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

// Define type for frequency keys
type FrequencyKey = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

// Define type for frequency options
interface FrequencyOption {
  value: string;
  label: string;
  multiplier: number;
}

// Define type for frequency labels
interface FrequencyLabels {
  once: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  quarterly: string;
  biannual: string;
  annual: string;
  yearly: string;
  [key: string]: string; // Allow for other frequency strings
}

// Precise frequency multipliers (periods per year)
export const FREQUENCY_MULTIPLIERS: Record<FrequencyKey, number> = {
  weekly: 52.1775, // More precise than 52
  biweekly: 26, // Use simple 26 for consistency across app
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

// Legacy multipliers for compatibility (less precise)
export const LEGACY_MULTIPLIERS: Record<FrequencyKey, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

/**
 * Convert any amount from one frequency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromFrequency - Source frequency
 * @param {string} toFrequency - Target frequency
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Converted amount
 */
export function convertFrequency(
  amount: number,
  fromFrequency: FrequencyKey,
  toFrequency: FrequencyKey,
  usePrecise = true
): number {
  if (!amount || fromFrequency === toFrequency) return amount;

  const multipliers = usePrecise ? FREQUENCY_MULTIPLIERS : LEGACY_MULTIPLIERS;

  const fromMultiplier = multipliers[fromFrequency] || 1;
  const toMultiplier = multipliers[toFrequency] || 1;

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
 * @param {number} amount - The amount to convert
 * @param {string} fromFrequency - Source frequency
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Biweekly amount
 */
export function toBiweekly(amount: number, fromFrequency: FrequencyKey, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "biweekly", usePrecise);
}

/**
 * Convert any amount to monthly amount
 * @param {number} amount - The amount to convert
 * @param {string} fromFrequency - Source frequency
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Monthly amount
 */
export function toMonthly(amount: number, fromFrequency: FrequencyKey, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "monthly", usePrecise);
}

/**
 * Convert any amount to yearly amount
 * @param {number} amount - The amount to convert
 * @param {string} fromFrequency - Source frequency
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Yearly amount
 */
export function toYearly(amount: number, fromFrequency: FrequencyKey, usePrecise = true): number {
  return convertFrequency(amount, fromFrequency, "yearly", usePrecise);
}

/**
 * Get frequency multiplier for a given frequency
 * @param {string} frequency - The frequency to get multiplier for
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Frequency multiplier (periods per year)
 */
export function getMultiplier(frequency: FrequencyKey, usePrecise = true): number {
  const multipliers = usePrecise ? FREQUENCY_MULTIPLIERS : LEGACY_MULTIPLIERS;
  return multipliers[frequency] || 1;
}

/**
 * Calculate how much needs to be saved per paycheck to reach a target
 * @param {number} targetAmount - Target amount to reach
 * @param {string} targetFrequency - Frequency of target amount
 * @param {string} paycheckFrequency - How often you get paid (default: biweekly)
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {number} Amount needed per paycheck
 */
export function calculatePaycheckAmount(
  targetAmount: number,
  targetFrequency: FrequencyKey,
  paycheckFrequency: FrequencyKey = "biweekly",
  usePrecise = true
): number {
  return convertFrequency(targetAmount, targetFrequency, paycheckFrequency, usePrecise);
}

/**
 * Validate frequency string
 * @param {string} frequency - The frequency to validate
 * @returns {boolean} Whether the frequency is valid
 */
export function isValidFrequency(frequency: string): boolean {
  return Object.keys(FREQUENCY_MULTIPLIERS).includes(frequency);
}

/**
 * Get all supported frequencies
 * @param {boolean} usePrecise - Use precise multipliers (default: true)
 * @returns {Array<FrequencyOption>} Array of frequency options
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
 * @param {string} frequency - The frequency to get display text for
 * @param {number} customFrequency - Custom multiplier for the frequency
 * @returns {string} Human readable frequency text
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
