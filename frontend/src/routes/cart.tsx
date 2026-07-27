import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { useCart, formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — GK Mart" },
      { name: "description", content: "Review items in your GK Mart cart and check out for fast grocery delivery." },
      { property: "og:title", content: "Your Cart — GK Mart" },
      { property: "og:description", content: "Review items and check out on GK Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, clear } = useCart();
  const delivery = subtotal > 0 && subtotal < 199 ? 29 : 0;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-40">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Your cart</h1>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {count === 0
                  ? "Nothing here yet"
                  : `${count} item${count === 1 ? "" : "s"} · delivered in ~12 min`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-5 pt-2">
          {items.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="h-8 w-8" strokeWidth={2} />
              </div>
              <h2 className="mt-5 text-base font-bold">Your cart is empty</h2>
              <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
                Add fresh produce and everyday essentials to get started.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] active:scale-95"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {item.unit}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {formatPrice(item.price * item.qty)}
                      </span>
                      <div className="flex items-center gap-2 rounded-full border border-border bg-background p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-7 w-7 place-items-center rounded-full text-foreground hover:bg-muted active:scale-90"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="min-w-4 text-center text-xs font-bold">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Delivery"
                value={delivery === 0 ? "Free" : formatPrice(delivery)}
              />
              <div className="my-3 h-px bg-border" />
              <Row label="Total" value={formatPrice(total)} bold />
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)] active:scale-[0.98]"
              >
                Checkout · {formatPrice(total)}
              </button>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-bold" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-base font-extrabold" : "font-semibold"}>{value}</span>
    </div>
  );
}