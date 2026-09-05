/** Calculates rounded profit from an invoice's selling and cost snapshots. */
export function calculateInvoiceProfit(
  items: Array<{ sellingPrice: number; costPrice: number; unit: number }>,
): number {
  const profit = items.reduce(
    (sum, item) => sum + (item.sellingPrice - item.costPrice) * item.unit,
    0,
  );
  return Math.round(profit * 100) / 100;
}
