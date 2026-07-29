import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { OrderForm } from "../../../admin/components/orders/order-form";
import { Plus, Pencil, Loader2, AlertCircle } from "lucide-react";

interface Order {
  _id: string;
  items: { enum: string; unit: number; sellingPrice: number; costPrice: number; mrp: number }[];
  userId: { _id: string; name: string; email: string } | string;
  totalAmount: number;
  userAddress: { label: string; line1: string; line2: string; pincode: string; city: string; state: string; phone: string };
  paymentMethod: string;
  deliveryStatus: string;
  deliveredAt?: string;
  invoiceLink: string;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const Route = createFileRoute("/admin/_admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | undefined>();

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: Order[] }>("/orders");
      setOrders(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getUserName = (userId: Order["userId"]) => {
    if (typeof userId === "object" && userId !== null) return userId.name;
    return String(userId);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{orders.length} order(s) — sorted by latest update</p>
        </div>
        <button
          onClick={() => { setEditOrder(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No orders yet.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{o.invoiceId}</code>
                    </td>
                    <td className="px-4 py-3 font-medium">{getUserName(o.userId)}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{o.totalAmount}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.deliveryStatus] ?? ""}`}>
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.items.length} item(s)</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.updatedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditOrder(o); setShowForm(true); }}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
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
        <OrderForm
          order={editOrder}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
