import { useState } from "react";
import { adminFetch } from "../../lib/admin-api";
import { Loader2, Pencil, Trash2, X, Check } from "lucide-react";

export interface InventoryBatch {
  _id: string;
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  billImage?: string;
  createdAt: string;
}

interface EditState {
  id: string;
  units: string;
  totalCost: string;
}

interface Props {
  batches: InventoryBatch[];
  showProduct?: boolean;
  onUpdated: () => void;
}

export function InventoryBatchTable({ batches, showProduct = false, onUpdated }: Props) {
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (b: InventoryBatch) => {
    setError(null);
    setEditing({ id: b._id, units: String(b.numberOfUnits), totalCost: String(b.totalCostPrice) });
  };

  const cancelEdit = () => {
    setEditing(null);
    setError(null);
  };

  const saveEdit = async (b: InventoryBatch) => {
    if (!editing) return;
    const units = parseInt(editing.units);
    const cost = parseFloat(editing.totalCost);
    if (!Number.isInteger(units) || units < 1) {
      setError("Units must be a positive integer.");
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setError("Cost must be non-negative.");
      return;
    }
    if (units === b.numberOfUnits && cost === b.totalCostPrice) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await adminFetch(`/inventory/${b._id}`, {
        method: "PUT",
        body: JSON.stringify({ numberOfUnits: units, totalCostPrice: cost }),
      });
      setEditing(null);
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update batch");
    } finally {
      setSaving(false);
    }
  };

  const deleteBatch = async (b: InventoryBatch) => {
    if (
      !window.confirm(
        `Delete inventory batch #${b.inventoryBatch}? This will reverse its stock and cost.`,
      )
    ) {
      return;
    }
    setDeleting(b._id);
    setError(null);
    try {
      await adminFetch(`/inventory/${b._id}`, { method: "DELETE" });
      if (editing?.id === b._id) setEditing(null);
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete batch");
    } finally {
      setDeleting(null);
    }
  };

  const colSpan = showProduct ? 9 : 8;

  if (batches.length === 0) {
    return (
      <div className="rounded-xl border border-border">
        <p className="py-12 text-center text-sm text-muted-foreground">No inventory batches yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            {showProduct && <th className="px-4 py-3">Product</th>}
            <th className="px-4 py-3">Batch #</th>
            <th className="px-4 py-3">Vendor</th>
            <th className="px-4 py-3 text-right">Units</th>
            <th className="px-4 py-3 text-right">Total Cost</th>
            <th className="px-4 py-3 text-right">Cost / Unit</th>
            <th className="px-4 py-3">Bill</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {error && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-2 text-sm text-destructive bg-destructive/5">
                {error}
              </td>
            </tr>
          )}
          {batches.map((b) => {
            const isEditingThis = editing?.id === b._id;
            const displayUnits = isEditingThis ? parseInt(editing.units) || 0 : b.numberOfUnits;
            const displayCost = isEditingThis
              ? parseFloat(editing.totalCost) || 0
              : b.totalCostPrice;

            return (
              <tr key={b._id} className={isEditingThis ? "bg-muted/40" : "hover:bg-muted/30"}>
                {showProduct && (
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {b.itemEnum}
                  </td>
                )}
                <td className="px-4 py-3 font-medium">#{b.inventoryBatch}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.vendorName}</td>

                {/* Editable: units */}
                <td className="px-4 py-3 text-right">
                  {isEditingThis ? (
                    <input
                      type="number"
                      min="1"
                      value={editing.units}
                      onChange={(e) => setEditing((p) => p && { ...p, units: e.target.value })}
                      className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      autoFocus
                    />
                  ) : (
                    b.numberOfUnits
                  )}
                </td>

                {/* Editable: total cost */}
                <td className="px-4 py-3 text-right">
                  {isEditingThis ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editing.totalCost}
                      onChange={(e) => setEditing((p) => p && { ...p, totalCost: e.target.value })}
                      className="w-24 rounded border border-input bg-background px-2 py-1 text-right text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  ) : (
                    `₹${b.totalCostPrice.toFixed(2)}`
                  )}
                </td>

                <td className="px-4 py-3 text-right text-muted-foreground">
                  {displayUnits > 0 ? `₹${(displayCost / displayUnits).toFixed(2)}` : "—"}
                </td>

                <td className="px-4 py-3">
                  {b.billImage ? (
                    <a
                      href={b.billImage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      View bill
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => saveEdit(b)}
                        disabled={saving}
                        className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-60"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(b)}
                        disabled={!!editing || deleting !== null}
                        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBatch(b)}
                        disabled={!!editing || deleting !== null}
                        className="flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40"
                      >
                        {deleting === b._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
