import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { ProductForm } from "../../../admin/components/products/product-form";
import { ArrowLeft, Loader2, AlertCircle, Plus, Package, TrendingUp, Boxes } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  volume: string;
  enum: string;
  barcode?: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
  isVisible: boolean;
}

interface InventoryBatch {
  _id: string;
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  expiryDate?: string;
  createdAt: string;
}

export const Route = createFileRoute("/admin/_admin/products/$productEnum")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productEnum } = Route.useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Add-batch form state
  const [batchForm, setBatchForm] = useState({ vendorName: "", numberOfUnits: "", totalCostPrice: "", expiryDate: "" });
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pRes, bRes] = await Promise.all([
        adminFetch<{ data: Product }>(`/products/${productEnum}`),
        adminFetch<{ data: InventoryBatch[] }>(`/inventory?itemEnum=${productEnum}`),
      ]);
      setProduct(pRes.data);
      setBatches(bRes.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [productEnum]);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);
    const units = parseInt(batchForm.numberOfUnits);
    const cost = parseFloat(batchForm.totalCostPrice);
    if (!batchForm.vendorName.trim()) return setBatchError("Vendor name is required");
    if (!units || units < 1) return setBatchError("Units must be at least 1");
    if (isNaN(cost) || cost < 0) return setBatchError("Cost price is required");

    setIsBatchLoading(true);
    try {
      await adminFetch("/inventory", {
        method: "POST",
        body: JSON.stringify({
          itemEnum: productEnum,
          numberOfUnits: units,
          totalCostPrice: cost,
          vendorName: batchForm.vendorName.trim(),
          ...(batchForm.expiryDate ? { expiryDate: batchForm.expiryDate } : {}),
        }),
      });
      setBatchForm({ vendorName: "", numberOfUnits: "", totalCostPrice: "", expiryDate: "" });
      await load();
    } catch (err: unknown) {
      setBatchError(err instanceof Error ? err.message : "Failed to add batch");
    } finally {
      setIsBatchLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error ?? "Product not found"}
        </div>
      </div>
    );
  }

  const margin =
    product.averageCostPrice > 0
      ? ((product.sellingPrice - product.averageCostPrice) / product.averageCostPrice) * 100
      : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/admin/products" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </button>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.volume}</p>
        </div>
        {!product.isVisible && (
          <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Hidden
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Boxes className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Stock</span>
          </div>
          <p className="mt-1.5 text-2xl font-semibold text-foreground">{product.unitsInStock}</p>
          <p className="text-xs text-muted-foreground">units in stock</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Avg Cost</span>
          </div>
          <p className="mt-1.5 text-2xl font-semibold text-foreground">₹{product.averageCostPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">weighted average</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Margin</span>
          </div>
          <p className={`mt-1.5 text-2xl font-semibold ${margin !== null && margin >= 0 ? "text-green-600" : "text-destructive"}`}>
            {margin !== null ? `${margin.toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">sell ₹{product.sellingPrice} / cost ₹{product.averageCostPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Barcode */}
      {product.barcode && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
          <span className="font-medium text-foreground">Barcode / SKU:</span>
          <span className="font-mono text-muted-foreground">{product.barcode}</span>
        </div>
      )}

      {/* Edit product button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowEditForm(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Edit Product Details
        </button>
      </div>

      {/* Add inventory batch */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Add Inventory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Stock will be added and avg cost price recalculated</p>
        </div>
        <form onSubmit={handleAddBatch} className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Vendor Name</label>
              <input
                type="text"
                value={batchForm.vendorName}
                onChange={(e) => setBatchForm((p) => ({ ...p, vendorName: e.target.value }))}
                placeholder="e.g. Reliance Fresh"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Units</label>
              <input
                type="number"
                min="1"
                value={batchForm.numberOfUnits}
                onChange={(e) => setBatchForm((p) => ({ ...p, numberOfUnits: e.target.value }))}
                placeholder="50"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Total Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={batchForm.totalCostPrice}
                onChange={(e) => setBatchForm((p) => ({ ...p, totalCostPrice: e.target.value }))}
                placeholder="500.00"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Expiry Date <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) => setBatchForm((p) => ({ ...p, expiryDate: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          {batchForm.numberOfUnits && batchForm.totalCostPrice && (
            <p className="mt-2 text-xs text-muted-foreground">
              Cost per unit: ₹{(parseFloat(batchForm.totalCostPrice) / parseInt(batchForm.numberOfUnits)).toFixed(2)}
            </p>
          )}
          {batchError && (
            <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{batchError}</p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isBatchLoading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isBatchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Batch
            </button>
          </div>
        </form>
      </div>

      {/* Batch history */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Inventory History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{batches.length} batch(es)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Batch #</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-right">Units</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Cost / Unit</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No inventory batches yet.
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const expiry = b.expiryDate ? new Date(b.expiryDate) : null;
                  const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null;
                  return (
                  <tr key={b._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">#{b.inventoryBatch}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.vendorName}</td>
                    <td className="px-4 py-3 text-right">{b.numberOfUnits}</td>
                    <td className="px-4 py-3 text-right">₹{b.totalCostPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      ₹{(b.totalCostPrice / b.numberOfUnits).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {expiry ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          daysLeft! < 0 ? "bg-destructive/15 text-destructive" :
                          daysLeft! <= 30 ? "bg-yellow-100 text-yellow-800" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {daysLeft! < 0 ? "Expired" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditForm && (
        <ProductForm
          product={product}
          onClose={() => setShowEditForm(false)}
          onSaved={() => { setShowEditForm(false); load(); }}
        />
      )}
    </div>
  );
}
