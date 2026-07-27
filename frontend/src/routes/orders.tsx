import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Package, RefreshCw } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — GK Mart" },
      { name: "description", content: "Track your ongoing grocery deliveries and view past orders from GK Mart." },
      { property: "og:title", content: "My Orders — GK Mart" },
      { property: "og:description", content: "Track ongoing and past grocery orders on GK Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const ongoing = [
  {
    id: "GK-2841",
    eta: "Arriving in 8 min",
    items: 6,
    total: "₹842",
    status: "Out for delivery",
  },
];

const past = [
  { id: "GK-2790", date: "24 Jul 2026", items: 4, total: "₹512" },
  { id: "GK-2743", date: "18 Jul 2026", items: 9, total: "₹1,284" },
  { id: "GK-2701", date: "11 Jul 2026", items: 2, total: "₹198" },
  { id: "GK-2688", date: "05 Jul 2026", items: 7, total: "₹967" },
];

function OrdersPage() {
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
          <h2 className="mb-3 text-sm font-bold tracking-tight">Ongoing</h2>
          <div className="space-y-3">
            {ongoing.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">Order #{o.id}</p>
                    <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" /> {o.eta}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {o.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    {o.items} items · {o.total}
                  </span>
                  <button className="font-semibold text-primary">Track live</button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-6 mb-3 text-sm font-bold tracking-tight">Past orders</h2>
          <div className="space-y-3">
            {past.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">Order #{o.id}</p>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {o.date} · {o.items} items · {o.total}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}