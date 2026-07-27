import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — GK Mart" },
      { name: "description", content: "Browse groceries by category on GK Mart — fruits, vegetables, dairy, staples and more." },
      { property: "og:title", content: "Categories — GK Mart" },
      { property: "og:description", content: "Shop groceries by category at GK Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CategoriesPage,
});

const categories = [
  { label: "Fruits", emoji: "🍎", items: 84, tint: "bg-[#FDECEC]" },
  { label: "Vegetables", emoji: "🥬", items: 96, tint: "bg-[#E8F7EE]" },
  { label: "Rice & Dal", emoji: "🌾", items: 42, tint: "bg-[#FFF6E0]" },
  { label: "Dairy", emoji: "🥛", items: 58, tint: "bg-[#EAF2FB]" },
  { label: "Snacks", emoji: "🍪", items: 120, tint: "bg-[#FBEFE2]" },
  { label: "Beverages", emoji: "🧃", items: 72, tint: "bg-[#EEEAFB]" },
  { label: "Bakery", emoji: "🍞", items: 34, tint: "bg-[#FBF3E4]" },
  { label: "Personal Care", emoji: "🧴", items: 65, tint: "bg-[#E6F5F4]" },
  { label: "Household", emoji: "🧺", items: 48, tint: "bg-[#F1F0EA]" },
];

function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Everything you need, neatly sorted
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.25} />
            <input
              type="text"
              placeholder="Search categories..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </header>

        <main className="flex-1 px-5 pt-4">
          <div className="grid grid-cols-3 gap-3">
            {categories.map((c) => (
              <button
                key={c.label}
                type="button"
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl ${c.tint}`}>
                  {c.emoji}
                </span>
                <span className="text-xs font-semibold leading-tight">{c.label}</span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {c.items} items
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-6 mb-3 text-sm font-bold tracking-tight">Featured collections</h2>
          <div className="space-y-3">
            {[
              { title: "Fresh from farms", desc: "Seasonal fruits & veggies", emoji: "🍅" },
              { title: "Monthly essentials", desc: "Staples for your kitchen", emoji: "🍚" },
              { title: "Healthy breakfast", desc: "Start your day right", emoji: "🥣" },
            ].map((f) => (
              <button
                key={f.title}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-[var(--shadow-card)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-xl">
                  {f.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{f.title}</p>
                  <p className="truncate text-[11px] font-medium text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}