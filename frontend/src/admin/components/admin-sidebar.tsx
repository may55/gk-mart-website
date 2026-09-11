import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Users,
  ShoppingCart,
  Wallet,
  Bell,
  LogOut,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../lib/admin-auth-context";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Manage Products", icon: Package, to: "/admin/products" },
  { label: "Manage Categories", icon: Tags, to: "/admin/categories" },
  { label: "Add Inventory", icon: PackagePlus, to: "/admin/inventory" },
  { label: "Manage Users", icon: Users, to: "/admin/users" },
  { label: "Manage Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Accounts", icon: Wallet, to: "/admin/accounts" },
  { label: "Notifications", icon: Bell, to: "/admin/notifications" },
] as const;

export function AdminSidebar() {
  const { logout, user } = useAdminAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            GK
          </div>
          <span className="text-sm font-semibold text-foreground">Admin Panel</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-foreground hover:bg-muted"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform md:static md:z-auto md:h-screen md:w-60 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              GK
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">GK Mart</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-2 text-muted-foreground md:hidden"
            aria-label="Close admin navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
