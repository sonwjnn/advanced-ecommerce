"use client";

import { generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import { useCheckoutState } from "@/modules/checkout/hooks/use-checkout-state";
import { CheckoutItem } from "@/modules/checkout/ui/components/checkout-item";
import { CheckoutSidebar } from "@/modules/checkout/ui/components/checkout-sidebar";

interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();

  const [states, setStates] = useCheckoutState();
  const { productIds, clearCart, removeProduct } = useCart(tenantSlug);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds, // Send list of product IDs to the backend
    })
  );

  // tRPC mutation to initiate a Stripe checkout session
  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        // Reset checkout query state before starting a new purchase
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        // Redirect to Stripe checkout URL on success
        window.location.href = data.url;
      },
      onError: (error) => {
        // If user is not authenticated, redirect to sign-in
        if (error?.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }

        toast.error(error.message);
      },
    })
  );

  // Clear cart and redirect after successful checkout
  useEffect(() => {
    if (states.success) {
      setStates({
        success: false, // Reset success state to prevent re-trigger
        cancel: false, // Clear any cancel flag
      });

      clearCart();

      // Invalidate cached queries related to the user's library to ensure fresh data
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());

      router.push("/library");
    }
  }, [
    states.success,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  // Handle invalid product error by clearing cart and showing a warning
  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared.");
    }
  }, [error, clearCart]);

  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  // Render empty state if no products are found
  if (data?.totalDocs === 0) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 pt-4 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        {/* Products list section */}
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {/* Render each product in cart */}
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1} // If last item, remove bottom border
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantUrl(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantUrl(product.tenant.slug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>

        {/* Checkout sidebar section */}
        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.totalPrice || 0}
            onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
            isCanceled={states.cancel}
            disabled={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};
