import { stripe } from "@/lib/stripe";
import { ExpandedLineItems } from "@/modules/checkout/types";
import config from "@/payload.config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import type { Stripe } from "stripe";

// POST - Handles Stripe webhook events (e.g., checkout.session.completed)
export async function POST(req: Request) {
  let event: Stripe.Event;

  // Attempt to verify the incoming webhook event from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    // Gracefully handle verification errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log the full error if it exists
    if (error! instanceof Error) {
      console.log(error);
    }

    console.log(`❌ Error message: ${errorMessage}`);

    return NextResponse.json(
      { error: `Webhook error: ${errorMessage}` },
      { status: 400 } // Respond with 400 Bad Request if verification fails
    );
  }

  console.log("✅ Success:", event.id);

  // Define which event types this handler cares about
  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  // Initialize Payload CMS instance
  const payload = await getPayload({ config });

  // Only process permitted event types
  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        // Handle successful checkout session
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          // Ensure metadata contains required user ID
          if (!data.metadata?.userId) {
            throw new Error("user ID is required");
          }

          // Find the user associated with the userId from metadata
          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          // Ensure the user exists
          if (!user) {
            throw new Error("User not found");
          }

          // Retrieve the session again to expand line items and include product data
          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"], // Expand products in line items
            },
            {
              stripeAccount: event.account, // Specify the Stripe account to use
            }
          );

          // Ensure line items exist in the session
          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No line items found");
          }

          // Cast the expanded line items for type safety
          const lineItems = expandedSession.line_items
            .data as ExpandedLineItems[];

          // Create an order entry for each product purchased in the session
          for (const item of lineItems) {
            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id, // Stripe session ID
                stripeAccountId: event.account, // Stripe account ID
                user: user.id, // ID of the purchasing user
                product: item.price.product.metadata.id, // Product ID from metadata
                name: item.price.product.name, // Product name
              },
            });
          }

          break;

        // Handle Stripe account updates
        case "account.updated":
          data = event.data.object as Stripe.Account;

          // Update the tenant record whose Stripe account ID matches the updated account
          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id, // Match tenant by Stripe account ID
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted, // Update the verification status
            },
          });
          break;

        // Catch-all for unhandled events (shouldn't occur due to filter)
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      // Handle any processing error and log it
      console.log(error);

      return NextResponse.json(
        { error: "Webhook handler failed" },
        { status: 500 } // Internal Server Error for processing failures
      );
    }
  }

  // Return 200 OK to acknowledge the event was received (even if ignored)
  return NextResponse.json({ error: "Received" }, { status: 200 });
}
