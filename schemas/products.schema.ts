import { z } from "zod";

export const productCategories = [
  "Perfume",
  "Lip Gloss",
  "Body Splash",
  "Cologne",
] as const;

const optionalString = z.union([z.string().trim(), z.literal("")]).optional();

const numericField = (fieldName: string, minValue: number) =>
  z.number({ error: `${fieldName} is required` }).min(
    minValue,
    `${fieldName} must be ${minValue} or greater`
  );

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: numericField("Price", 0),
  stock_quantity: z
    .number({ error: "Stock quantity is required" })
    .refine((value) => Number.isInteger(value), "Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  product_catergory: z.enum(productCategories, {
    message: "Please select a valid product category",
  }),
  brand: optionalString,
  longevity: optionalString,
  sillage: optionalString,
  scent_family: optionalString,
  base_notes: optionalString,
  middle_notes: optionalString,
  top_notes: optionalString,
  images: z.array(z.instanceof(File)).min(3, "Please upload at least 3 product images"),
  is_active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
