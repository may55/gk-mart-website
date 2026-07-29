import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — GK Mart" },
      { name: "description", content: "Browse groceries by category on GK Mart." },
      { property: "og:title", content: "Categories — GK Mart" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch<{ data: Category[] }>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.label.toLowerCase().includes(filterText.toLowerCase())
  );

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
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search categories..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </header>

        <main className="flex-1 px-5 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {categories.length === 0
                ? "No categories added yet."
                : "No categories match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => navigate({ to: "/", search: { category: c.label } as never })}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.label}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl">
                      🛒
                    </div>
                  )}
                  <span className="text-xs font-semibold leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
