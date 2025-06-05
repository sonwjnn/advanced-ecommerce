import { NextRequest, NextResponse } from "next/server";

// middleware - Handles tenant-based routing via subdomain parsing
export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || ""; // Get the full hostname (e.g., tenant.example.com)

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!; // Root domain for production (e.g., example.com)

  // Check if the hostname is a subdomain of the root domain (e.g., tenant.example.com)
  if (hostname.endsWith(`.${rootDomain}`)) {
    // Extract tenant slug from the subdomain (e.g., 'tenant' from 'tenant.example.com')
    const tenantSlug = hostname.replace(`.${rootDomain}`, "");

    // Rewrite the request to the internal tenant-specific route (e.g., /tenants/tenant/path)
    return NextResponse.rewrite(
      new URL(`/tenants/${tenantSlug}${url.pathname}`, req.url)
    );
  }

  // Allow request to proceed as normal if it's not a tenant subdomain
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)"], // Exclude API routes, Next.js internals, media, static assets, and file extensions
};
