import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

interface Props {
  subcategorySlug: string;
  categorySlug: string;
  subcategoryName: string;
}

export const SubcategoryItem = ({
  subcategorySlug,
  categorySlug,
  subcategoryName,
}: Props) => {
  const params = useParams();
  const router = useRouter();

  const isActive =
    params.category === categorySlug && params.subcategory === subcategorySlug;

  const handleClick = () => {
    if (isActive) {
      return;
    }

    router.push(`/${categorySlug}/${subcategorySlug}`);
  };
  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      className={cn(
        "w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium cursor-pointer",
        isActive && "bg-black/40 text-white"
      )}
    >
      {subcategoryName}
    </button>
  );
};
