import { TrendingUp, Truck, Calendar, CalendarDays, IndianRupee } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SummaryCardsProps {
  todaySales: number;
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  totalProfit: number;
}

const CARDS = [
  {
    key: "todaySales" as const,
    label: "Today's Sales",
    icon: TrendingUp,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "deliveredToday" as const,
    label: "Delivered Today",
    icon: Truck,
    color: "bg-green-50 text-green-600",
  },
  {
    key: "deliveredThisWeek" as const,
    label: "Delivered This Week",
    icon: Calendar,
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "deliveredThisMonth" as const,
    label: "Delivered This Month",
    icon: CalendarDays,
    color: "bg-orange-50 text-orange-600",
  },
  {
    key: "totalProfit" as const,
    label: "Total Profit",
    icon: IndianRupee,
    color: "bg-emerald-50 text-emerald-600",
  },
];

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            ₹{props[key].toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  );
}
