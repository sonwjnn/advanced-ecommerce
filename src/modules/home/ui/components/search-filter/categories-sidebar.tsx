import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  CategoriesGetManyOutput,
  CategoriesGetManyOutputSingle,
} from "@/modules/categories/types";
import { cn } from "@/lib/utils";

export const CategoriesSidebar = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const trpc = useTRPC();
  const router = useRouter();
  const params = useParams();

  const categoryParams = params.category as string;
  const subcategoryParams = params.subcategory as string;

  const { data } = useQuery(trpc.categories.getMany.queryOptions());
  const [parentCategories, setParentCategories] =
    useState<CategoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesGetManyOutputSingle | null>(null);

  // If we have parent categories, show those, otherwise show root categories

  const currentCategories = parentCategories ?? data ?? [];

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    setParentCategories(null);
    setSelectedCategory(null);
  };

  const handleBackClick = () => {
    setParentCategories(null);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category: CategoriesGetManyOutputSingle) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategories(category.subcategories as any);
      setSelectedCategory(category);
    } else {
      // This is a leaf category (no subcategories)
      if (parentCategories && selectedCategory) {
        // This is  a subcategory - navigate to /category/subcategory
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        // This is a root category - navigate to /category
        if (category.slug === "all") {
          router.push("/");
        } else {
          router.push(`/${category.slug}`);
        }
      }

      handleOpenChange(false);
    }
  };

  const backgroundColor = selectedCategory?.color || "white";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>{selectedCategory?.name || "Categories"}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {parentCategories && (
            <button
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium cursor-pointer"
              onClick={handleBackClick}
            >
              <ChevronLeftIcon className="size-4 mr-2" />
              Back
            </button>
          )}
          {currentCategories.map((category) => {
            const isSubcategory = category.slug === subcategoryParams;
            const isCategoryActive =
              category.slug === categoryParams && !isSubcategory;

            return (
              <button
                key={category.slug}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium justify-between cursor-pointer",
                  isSubcategory && "bg-black/40 text-white",
                  isCategoryActive && "bg-black/40 text-white"
                )}
              >
                {category.name}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <ChevronRightIcon className="size-4 " />
                  )}
              </button>
            );
          })}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
