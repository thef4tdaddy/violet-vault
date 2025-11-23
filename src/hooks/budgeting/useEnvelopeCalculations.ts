import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "../../constants/categories";
import logger from "../../utils/common/logger";

interface Envelope {
  id?: string;
  currentBalance?: number;
  targetAmount?: number;
  category?: string;
  [key: string]: unknown;
}

/**
 * Hook for envelope calculations and utility functions
 * Handles computed values and helper functions for envelopes
 */
export const useEnvelopeCalculations = (envelopes: Envelope[] = []) => {
  // Computed values
  const totalBalance = envelopes.reduce((sum, env) => sum + (env.currentBalance || 0), 0);
  const totalTargetAmount = envelopes.reduce((sum, env) => sum + (env.targetAmount || 0), 0);
  const underfundedEnvelopes = envelopes.filter(
    (env) => (env.currentBalance || 0) < (env.targetAmount || 0)
  );
  const overfundedEnvelopes = envelopes.filter(
    (env) => (env.currentBalance || 0) > (env.targetAmount || 0)
  );

  // Utility functions
  const getEnvelopeById = (id: string) => envelopes.find((env) => env.id === id);

  const getEnvelopesByCategory = (cat: string) => envelopes.filter((env) => env.category === cat);

  const getAvailableCategories = () => {
    const categories = new Set(envelopes.map((env) => env.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  // Repair corrupted envelopes
  const repairCorruptedEnvelope = async (
    envelopeId: string,
    name: string,
    category: string = "utilities"
  ) => {
    logger.info("Repairing corrupted envelope", { envelopeId, name, category });

    const updates = {
      name,
      category,
      // Set reasonable defaults for missing fields
      targetAmount: 100,
      monthlyBudget: 50,
      biweeklyAllocation: 25,
      envelopeType: AUTO_CLASSIFY_ENVELOPE_TYPE(category),
      description: `Repaired envelope: ${name}`,
      lastUpdate: new Date().toISOString(),
    };

    return updates;
  };

  return {
    // Computed values
    totalBalance,
    totalTargetAmount,
    underfundedEnvelopes,
    overfundedEnvelopes,
    availableCategories: getAvailableCategories(),

    // Utility functions
    getEnvelopeById,
    getEnvelopesByCategory,
    repairCorruptedEnvelope,
  };
};
