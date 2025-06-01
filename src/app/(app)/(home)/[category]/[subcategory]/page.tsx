import { prefetch, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/hydrate-client";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";
import { Suspense } from "react";

interface Props {
  params: Promise<{ category: string; subcategory: string }>;
}

const Page = async ({ params }: Props) => {
  const { category, subcategory } = await params;

  void prefetch(trpc.products.getMany.queryOptions({ category: subcategory }));

  return (
    <HydrateClient>
      <Suspense fallback={<ProductListLoading />}>
        <ProductList category={subcategory} />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
