import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { SummaryCards } from "../../../admin/components/accounts/summary-cards";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface Invoice {
  _id: string;
  invoiceId: string;
  userName: string;
  userAddress: string;
  amount: number;
  paymentMethod: string;
  items: { enum: string; unit: number; sellingPrice: number; costPrice: number }[];
  invoiceLink: string;
  createdAt: string;
}

interface Summary {
  todaySales: number;
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  totalProfit: number;
  invoices: Invoice[];
}

export const Route = createFileRoute("/admin/_admin/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    adminFetch<{ data: Summary }>("/accounts/summary")
      .then((res) => setSummary(res.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Sales summary and invoices</p>
      </div>

      {summary && (
        <SummaryCards
          todaySales={summary.todaySales}
          deliveredToday={summary.deliveredToday}
          deliveredThisWeek={summary.deliveredThisWeek}
          deliveredThisMonth={summary.deliveredThisMonth}
          totalProfit={summary.totalProfit}
        />
      )}

      {/* Invoices table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          Invoices ({summary?.invoices.length ?? 0})
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!summary?.invoices.length ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                summary.invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{inv.invoiceId}</code>
                    </td>
                    <td className="px-4 py-3 font-medium">{inv.userName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv.userAddress}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{inv.amount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      ₹{inv.items.reduce((s, it) => s + (it.sellingPrice - it.costPrice) * it.unit, 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{inv.paymentMethod}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{inv.items.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      {inv.invoiceLink ? (
                        <a href={inv.invoiceLink} target="_blank" rel="noopener noreferrer"
                          className="rounded p-1.5 text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="px-1.5 text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
