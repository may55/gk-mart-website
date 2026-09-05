import OrderRepository from '../repositories/OrderRepository';
import InvoiceRepository from '../repositories/InvoiceRepository';
import { IInvoice } from '../models/Invoice';
import { endOfDay, startOfDay, startOfMonth, startOfWeekMonday } from '../utils/dates';
import { calculateInvoiceProfit } from '../utils/profit';

interface AccountsSummary {
  todaySales: number;
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
  totalProfit: number;
  invoices: IInvoice[];
}

class AccountsService {
  /** Builds the admin sales dashboard summary for today, this week, and this month. */
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
    const weekStart = startOfWeekMonday(now);
    const deliveredThisWeek = await OrderRepository.sumTotalAmountByDateRange(
      'deliveredAt',
      startOfDay(weekStart),
      endOfDay(now)
    );

    // Delivered this month
    const monthStart = startOfMonth(now);
    const deliveredThisMonth = await OrderRepository.sumTotalAmountByDateRange(
      'deliveredAt',
      startOfDay(monthStart),
      endOfDay(now)
    );

    const invoices = await InvoiceRepository.findAll();

    const totalProfit = calculateInvoiceProfit(invoices.flatMap((invoice) => invoice.items));

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
