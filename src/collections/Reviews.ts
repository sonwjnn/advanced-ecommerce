import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

// Reviews - Collection configuration for storing product reviews by users
export const Reviews: CollectionConfig = {
  slug: "reviews",

  // access - Access control configuration for the reviews collection
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },

  // admin - Defines how this collection appears in the Payload admin panel
  admin: {
    useAsTitle: "description", // Display 'description' as the label in the admin panel
  },

  fields: [
    // description - Text content of the user's review
    {
      name: "description",
      type: "textarea",
      required: true,
    },

    // rating - Numeric rating score from 1 to 5
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },

    // product - Reference to the product being reviewed
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
      required: true,
    },

    // user - Reference to the user who submitted the review
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      required: true,
    },
  ],
};
