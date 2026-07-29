import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "../../admin/components/admin-sidebar";

export const Route = createFileRoute("/admin/_admin")({
  beforeLoad: ({ context }) => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("gkmart.admin.auth.v1")
      : null;
    if (!stored) {
      throw redirect({ to: "/admin/login" });
    }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.token) throw redirect({ to: "/admin/login" });
    } catch {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
