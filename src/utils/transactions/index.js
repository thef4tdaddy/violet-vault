// Legacy exports
export { default as envelopeMatching } from "./envelopeMatching.js";
export { default as fileParser } from "./fileParser.js";
export { default as tableHelpers } from "./tableHelpers.js";

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
} from "./splitting.js";

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
} from "./filtering.js";

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
} from "./operations.js";
