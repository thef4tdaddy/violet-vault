import { ENVELOPE_TYPES, AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";
import { BIWEEKLY_MULTIPLIER } from "@/constants/frequency";
import {
  calculateBillEnvelopePriority,
  getRecommendedBillFunding,
} from "@/utils/budgeting/billEnvelopeCalculations";
import type { Envelope as DbEnvelope, Bill as DbBill } from "@/db/types";

export type EnvelopeRecord = DbEnvelope & {
  monthlyBudget?: number;
  monthlyAmount?: number;
  biweeklyAllocation?: number;
  color?: string;
};

type LegacyEnvelope = EnvelopeRecord & {
  envelopeType?: string;
  category?: string;
};

export type BillRecord = DbBill;

// Helper to calculate monthly budget for an envelope
export const calculateMonthlyBudget = (envelope: EnvelopeRecord): number => {
  const legacyEnvelope = envelope as LegacyEnvelope;
  const envelopeType =
    legacyEnvelope.envelopeType ||
    envelope.type ||
    AUTO_CLASSIFY_ENVELOPE_TYPE(legacyEnvelope.category || "");

  if (envelopeType === ENVELOPE_TYPES.BILL) {
    return envelope.biweeklyAllocation ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 0;
  } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
    return envelope.monthlyBudget || envelope.monthlyAmount || 0;
  } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
    return envelope.biweeklyAllocation ? envelope.biweeklyAllocation * BIWEEKLY_MULTIPLIER : 50;
  }

  return 0;
};

// Helper to calculate total budget across envelopes
export const calculateTotalBudget = (envelopes: EnvelopeRecord[]): number => {
  return envelopes.reduce((sum, env) => sum + calculateMonthlyBudget(env), 0);
};

// Helper to create proportional distributions
export const createProportionalDistributions = (
  envelopes: EnvelopeRecord[],
  unassignedCash: number,
  totalBudget: number
): Record<string, number> => {
  const newDistributions: Record<string, number> = {};

  envelopes.forEach((envelope) => {
    const monthlyBudget = calculateMonthlyBudget(envelope);
    const proportion = monthlyBudget / totalBudget;
    const amount = Math.floor(unassignedCash * proportion * 100) / 100;

    if (amount > 0) {
      newDistributions[envelope.id] = amount;
    }
  });

  return newDistributions;
};

// Helper to create bill priority distributions
export const createBillPriorityDistributions = (
  billEnvelopes: EnvelopeRecord[],
  bills: BillRecord[],
  unassignedCash: number
): Record<string, number> => {
  const envelopeRecommendations = billEnvelopes.map((envelope) => {
    const priority = calculateBillEnvelopePriority(envelope, bills);
    const recommendation = getRecommendedBillFunding(envelope, bills, unassignedCash);

    return {
      envelope,
      priority: priority.priority,
      priorityLevel: priority.priorityLevel,
      recommendedAmount: recommendation.recommendedAmount,
      reason: recommendation.reason,
      isUrgent: recommendation.isUrgent,
    };
  });

  // Sort by priority (highest first)
  envelopeRecommendations.sort((a, b) => b.priority - a.priority);

  const newDistributions: Record<string, number> = {};
  let remainingCash = unassignedCash;

  // First pass: Fund urgent/critical envelopes fully
  envelopeRecommendations.forEach(({ envelope, recommendedAmount, isUrgent }) => {
    if (isUrgent && remainingCash >= recommendedAmount) {
      newDistributions[envelope.id] = recommendedAmount;
      remainingCash -= recommendedAmount;
    }
  });

  // Second pass: Fund other envelopes based on availability
  envelopeRecommendations.forEach(({ envelope, recommendedAmount, isUrgent }) => {
    if (!isUrgent && remainingCash > 0) {
      const amountToAllocate = Math.min(recommendedAmount, remainingCash);
      if (amountToAllocate > 0) {
        newDistributions[envelope.id] = amountToAllocate;
        remainingCash -= amountToAllocate;
      }
    }
  });

  return newDistributions;
};
