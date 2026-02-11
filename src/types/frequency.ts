/**
 * TypeScript type definitions for frequency calculations
 */

// Frequency types (used in both bills and other areas)
export type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

// Frequency multipliers interface
export interface FrequencyMultipliers {
  weekly: number;
  biweekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
}

// Frequency option interface for UI components
export interface FrequencyOption {
  value: Frequency;
  label: string;
  multiplier: number;
}

// Frequency display labels
export interface FrequencyLabels {
  [key: string]: string;
  once: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  quarterly: string;
  biannual: string;
  annual: string;
  yearly: string;
}
