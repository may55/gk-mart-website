/**
 * Builds the stable product identifier used in URLs, carts, and order lines.
 * Identity fields are normalized so equivalent user input produces one enum.
 */
export function buildProductEnum(
  name: string,
  sku: string,
  marketPrice: number,
  expiryMonth?: number,
  expiryYear?: number,
): string {
  return `${name.trim()}_${sku.trim()}_${marketPrice}_${expiryMonth ?? 'na'}_${expiryYear ?? 'na'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
