import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthPromptModal } from "@/components/auth-prompt-modal";
import { apiFetch } from "@/lib/api";
import type { UserNotification } from "@/lib/types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GK Mart" },
      { name: "description", content: "View your GK Mart notifications." },
    ],
  }),
  component: NotificationsPage,
});

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotificationsPage() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    apiFetch<{ data: UserNotification[] }>("/notifications", {}, token)
      .then((res) => {
        const validNotifications = res.data.filter(
          (notification) => notification.notificationId && notification.notificationId._id,
        );
        setNotifications(validNotifications);
        // Mark all unread as read
        validNotifications
          .filter((n) => !n.read)
          .forEach((n) => {
            apiFetch(
              `/notifications/${n.notificationId._id}/read`,
              { method: "PATCH" },
              token,
            ).catch(() => {});
          });
        // Optimistically mark all as read in local state
        setNotifications(validNotifications.map((n) => ({ ...n, read: true })));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isLoggedIn, token]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
          <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
          </header>
          <main className="flex-1 flex items-center justify-center px-5">
            <AuthPromptModal
              title="Notifications"
              description="Sign in to view your notifications from GK Mart"
              onClose={() => navigate({ to: "/" })}
            />
          </main>
        </div>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-32">
        <header className="sticky top-0 z-30 bg-background/95 px-5 pb-4 pt-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1>
          </div>
        </header>

        <main className="flex-1 px-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Bell className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                We'll notify you about offers, orders and updates.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {unread.length > 0 && (
                <section>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    New
                  </h2>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    {unread.map((n, i) => (
                      <NotificationRow
                        key={n.notificationId._id}
                        notification={n}
                        isLast={i === unread.length - 1}
                      />
                    ))}
                  </div>
                </section>
              )}

              {read.length > 0 && (
                <section>
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Earlier
                  </h2>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    {read.map((n, i) => (
                      <NotificationRow
                        key={n.notificationId._id}
                        notification={n}
                        isLast={i === read.length - 1}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  isLast,
}: {
  notification: UserNotification;
  isLast: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${!isLast ? "border-b border-border" : ""} ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {notification.read ? (
          <CheckCheck className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Bell className="h-4 w-4" strokeWidth={2} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">
          {notification.notificationId.text}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
          {timeAgo(notification.receivedAt)}
        </p>
      </div>
      {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </div>
  );
}
