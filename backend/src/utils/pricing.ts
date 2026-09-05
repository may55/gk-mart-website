/** Calculates a weighted average unit cost from existing and incoming stock. */
export function calculateWeightedAverageCost(
  currentUnits: number,
  currentAverageCost: number,
  incomingUnits: number,
  incomingTotalCost: number,
): number {
  const totalUnits = currentUnits + incomingUnits;
  if (totalUnits <= 0) return 0;
  return Math.round(((currentAverageCost * currentUnits + incomingTotalCost) / totalUnits) * 100) / 100;
}

/** Recalculates average cost after replacing one existing inventory batch. */
export function calculateReplacedBatchAverageCost(
  currentTotalUnits: number,
  updatedTotalUnits: number,
  currentAverageCost: number,
  oldBatchTotalCost: number,
  replacementTotalCost: number,
): number {
  if (updatedTotalUnits <= 0) return 0;
  return Math.round(
    ((currentAverageCost * currentTotalUnits - oldBatchTotalCost + replacementTotalCost) / updatedTotalUnits) * 100,
  ) / 100;
}

/** Calculates the whole-number discount percentage shown to customers. */
export function calculateDiscountPercent(sellingPrice: number, marketPrice: number): number {
  if (marketPrice <= 0 || sellingPrice >= marketPrice) return 0;
  return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
}

/** Calculates the customer-facing total for one order line. */
export function calculateLineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}
