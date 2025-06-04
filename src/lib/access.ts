import { User } from "@/payload-types";
import { ClientUser } from "payload";

// isSuperAdmin - Check if the user is a super admin
export const isSuperAdmin = (user: User | ClientUser | null) => {
  return Boolean(user?.roles?.includes("super-admin"));
};
