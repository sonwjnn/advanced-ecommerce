import { currencyFormatter, generateTenantUrl } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
  tenantSlug: string;
  tenantImage?: string | null;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  reviewRating,
  reviewCount,
  price,
  tenantSlug,
  tenantImage,
}: ProductCardProps) => {
  const router = useRouter();
  const handleTenantClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/tenants/${tenantSlug}`);
  };

  return (
    <Link
      href={`${generateTenantUrl(tenantSlug)}/products/${id}`}
      className="no-underline"
    >
      <div className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image
            src={imageUrl || "/place-holder.png"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4 border-y flex flex-col gap-3 flex-1">
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          <div className="flex items-center gap-2" onClick={handleTenantClick}>
            {tenantImage && (
              <Image
                src={tenantImage || "/place-holder.png"}
                alt={tenantSlug}
                width={16}
                height={16}
                className="rounded-full border shrink-0 size-[16px]"
              />
            )}
            <p className="text-sm font-medium underline">{tenantSlug}</p>
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="relative px-2 py-1 border bg-pink-400 w-fit">
            <p className="text-sm font-medium">
              {currencyFormatter(price ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />
  );
};
