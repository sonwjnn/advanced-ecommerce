import { Category, Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Sort, Where } from "payload";
import { z } from "zod";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      // Query the database for a product with the specified ID
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, // Include related fields like image, category, tenant, tenant.image
        select: {
          content: false, // Exclude the content field from the results
        },
      });

      // If the product is archived, throw an error
      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Initialize purchase flag
      let isPurchased = false;

      // If the user is authenticated, check for matching purchase
      if (session.user) {
        // Query the orders collection to see if this product was purchased by the user
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        // If a matching order exists, set isPurchased to true
        isPurchased = !!ordersData.docs[0];
      }

      // Fetch all reviews associated with the product
      const reviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: { equals: input.id },
        },
      });

      // Calculate average review rating (default to 0 if no reviews)
      const reviewRating =
        reviews.docs.length === 0
          ? 0
          : reviews.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviews.docs.length;

      // Initialize distribution map to track % of each star rating
      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      // Count how many reviews exist per rating (1–5)
      if (reviews.totalDocs > 0) {
        reviews.docs.forEach((review) => {
          const rating = review.rating;

          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });

        // Convert raw counts into percentages
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;

          ratingDistribution[rating] = Math.round(
            (count / reviews.totalDocs) * 100
          );
        });
      }

      return {
        ...product,
        isPurchased,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
      };
    }),
  getMany: baseProcedure
    .input(
      z.object({
        search: z.string().nullable().optional(),
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {
        isArchived: {
          not_equals: true, // Exclude archived products
        },
      };

      let sort: Sort = "-createdAt";

      if (input.sort === "trending") {
        sort = "-createdAt";
      }

      if (input.sort === "hot_and_new") {
        sort = "+createdAt";
      }

      if (input.sort === "curated") {
        sort = "-createdAt";
      }

      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
        };
      } else if (input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice,
        };
      }

      // Apply tenant filter if a tenant slug is provided
      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      } else {
        // If we are loading products for public storefront, we need to exclude private products
        where["isPrivate"] = {
          not_equals: true, // Match products that are not private
        };
      }

      // If category is provided, filter products by category and its subcategories
      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          limit: 1, // Only expect one matching category
          depth: 1, // Include subcategories up to one level deep
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            ...(doc as Category),
            subcategories: undefined,
          })),
        }));

        const subcategoriesSlugs: string[] = [];
        const parentCategory = formattedData[0];

        if (parentCategory?.subcategories) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map((sub) => sub.slug)
          );
          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
          };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      if (input.search) {
        where["name"] = {
          like: input.search,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Include relational fields (like images, category, tenant, tenant.image etc.)
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false, // Exclude the content field from the results
        },
      });

      // Map over each product to attach summarized review data
      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
          // Fetch all reviews related to the current product
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          // Return the product along with its reviews and average rating
          return {
            ...doc,
            reviews: reviewsData.docs,
            reviewCount: reviewsData.docs.length,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / reviewsData.docs.length, // Average rating calculation
          };
        })
      );

      return {
        ...data, // Include all pagination and meta fields (e.g., totalDocs, limit, totalPages, etc.)
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
