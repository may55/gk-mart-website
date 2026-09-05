import { aggregateQuantities } from '../../src/utils/stock';

describe('stock utilities', () => {
  it('aggregates duplicate product lines case-insensitively', () => {
    expect([...aggregateQuantities([
      { productEnum: 'RICE_1', quantity: 2 },
      { productEnum: 'rice_1', quantity: 3 },
    ])]).toEqual([['rice_1', 5]]);
  });
});
