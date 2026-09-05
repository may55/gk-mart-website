import {
  calculateDiscountPercent,
  calculateLineTotal,
  calculateReplacedBatchAverageCost,
  calculateWeightedAverageCost,
} from '../../src/utils/pricing';

describe('pricing utilities', () => {
  it('calculates weighted average cost', () => {
    expect(calculateWeightedAverageCost(10, 20, 5, 90)).toBe(19.33);
    expect(calculateWeightedAverageCost(0, 0, 4, 100)).toBe(25);
  });

  it('recalculates cost when an existing batch is replaced', () => {
    expect(calculateReplacedBatchAverageCost(15, 15, 19.33, 90, 60)).toBe(17.33);
  });

  it('returns zero weighted cost when there are no units', () => {
    expect(calculateWeightedAverageCost(0, 100, 0, 0)).toBe(0);
  });

  it('calculates display discount safely', () => {
    expect(calculateDiscountPercent(80, 100)).toBe(20);
    expect(calculateDiscountPercent(120, 100)).toBe(0);
    expect(calculateDiscountPercent(80, 0)).toBe(0);
  });

  it('calculates a line total', () => {
    expect(calculateLineTotal(19.5, 4)).toBe(78);
  });
});
