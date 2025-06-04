import { createTRPCRouter, protectedProcedures } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// reviewsRouter - Defines review-related API procedures
export const reviewsRouter = createTRPCRouter({
  // getOne - Fetches the review made by the logged-in user for a given product
  getOne: protectedProcedures
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Query the product by ID to verify it exists
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Look up an existing review by the current user for the specified product
      const reviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1, // Only fetch one, since a user can review a product once
        where: {
          and: [
            { product: { equals: product.id } },
            { user: { equals: ctx.session.user.id } },
          ],
        },
      });

      const review = reviewsData.docs[0]; // Extract the first (and only) review, if found

      // If no review exists, return null
      if (!review) {
        return null;
      }

      // Return the user's review
      return review;
    }),

  // create - Allows a logged-in user to create a review for a product
  create: protectedProcedures
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(3, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Query the product by ID to ensure it exists
      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if the user has already reviewed this product
      const existingReviewsData = await ctx.db.find({
        collection: "reviews",
        where: {
          and: [
            { product: { equals: input.productId } },
            { user: { equals: ctx.session.user.id } },
          ],
        },
      });

      // Prevent duplicate reviews by same user for the same product
      if (existingReviewsData.totalDocs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      // Create a new review in the database
      const review = await ctx.db.create({
        collection: "reviews",
        data: {
          user: ctx.session.user.id,
          product: product.id,
          rating: input.rating,
          description: input.description,
        },
      });

      // Return the newly created review
      return review;
    }),

  update: protectedProcedures
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(3, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.db.findByID({
        depth: 0, // No need to fetch relational data
        collection: "reviews",
        id: input.reviewId,
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      // Ensure the current user is the author of the review
      if (existingReview.user !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to update this review",
        });
      }

      // Update the review with new rating and description
      const updatedReview = await ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        },
      });

      return updatedReview;
    }),
});
