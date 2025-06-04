import { isSuperAdmin } from "@/lib/access";
import type { CollectionConfig } from "payload";

export const Tenants: CollectionConfig = {
  slug: "tenants",

  // access - Access control configuration for the tenants collection
  access: {
    read: () => true, // Allow all users to read
    create: ({ req }) => isSuperAdmin(req.user), // Allow super admins to create
    delete: ({ req }) => isSuperAdmin(req.user), // Allow super admins to delete
  },

  admin: {
    useAsTitle: "slug",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Store Name", // Custom label shown in admin UI
      admin: {
        description: "The name of the store (e.g., John Doe's Store)", // Help text
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      unique: true,
      required: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user), // Allow super admins to update
      },
      admin: {
        description:
          "Unique identifier for the tenant, used in URLs. E.g. '[slug].metashopper.com'",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "stripeAccountId",
      type: "text",
      access: {
        update: ({ req }) => isSuperAdmin(req.user), // Allow super admins to update
      },
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "stripeDetailsSubmitted",
      type: "checkbox",
      access: {
        update: ({ req }) => isSuperAdmin(req.user), // Allow super admins to update
      },
      admin: {
        description:
          "You cannot create products for this tenant until you have submitted your Stripe account details.",
        readOnly: true,
      },
    },
  ],
};
