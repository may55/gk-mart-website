import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatPrice, calculateLineSavings } from "@/lib/pricing";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/order/$orderId")({ component: OrderDetailPage });

/** Loads and displays one authenticated customer's order at a shareable URL. */
function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    apiFetch<{ data: Order[] }>("/orders", {}, token)
      .then((res) => setOrder(res.data.find((item) => item._id === orderId) ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token, orderId]);

  if (!isLoggedIn)
    return (
      <EmptyState message="Sign in to view this order." onBack={() => navigate({ to: "/" })} />
    );
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (!order)
    return <EmptyState message="Order not found." onBack={() => navigate({ to: "/orders" })} />;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-16">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate({ to: "/orders" })}
            className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">{order.invoiceId}</h1>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {order.deliveryStatus} · {order.paymentMethod}
          </p>
        </header>
        <main className="flex-1 space-y-4 px-5 pt-2">
          <section className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <p className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Items
            </p>
            {order.items.map((item, index) => {
              const savings = calculateLineSavings(item.mrp, item.sellingPrice, item.unit);
              return (
                <div
                  key={`${item.enum}-${index}`}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
                >
                  <Package className="h-5 w-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.enum}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.sellingPrice)} × {item.unit}
                      {savings > 0 ? ` · Save ${formatPrice(savings)}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.sellingPrice * item.unit)}</p>
                </div>
              );
            })}
          </section>
          <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivery address
            </p>
            <div className="mt-2 flex gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{order.userAddress?.line1}</p>
                <p className="text-xs text-muted-foreground">{order.userAddress?.line2}</p>
                <p className="text-xs text-muted-foreground">
                  {order.userAddress?.city}, {order.userAddress?.state} —{" "}
                  {order.userAddress?.pincode}
                </p>
              </div>
            </div>
          </section>
          <section className="flex justify-between rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-base font-extrabold">{formatPrice(order.totalAmount)}</span>
          </section>
        </main>
      </div>
    </div>
  );
}

function EmptyState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-sm font-semibold">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-primary underline"
      >
        Go back
      </button>
    </div>
  );
}
