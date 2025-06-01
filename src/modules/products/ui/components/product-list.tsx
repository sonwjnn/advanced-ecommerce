"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useProductFilters } from "../../hooks/use-product-filter";

interface Props {
  category?: string;
}

export const ProductList = ({ category }: Props) => {
  const [filters] = useProductFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({
      category,
      ...filters,
    })
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data?.docs?.map((doc) => (
        <div key={doc.id} className="border rounded-md bg-white p-4">
          <h2>{doc.name}</h2>
          <p>${doc.price}</p>
        </div>
      ))}
    </div>
  );
};

export const ProductListLoading = () => {
  return <div>Loading...</div>;
};
