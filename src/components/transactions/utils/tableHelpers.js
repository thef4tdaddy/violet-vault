/**
 * Utility functions for transaction table operations
 */

// Fixed column widths for consistent table layout
export const COLUMN_WIDTHS = {
  date: "w-32",
  description: "", // flexible width
  category: "w-36", 
  envelope: "w-48",
  amount: "w-32",
  actions: "w-36"
};

// Table configuration
export const TABLE_CONFIG = {
  estimateRowSize: 80,
  overscan: 10,
  maxHeight: "70vh"
};

/**
 * Find envelope by transaction envelope ID
 */
export const findEnvelopeForTransaction = (transaction, envelopes) => {
  return envelopes.find((e) => e.id === transaction.envelopeId);
};

/**
 * Format transaction amount for display
 */
export const formatTransactionAmount = (amount) => {
  const isPositive = amount >= 0;
  const absoluteAmount = Math.abs(amount);
  
  return {
    formatted: `${isPositive ? "+" : ""}$${absoluteAmount.toFixed(2)}`,
    className: isPositive ? "text-emerald-600" : "text-red-600",
    isPositive
  };
};

/**
 * Format transaction date for display
 */
export const formatTransactionDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Get envelope display info
 */
export const getEnvelopeDisplay = (envelope) => {
  if (!envelope) {
    return {
      name: "Unassigned",
      color: "#gray",
      className: "text-gray-400"
    };
  }
  
  return {
    name: envelope.name,
    color: envelope.color,
    className: "text-gray-700"
  };
};

export default {
  COLUMN_WIDTHS,
  TABLE_CONFIG,
  findEnvelopeForTransaction,
  formatTransactionAmount,
  formatTransactionDate,
  getEnvelopeDisplay
};