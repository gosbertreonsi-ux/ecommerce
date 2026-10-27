import {
  adminApi,
} from "./admin.api";

export type InventoryType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGE"
  | "ADJUSTMENT";

export interface InventoryMovement {
  id: number;
  quantity: number;
  type: InventoryType;
  note: string | null;
  variantId: number;
  createdAt: string;

  variant?: {
    id: number;
    name: string;
    value: string;
    sku: string;
    stock: number;

    product?: {
      id: number;
      name: string;
      sku: string;
    };
  };
}

export interface CreateInventoryMovementInput {
  variantId: number;
  quantity: number;
  type: InventoryType;
  note?: string | null;
}

export const getInventory =
  async (): Promise<
    InventoryMovement[]
  > => {
    return adminApi.get<
      InventoryMovement[]
    >("/admin/inventory");
  };

export const createInventoryMovement =
  async (
    data: CreateInventoryMovementInput,
  ): Promise<InventoryMovement> => {
    return adminApi.post<InventoryMovement>(
      "/admin/inventory",
      data,
    );
  };