import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Bell, MapPin, Search, Loader2 } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import logo from "@/assets/gkmart-logo.png";
import type { Product, Category, UserNotification } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  // Fetch categories once
  useEffect(() => {
    apiFetch<{ data: Category[] }>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Fetch unread notification count when logged in
  useEffect(() => {
    if (!isLoggedIn || !token) {
      setUnreadCount(0);
      return;
    }
    apiFetch<{ data: UserNotification[] }>("/notifications", {}, token)
      .then((res) => setUnreadCount(res.data.filter((n) => !n.read).length))
      .catch(() => {});
  }, [isLoggedIn, token]);

  // Fetch products whenever search or category changes (debounced)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (activeCategory !== "All") params.set("category", activeCategory);
      const qs = params.toString();
      apiFetch<{ data: Product[] }>(`/products${qs ? `?${qs}` : ""}`)
        .then((res) => setProducts(res.data))
        .catch(() => setProducts([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, activeCategory]);

  const allCategories = [{ label: "All", image: "" }, ...categories];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logo}
                alt="GK Mart logo"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-[var(--shadow-card)]"
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-base font-extrabold tracking-tight">GK Mart</p>
                <p className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                  <span className="truncate">Home · 12 min</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate({ to: "/notifications" })}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-card)]"
            >
              <Bell className="h-5 w-5" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.25} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Category pills */}
          <div className="mt-4 -mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2">
              {allCategories.map((cat) => {
                const isActive = cat.label === activeCategory;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(46,204,113,0.3)]"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.image ? (
                      <img src={cat.image} alt="" className="h-4 w-4 rounded-full object-cover" />
                    ) : null}
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
            <h1 className="text-lg font-bold tracking-tight">
              {activeCategory === "All" ? "All products" : activeCategory}
            </h1>
            <span className="text-xs text-muted-foreground">{products.length} items</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-sm font-semibold text-foreground">No products found</p>
              <p className="text-xs text-muted-foreground">
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p.enum} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

