/**
 * Frequency calculation constants
 * Standardized across the entire application for consistency
 */

// Biweekly conversion constant - proper conversion based on 26 pay periods per year
// There are 26 biweekly periods per year, so 26/12 = 2.167 biweekly periods per month
export const BIWEEKLY_MULTIPLIER = 26 / 12;

// Frequency types
export type FrequencyType =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly"
  | "custom";

// Standard frequency multipliers (periods per year)
// Keep these simple and consistent
export const FREQUENCY_MULTIPLIERS: Record<FrequencyType, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  yearly: 1,
  custom: 12, // Default to monthly for custom
};

// Helper functions for frequency conversions
export const convertToMonthly = (amount: number, frequency: FrequencyType): number => {
  const multiplier = FREQUENCY_MULTIPLIERS[frequency] || 12;
  return (amount * multiplier) / 12;
};

export const convertToBiweekly = (monthlyAmount: number): number => {
  return monthlyAmount / BIWEEKLY_MULTIPLIER;
};

export const convertFromBiweeklyToMonthly = (biweeklyAmount: number): number => {
  return biweeklyAmount * BIWEEKLY_MULTIPLIER;
};
