/**
 * Frequency calculation constants
 * Standardized across the entire application for consistency
 */

// Biweekly conversion constant - always use monthly / 2 for consistency
// This ensures all biweekly calculations use the same simple multiplier
export const BIWEEKLY_MULTIPLIER = 2;

// Standard frequency multipliers (periods per year)
// Keep these simple and consistent
export const FREQUENCY_MULTIPLIERS = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannual: 2,
  yearly: 1,
  custom: 12, // Default to monthly for custom
};

// Helper functions for frequency conversions
export const convertToMonthly = (amount, frequency) => {
  const multiplier = FREQUENCY_MULTIPLIERS[frequency] || 12;
  return (amount * multiplier) / 12;
};

export const convertToBiweekly = (monthlyAmount) => {
  return monthlyAmount / BIWEEKLY_MULTIPLIER;
};

export const convertFromBiweeklyToMonthly = (biweeklyAmount) => {
  return biweeklyAmount * BIWEEKLY_MULTIPLIER;
};
