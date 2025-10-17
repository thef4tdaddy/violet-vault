/**
 * Standardized frequency calculations for VioletVault
 *
 * This utility provides consistent calculation methods across the entire app
 * for converting between different payment/budget frequencies.
 *
 * Standard multipliers based on exact calculations:
 * - Weekly: 52.1775 weeks per year (365.25 days / 7)
 * - Biweekly: 26.0875 periods per year (365.25 days / 14)
 * - Monthly: 12 months per year
 * - Quarterly: 4 quarters per year
 * - Yearly: 1 year per year
 */

import logger from "../common/logger";
import type {
  Frequency,
  FrequencyMultipliers,
  FrequencyOption,
  FrequencyLabels,
} from "../../types/frequency";

// Precise frequency multipliers (periods per year)
export const FREQUENCY_MULTIPLIERS: FrequencyMultipliers = {
  weekly: 52.1775, // More precise than 52
  biweekly: 26, // Use simple 26 for consistency across app
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

// Legacy multipliers for compatibility (less precise)
export const LEGACY_MULTIPLIERS: FrequencyMultipliers = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

/**
 * Convert any amount from one frequency to another
 */
export function convertFrequency(
  amount: number,
  fromFrequency: Frequency,
  toFrequency: Frequency,
  usePrecise = true
): number {
  if (!amount || fromFrequency === toFrequency) return amount;

  const multipliers = usePrecise ? FREQUENCY_MULTIPLIERS : LEGACY_MULTIPLIERS;

  const fromMultiplier = multipliers[fromFrequency];
  const toMultiplier = multipliers[toFrequency];

  if (!fromMultiplier || !toMultiplier) {
    logger.warn(`Unknown frequency: ${fromFrequency} or ${toFrequency}`);
    return amount;
  }

  // Convert to yearly amount first, then to target frequency
  const yearlyAmount = amount * fromMultiplier;
  return yearlyAmount / toMultiplier;
}

/**
 * Convert any amount to biweekly amount
 */
export function toBiweekly(amount: number, fromFrequency: Frequency, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "biweekly", usePrecise);
}

/**
 * Convert any amount to monthly amount
 */
export function toMonthly(amount: number, fromFrequency: Frequency, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "monthly", usePrecise);
}

/**
 * Convert any amount to yearly amount
 */
export function toYearly(amount: number, fromFrequency: Frequency, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "yearly", usePrecise);
}

/**
 * Get frequency multiplier for a given frequency
 */
export function getMultiplier(frequency: Frequency, usePrecise = true): number {
  const multipliers = usePrecise ? FREQUENCY_MULTIPLIERS : LEGACY_MULTIPLIERS;
  return multipliers[frequency] || 1;
}

/**
 * Calculate how much needs to be saved per paycheck to reach a target
 */
export function calculatePaycheckAmount(
  targetAmount: number,
  targetFrequency: Frequency,
  paycheckFrequency: Frequency = "biweekly",
  usePrecise = true
): number {
  return convertFrequency(targetAmount, targetFrequency, paycheckFrequency, usePrecise);
}

/**
 * Validate frequency string
 */
export function isValidFrequency(frequency: string): frequency is Frequency {
  return Object.keys(FREQUENCY_MULTIPLIERS).includes(frequency);
}

/**
 * Get all supported frequencies
 */
export function getFrequencyOptions(usePrecise = true): FrequencyOption[] {
  const multipliers = usePrecise ? FREQUENCY_MULTIPLIERS : LEGACY_MULTIPLIERS;

  return [
    { value: "weekly", label: "Weekly", multiplier: multipliers.weekly },
    { value: "biweekly", label: "Bi-weekly", multiplier: multipliers.biweekly },
    { value: "monthly", label: "Monthly", multiplier: multipliers.monthly },
    {
      value: "quarterly",
      label: "Quarterly",
      multiplier: multipliers.quarterly,
    },
    { value: "yearly", label: "Yearly", multiplier: multipliers.yearly },
  ];
}

/**
 * Get display text for a frequency value
 */
export function getFrequencyDisplayText(frequency: string, customFrequency = 1): string {
  if (!frequency) return "Not set";

  const baseLabels: FrequencyLabels = {
    once: "One-time",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    biannual: "Bi-annual",
    annual: "Annual",
    yearly: "Annual",
  };

  const baseLabel = baseLabels[frequency] || frequency;

  // Handle custom frequency multipliers
  if (customFrequency && customFrequency > 1) {
    if (frequency === "monthly") {
      return `Every ${customFrequency} months`;
    } else if (frequency === "weekly") {
      return `Every ${customFrequency} weeks`;
    } else if (frequency === "yearly" || frequency === "annual") {
      return `Every ${customFrequency} years`;
    } else {
      return `${baseLabel} (${customFrequency}x)`;
    }
  }

  return baseLabel;
}
