import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { AddressManager } from "@/components/address-manager";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/pricing";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Address } from "@/lib/types";

type Screen = "cart" | "address" | "payment" | "success";

export const Route = createFileRoute("/cart")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: search.checkout === "1" || search.checkout === true,
  }),
  head: () => ({
    meta: [
      { title: "Your Cart — GK Mart" },
      {
        name: "description",
        content: "Review items in your GK Mart cart and check out for fast grocery delivery.",
      },
      { property: "og:title", content: "Your Cart — GK Mart" },
      { property: "og:description", content: "Review items and check out on GK Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

type StockWarnings = Map<string, number>;

function CartPage() {
  const { items, setQty, remove, subtotal, totalSavings, count, clear } = useCart();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const { checkout } = Route.useSearch();
  const delivery = 0;
  const total = subtotal + delivery;

  const [warnings, setWarnings] = useState<StockWarnings>(new Map());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const pendingRef = useRef<string>("");
  const setQtyRef = useRef(setQty);
  const removeRef = useRef(remove);
  useEffect(() => {
    setQtyRef.current = setQty;
  }, [setQty]);
  useEffect(() => {
    removeRef.current = remove;
  }, [remove]);

  useEffect(() => {
    if (items.length === 0) {
      setWarnings(new Map());
      return;
    }
    const key = items.map((i) => `${i.productEnum}:${i.quantity}`).join(",");
    if (key === pendingRef.current) return;
    pendingRef.current = key;

    apiFetch<{ data: { productEnum: string; available: number; adjusted: number }[] }>(
      "/products/validate-cart",
      {
        method: "POST",
        body: JSON.stringify({
          items: items.map(({ productEnum, quantity }) => ({ productEnum, quantity })),
        }),
      },
    )
      .then(({ data }) => {
        const newWarnings = new Map<string, number>();
        const adjustedParts: string[] = [];
        data.forEach(({ productEnum, available, adjusted }) => {
          if (available === 0) {
            removeRef.current(productEnum);
          } else if (adjusted < (items.find((i) => i.productEnum === productEnum)?.quantity ?? 0)) {
            newWarnings.set(productEnum, available);
            setQtyRef.current(productEnum, adjusted);
            adjustedParts.push(`${productEnum}:${adjusted}`);
          } else {
            adjustedParts.push(`${productEnum}:${adjusted}`);
          }
        });
        if (adjustedParts.length) pendingRef.current = adjustedParts.join(",");
        if (newWarnings.size) {
          setWarnings(newWarnings);
          setDismissed((prev) => {
            const n = new Set(prev);
            newWarnings.forEach((_, k) => n.delete(k));
            return n;
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const [screen, setScreen] = useState<Screen>("cart");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  useEffect(() => {
    if (!checkout || !isLoggedIn || !token || screen !== "cart") return;
    setAddrLoading(true);
    apiFetch<{ data: Address[] }>("/user/addresses", {}, token)
      .then((r) => setAddresses(r.data))
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
    setScreen("address");
  }, [checkout, isLoggedIn, token, screen]);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/cart?checkout=1" } as never });
      return;
    }
    setAddrLoading(true);
    apiFetch<{ data: Address[] }>("/user/addresses", {}, token)
      .then((r) => setAddresses(r.data))
      .catch(() => {})
      .finally(() => setAddrLoading(false));
    setScreen("address");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !token) return;
    setOrdering(true);
    setOrderError("");
    try {
      const res = await apiFetch<{ data: { invoiceId: string } }>(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            items: items.map(({ productEnum, quantity }) => ({ productEnum, quantity })),
            address: selectedAddress,
            paymentMethod: "Cash on Delivery",
          }),
        },
        token,
      );
      setInvoiceId(res.data.invoiceId);
      clear();
      setScreen("success");
    } catch (e: unknown) {
      setOrderError(e instanceof Error ? e.message : "Failed to place order. Try again.");
    } finally {
      setOrdering(false);
    }
  };

  if (screen === "address") {
    return (
      <AddressManager
        addresses={addresses}
        addrLoading={addrLoading}
        token={token}
        onAddressesChange={setAddresses}
        onBack={() => setScreen("cart")}
        total={total}
        onSelect={(addr) => {
          setSelectedAddress(addr);
          setScreen("payment");
        }}
      />
    );
  }

  if (screen === "payment") {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
            <button
              type="button"
              onClick={() => setScreen("address")}
              className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight">Payment</h1>
          </header>
          <main className="flex-1 space-y-4 px-5 pt-2 pb-40">
            {/* Delivery address summary */}
            {selectedAddress && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                  {selectedAddress.label || "Deliver to"}
                </p>
                <p className="text-sm font-semibold">{selectedAddress.line1}</p>
                {selectedAddress.line2 && (
                  <p className="text-xs text-muted-foreground">{selectedAddress.line2}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Phone: {selectedAddress.phone}</p>
              </div>
            )}

            {/* Order summary */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Order summary
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productEnum} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg">
                          🛒
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.sku} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold">
                      {formatPrice(item.sellingPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-3 h-px bg-border" />
              {totalSavings > 0 && (
                <Row label="Total savings" value={`-${formatPrice(totalSavings)}`} green />
              )}
              <Row label="Delivery" value="Free" />
              <div className="my-2 h-px bg-border" />
              <Row label="Total" value={formatPrice(total)} bold />
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment method
              </p>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="radio" defaultChecked readOnly className="accent-primary" />
                <div>
                  <p className="text-sm font-semibold">Cash on Delivery</p>
                  <p className="text-[11px] text-muted-foreground">Pay when your order arrives</p>
                </div>
              </label>
            </div>

            {orderError && (
              <p className="text-center text-sm font-medium text-red-500">{orderError}</p>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={ordering}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)] active:scale-[0.98] disabled:opacity-60"
            >
              {ordering ? "Placing order…" : `Proceed & Order · ${formatPrice(total)}`}
            </button>
          </main>
        </div>
      </div>
    );
  }

  if (screen === "success") {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Order placed!</h1>
          {invoiceId && <p className="mt-1 text-xs text-muted-foreground">Invoice: {invoiceId}</p>}
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Your order is confirmed. We'll deliver it to your doorstep soon.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/orders" })}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] active:scale-95"
          >
            View my orders
          </button>
          <Link
            to="/"
            className="mt-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

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
              {items.map((item) => {
                const stockLimit = warnings.get(item.productEnum);
                const hasWarning = stockLimit !== undefined && !dismissed.has(item.productEnum);
                return (
                  <li
                    key={item.productEnum}
                    className={`flex flex-col rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-colors ${hasWarning ? "border-amber-400/60" : "border-border"}`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-2xl">
                            🛒
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{item.name}</p>
                            <p className="text-[11px] font-medium text-muted-foreground">
                              {item.sku}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.productEnum)}
                            aria-label={`Remove ${item.name}`}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold">
                            {formatPrice(item.sellingPrice * item.quantity)}
                          </span>
                          <div className="flex items-center gap-2 rounded-full border border-border bg-background p-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(item.productEnum, item.quantity - 1)}
                              aria-label="Decrease"
                              className="grid h-7 w-7 place-items-center rounded-full text-foreground hover:bg-muted active:scale-90"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="min-w-4 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.productEnum, item.quantity + 1)}
                              disabled={hasWarning && item.quantity >= stockLimit!}
                              aria-label="Increase"
                              className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {hasWarning && (
                      <div className="flex items-center gap-2 rounded-b-2xl border-t border-amber-400/30 bg-amber-50 px-3 py-2 dark:bg-amber-950/40">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <p className="flex-1 text-[11px] font-semibold text-amber-700">
                          Quantity reduced because the requested quantity is unavailable
                        </p>
                        <button
                          type="button"
                          onClick={() => setDismissed((p) => new Set(p).add(item.productEnum))}
                          aria-label="Dismiss"
                          className="grid h-5 w-5 place-items-center rounded-full text-amber-500 hover:bg-amber-200/60"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {totalSavings > 0 && (
                <Row label="Total savings" value={`-${formatPrice(totalSavings)}`} green />
              )}
              <Row label="Delivery" value="Free" />
              <div className="my-3 h-px bg-border" />
              <Row label="Total" value={formatPrice(total)} bold />
              <button
                type="button"
                onClick={handleCheckout}
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

function Row({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span
        className={
          bold ? "font-bold" : green ? "font-semibold text-green-600" : "text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          bold
            ? "text-base font-extrabold"
            : green
              ? "font-semibold text-green-600"
              : "font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}
