// Consolidated budgeting utilities
// autoFundingEngine removed - replaced with modular autofunding utilities and hooks
export * as billEnvelopeCalculations from "./billEnvelopeCalculations.js";
export * as envelopeCalculations from "./envelopeCalculations.js";
export * as envelopeIntegrityChecker from "./envelopeIntegrityChecker.js";
export * as envelopeMatching from "./envelopeMatching.js";
export * as envelopeStyles from "./envelopeStyles.js";
export * as paydayPredictor from "./paydayPredictor.js";

// Export specific functions from envelopeStyles
export {
  getEnvelopeTypeStyle,
  getStatusStyle,
  getStatusIcon,
  getUtilizationColor,
} from "./envelopeStyles.js";

// Export specific functions from envelopeCalculations
export {
  calculateEnvelopeData,
  calculateUtilizationRate,
  determineEnvelopeStatus,
  sortEnvelopes,
  filterEnvelopes,
  calculateEnvelopeTotals,
  calculateBiweeklyNeeds,
} from "./envelopeCalculations.js";
