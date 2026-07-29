import OrderRepository from '../repositories/OrderRepository';
import InvoiceRepository from '../repositories/InvoiceRepository';
import { IInvoice } from '../models/Invoice';

interface AccountsSummary {
  todaySales: number;
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  totalProfit: number;
  invoices: IInvoice[];
}

const startOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};

const endOfDay = (d: Date): Date => {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
};

class AccountsService {
  async getSummary(): Promise<AccountsSummary> {
    const now = new Date();

    // Today's sales (created today)
    const todaySales = await OrderRepository.sumTotalAmountByDateRange(
      'createdAt',
      startOfDay(now),
      endOfDay(now)
    );

    // Delivered today
    const deliveredToday = await OrderRepository.sumTotalAmountByDateRange(
      'deliveredAt',
      startOfDay(now),
      endOfDay(now)
    );

    // Delivered this week (Mon–Sun)
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    const deliveredThisWeek = await OrderRepository.sumTotalAmountByDateRange(
      'deliveredAt',
      startOfDay(weekStart),
      endOfDay(now)
    );

    // Delivered this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const deliveredThisMonth = await OrderRepository.sumTotalAmountByDateRange(
      'deliveredAt',
      startOfDay(monthStart),
      endOfDay(now)
    );

    const invoices = await InvoiceRepository.findAll();

    const totalProfit = Math.round(
      invoices.reduce(
        (sum, inv) =>
          sum +
          inv.items.reduce(
            (s, item) => s + (item.sellingPrice - item.costPrice) * item.unit,
            0
          ),
        0
      ) * 100
    ) / 100;

    return {
      todaySales,
      deliveredToday,
      deliveredThisWeek,
      deliveredThisMonth,
      totalProfit,
      invoices,
    };
  }
}

export default new AccountsService();
