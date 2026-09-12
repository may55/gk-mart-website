import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart, type CartItem } from "@/lib/cart";
import { calculateDiscountPercent, formatPrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { items, add } = useCart();
  const inCart = items.find((i) => i.productEnum === product.enum);
  const off = calculateDiscountPercent(product.sellingPrice, product.marketPrice);

  const cartProduct: Omit<CartItem, "quantity"> = {
    productEnum: product.enum,
    name: product.name,
    sku: product.sku,
    sellingPrice: product.sellingPrice,
    marketPrice: product.marketPrice,
    image: product.images[0] ?? "",
  };

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]">
      <Link to="/product/$productEnum" params={{ productEnum: product.enum }} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              width={512}
              height={512}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-3xl">
              🛒
            </div>
          )}
          {off > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {off}% off
            </span>
          )}
        </div>
        <div className="mt-3 flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.sku}</p>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.marketPrice > product.sellingPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.marketPrice)}
            </span>
          )}
        </div>
      </Link>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => add(cartProduct)}
          aria-label={`Add ${product.name} to cart`}
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_rgba(46,204,113,0.35)] transition-transform active:scale-90"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          {inCart && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-card bg-foreground px-1 text-[9px] font-bold text-background">
              {inCart.quantity}
            </span>
          )}
        </button>
      </div>
    </article>
  );
}
