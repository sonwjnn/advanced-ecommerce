import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

// Orders - Collection configuration for storing order records
export const Orders: CollectionConfig = {
  slug: "orders",

  // access - Access control configuration for the orders collection
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },

  // admin - Admin panel configuration
  admin: {
    useAsTitle: "name",
  },

  // fields - Defines the schema/structure of the orders collection
  fields: [
    // name - Human-readable label for the order (e.g., "Order #123")
    {
      name: "name",
      type: "text",
      required: true,
    },

    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false, // Single user per order
    },

    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false, // Single product per order
    },

    {
      name: "stripeCheckoutSessionId",
      type: "text",
      required: true,
      admin: {
        description: "Stripe checkout session associated with this order", // Help text shown in the admin UI
      },
    },

    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe account associated with this order",
      },
    },
  ],
};
