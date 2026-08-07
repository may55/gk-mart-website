import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { ProductForm } from "../../../admin/components/products/product-form";
import { Plus, Pencil, Trash2, Image, Loader2, AlertCircle, EyeOff } from "lucide-react";

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
  isVisible: boolean;
}

export const Route = createFileRoute("/admin/_admin/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [deletingEnum, setDeletingEnum] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: Product[] }>("/products");
      setProducts(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (itemEnum: string) => {
    if (!confirm(`Delete product "${itemEnum}"? This cannot be undone.`)) return;
    setDeletingEnum(itemEnum);
    try {
      await adminFetch(`/products/${itemEnum}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((i) => i.enum !== itemEnum));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingEnum(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Items</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{products.length} product(s) total</p>
        </div>
        <button
          onClick={() => { setEditProduct(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Enum</th>
                <th className="px-4 py-3 text-right">Selling ₹</th>
                <th className="px-4 py-3 text-right">MRP ₹</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Avg Cost</th>
                <th className="px-4 py-3 text-center">Images</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No items yet. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate({ to: "/admin/products/$productEnum", params: { productEnum: product.enum } })}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-foreground">{product.name}</p>
                            {!product.isVisible && (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" title="Hidden from storefront" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{product.volume}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{product.enum}</code>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{product.sellingPrice}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">₹{product.marketPrice}</td>
                    <td className="px-4 py-3 text-right">{product.unitsInStock}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">₹{product.averageCostPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{product.images.length}/5</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          product.categories.map((c) => (
                            <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditProduct(product); setShowForm(true); }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(product.enum); }}
                          disabled={deletingEnum === product.enum}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingEnum === product.enum ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadProducts(); }}
        />
      )}
    </div>
  );
}
