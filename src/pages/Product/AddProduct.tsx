import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { supabase } from "../../../config/config";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import CameraScanner from "../../components/cameraScanner";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useModal } from "../../hooks/useModal";
import {
  productCategories,
  productSchema,
  type ProductFormValues,
} from "../../../schemas/products.schema";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanImage = async (base64Image: string) => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-product", {
        body: { image: base64Image },
      });

      if (error) throw error;

      const product = data?.product as Record<string, unknown> | undefined;
      if (!product) return;

      const fieldMap: Record<string, keyof ProductFormValues> = {
        name: "name",
        description: "description",
        price: "price",
        brand: "brand",
        longevity: "longevity",
        sillage: "sillage",
        scent_family: "scent_family",
        base_notes: "base_notes",
        middle_notes: "middle_notes",
        top_notes: "top_notes",
        product_category: "product_catergory",
      };

      Object.entries(fieldMap).forEach(([responseKey, formKey]) => {
        const value = product[responseKey];
        if (typeof value === "string" || typeof value === "number") {
          setValue(formKey, value as ProductFormValues[typeof formKey], {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      });
    } catch (err) {
      console.error("Scanning failed:", err);
    } finally {
      setIsScanning(false);
    }
  };



  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      product_catergory: "Perfume",
      brand: "",
      longevity: "",
      sillage: "",
      scent_family: "",
      base_notes: "",
      middle_notes: "",
      top_notes: "",
      is_active: true,
    },
  });

  useEffect(() => {
    openModal();
  }, [openModal]);

  const handleClose = () => {
    closeModal();
    reset();
    setSelectedImages([]);
    navigate("/");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextFiles = files.slice(0, 3);
    setSelectedImages(nextFiles);
    setValue("images", nextFiles, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (values: ProductFormValues) => {
    console.log("Product submitted:", values);
    closeModal();
    reset();
    setSelectedImages([]);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-4xl p-6 lg:p-8 scrollbar-none"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Add Product</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a fragrance product with notes, category, and imagery.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <div className="mb-3">
              <Label htmlFor="name">Product Scanner</Label>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
              <CameraScanner onCapture={handleScanImage} isScanning={isScanning} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter product name"
                error={Boolean(errors.name)}
                hint={errors.name?.message}
              />
            </div>

            <div>
              <Label htmlFor="product_catergory">Category</Label>
              <select
                id="product_catergory"
                {...register("product_catergory")}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.product_catergory && (
                <p className="mt-1.5 text-xs text-red-500">{errors.product_catergory.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              placeholder="Enter product description"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step={0.01}
                min={0}
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                error={Boolean(errors.price)}
                hint={errors.price?.message}
              />
            </div>

            <div>
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                min={0}
                step={1}
                {...register("stock_quantity", { valueAsNumber: true })}
                placeholder="0"
                error={Boolean(errors.stock_quantity)}
                hint={errors.stock_quantity?.message}
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="Brand name"
                error={Boolean(errors.brand)}
                hint={errors.brand?.message}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="longevity">Longevity</Label>
              <Input
                id="longevity"
                {...register("longevity")}
                placeholder="e.g. 8 hours"
                error={Boolean(errors.longevity)}
                hint={errors.longevity?.message}
              />
            </div>

            <div>
              <Label htmlFor="sillage">Sillage</Label>
              <Input
                id="sillage"
                {...register("sillage")}
                placeholder="e.g. Moderate"
                error={Boolean(errors.sillage)}
                hint={errors.sillage?.message}
              />
            </div>

            <div>
              <Label htmlFor="scent_family">Scent Family</Label>
              <Input
                id="scent_family"
                {...register("scent_family")}
                placeholder="e.g. Floral"
                error={Boolean(errors.scent_family)}
                hint={errors.scent_family?.message}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="base_notes">Base Notes</Label>
              <Input
                id="base_notes"
                {...register("base_notes")}
                placeholder="e.g. Vanilla, Amber"
                error={Boolean(errors.base_notes)}
                hint={errors.base_notes?.message}
              />
            </div>

            <div>
              <Label htmlFor="middle_notes">Middle Notes</Label>
              <Input
                id="middle_notes"
                {...register("middle_notes")}
                placeholder="e.g. Rose, Jasmine"
                error={Boolean(errors.middle_notes)}
                hint={errors.middle_notes?.message}
              />
            </div>

            <div>
              <Label htmlFor="top_notes">Top Notes</Label>
              <Input
                id="top_notes"
                {...register("top_notes")}
                placeholder="e.g. Citrus, Bergamot"
                error={Boolean(errors.top_notes)}
                hint={errors.top_notes?.message}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Upload Product Images</Label>
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
              <input
                ref={fileInputRef}
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload at least 3 images
              </Button>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedImages.length > 0 ? (
                  selectedImages.map((file, index) => (
                    <span
                      key={`${file.name}-${index}`}
                      className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                    >
                      {file.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No images selected yet</span>
                )}
              </div>

              {errors.images && (
                <p className="mt-2 text-xs text-red-500">{errors.images.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <input
              id="is_active"
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="is_active" className="mb-0 cursor-pointer">
              Active product
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
