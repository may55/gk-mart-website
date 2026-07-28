import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Gift,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthPromptModal } from "@/components/auth-prompt-modal";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GK Mart" },
      { name: "description", content: "Manage your GK Mart account, addresses, payments and preferences." },
      { property: "og:title", content: "Profile — GK Mart" },
      { property: "og:description", content: "Manage your GK Mart account and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const account = [
  { icon: MapPin, label: "Delivery addresses", meta: "3 saved" },
  { icon: CreditCard, label: "Payment methods", meta: "UPI, 2 cards" },
  { icon: Heart, label: "Wishlist", meta: "12 items" },
  { icon: Gift, label: "Rewards & offers", meta: "₹250 credit" },
];

const preferences = [
  { icon: Bell, label: "Notifications" },
  { icon: ShieldCheck, label: "Privacy & security" },
  { icon: Settings, label: "App settings" },
  { icon: Headphones, label: "Help & support" },
];

function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // If not logged in, show auth prompt modal
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
          <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
          </header>
          <main className="flex-1 flex items-center justify-center px-5">
            <AuthPromptModal
              title="Your Profile"
              description="Sign in to view your profile, manage addresses, and track preferences"
            />
          </main>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleLogout = async () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="px-5 pb-4 pt-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
        </header>

        <main className="flex-1 px-5">
          {/* User card */}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-extrabold text-primary-foreground shadow-[var(--shadow-float)]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold">{user?.name}</p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {user?.email || user?.number}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-primary">
                GK Gold Member
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary"
            >
              Edit
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Orders", value: "42" },
              { label: "Wishlist", value: "12" },
              { label: "Credits", value: "₹250" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-3 text-center shadow-[var(--shadow-card)]"
              >
                <p className="text-base font-extrabold text-primary">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Account */}
          <h2 className="mt-6 mb-3 text-sm font-bold tracking-tight">Account</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            {account.map((item, i) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.label}</p>
                  <p className="truncate text-[11px] font-medium text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Preferences */}
          <h2 className="mt-6 mb-3 text-sm font-bold tracking-tight">Preferences</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            {preferences.map((item, i) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-foreground">
                  <item.icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {item.label}
                </p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-destructive shadow-[var(--shadow-card)] hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.25} />
            Log out
          </button>

          <p className="mt-4 text-center text-[10px] font-medium text-muted-foreground">
            GK Mart · v1.0.0
          </p>
        </main>
      </div>
    </div>
  );
}