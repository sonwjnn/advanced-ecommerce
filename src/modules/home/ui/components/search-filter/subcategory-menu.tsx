import Link from "next/link";
import { CategoriesGetManyOutputSingle } from "@/modules/categories/types";
import { SubcategoryItem } from "./subcategory-item";

interface Props {
  category: CategoriesGetManyOutputSingle;
  isOpen: boolean;
  position: { top: number; left: number };
}

export const SubcategoryMenu = ({ category, isOpen, position }: Props) => {
  if (!isOpen || !category.subcategories || category.subcategories.length === 0)
    return null;

  const backgroundColor = category.color || "#F5F5F5";
  return (
    <div
      className="fixed z-100"
      style={{ top: position.top, left: position.left }}
    >
      <div className="h-3 w-60" />
      <div
        style={{ backgroundColor }}
        className="w-60  text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
      >
        <div>
          {category.subcategories.map((subcategory) => (
            <SubcategoryItem
              key={subcategory.id}
              subcategorySlug={subcategory.slug}
              categorySlug={category.slug}
              subcategoryName={subcategory.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
