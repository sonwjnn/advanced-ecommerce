import { Suspense } from "react";
import { Footer } from "@/modules/home/ui/components/footer";
import { Navbar } from "@/modules/home/ui/components/navbar";
import {
  SearchFilter,
  SearchFilterLoading,
} from "@/modules/home/ui/components/search-filter";
import { prefetch, trpc } from "@/trpc/server";
import { HydrateClient } from "@/trpc/hydrate-client";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  void prefetch(trpc.categories.getMany.queryOptions());

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrateClient>
        <Suspense fallback={<SearchFilterLoading />}>
          <SearchFilter />
        </Suspense>
      </HydrateClient>
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
