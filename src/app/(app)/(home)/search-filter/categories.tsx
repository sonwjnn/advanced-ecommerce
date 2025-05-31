"use client";

import { Category } from "@/payload-types";
import { CategoryDropdown } from "./category-dropdown";
import { CustomCategory } from "../types";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFilterIcon } from "lucide-react";
import { CategoriesSidebar } from "./categories-sidebar";

interface CategoriesProps {
  data: CustomCategory[];
}

export const Categories = ({ data }: CategoriesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(data.length);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeCategory = "all";

  const activeCategoryIndex = data.findIndex(
    (item) => item.slug === activeCategory
  );
  const isActiveCategoryHidden =
    activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;

  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current || !measureRef.current || !viewAllRef.current)
        return;

      const containerWidth = containerRef.current.offsetWidth;
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const measureWidth = measureRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;

      const items = Array.from(measureRef.current.children);

      let totalWidth = 0;
      let visibleCount = 0;

      for (const item of items) {
        const width = item.getBoundingClientRect().width;
        if (totalWidth + width > availableWidth) break;

        totalWidth += width;
        visibleCount++;
      }

      setVisibleCount(visibleCount);
    };

    const resizeObserver = new ResizeObserver(calculateVisible);
    resizeObserver.observe(containerRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [data.length]);

  return (
    <div className="relative w-full">
      {/* Categories Sidebar */}
      <CategoriesSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        data={data}
      />

      {/* Hidden div to measure all items */}
      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none flex"
        style={{ position: "fixed", top: -9999, left: -9999 }}
      >
        {data.map((item) => (
          <div key={item.id}>
            <CategoryDropdown
              category={item}
              isActive={activeCategory === item.slug}
              isNavigationHovered={false}
            />
          </div>
        ))}
      </div>

      {/* Visible div */}
      <div
        ref={containerRef}
        className="flex flex-nowrap items-center"
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {data.slice(0, visibleCount).map((item) => (
          <div key={item.id}>
            <CategoryDropdown
              category={item}
              isActive={activeCategory === item.slug}
              isNavigationHovered={isAnyHovered}
            />
          </div>
        ))}

        <div ref={viewAllRef}>
          <Button
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
              isActiveCategoryHidden &&
                !isAnyHovered &&
                "bg-white border-primary"
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            View All
            <ListFilterIcon className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
