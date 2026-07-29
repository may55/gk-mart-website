import { useState, useEffect } from "react";
import { adminFetch } from "../../lib/admin-api";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface Item { enum: string; name: string; volume: string; sellingPrice: number; marketPrice: number; averageCostPrice: number; }
interface User { _id: string; name: string; email: string; }

interface OrderItemData {
  enum: string;
  unit: string;
  sellingPrice: string;
  costPrice: string;
  mrp: string;
}

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
}

interface Props {
  order?: Order;
  onClose: () => void;
  onSaved: () => void;
}

const DELIVERY_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_METHODS = ["cash", "upi", "card", "net_banking"];

const EMPTY_ITEM: OrderItemData = { enum: "", unit: "", sellingPrice: "", costPrice: "", mrp: "" };

export function OrderForm({ order, onClose, onSaved }: Props) {
  const isEdit = !!order;
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>(
    order?.items.map((i) => ({
      enum: i.enum,
      unit: String(i.unit),
      sellingPrice: String(i.sellingPrice),
      costPrice: String(i.costPrice),
      mrp: String(i.mrp),
    })) ?? [{ ...EMPTY_ITEM }]
  );
  const getUserId = () => {
    if (!order) return "";
    if (typeof order.userId === "object") return order.userId._id;
    return order.userId;
  };
  const [userId, setUserId] = useState(getUserId());
  const [totalAmount, setTotalAmount] = useState(String(order?.totalAmount ?? ""));
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod ?? "");
  const [deliveryStatus, setDeliveryStatus] = useState(order?.deliveryStatus ?? "pending");
  const [deliveredAt, setDeliveredAt] = useState(
    order?.deliveredAt ? order.deliveredAt.slice(0, 10) : ""
  );
  const [addrLabel, setAddrLabel] = useState(order?.userAddress.label ?? "");
  const [addrLine1, setAddrLine1] = useState(order?.userAddress.line1 ?? "");
  const [addrLine2, setAddrLine2] = useState(order?.userAddress.line2 ?? "");
  const [addrPincode, setAddrPincode] = useState(order?.userAddress.pincode ?? "");
  const [addrCity, setAddrCity] = useState(order?.userAddress.city ?? "");
  const [addrState, setAddrState] = useState(order?.userAddress.state ?? "");
  const [addrPhone, setAddrPhone] = useState(order?.userAddress.phone ?? "");
  const [invoiceLink, setInvoiceLink] = useState(order?.invoiceLink ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminFetch<{ data: Item[] }>("/products"),
      adminFetch<{ data: User[] }>("/users"),
    ]).then(([itemsRes, usersRes]) => {
      setItems(itemsRes.data);
      setUsers(usersRes.data);
    }).catch(() => {});
  }, []);

  const addItem = () => setOrderItems((p) => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setOrderItems((p) => p.filter((_, idx) => idx !== i));
  const setOrderItem = (i: number, key: keyof OrderItemData, val: string) =>
    setOrderItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const onItemSelect = (i: number, enumVal: string) => {
    const found = items.find((it) => it.enum === enumVal);
    setOrderItems((p) =>
      p.map((item, idx) =>
        idx === i
          ? {
              ...item,
              enum: enumVal,
              sellingPrice: found ? String(found.sellingPrice) : "",
              costPrice: found ? String(found.averageCostPrice) : "",
              mrp: found ? String(found.marketPrice) : "",
            }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = {
        items: orderItems.map((i) => ({
          enum: i.enum,
          unit: parseInt(i.unit),
          sellingPrice: parseFloat(i.sellingPrice),
          costPrice: parseFloat(i.costPrice),
          mrp: parseFloat(i.mrp),
        })),
        userId,
        totalAmount: parseFloat(totalAmount),
        userAddress: { label: addrLabel, line1: addrLine1, line2: addrLine2, pincode: addrPincode, city: addrCity, state: addrState, phone: addrPhone },
        paymentMethod,
        deliveryStatus,
        deliveredAt: deliveredAt || undefined,
        invoiceLink,
      };
      if (isEdit) {
        await adminFetch(`/orders/${order._id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/orders", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit Order" : "Create Order"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
          {/* Customer */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Customer</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select a customer...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Items</label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
            {orderItems.map((oi, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 rounded-lg border border-border p-3">
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Item</p>
                  <select value={oi.enum} onChange={(e) => onItemSelect(i, e.target.value)} required
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select...</option>
                    {items.map((it) => <option key={it.enum} value={it.enum}>{it.name} {it.volume}</option>)}
                  </select>
                </div>
                {(["unit", "sellingPrice", "costPrice", "mrp"] as const).map((k) => (
                  <div key={k} className="space-y-1">
                    <p className="text-xs text-muted-foreground capitalize">{k === "sellingPrice" ? "Price" : k === "costPrice" ? "Cost" : k}</p>
                    <input type="number" min="0" step={k === "unit" ? "1" : "0.01"} value={oi[k]}
                      onChange={(e) => setOrderItem(i, k, e.target.value)} required
                      className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                ))}
                <div className="flex items-end justify-end">
                  {orderItems.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery Address</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["Label", addrLabel, setAddrLabel],
                ["Phone", addrPhone, setAddrPhone],
                ["Line 1", addrLine1, setAddrLine1],
                ["Line 2", addrLine2, setAddrLine2],
                ["City", addrCity, setAddrCity],
                ["Pincode", addrPincode, setAddrPincode],
                ["State", addrState, setAddrState],
              ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                <div key={label} className={`space-y-1.5 ${
                  label === "Line 1" || label === "Line 2" ? "col-span-2" : ""
                }`}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <input value={val} onChange={(e) => setter(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select...</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Amount (₹)</label>
              <input type="number" min="0" step="0.01" value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Delivery Status</label>
              <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Delivered At</label>
              <input type="date" value={deliveredAt} onChange={(e) => setDeliveredAt(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Invoice Link (optional)</label>
            <input value={invoiceLink} onChange={(e) => setInvoiceLink(e.target.value)} placeholder="https://..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
