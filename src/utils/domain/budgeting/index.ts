// Consolidated budgeting utilities
// autoFundingEngine removed - replaced with modular autofunding utilities and hooks
export * as billEnvelopeCalculations from "./billEnvelopeCalculations.ts";
export * as envelopeCalculations from "./envelopeCalculations.ts";
export * as envelopeIntegrityChecker from "./envelopeIntegrityChecker.ts";
export * as envelopeMatching from "./envelopeMatching.ts";
export * as envelopeStyles from "./envelopeStyles.ts";
export * as paydayPredictor from "./paydayPredictor.ts";

// Export specific functions from envelopeStyles
export {
  getEnvelopeTypeStyle,
  getStatusStyle,
  getStatusIcon,
  getUtilizationColor,
} from "./envelopeStyles.ts";

// Export specific functions from envelopeCalculations
export {
  calculateEnvelopeData,
  calculateUtilizationRate,
  determineEnvelopeHealth,
  sortEnvelopes,
  filterEnvelopes,
  calculateEnvelopeTotals,
  calculateBiweeklyNeeds,
} from "./envelopeCalculations.ts";
