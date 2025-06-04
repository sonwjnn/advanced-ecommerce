import { cookies as getCookies } from "next/headers";

interface Props {
  prefix: string;
  value: string;
}

export const generateAuthCookie = async ({ prefix, value }: Props) => {
  const cookies = await getCookies();

  cookies.set({
    name: `${prefix}-token`,
    value: value,
    httpOnly: true, // Make cookie inaccessible to client-side JavaScript (security best practice)
    path: "/", // Ensure the cookie is available on all routes of the site
    // Only set the cookie if the environment is not development
    ...(process.env.NODE_ENV !== "development" && {
      sameSite: "none",
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN, // Set the domain for broader cookie scope (e.g., across subdomains)
      secure: true, // Only send the cookie over HTTPS in production
    }),
  });
};
