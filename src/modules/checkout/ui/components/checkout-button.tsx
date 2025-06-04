import { Button } from "@/components/ui/button";
import { cn, generateTenantUrl } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/modules/checkout/hooks/use-cart";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

export const CheckoutButton = ({
  className,
  hideIfEmpty,
  tenantSlug,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <Button variant={"elevated"} asChild className={cn("bg-white", className)}>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon />
        {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
