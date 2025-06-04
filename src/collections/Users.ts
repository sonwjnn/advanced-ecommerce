import type { CollectionConfig } from "payload";
import { tenantsArrayField } from "@payloadcms/plugin-multi-tenant/fields";
import { isSuperAdmin } from "@/lib/access";

const defaultTenantsArrayField = tenantsArrayField({
  tenantsArrayFieldName: "tenants",
  tenantsCollectionSlug: "tenants",
  tenantsArrayTenantFieldName: "tenant",

  arrayFieldAccess: {
    read: () => true, // Allow reading tenant array
    create: ({ req }) => isSuperAdmin(req.user), // Allow admin to create tenant array items
    update: ({ req }) => isSuperAdmin(req.user), // Allow admin to update tenant array items
  },
  tenantFieldAccess: {
    read: () => true, // Allow reading individual tenant field
    create: ({ req }) => isSuperAdmin(req.user), // Allow admin to create tenant field
    update: ({ req }) => isSuperAdmin(req.user), // Allow admin to update tenant field
  },
});

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    hidden: ({ user }) => !isSuperAdmin(user), // Hide the users collection from non-super admins
  },
  auth: {
    cookies: {
      ...(process.env.NODE_ENV !== "development" && {
        sameSite: "None",
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        secure: true,
      }),
    },
  },
  fields: [
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      options: ["super-admin", "admin", "user"],
      defaultValue: ["user"],
      admin: {
        position: "sidebar", // Display in the admin sidebar
      },
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
    },
    {
      ...defaultTenantsArrayField,
      admin: {
        ...(defaultTenantsArrayField?.admin || {}),
        position: "sidebar",
      },
    },
  ],
};
