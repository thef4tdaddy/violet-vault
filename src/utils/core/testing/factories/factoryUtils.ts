/**
 * Factory Utility Functions
 * Helper functions for generating test data
 * Part of Phase 3: Test Schema Factories and Fixtures
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique ID for test entities
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Generate a timestamp for test entities (current time)
 */
export const generateTimestamp = (): number => {
  return Date.now();
};

/**
 * Generate a timestamp for a specific date
 */
export const generateTimestampFor = (date: Date): number => {
  return date.getTime();
};

/**
 * Generate a random amount between min and max
 */
export const generateAmount = (min = 10, max = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random date within the last N days
 */
export const generateRecentDate = (daysAgo = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

/**
 * Generate a random future date within the next N days
 */
export const generateFutureDate = (daysAhead = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

/**
 * Generate a random color hex code
 */
export const generateColor = (): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52C93F",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generate random text of specified length
 */
export const generateText = (length = 10): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Pick a random item from an array
 */
export const pickRandom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Merge partial overrides with defaults
 */
export const mergeDefaults = <T extends Record<string, unknown>>(
  defaults: T,
  overrides?: Partial<T>
): T => {
  return { ...defaults, ...overrides };
};
