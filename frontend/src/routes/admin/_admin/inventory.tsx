import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { InventoryAddForm } from "../../../admin/components/inventory/inventory-add-form";
import {
  InventoryBatchTable,
  type InventoryBatch,
} from "../../../admin/components/inventory/inventory-batch-table";
import { Loader2 } from "lucide-react";

interface InventoryBatch {
  _id: string;
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  billImage?: string;
  createdAt: string;
}

export const Route = createFileRoute("/admin/_admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch<{ data: InventoryBatch[] }>("/inventory");
      setBatches(res.data);
    } catch {
      // silent — table stays empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add Inventory</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Search an existing product or add a new one, then record a stock batch.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <InventoryAddForm onAdded={loadBatches} />
      </div>

      {/* History */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">All Inventory Batches</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <InventoryBatchTable batches={batches} showProduct onUpdated={loadBatches} />
        )}
      </div>
    </div>
  );
}
