import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Plus, Check, Minus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCart, type CartItem } from "@/lib/cart";
import { calculateDiscountPercent, formatPrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/product/$productEnum")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productEnum } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const { items, add, setQty, remove } = useCart();

  useEffect(() => {
    setIsLoading(true);
    apiFetch<{ data: Product }>(`/products/${productEnum}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [productEnum]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-base font-semibold">Product not found</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-primary underline underline-offset-2"
        >
          Go home
        </button>
      </div>
    );
  }

  const cartItem = items.find((i) => i.productEnum === product.enum);
  const off = calculateDiscountPercent(product.sellingPrice, product.marketPrice);
  const images = product.images.length > 0 ? product.images : [""];

  const cartProduct: Omit<CartItem, "quantity"> = {
    productEnum: product.enum,
    name: product.name,
    sku: product.sku,
    sellingPrice: product.sellingPrice,
    marketPrice: product.marketPrice,
    image: product.images[0] ?? "",
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Image carousel */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {images[imgIndex] ? (
            <img src={images[imgIndex]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🛒</div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                disabled={imgIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-background/80 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
                disabled={imgIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-background/80 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIndex ? "w-4 bg-primary" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col px-5 pt-5">
          {/* Name & category badges */}
          <div className="flex flex-wrap gap-1.5">
            {product.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                {cat}
              </span>
            ))}
          </div>

          <h1 className="mt-2 text-xl font-extrabold leading-tight tracking-tight">
            {product.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">SKU: {product.sku}</p>

          {/* Price */}
          <div className="mt-4 flex items-end gap-3">
            <span className="text-2xl font-extrabold">{formatPrice(product.sellingPrice)}</span>
            {product.marketPrice > product.sellingPrice && (
              <>
                <span className="mb-0.5 text-sm text-muted-foreground line-through">
                  {formatPrice(product.marketPrice)}
                </span>
                {off > 0 && (
                  <span className="mb-0.5 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                    {off}% off
                  </span>
                )}
              </>
            )}
          </div>

          {off > 0 && (
            <p className="mt-1 text-xs font-medium text-green-600">
              You save {formatPrice(product.marketPrice - product.sellingPrice)} on this item
            </p>
          )}

          <div className="my-5 h-px bg-border" />

          {/* Stock */}
          <p className="text-xs text-muted-foreground">
            {product.unitsInStock > 0 ? `${product.unitsInStock} units in stock` : "Out of stock"}
          </p>
        </div>

        {/* Add to cart footer */}
        <div className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
          {cartItem ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {formatPrice(product.sellingPrice * cartItem.quantity)} in cart
              </span>
              <div className="flex items-center gap-3 rounded-full border border-border bg-card px-1 py-1">
                <button
                  onClick={() => setQty(product.enum, cartItem.quantity - 1)}
                  className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted active:scale-90"
                >
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                <button
                  onClick={() => add(cartProduct)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => add(cartProduct)}
              disabled={product.unitsInStock === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)] active:scale-[0.98] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
