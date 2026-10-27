import { create } from "zustand";

import type { Product } from "../types/product";

import {
  addCartItem,
  clearBackendCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart.api";

export interface CartItem {
  product: Product;
  variantId: number;
  variantName: string;
  variantValue: string;
  variantSku: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;

  loadCart: (
    token: string,
  ) => Promise<void>;

  addItem: (
    product: Product,
    variantId: number,
    token?: string,
    quantity?: number,
  ) => Promise<void>;

  removeItem: (
    variantId: number,
    token?: string,
  ) => Promise<void>;

  updateQuantity: (
    variantId: number,
    quantity: number,
    token?: string,
  ) => Promise<void>;

  clearCart: (
    token?: string,
  ) => Promise<void>;

  getTotal: () => number;
  getItemCount: () => number;
}

const normalizeProduct = (
  product: Product,
): Product => {
  const normalizedPrice =
    Number(product.price);

  const normalizedCostPrice =
    product.costPrice === null ||
    product.costPrice === undefined
      ? null
      : Number(product.costPrice);

  return {
    ...product,

    price:
      Number.isFinite(
        normalizedPrice,
      )
        ? normalizedPrice
        : 0,

    costPrice:
      normalizedCostPrice === null
        ? null
        : Number.isFinite(
            normalizedCostPrice,
          )
          ? normalizedCostPrice
          : null,
  };
};

export const useCartStore =
  create<CartState>(
    (set, get) => ({
      items: [],
      loading: false,

      loadCart: async (
        token: string,
      ) => {
        if (!token) {
          set({
            items: [],
            loading: false,
          });

          return;
        }

        set({
          loading: true,
        });

        try {
          const cart =
            await getCart(token);

          const backendItems =
            Array.isArray(
              cart?.items,
            )
              ? cart.items
              : [];

          const items: CartItem[] =
            backendItems
              .filter(
                (item) =>
                  item &&
                  item.product &&
                  item.variant &&
                  item.variantId,
              )
              .map(
                (item) => ({
                  product:
                    normalizeProduct(
                      item.product,
                    ),

                  variantId:
                    Number(
                      item.variantId,
                    ),

                  variantName:
                    item.variant!.name,

                  variantValue:
                    item.variant!.value,

                  variantSku:
                    item.variant!.sku,

                  quantity:
                    Number(
                      item.quantity,
                    ) || 0,
                }),
              )
              .filter(
                (item) =>
                  item.quantity > 0 &&
                  item.variantId > 0,
              );

          set({
            items,
            loading: false,
          });
        } catch (error) {
          set({
            loading: false,
          });

          throw error;
        }
      },

      addItem: async (
        product,
        variantId,
        token,
        quantity = 1,
      ) => {
        const variant =
          product.variants.find(
            (item) =>
              item.id === variantId,
          );

        if (!variant) {
          throw new Error(
            "Selected product variant not found",
          );
        }

        if (
          variant.stock <
          quantity
        ) {
          throw new Error(
            `Insufficient stock. Available: ${variant.stock}`,
          );
        }

        if (!token) {
          const normalizedProduct =
            normalizeProduct(
              product,
            );

          set((state) => {
            const existingItem =
              state.items.find(
                (item) =>
                  item.variantId ===
                  variantId,
              );

            if (existingItem) {
              return {
                items:
                  state.items.map(
                    (item) =>
                      item.variantId ===
                      variantId
                        ? {
                            ...item,
                            quantity:
                              item.quantity +
                              quantity,
                          }
                        : item,
                  ),
              };
            }

            return {
              items: [
                ...state.items,
                {
                  product:
                    normalizedProduct,

                  variantId,

                  variantName:
                    variant.name,

                  variantValue:
                    variant.value,

                  variantSku:
                    variant.sku,

                  quantity,
                },
              ],
            };
          });

          return;
        }

        await addCartItem(
          token,
          product.id,
          variantId,
          quantity,
        );

        await get().loadCart(
          token,
        );
      },

      removeItem: async (
        variantId,
        token,
      ) => {
        if (!token) {
          set((state) => ({
            items:
              state.items.filter(
                (item) =>
                  item.variantId !==
                  variantId,
              ),
          }));

          return;
        }

        await removeCartItem(
          token,
          variantId,
        );

        await get().loadCart(
          token,
        );
      },

      updateQuantity: async (
        variantId,
        quantity,
        token,
      ) => {
        if (quantity <= 0) {
          await get().removeItem(
            variantId,
            token,
          );

          return;
        }

        if (!token) {
          set((state) => ({
            items:
              state.items.map(
                (item) =>
                  item.variantId ===
                  variantId
                    ? {
                        ...item,
                        quantity,
                      }
                    : item,
              ),
          }));

          return;
        }

        await updateCartItem(
          token,
          variantId,
          quantity,
        );

        await get().loadCart(
          token,
        );
      },

      clearCart: async (
        token,
      ) => {
        if (!token) {
          set({
            items: [],
          });

          return;
        }

        await clearBackendCart(
          token,
        );

        set({
          items: [],
        });
      },

      getTotal: () => {
        return get().items.reduce(
          (
            total,
            item,
          ) => {
            const price =
              Number(
                item.product.price,
              );

            const quantity =
              Number(
                item.quantity,
              );

            if (
              !Number.isFinite(
                price,
              ) ||
              !Number.isFinite(
                quantity,
              )
            ) {
              return total;
            }

            return (
              total +
              price *
                quantity
            );
          },
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce(
          (
            count,
            item,
          ) =>
            count +
            (
              Number(
                item.quantity,
              ) || 0
            ),
          0,
        );
      },
    }),
  );