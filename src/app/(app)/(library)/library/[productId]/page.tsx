import {
  ProductView,
  ProductViewSkeleton,
} from "@/modules/library/ui/views/product-view";
import { HydrateClient } from "@/trpc/hydrate-client";
import { prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { productId } = await params;

  void prefetch(
    trpc.library.getOne.queryOptions({
      productId,
    })
  );

  void prefetch(
    trpc.reviews.getOne.queryOptions({
      productId,
    })
  );

  return (
    <HydrateClient>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
