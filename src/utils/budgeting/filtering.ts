import type { Envelope as DbEnvelope } from "@/db/types";
import logger from "@/utils/common/logger";
import { AUTO_CLASSIFY_ENVELOPE_TYPE, ENVELOPE_TYPES } from "@/constants/categories";
import { isValidEnvelopeType } from "@/utils/validation/envelopeValidation";

/**
 * Enhanced Envelope type with computed properties
 */
export type EnhancedEnvelope = DbEnvelope & {
  status: string;
  utilizationRate: number;
  available: number;
  monthlyBudget?: number;
  monthlyAmount?: number;
  biweeklyAllocation?: number;
  envelopeType?: string;
};

/**
 * Comprehensive envelope statistics
 */
export interface EnvelopeStats {
  totalBalance: number;
  totalTargetAmount: number;
  underfundedCount: number;
  overfundedCount: number;
  categories: string[];
  envelopeCount: number;
}

/**
 * Filter and sort envelopes based on options
 */
export const processEnvelopes = (
  envelopes: DbEnvelope[],
  options: {
    category?: string;
    includeArchived?: boolean;
    envelopeTypes?: string[];
    excludeEnvelopeTypes?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): EnhancedEnvelope[] => {
  const {
    category,
    includeArchived = false,
    envelopeTypes,
    excludeEnvelopeTypes,
    sortBy = "name",
    sortOrder = "asc",
  } = options;

  // 1. Transform and Auto-Classify
  let processed: EnhancedEnvelope[] = envelopes.map((env) => {
    let type: string | undefined = env.type;

    // Use envelopeType for backward compatibility if type is missing
    const legacyEnv = env as unknown as { envelopeType?: string; biweeklyAllocation?: number };
    if (!type && legacyEnv.envelopeType) {
      type = legacyEnv.envelopeType;
    }

    // Auto-classify if type is invalid or missing
    if (!type || !isValidEnvelopeType(type)) {
      type = AUTO_CLASSIFY_ENVELOPE_TYPE(env.category || "General");
    }

    // Explicitly handle sinking_fund to goal transition if it slipped through validation
    if (type === ENVELOPE_TYPES.SINKING_FUND) {
      type = ENVELOPE_TYPES.SAVINGS;
    }

    return {
      ...env,
      status: "active",
      utilizationRate: 0,
      available: env.currentBalance || 0,
      monthlyBudget: env.targetAmount,
      monthlyAmount: env.targetAmount,
      biweeklyAllocation: type === "standard" ? legacyEnv.biweeklyAllocation : undefined,
      envelopeType: type,
      type: type as DbEnvelope["type"],
    } as EnhancedEnvelope;
  });

  // Diagnostic logging for corrupted envelopes
  const corrupted = envelopes.filter((env) => !env.name || !env.category);
  if (corrupted.length > 0) {
    logger.warn("Found corrupted envelopes missing critical fields", {
      count: corrupted.length,
      corrupted: corrupted.map((env) => ({ id: env.id, name: env.name, category: env.category })),
    });
  }

  // 2. Apply Filters
  if (category) {
    processed = processed.filter((env) => env.category === category);
  }

  if (!includeArchived) {
    processed = processed.filter((env) => !env.archived);
  }

  if (envelopeTypes && envelopeTypes.length > 0) {
    processed = processed.filter((env) => envelopeTypes.includes(env.type));
  } else if (excludeEnvelopeTypes && excludeEnvelopeTypes.length > 0) {
    processed = processed.filter((env) => !excludeEnvelopeTypes.includes(env.type));
  }

  // 3. Apply Sorting
  processed.sort((a, b) => {
    const aVal = a[sortBy as keyof EnhancedEnvelope];
    const bVal = b[sortBy as keyof EnhancedEnvelope];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  return processed;
};

/**
 * Calculate envelope statistics
 */
export const calculateEnvelopeStats = (envelopes: EnhancedEnvelope[]): EnvelopeStats => {
  const stats: EnvelopeStats = {
    totalBalance: 0,
    totalTargetAmount: 0,
    underfundedCount: 0,
    overfundedCount: 0,
    categories: [],
    envelopeCount: envelopes.length,
  };

  const categorySet = new Set<string>();

  envelopes.forEach((env) => {
    const balance = env.currentBalance || 0;
    const target = env.targetAmount || 0;

    stats.totalBalance += balance;
    stats.totalTargetAmount += target;

    if (balance < target) stats.underfundedCount++;
    else if (balance > target) stats.overfundedCount++;

    if (env.category) categorySet.add(env.category);
  });

  stats.categories = Array.from(categorySet).sort();
  return stats;
};

/**
 * Repair utility for corrupted envelopes
 */
export const getRepairUpdates = (name: string, category: string) => {
  logger.info("Generating repair updates for envelope", { name, category });
  const type = AUTO_CLASSIFY_ENVELOPE_TYPE(category);

  return {
    name,
    category,
    targetAmount: 100,
    monthlyBudget: 50,
    biweeklyAllocation: 25,
    description: `Repaired envelope: ${name}`,
    lastModified: Date.now(),
    envelopeType: type,
    type: type as DbEnvelope["type"],
  };
};
