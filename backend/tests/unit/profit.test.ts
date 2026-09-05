import { calculateInvoiceProfit } from '../../src/utils/profit';

describe('calculateInvoiceProfit', () => {
  it('calculates and rounds invoice profit', () => {
    expect(calculateInvoiceProfit([
      { sellingPrice: 10, costPrice: 7.25, unit: 4 },
      { sellingPrice: 5, costPrice: 6, unit: 2 },
    ])).toBe(9);
  });
});
