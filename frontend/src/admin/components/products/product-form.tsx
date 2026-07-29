import { useState } from "react";
import { adminFetch, adminUpload } from "../../../admin/lib/admin-api";
import { X, Upload, Loader2, Plus } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  volume: string;
  enum: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
}

interface ProductFormData {
  name: string;
  volume: string;
  sellingPrice: string;
  marketPrice: string;
  unitsInStock: string;
  averageCostPrice: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  volume: "",
  sellingPrice: "",
  marketPrice: "",
  unitsInStock: "0",
  averageCostPrice: "0",
};

interface Props {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ product: item, onClose, onSaved }: Props) {
  const isEdit = !!item;
  const [form, setForm] = useState<ProductFormData>(
    item
      ? {
          name: item.name,
          volume: item.volume,
          sellingPrice: String(item.sellingPrice),
          marketPrice: String(item.marketPrice),
          unitsInStock: String(item.unitsInStock),
          averageCostPrice: String(item.averageCostPrice),
        }
      : EMPTY_FORM
  );
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<string[]>(item?.categories ?? []);
  const [categoryInput, setCategoryInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewEnum = form.name && form.volume
    ? `${form.name}_${form.volume}`.toLowerCase().replace(/\s+/g, "_")
    : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const currentImages = item?.images.length ?? 0;
    const newTotal = currentImages + files.length + selected.length;

    if (newTotal > 5) {
      setError(`Cannot add ${selected.length} image(s): max 5 total`);
      return;
    }
    const oversized = selected.filter((f) => f.size > 150 * 1024);
    if (oversized.length > 0) {
      setError(`Some files exceed 150KB: ${oversized.map((f) => f.name).join(", ")}`);
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setError(null);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        volume: form.volume.trim(),
        sellingPrice: parseFloat(form.sellingPrice),
        marketPrice: parseFloat(form.marketPrice),
        unitsInStock: parseFloat(form.unitsInStock),
        averageCostPrice: parseFloat(form.averageCostPrice),
        categories,
      };

      let savedEnum: string;

      if (isEdit) {
        await adminFetch(`/products/${item.enum}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        savedEnum = item.enum;
      } else {
        const res = await adminFetch<{ data: Product }>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        savedEnum = res.data.enum;
      }

      // Upload new images
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append("images", f));
        await adminUpload(`/products/${savedEnum}/images`, formData);
      }

      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setIsLoading(false);
    }
  };

  const field = (label: string, key: keyof ProductFormData, type = "text", readOnly = false) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => !readOnly && setForm((p) => ({ ...p, [key]: e.target.value }))}
        readOnly={readOnly}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-muted"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {field("Name", "name")}
            {field("Volume", "volume")}
          </div>

          <div className="mt-3 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Enum (auto-generated)</label>
            <input
              readOnly
              value={isEdit ? item.enum : previewEnum}
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            {!isEdit && <p className="text-xs text-muted-foreground">Cannot be changed after creation</p>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            {field("Selling Price (₹)", "sellingPrice", "number")}
            {field("Market Price (₹)", "marketPrice", "number")}
            {field("Units in Stock", "unitsInStock", "number")}
            {field("Avg Cost Price (₹)", "averageCostPrice", "number")}
          </div>

          {/* Categories */}
          <div className="mt-3 space-y-2">
            <label className="text-sm font-medium text-foreground">Categories</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = categoryInput.trim();
                    if (val && !categories.includes(val)) {
                      setCategories((p) => [...p, val]);
                    }
                    setCategoryInput("");
                  }
                }}
                placeholder="Type and press Enter to add"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => {
                  const val = categoryInput.trim();
                  if (val && !categories.includes(val)) {
                    setCategories((p) => [...p, val]);
                  }
                  setCategoryInput("");
                }}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setCategories((p) => p.filter((c) => c !== cat))}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image upload */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Images ({(item?.images.length ?? 0) + files.length}/5)
            </label>
            {/* Existing images */}
            {item && item.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`item-${i}`}
                    className="h-16 w-16 rounded-md border object-cover"
                  />
                ))}
              </div>
            )}
            {/* New files preview */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-16 w-16 rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(item?.images.length ?? 0) + files.length < 5 && (
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                Add images (max 150KB each)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
