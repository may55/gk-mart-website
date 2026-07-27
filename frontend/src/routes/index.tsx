import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, MapPin, Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { BottomNav } from "@/components/bottom-nav";
import logo from "@/assets/gk-mart-logo.jpeg.asset.json";

import basmati from "@/assets/products/basmati.jpg";
import toordal from "@/assets/products/toordal.jpg";
import tomatoes from "@/assets/products/tomatoes.jpg";
import milk from "@/assets/products/milk.jpg";
import mangoes from "@/assets/products/mangoes.jpg";
import atta from "@/assets/products/atta.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GK Mart — Groceries delivered in minutes" },
      {
        name: "description",
        content:
          "Order rice, dal, dairy, and fresh produce from GK Mart. Minimal, fast grocery shopping, delivered to your door.",
      },
      { property: "og:title", content: "GK Mart — Groceries delivered in minutes" },
      {
        property: "og:description",
        content: "Rice, dal, dairy, and fresh produce. Minimal, fast grocery shopping.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { label: "All", emoji: "🛒" },
  { label: "Fruits", emoji: "🍎" },
  { label: "Vegetables", emoji: "🥬" },
  { label: "Rice & Dal", emoji: "🌾" },
  { label: "Dairy", emoji: "🥛" },
  { label: "Snacks", emoji: "🍪" },
  { label: "Beverages", emoji: "🧃" },
];

const products = [
  { id: "basmati", name: "Basmati Rice", unit: "5 kg pack", price: 599, image: basmati },
  { id: "toordal", name: "Toor Dal", unit: "1 kg pouch", price: 149, image: toordal },
  { id: "tomatoes", name: "Fresh Tomatoes", unit: "1 kg", price: 49, image: tomatoes },
  { id: "milk", name: "Full Cream Milk", unit: "1 L carton", price: 72, image: milk },
  { id: "mangoes", name: "Alphonso Mangoes", unit: "1 dozen", price: 499, image: mangoes },
  { id: "atta", name: "Whole Wheat Atta", unit: "5 kg bag", price: 279, image: atta },
];

function Index() {
  const [active, setActive] = useState("Rice & Dal");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logo.url}
                alt="GK Mart logo"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-[var(--shadow-card)]"
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-base font-extrabold tracking-tight">
                  GK Mart
                </p>
                <p className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  <span className="truncate">Home · 12 min</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)]"
            >
              <Bell className="h-4.5 w-4.5 h-5 w-5" strokeWidth={2} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.25} />
            <input
              type="text"
              placeholder="Search basmati rice..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              aria-label="Filters"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Category bubbles */}
          <div className="mt-4 -mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2">
              {categories.map((cat) => {
                const isActive = cat.label === active;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setActive(cat.label)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(46,204,113,0.3)]"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-sm leading-none">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Product grid */}
        <main className="flex-1 px-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight">Popular now</h1>
            <button type="button" className="text-xs font-semibold text-primary">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
