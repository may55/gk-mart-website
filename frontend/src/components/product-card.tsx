import { Check, Plus } from "lucide-react";
import { useCart, formatPrice, type CartProduct } from "@/lib/cart";

export function ProductCard({ product }: { product: CartProduct }) {
  const { items, add } = useCart();
  const inCart = items.find((i) => i.id === product.id);
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]">
      <div className="aspect-square overflow-hidden rounded-lg bg-background">
        <img
          src={product.image}
          alt={product.name}
          width={512}
          height={512}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex min-w-0 flex-col gap-0.5">
        <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
        <button
          type="button"
          onClick={() => add(product)}
          aria-label={`Add ${product.name} to cart`}
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(46,204,113,0.35)] transition-transform active:scale-90"
        >
          {inCart ? (
            <>
              <Check className="h-5 w-5" strokeWidth={2.75} />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-card bg-foreground px-1 text-[9px] font-bold text-background">
                {inCart.qty}
              </span>
            </>
          ) : (
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          )}
        </button>
      </div>
    </article>
  );
}