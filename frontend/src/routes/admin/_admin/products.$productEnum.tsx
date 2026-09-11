import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { ProductForm } from "../../../admin/components/products/product-form";
import { ProductImageManager } from "../../../admin/components/products/product-image-manager";
import {
  InventoryBatchTable,
  type InventoryBatch,
} from "../../../admin/components/inventory/inventory-batch-table";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  TrendingUp,
  Boxes,
  PackagePlus,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
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

  useEffect(() => {
    load();
  }, [productEnum]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 sm:p-6">
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
    <div className="space-y-6 p-4 sm:p-6">
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
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        </div>
        {!product.isVisible && (
          <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Hidden
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          <p className="mt-1.5 text-2xl font-semibold text-foreground">
            ₹{product.averageCostPrice.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">weighted average</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Margin</span>
          </div>
          <p
            className={`mt-1.5 text-2xl font-semibold ${margin !== null && margin >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            {margin !== null ? `${margin.toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            sell ₹{product.sellingPrice} / cost ₹{product.averageCostPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Barcode */}
      {product.barcode && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
          <span className="font-medium text-foreground">Barcode / SKU:</span>
          <span className="font-mono text-muted-foreground">{product.barcode}</span>
        </div>
      )}

      {/* Images */}
      <div className="rounded-xl border border-border bg-card p-4">
        <ProductImageManager
          productEnum={product.enum}
          images={product.images}
          onChanged={(images) => setProduct((p) => (p ? { ...p, images } : p))}
        />
      </div>

      {/* Edit + Add Inventory actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/inventory"
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <PackagePlus className="h-4 w-4" />
          Add Inventory
        </Link>
        <button
          onClick={() => setShowEditForm(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Edit Product Details
        </button>
      </div>

      {/* Batch history */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Inventory History</h2>
          <span className="text-xs text-muted-foreground">{batches.length} batch(es)</span>
        </div>
        <InventoryBatchTable batches={batches} onUpdated={load} />
      </div>

      {showEditForm && (
        <ProductForm
          product={product}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            setShowEditForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
