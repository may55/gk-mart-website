import { useState, useEffect, useRef } from "react";
import { adminFetch, adminUpload } from "../../../admin/lib/admin-api";
import { X, Upload, Loader2, Plus } from "lucide-react";

interface CategoryOption {
  _id: string;
  label: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  enum: string;
  barcode?: string;
  sellingPrice: number;
  marketPrice: number;
  expiryMonth?: number;
  expiryYear?: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
  metadata: string;
  isVisible: boolean;
}

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  sellingPrice: string;
  marketPrice: string;
  expiryMonth: string;
  expiryYear: string;
  metadata: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  sku: "",
  barcode: "",
  sellingPrice: "",
  marketPrice: "",
  expiryMonth: "",
  expiryYear: "",
  metadata: "",
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
          sku: item.sku,
          barcode: item.barcode ?? "",
          sellingPrice: String(item.sellingPrice),
          marketPrice: String(item.marketPrice),
          expiryMonth: item.expiryMonth ? String(item.expiryMonth) : "",
          expiryYear: item.expiryYear ? String(item.expiryYear) : "",
          metadata: item.metadata ?? "",
        }
      : EMPTY_FORM,
  );
  const [isVisible, setIsVisible] = useState(item?.isVisible ?? true);
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<string[]>(item?.categories ?? []);
  const [categoryInput, setCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = useState<string[]>(item?.images ?? []);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewEnum =
    form.name && form.sku && form.marketPrice
      ? `${form.name}_${form.sku}_${form.marketPrice}_${form.expiryMonth || "na"}_${form.expiryYear || "na"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "")
      : "";

  useEffect(() => {
    adminFetch<{ data: CategoryOption[] }>("/categories")
      .then((res) => setAllCategories(res.data))
      .catch(() => {});
  }, []);

  const suggestions = categoryInput.trim()
    ? allCategories.filter(
        (c) =>
          c.label.toLowerCase().includes(categoryInput.toLowerCase()) &&
          !categories.includes(c.label),
      )
    : [];

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

  const handleDeleteExistingImage = async (index: number) => {
    if (!item) return;
    setDeletingIndex(index);
    setError(null);
    try {
      await adminFetch(`/products/${item.enum}/images/${index}`, { method: "DELETE" });
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        ...(form.barcode.trim() ? { barcode: form.barcode.trim() } : {}),
        sellingPrice: parseFloat(form.sellingPrice),
        marketPrice: parseFloat(form.marketPrice),
        ...(form.expiryMonth ? { expiryMonth: parseInt(form.expiryMonth, 10) } : {}),
        ...(form.expiryYear ? { expiryYear: parseInt(form.expiryYear, 10) } : {}),
        metadata: form.metadata.trim(),
        categories,
        isVisible,
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
            {field("SKU", "sku")}
          </div>

          <div className="mt-3">{field("Barcode (optional)", "barcode")}</div>

          <div className="mt-3 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Enum (auto-generated)</label>
            <input
              readOnly
              value={isEdit ? item.enum : previewEnum}
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            {!isEdit && (
              <p className="text-xs text-muted-foreground">Cannot be changed after creation</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            {field("Selling Price (₹)", "sellingPrice", "number")}
            {field("Market Price (₹)", "marketPrice", "number")}
            {field("Expiry Month", "expiryMonth", "number")}
            {field("Expiry Year", "expiryYear", "number")}
          </div>

          <div className="mt-3 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Search metadata</label>
            <textarea
              value={form.metadata}
              onChange={(e) => setForm((p) => ({ ...p, metadata: e.target.value }))}
              rows={5}
              placeholder="Keywords, aliases, local names, brand, use cases, ingredients…"
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Used by MongoDB text search on the storefront.
            </p>
          </div>

          {/* Categories */}
          <div className="mt-3 space-y-2">
            <label className="text-sm font-medium text-foreground">Categories</label>
            <div className="relative flex gap-2">
              <input
                ref={categoryInputRef}
                type="text"
                value={categoryInput}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = categoryInput.trim();
                    if (val && !categories.includes(val)) {
                      setCategories((p) => [...p, val]);
                    }
                    setCategoryInput("");
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search or type a new category"
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
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-border bg-card shadow-md">
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCategories((p) => [...p, s.label]);
                        setCategoryInput("");
                        setShowSuggestions(false);
                        categoryInputRef.current?.focus();
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
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
              Images ({existingImages.length + files.length}/5)
            </label>
            {/* Existing images */}
            {item && existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, i) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`item-${i}`}
                      className="h-16 w-16 rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(i)}
                      disabled={deletingIndex !== null}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white disabled:opacity-60"
                    >
                      {deletingIndex === i ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </div>
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
            {existingImages.length + files.length < 5 && (
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

          {/* Visibility toggle */}
          <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Visible on storefront</p>
              <p className="text-xs text-muted-foreground">
                Hidden products won't appear to customers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVisible((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isVisible ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isVisible ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
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
