import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthPromptModal } from "@/components/auth-prompt-modal";
import { apiFetch } from "@/lib/api";
import { formatPrice, calculateLineSavings } from "@/lib/pricing";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — GK Mart" },
      {
        name: "description",
        content: "Track your ongoing grocery deliveries and view past orders from GK Mart.",
      },
      { property: "og:title", content: "My Orders — GK Mart" },
      { property: "og:description", content: "Track ongoing and past grocery orders on GK Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const ONGOING_STATUSES = new Set(["pending", "processing", "shipped"]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function OrdersPage() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    apiFetch<{ data: Order[] }>("/orders", {}, token)
      .then((r) => setOrders(r.data))
      .catch(() => setError("Couldn't load orders. Pull to refresh."))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  const ongoingOrders = orders.filter((o) => ONGOING_STATUSES.has(o.deliveryStatus));
  const pastOrders = orders.filter((o) => !ONGOING_STATUSES.has(o.deliveryStatus));

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
          <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight">My Orders</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Track deliveries and reorder favourites
            </p>
          </header>
          <main className="flex flex-1 items-center justify-center px-5">
            <AuthPromptModal
              title="Track Your Orders"
              description="Sign in to view your order history and track ongoing deliveries"
              onClose={() => navigate({ to: "/" })}
            />
          </main>
        </div>
      </div>
    );
  }

  // Legacy in-page detail rendering is replaced by the shareable /order/:orderId route.
  if (selected) {
    const addr = selected.userAddress ?? null;
    const isOngoing = ONGOING_STATUSES.has(selected.deliveryStatus);
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col pb-16">
          <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">{selected.invoiceId}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <span
                className={`mt-1 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
                  isOngoing
                    ? "bg-primary/10 text-primary"
                    : selected.deliveryStatus === "cancelled"
                      ? "bg-red-100 text-red-600 dark:bg-red-950/40"
                      : "bg-green-100 text-green-700 dark:bg-green-950/40"
                }`}
              >
                {selected.deliveryStatus}
              </span>
            </div>
          </header>

          <main className="flex-1 space-y-4 px-5 pt-2">
            {/* Items */}
            <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <p className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              <ul className="divide-y divide-border">
                {selected.items.map((item, i) => {
                  const savings = calculateLineSavings(item.mrp, item.sellingPrice, item.unit);
                  return (
                    <li key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-base">
                        🛒
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.enum}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatPrice(item.sellingPrice)} × {item.unit}
                          {item.mrp > item.sellingPrice && (
                            <span className="ml-1 text-muted-foreground/60 line-through">
                              {formatPrice(item.mrp)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatPrice(item.sellingPrice * item.unit)}
                        </p>
                        {savings > 0 && (
                          <p className="text-[10px] font-medium text-green-600">
                            -{formatPrice(savings)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price summary */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Price details
              </p>
              {(() => {
                const mrpTotal = selected.items.reduce((s, i) => s + i.mrp * i.unit, 0);
                const savedTotal = mrpTotal - selected.totalAmount;
                return (
                  <>
                    <div className="flex justify-between py-0.5 text-sm">
                      <span className="text-muted-foreground">MRP total</span>
                      <span className="font-semibold">{formatPrice(mrpTotal)}</span>
                    </div>
                    {savedTotal > 0 && (
                      <div className="flex justify-between py-0.5 text-sm">
                        <span className="font-semibold text-green-600">Discount</span>
                        <span className="font-semibold text-green-600">
                          -{formatPrice(savedTotal)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-0.5 text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="my-2 h-px bg-border" />
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Total paid</span>
                      <span className="text-base font-extrabold">
                        {formatPrice(selected.totalAmount)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Delivery address */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Delivery address
                </p>
              </div>
              {addr?.line1 ? (
                <>
                  {addr.label && (
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                      {addr.label}
                    </p>
                  )}
                  <p className="text-sm font-semibold">{addr.line1}</p>
                  {addr.line2 && <p className="text-xs text-muted-foreground">{addr.line2}</p>}
                  <p className="text-xs text-muted-foreground">
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  {addr.phone && (
                    <p className="mt-1 text-xs text-muted-foreground">Phone: {addr.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No address on record</p>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment
              </p>
              <p className="text-sm font-semibold">{selected.paymentMethod}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight">My Orders</h1>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Track deliveries and reorder favourites
          </p>
        </header>

        <main className="flex-1 px-5 pt-4">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {error && !loading && (
            <p className="mt-8 text-center text-sm text-muted-foreground">{error}</p>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
                <Package className="h-8 w-8" strokeWidth={2} />
              </div>
              <h2 className="mt-5 text-base font-bold">No orders yet</h2>
              <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
                Your order history will appear here.
              </p>
            </div>
          )}

          {!loading && ongoingOrders.length > 0 && (
            <>
              <h2 className="mb-3 text-sm font-bold tracking-tight">Ongoing</h2>
              <div className="space-y-3">
                {ongoingOrders.map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    onClick={() => navigate({ to: "/order/$orderId", params: { orderId: o._id } })}
                    className="w-full rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Package className="h-5 w-5" strokeWidth={2.25} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{o.invoiceId}</p>
                        <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        {statusLabel(o.deliveryStatus)}
                      </span>
                    </div>
                    {o.userAddress?.line1 && (
                      <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {o.userAddress.line1}, {o.userAddress.city}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""} ·{" "}
                        {formatPrice(o.totalAmount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{o.paymentMethod}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {!loading && pastOrders.length > 0 && (
            <>
              <h2
                className={`mb-3 text-sm font-bold tracking-tight${ongoingOrders.length > 0 ? " mt-6" : ""}`}
              >
                Past orders
              </h2>
              <div className="space-y-3">
                {pastOrders.map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    onClick={() => navigate({ to: "/order/$orderId", params: { orderId: o._id } })}
                    className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] text-left active:scale-[0.98] transition-transform"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{o.invoiceId}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {formatDate(o.createdAt)} · {o.items.length} item
                        {o.items.length !== 1 ? "s" : ""} · {formatPrice(o.totalAmount)}
                      </p>
                      {o.userAddress?.line1 && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {o.userAddress.line1}, {o.userAddress.city}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground capitalize">
                      {o.deliveryStatus}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
