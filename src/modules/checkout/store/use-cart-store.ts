import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TenantCart {
  productIds: string[]; 
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;

  addProduct: (tenantSlug: string, productId: string) => void;

  removeProduct: (tenantSlug: string, productId: string) => void;

  clearCart: (tenantSlug: string) => void;

  clearAllCarts: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {}, 

      // addProduct - Adds a product to a specific tenant's cart
      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts, // Preserve other tenant carts
            [tenantSlug]: {
              productIds: [
                ...(state.tenantCarts[tenantSlug]?.productIds || []), 
                productId, 
              ],
            },
          },
        })),

      // removeProduct - Removes a product from a tenant’s cart by filtering it out
      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts, // Preserve other tenant carts
            [tenantSlug]: {
              productIds:
                state.tenantCarts[tenantSlug]?.productIds.filter(
                  (id) => id !== productId // Remove the matching product
                ) || [], // If no cart exists yet, return empty array
            },
          },
        })),

      // clearCart - Empties all products from a specific tenant’s cart
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts, 
            [tenantSlug]: {
              productIds: [],
            },
          },
        })),

      clearAllCarts: () => set({ tenantCarts: {} }),
    }),
    {
      name: "funroad-cart", 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
