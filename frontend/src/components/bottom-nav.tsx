import { Home, LayoutGrid, Receipt, User, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

const items = [
  { icon: Home, label: "Home", to: "/" as const },
  { icon: LayoutGrid, label: "Categories", to: "/categories" as const },
  { icon: Receipt, label: "Orders", to: "/orders" as const },
  { icon: User, label: "Profile", to: "/profile" as const },
];

export function BottomNav({ cartCount }: { cartCount?: number } = {}) {
  const { count } = useCart();
  const badge = cartCount ?? count;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="pointer-events-auto relative mx-auto w-full max-w-md px-4 pb-4">
        <nav className="relative flex items-center justify-around rounded-2xl border border-border bg-background/95 px-2 py-3 shadow-[var(--shadow-soft)] backdrop-blur">
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
          <div className="h-10 w-14" aria-hidden />
          {items.slice(2).map((item) => (
            <NavItem key={item.label} {...item} />
          ))}

          <Link
            to="/cart"
            aria-label="Open cart"
            className="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-transform active:scale-95"
          >
            <ShoppingCart className="h-6 w-6" strokeWidth={2.25} />
            {badge > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-foreground px-1 text-[10px] font-bold text-background">
                {badge}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof Home;
  label: string;
  to: "/" | "/categories" | "/orders" | "/profile";
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      className="group flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
    >
      <Icon className="h-5 w-5 group-data-[status=active]:[stroke-width:2.5]" strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}