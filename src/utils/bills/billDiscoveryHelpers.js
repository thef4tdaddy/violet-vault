/**
 * Helper functions for bill discovery operations
 * Extracted from useBillDiscovery hook to reduce complexity
 */

/**
 * Create initial envelope mapping from discovered bills
 */
export const createInitialEnvelopeMap = (discoveredBills) => {
  const envelopeMap = {};
  discoveredBills.forEach((bill) => {
    if (bill.suggestedEnvelopeId) {
      envelopeMap[bill.id] = bill.suggestedEnvelopeId;
    }
  });
  return envelopeMap;
};

/**
 * Calculate estimated total for selected bills
 */
export const calculateSelectedBillsTotal = (discoveredBills, selectedBills) => {
  return discoveredBills
    .filter((bill) => selectedBills.has(bill.id))
    .reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
};

/**
 * Transform bills for adding to system
 */
export const transformBillsForAdd = (discoveredBills, selectedBills, billEnvelopeMap) => {
  return discoveredBills
    .filter((bill) => selectedBills.has(bill.id))
    .map((bill) => ({
      ...bill,
      envelopeId: billEnvelopeMap[bill.id] || null,
      isPaid: false,
      source: "auto_discovery",
      createdAt: new Date().toISOString(),
    }));
};