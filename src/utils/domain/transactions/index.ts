// Legacy exports
export * as envelopeMatching from "./envelopeMatching.ts";
export * as fileParser from "./fileParser.ts";
export * as tableHelpers from "./tableHelpers.ts";

// New refactored utilities (Issue #508)
// Splitting utilities
export {
  findEnvelopeForCategory,
  initializeSplitsFromTransaction,
  calculateSplitTotals,
  validateSplitAllocations,
  autoBalanceSplits,
  splitEvenly,
  addNewSplit,
  updateSplitField,
  removeSplit,
  prepareSplitTransactions,
  getSplitSummary,
} from "./splitting";

// Filtering and processing utilities
export {
  filterByDateRange,
  filterByEnvelope,
  filterByCategory,
  filterByType,
  filterBySearch,
  sortTransactions,
  processTransactions,
  groupTransactionsByDate,
  groupTransactionsByCategory,
  calculateTransactionStats,
} from "./filtering.ts";

// Operation utilities
export {
  validateTransactionData,
  prepareTransactionForStorage,
  determineTransactionType,
  createTransferPair,
  categorizeTransaction,
  mergeDuplicateTransactions,
  calculateRunningBalance,
  formatTransactionForDisplay,
} from "./operations.ts";
