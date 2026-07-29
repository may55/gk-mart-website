import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { InventoryForm } from "../../../admin/components/inventory/inventory-form";
import { Plus, Pencil, Loader2, AlertCircle } from "lucide-react";

interface InventoryBatch {
  _id: string;
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  marginPercent: number;
  vendorName: string;
  createdAt: string;
}

export const Route = createFileRoute("/admin/_admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBatch, setEditBatch] = useState<InventoryBatch | undefined>();

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: InventoryBatch[] }>("/inventory");
      setBatches(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{batches.length} batch(es)</p>
        </div>
        <button
          onClick={() => { setEditBatch(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Batch
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
                <th className="px-4 py-3">Item Enum</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-center">Batch #</th>
                <th className="px-4 py-3 text-right">Units</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Margin %</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No inventory batches yet.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{b.itemEnum}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{b.vendorName || "—"}</td>
                    <td className="px-4 py-3 text-center font-medium">#{b.inventoryBatch}</td>
                    <td className="px-4 py-3 text-right">{b.numberOfUnits}</td>
                    <td className="px-4 py-3 text-right">₹{b.totalCostPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{b.marginPercent}%</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setEditBatch(b); setShowForm(true); }}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Update margin"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <InventoryForm
          batch={editBatch}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
