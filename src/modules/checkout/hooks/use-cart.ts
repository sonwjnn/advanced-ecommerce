import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../store/use-cart-store";

// useCart - Hook for managing cart state scoped to a specific tenant
export const useCart = (tenantSlug: string) => {
  const addProduct = useCartStore((state) => state.addProduct);

  const removeProduct = useCartStore((state) => state.removeProduct);

  const clearCart = useCartStore((state) => state.clearCart);

  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  const productIds = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSlug]?.productIds || [])
  );

  // toggleProduct - Add or remove a product from the cart depending on its presence
  const toggleProduct = useCallback(
    (productId: string) => {
      if (productIds.includes(productId)) {
        removeProduct(tenantSlug, productId);
      } else {
        addProduct(tenantSlug, productId);
      }
    },
    [addProduct, removeProduct, productIds, tenantSlug]
  );

  // isProductInCart - Returns true if the product is already in the tenant's cart
  const isProductInCart = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  // clearTenantCard - Clears all products from the current tenant’s cart
  const clearTenantCard = useCallback(() => {
    clearCart(tenantSlug);
  }, [clearCart, tenantSlug]);

  // handleAddProduct - Adds a product to the current tenant’s cart
  const handleAddProduct = useCallback(
    (productId: string) => {
      addProduct(tenantSlug, productId);
    },
    [addProduct, tenantSlug]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeProduct(tenantSlug, productId);
    },
    [removeProduct, tenantSlug]
  );

  return {
    productIds,
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    clearCart: clearTenantCard,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    totalItems: productIds.length,
  };
};
