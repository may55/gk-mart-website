/** Calculates the whole-number discount percentage displayed beside MRP. */
export function calculateDiscountPercent(sellingPrice: number, marketPrice: number): number {
  if (marketPrice <= 0 || sellingPrice >= marketPrice) return 0;
  return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
}

/** Calculates savings for one product line, never displaying negative savings. */
export function calculateLineSavings(
  marketPrice: number,
  sellingPrice: number,
  quantity: number,
): number {
  return Math.max(0, marketPrice - sellingPrice) * quantity;
}

/** Formats a rupee amount using the Indian number grouping convention. */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
