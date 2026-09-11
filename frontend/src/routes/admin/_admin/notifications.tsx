import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { Bell, Plus, X, Loader2, AlertCircle, Send } from "lucide-react";

interface NotificationData {
  _id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export const Route = createFileRoute("/admin/_admin/notifications")({
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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: NotificationData[] }>("/notifications");
      setNotifications(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showForm) textareaRef.current?.focus();
  }, [showForm]);

  const handlePublish = async () => {
    if (!text.trim()) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      await adminFetch("/notifications", {
        method: "POST",
        body: JSON.stringify({ text: text.trim() }),
      });
      setText("");
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish notification");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {notifications.length} notification(s) published
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setPublishError(null);
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Notification"}
        </button>
      </div>

      {/* Compose form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Publish a notification</h2>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your notification message…"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {publishError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {publishError}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={handlePublish}
              disabled={isPublishing || !text.trim()}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish to all users
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
            <Bell className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-foreground">No notifications published yet</p>
          <p className="text-xs text-muted-foreground">
            Click "Add Notification" to send one to all users.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 w-36">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.map((n) => (
                <tr key={n._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{n.text}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {timeAgo(n.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
