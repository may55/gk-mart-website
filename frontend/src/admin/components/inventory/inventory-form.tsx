import { useState, useEffect } from "react";
import { adminFetch } from "../../lib/admin-api";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface Item {
  enum: string;
  name: string;
  volume: string;
  averageCostPrice: number;
}

interface InventoryBatch {
  _id: string;
  itemEnum: string;
  vendorName: string;
  marginPercent: number;
}

interface BulkRow {
  itemEnum: string;
  numberOfUnits: string;
  totalCostPrice: string;
  marginPercent: string;
}

const EMPTY_ROW: BulkRow = { itemEnum: "", numberOfUnits: "", totalCostPrice: "", marginPercent: "" };

interface Props {
  batch?: InventoryBatch;
  onClose: () => void;
  onSaved: () => void;
}

export function InventoryForm({ batch, onClose, onSaved }: Props) {
  const isEdit = !!batch;
  const [items, setItems] = useState<Item[]>([]);
  const [vendorName, setVendorName] = useState(batch?.vendorName ?? "");
  const [marginPercent, setMarginPercent] = useState(String(batch?.marginPercent ?? ""));
  const [rows, setRows] = useState<BulkRow[]>([{ ...EMPTY_ROW }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) {
      adminFetch<{ data: Item[] }>("/products")
        .then((res) => setItems(res.data))
        .catch(() => {});
    }
  }, [isEdit]);

  const addRow = () => setRows((p) => [...p, { ...EMPTY_ROW }]);
  const removeRow = (i: number) => setRows((p) => p.filter((_, idx) => idx !== i));
  const setRow = (i: number, key: keyof BulkRow, val: string) =>
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isEdit) {
        await adminFetch(`/inventory/${batch._id}`, {
          method: "PUT",
          body: JSON.stringify({ marginPercent: parseFloat(marginPercent) }),
        });
      } else {
        await adminFetch("/inventory/bulk", {
          method: "POST",
          body: JSON.stringify({
            vendorName,
            items: rows.map((r) => ({
              itemEnum: r.itemEnum,
              numberOfUnits: parseInt(r.numberOfUnits),
              totalCostPrice: parseFloat(r.totalCostPrice),
              marginPercent: parseFloat(r.marginPercent),
            })),
          }),
        });
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${isEdit ? "max-w-md" : "max-w-3xl"} rounded-xl border border-border bg-card shadow-xl`}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Update Margin" : "Add Inventory"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
          {isEdit ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Item</label>
                <input
                  readOnly
                  value={batch.itemEnum}
                  className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                />
              </div>
              {batch.vendorName && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Vendor</label>
                  <input
                    readOnly
                    value={batch.vendorName}
                    className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Margin %</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Vendor Name</label>
                <input
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. ABC Distributors"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Products</label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add product
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium w-24">Units</th>
                        <th className="px-3 py-2 font-medium w-32">Total Cost ₹</th>
                        <th className="px-3 py-2 font-medium w-24">Margin %</th>
                        <th className="px-3 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">
                            <select
                              value={row.itemEnum}
                              onChange={(e) => setRow(i, "itemEnum", e.target.value)}
                              required
                              className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                            >
                              <option value="">Select product...</option>
                              {items.map((it) => (
                                <option key={it.enum} value={it.enum}>
                                  {it.name} {it.volume}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={row.numberOfUnits}
                              onChange={(e) => setRow(i, "numberOfUnits", e.target.value)}
                              required
                              placeholder="0"
                              className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.totalCostPrice}
                              onChange={(e) => setRow(i, "totalCostPrice", e.target.value)}
                              required
                              placeholder="0.00"
                              className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.marginPercent}
                              onChange={(e) => setRow(i, "marginPercent", e.target.value)}
                              required
                              placeholder="0"
                              className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRow(i)}
                                className="rounded p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
