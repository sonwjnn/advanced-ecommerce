import React, { Suspense } from "react";
import {
  ProductView,
  ProductViewSkeleton,
} from "@/modules/products/ui/views/product-view";
import { prefetch, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/hydrate-client";

interface PageProps {
  params: Promise<{ productId: string; slug: string }>;
}
const Page = async ({ params }: PageProps) => {
  const { productId, slug } = await params;

  void prefetch(
    trpc.tenants.getOne.queryOptions({
      slug,
    })
  );

  return (
    <HydrateClient>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} tenantSlug={slug} />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
