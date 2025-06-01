import { prefetch, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/hydrate-client";
import {
  ProductList,
  ProductListLoading,
} from "@/modules/products/ui/components/product-list";
import { Suspense } from "react";
import { ProductFilters } from "@/modules/products/ui/components/product-filters";

interface Props {
  params: Promise<{ category: string }>;
}

const Page = async ({ params }: Props) => {
  const { category } = await params;

  void prefetch(trpc.products.getMany.queryOptions({ category }));

  return (
    <HydrateClient>
      <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
          <div className="lg:col-span-2 xl:col-span-2">
            <ProductFilters />
          </div>

          <div className="lg:col-span-4 xl:col-span-6">
            <Suspense fallback={<ProductListLoading />}>
              <ProductList category={category} />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
};

export default Page;
