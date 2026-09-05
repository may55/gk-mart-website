/** Groups order quantities by product so duplicate lines cannot bypass stock checks. */
export function aggregateQuantities(
  items: Array<{ productEnum: string; quantity: number }>,
): Map<string, number> {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const key = item.productEnum.toLowerCase();
    quantities.set(key, (quantities.get(key) ?? 0) + item.quantity);
  }
  return quantities;
}
