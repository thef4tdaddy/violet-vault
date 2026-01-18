/**
 * Date validation utilities using Zod schemas
 */
import { z } from "zod";

/**
 * Zod schema for date validation
 * Ensures date is valid and after year 1900
 */
export const DateSchema = z.union([z.string(), z.date(), z.number()]).refine(
  (val) => {
    if (!val) return false;
    const date = new Date(val);
    return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1900;
  },
  { message: "Invalid date or date must be after year 1900" }
);

/**
 * Check if a date is valid
 */
export const isValidDate = (dateString: unknown): boolean => {
  const result = DateSchema.safeParse(dateString);
  return result.success;
};
