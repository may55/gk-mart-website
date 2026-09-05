import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { adminFetch, adminUpload } from "../../lib/admin-api";
import { Loader2, CheckCircle2, ChevronDown, EyeOff } from "lucide-react";
import { calculateDiscountPercent } from "../../../lib/pricing";

interface Product {
  _id: string;
  name: string;
  sku: string;
  enum: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock: number;
  averageCostPrice: number;
  categories: string[];
  isVisible: boolean;
}

interface Props {
  onAdded: () => void;
}

const EMPTY_NEW = {
  sku: "",
  sellingPrice: "",
  marketPrice: "",
};

export function InventoryAddForm({ onAdded }: Props) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newFields, setNewFields] = useState(EMPTY_NEW);

  // Batch fields
  const [units, setUnits] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [vendor, setVendor] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [billImage, setBillImage] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makeVisible, setMakeVisible] = useState(false);
  const unitsRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    adminFetch<{ data: Product[] }>("/products")
      .then((res) => setAllProducts(res.data))
      .catch(() => {});
  }, []);

  const suggestions =
    query.trim().length > 0
      ? allProducts
          .filter((p) =>
            `${p.name} ${p.sku} ${p.marketPrice} ${p.enum}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const selectProduct = (p: Product) => {
    setSelected(p);
    setIsNewProduct(false);
    setMakeVisible(false);
    setQuery(`${p.name} · ${p.sku} · ₹${p.marketPrice}`);
    setShowDropdown(false);
    setTimeout(() => unitsRef.current?.focus(), 50);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelected(null);
    setIsNewProduct(false);
    setShowDropdown(true);
  };

  const markAsNew = () => {
    setSelected(null);
    setIsNewProduct(true);
    setShowDropdown(false);
  };

  const reset = () => {
    setQuery("");
    setSelected(null);
    setIsNewProduct(false);
    setNewFields(EMPTY_NEW);
    setUnits("");
    setTotalCost("");
    setVendor("");
    setExpiryMonth("");
    setExpiryYear("");
    setBillImage(null);
    setMakeVisible(false);
    setError(null);
    setSuccess(false);
  };

  const unitsNum = parseInt(units) || 0;
  const afterStock = selected ? selected.unitsInStock + unitsNum : unitsNum;
  const sellingPrice = selected ? selected.sellingPrice : parseFloat(newFields.sellingPrice) || 0;
  const marketPrice = selected ? selected.marketPrice : parseFloat(newFields.marketPrice) || 0;
  const discountPct = calculateDiscountPercent(sellingPrice, marketPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selected && !isNewProduct) {
      setError("Select an existing product or choose to add a new one.");
      return;
    }
    if (!units || parseInt(units) < 1) {
      setError("Units must be at least 1.");
      return;
    }
    if (!totalCost || parseFloat(totalCost) < 0) {
      setError("Total cost price is required.");
      return;
    }
    if (!vendor.trim()) {
      setError("Vendor name is required.");
      return;
    }

    if (isNewProduct) {
      if (!query.trim()) {
        setError("Product name is required.");
        return;
      }
      if (!newFields.sku.trim()) {
        setError("SKU is required.");
        return;
      }
      if (!newFields.sellingPrice) {
        setError("Selling price is required.");
        return;
      }
      if (!newFields.marketPrice) {
        setError("MRP is required.");
        return;
      }
    }

    setIsLoading(true);
    try {
      let targetEnum: string;

      if (isNewProduct) {
        const res = await adminFetch<{ data: Product }>("/products", {
          method: "POST",
          body: JSON.stringify({
            name: query.trim(),
            sku: newFields.sku.trim(),
            sellingPrice: parseFloat(newFields.sellingPrice),
            marketPrice: parseFloat(newFields.marketPrice),
            ...(expiryMonth ? { expiryMonth: parseInt(expiryMonth, 10) } : {}),
            ...(expiryYear ? { expiryYear: parseInt(expiryYear, 10) } : {}),
            isVisible: true,
          }),
        });
        targetEnum = res.data.enum;
      } else {
        targetEnum = selected!.enum;
        if (makeVisible && !selected!.isVisible) {
          await adminFetch(`/products/${targetEnum}`, {
            method: "PUT",
            body: JSON.stringify({ isVisible: true }),
          });
        }
      }

      const formData = new FormData();
      formData.append("itemEnum", targetEnum);
      formData.append("numberOfUnits", String(parseInt(units)));
      formData.append("totalCostPrice", String(parseFloat(totalCost)));
      formData.append("vendorName", vendor.trim());
      if (billImage) formData.append("billImage", billImage);
      await adminUpload("/inventory", formData);

      setSuccess(true);
      onAdded();
      setTimeout(reset, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {isLoading &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Saving inventory…</p>
            </div>
          </div>,
          document.body,
        )}
      {/* Product search */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Product Name</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Search existing product or type new name…"
            className={inputCls}
            autoComplete="off"
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {showDropdown && query.trim().length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-card shadow-md">
              {suggestions.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectProduct(p)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-accent"
                >
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {p.sku} · ₹{p.marketPrice} · {p.unitsInStock} in stock
                  </span>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={markAsNew}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm text-primary hover:bg-accent"
              >
                + Add "{query.trim()}" as new product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New product extra fields */}
      {isNewProduct && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            New product details — image & categories can be added later
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">SKU</label>
              <input
                type="text"
                value={newFields.sku}
                onChange={(e) => setNewFields((p) => ({ ...p, sku: e.target.value }))}
                placeholder="e.g. RICE-001"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">MRP (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newFields.marketPrice}
                onChange={(e) => setNewFields((p) => ({ ...p, marketPrice: e.target.value }))}
                placeholder="100.00"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newFields.sellingPrice}
                onChange={(e) => setNewFields((p) => ({ ...p, sellingPrice: e.target.value }))}
                placeholder="90.00"
                className={inputCls}
              />
            </div>
            <div className="flex items-end pb-2">
              {discountPct > 0 && (
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  {discountPct}% off MRP
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expiry Month (optional)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                placeholder="1–12"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expiry Year (optional)</label>
              <input
                type="number"
                min="2000"
                max="3000"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                placeholder="2027"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Existing product info strip */}
      {selected && (
        <div className="flex items-center gap-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">SKU</p>
            <p className="font-medium">{selected.sku}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Selling Price</p>
            <p className="font-medium">₹{selected.sellingPrice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">MRP</p>
            <p className="font-medium">₹{selected.marketPrice}</p>
          </div>
          {discountPct > 0 && (
            <span className="ml-auto rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              {discountPct}% off
            </span>
          )}
        </div>
      )}

      {/* Hidden product warning */}
      {selected && !selected.isVisible && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">
              This product is hidden from the storefront.
            </p>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-yellow-700">
              <input
                type="checkbox"
                checked={makeVisible}
                onChange={(e) => setMakeVisible(e.target.checked)}
                className="h-4 w-4 rounded border-yellow-400 accent-yellow-600"
              />
              Make visible when saving inventory
            </label>
          </div>
        </div>
      )}

      {/* Batch fields */}
      {(selected || isNewProduct) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Number of Units</label>
            <input
              ref={unitsRef}
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="50"
              className={inputCls}
            />
            {selected && unitsNum > 0 && (
              <p className="text-xs text-muted-foreground">
                Stock: {selected.unitsInStock} →{" "}
                <span className="font-semibold text-foreground">{afterStock}</span> after addition
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Total Cost Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="500.00"
              className={inputCls}
            />
            {units && totalCost && parseInt(units) > 0 && (
              <p className="text-xs text-muted-foreground">
                ₹{(parseFloat(totalCost) / parseInt(units)).toFixed(2)} per unit
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Vendor Name</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Reliance Fresh"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Bill image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBillImage(e.target.files?.[0] ?? null)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Inventory added successfully!
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || (!selected && !isNewProduct)}
          className="flex min-w-36 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Add Inventory
        </button>
      </div>
    </form>
  );
}
