import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "./api";

export type CartItem = {
  productEnum: string;
  quantity: number;
  // display snapshot
  name: string;
  volume: string;
  sellingPrice: number;
  marketPrice: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  totalSavings: number;
  add: (product: Omit<CartItem, "quantity">) => void;
  remove: (productEnum: string) => void;
  setQty: (productEnum: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gkmart.cart.v2";
const SYNC_DELAY_MS = 3000;

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("gkmart.auth.v1");
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage + schedule backend sync
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}

    const token = getToken();
    if (!token) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const payload = items.map(({ productEnum, quantity }) => ({ productEnum, quantity }));
      apiFetch("/cart", { method: "PUT", body: JSON.stringify({ cart: payload }) }, token).catch(
        () => {}
      );
    }, SYNC_DELAY_MS);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [items, hydrated]);

  const add = useCallback((product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const found = prev.find((p) => p.productEnum === product.productEnum);
      if (found) {
        return prev.map((p) =>
          p.productEnum === product.productEnum ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((productEnum: string) => {
    setItems((prev) => prev.filter((p) => p.productEnum !== productEnum));
  }, []);

  const setQty = useCallback((productEnum: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.productEnum !== productEnum)
        : prev.map((p) => (p.productEnum === productEnum ? { ...p, quantity: qty } : p))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
    const totalSavings = items.reduce(
      (s, i) => s + Math.max(0, i.marketPrice - i.sellingPrice) * i.quantity,
      0
    );
    return { items, count, subtotal, totalSavings, add, remove, setQty, clear };
  }, [items, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
