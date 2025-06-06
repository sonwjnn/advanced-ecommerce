import { prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient } from "@/trpc/hydrate-client";

interface PageProps {
  params: { slug: string };
  searchParams: SearchParams;
}

interface Props extends PageProps {
  narrowView?: boolean;
}

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
  narrowView,
}: Props) {
  const { slug } = await params;

  const filters = await loadProductFilters(searchParams);

  void prefetch(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      tenantSlug: slug,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrateClient>
      <ProductListView tenantSlug={slug} narrowView={narrowView} />
    </HydrateClient>
  );
}
