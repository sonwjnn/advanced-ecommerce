import { PLATFORM_FEE_PERCENTAGE } from "@/constants";
import { stripe } from "@/lib/stripe";
import { generateTenantUrl } from "@/lib/utils";
import { Media, Tenant } from "@/payload-types";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedures,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { CheckoutMetadata, ProductMetadata } from "../types";

// checkoutRouter - Defines checkout-related API procedures
export const checkoutRouter = createTRPCRouter({
  // verify - Generates a Stripe account onboarding link for the current user's tenant
  verify: protectedProcedures.mutation(async ({ ctx }) => {
    // Fetch the full user document using their session ID (depth: 0 returns raw ID refs)
    const user = await ctx.db.findByID({
      collection: "users", // Collection name to query
      id: ctx.session.user.id, // User ID to fetch
      depth: 0, // Fetch only the user document (no related fields)
    });

    // Throw an error if the user record is not found
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Extract the first tenant ID associated with the user
    const tenantId = user.tenants?.[0]?.tenant as string;

    // Fetch the tenant document using the extracted tenant ID
    const tenant = await ctx.db.findByID({
      collection: "tenants", // Collection name to query
      id: tenantId, // Tenant ID to fetch
    });

    // Throw an error if the tenant does not exist
    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }

    // Create a Stripe account onboarding link for the tenant
    const accountLink = await stripe.accountLinks.create({
      account: tenant.stripeAccountId as string, // Stripe account ID for the tenant
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`, // Redirect here if onboarding is canceled
      return_url: `${process.env.NEXT_PUBLIC_APP_URL!}/admin`, // Redirect here after successful onboarding
      type: "account_onboarding", // Type of link: onboarding flow
    });

    // Throw an error if the link creation fails
    if (!accountLink) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Account link failed",
      });
    }

    // Return the Stripe onboarding URL to the client
    return {
      url: accountLink.url,
    };
  }),

  // purchase - Creates a Stripe Checkout session for purchasing specified products from a tenant
  purchase: protectedProcedures
    .input(
      z.object({
        productIds: z.array(z.string()).min(1), // Array of product IDs to purchase
        tenantSlug: z.string().min(1), // Slug identifying the tenant/store
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch products that match the provided IDs and belong to the specified tenant
      const products = await ctx.db.find({
        collection: "products",
        depth: 2, // Fetch related fields (e.g., tenant, image)
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            }, // Match product IDs
            {
              "tenant.slug": {
                equals: input.tenantSlug,
              },
            }, // Match by tenant slug
            {
              isArchived: {
                not_equals: true,
              },
            }, // Match by isArchived field
          ],
        },
      });

      // Throw error if some products are missing (possible mismatch or filtering issue)
      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      // Fetch the tenant by slug
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: { equals: input.tenantSlug }, // Match the tenant by slug
        },
      });

      const tenant = tenantsData.docs[0]; // Extract the first tenant match

      // Throw error if the tenant is not found (invalid or outdated slug)
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      // Throw error if the tenant does not have a Stripe account ID configured
      if (!tenant.stripeAccountId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Tenant not allowed to sell products ",
        });
      }

      // Construct line items for each product to be used in the checkout session
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1, // Each product has a quantity of 1
          price_data: {
            unit_amount: product.price * 100, // Convert price to cents (required by Stripe)
            currency: "usd", // Currency set to USD
            product_data: {
              name: product.name, // Product name shown in Stripe checkout
              metadata: {
                stripeAccountId: tenant.stripeAccountId, // Use the tenant’s Stripe account
                id: product.id, // Store product ID in metadata
                name: product.name, // Store product name in metadata
                price: product.price, // Store product price in metadata
              } as ProductMetadata,
            },
          },
        }));

      // Calculate the total price of all products (in cents)
      const totalAmount = products.docs.reduce((acc, item) => {
        return acc + item.price * 100;
      }, 0);

      // Calculate platform fee based on a percentage of total amount
      const platformFeeAmount = Math.round(
        totalAmount * (PLATFORM_FEE_PERCENTAGE / 100)
      );

      // Generate the full URL for the tenant's site
      const domain = generateTenantUrl(tenant.slug);

      // Create a new Stripe Checkout session using tenant's connected account
      const checkout = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session.user.email, // Send receipt to the logged-in user’s email
          success_url: `${domain}/checkout?success=true`, // Redirect URL on successful payment
          cancel_url: `${domain}/checkout?cancel=true`, // Redirect URL if user cancels checkout
          mode: "payment", // Use one-time payment mode
          line_items: lineItems, // Add all mapped line items
          invoice_creation: {
            enabled: true, // Generate a Stripe invoice
          },
          metadata: {
            userId: ctx.session.user.id, // Attach the user ID for tracking in Stripe
          } as CheckoutMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeeAmount, // Apply platform fee
          },
        },
        {
          stripeAccount: tenant.stripeAccountId, // Specify the Stripe account to use
        }
      );

      // Validate that a checkout URL was returned from Stripe
      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      // Return the checkout session URL to the client so it can redirect
      return {
        url: checkout.url,
      };
    }),

  // getProducts - Fetches multiple products by their IDs and calculates total price
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()), // List of product IDs to fetch
      })
    )
    .query(async ({ ctx, input }) => {
      // Query the "products" collection with relational depth
      const data = await ctx.db.find({
        collection: "products", // Collection name to query
        depth: 2, // Fetch related fields like image, tenant, tenant.image, etc.
        where: {
          and: [
            {
              id: {
                in: input.ids, // Match products by IDs provided in input
              },
            },
            {
              isArchived: {
                not_equals: true, // Match by isArchived field
              },
            },
          ],
        },
      });

      // Throw an error if some products were not found
      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Calculate the total price of all fetched products
      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data, // Include pagination and meta fields (totalDocs, limit, totalPages, etc.)
        totalPrice: totalPrice, // Sum of all product prices in the fetched list
        docs: data.docs.map((doc) => ({
          ...doc, // Spread original product fields
          image: doc.image as Media | null, // Ensure image field is typed properly
          tenant: doc.tenant as Tenant & { image: Media | null }, // Ensure tenant field includes image
        })),
      };
    }),
});
