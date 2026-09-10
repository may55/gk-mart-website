import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/help-support")({ component: HelpSupportPage });

/** Provides a simple support message form and direct WhatsApp contact details. */
function HelpSupportPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const sendMessage = () => {
    const text = message.trim() || "Hi, I need help with my GK Mart order.";
    window.open(
      `https://wa.me/918739056741?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-16">
        <header className="flex items-center gap-3 px-5 pb-4 pt-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" })}
            className="grid h-9 w-9 place-items-center rounded-full bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">Help &amp; Support</h1>
        </header>
        <main className="flex-1 space-y-4 px-5">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-bold">Write us a message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us how we can help…"
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Send message on WhatsApp
            </button>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex gap-3">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <div>
                <h2 className="text-sm font-bold">Contact us on WhatsApp</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  For quick help, message us on WhatsApp at
                </p>
                <a
                  href="https://wa.me/918739056741"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-bold text-green-600"
                >
                  +91 87390 56741
                </a>
              </div>
            </div>
          </section>
          <p className="pt-8 text-center text-xs font-medium text-muted-foreground">
            Powered by Innovex Technologies
          </p>
        </main>
      </div>
    </div>
  );
}
