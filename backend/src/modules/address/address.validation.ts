import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema =
  createAddressSchema.partial();