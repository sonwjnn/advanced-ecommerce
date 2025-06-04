import { Footer } from "@/modules/tenants/ui/components/footer";
import { NavbarSkeleton, Navbar } from "@/modules/tenants/ui/components/navbar";
import { HydrateClient } from "@/trpc/hydrate-client";
import { prefetch, trpc } from "@/trpc/server";
import React, { Suspense } from "react";

interface Props {
  children?: React.ReactNode;
  params: Promise<{ slug: string }>;
}
const Layout = async ({ children, params }: Props) => {
  const { slug } = await params;

  void prefetch(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <div className="flex flex-col min-h-screen bg-[F4F4F0]">
      <HydrateClient>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar slug={slug} />
        </Suspense>
      </HydrateClient>

      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">{children}</div>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
