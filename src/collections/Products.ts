import { isSuperAdmin } from "@/lib/access";
import { Tenant } from "@/payload-types";
import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
  slug: "products",
  // access - Access control configuration for the products collection
  access: {
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;

      // Check if the tenant has submitted their stripe details
      const tenant = req.user?.tenants?.[0]?.tenant as Tenant;
      return Boolean(tenant?.stripeDetailsSubmitted);
    },
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
    description: "You must verify your account before you can create products.", // Help text shown in the admin UI
  },
  fields: [
    // name - The display name of the product (e.g., 'T-shirt', 'Laptop')
    {
      name: "name",
      type: "text",
      required: true,
    },

    // description - Short text describing the product
    {
      name: "description",
      type: "richText", // Rich text input field
    },

    // price - Numeric value representing the cost of the product
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD", // Help text shown in the admin UI
      },
    },

    // category - Relationship to a category this product belongs to
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },

    // tags - Relationship to multiple tags assigned to this product
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },

    // image - Upload field for product image
    {
      name: "image",
      type: "upload", // File upload input
      relationTo: "media",
    },

    // refundPolicy - Enum representing refund rules for this product
    {
      name: "refundPolicy", // Field name
      type: "select", // Dropdown select field
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"], // Allowed refund options
      defaultValue: "30-day",
    },

    // content - Protected content only visible to customers after purchase
    {
      name: "content",
      type: "richText", // Rich text input field
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Support markdown formatting.", // Help text shown in the admin UI
      },
    },

    // isPrivate - Checkbox to make the product private
    {
      name: "isPrivate",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "If checked, this product will not be shown on the public storefront.",
      },
    },

    // isArchived - Checkbox to archive the product
    {
      name: "isArchived",
      label: "Archive",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description: "If checked, this product will be archived.",
      },
    },
  ],
};
