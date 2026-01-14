/**
 * Share code validation using Zod schemas
 */
import { z } from "zod";
import logger from "./logger";

/**
 * Zod schema for share code validation
 */
export const ShareCodeSchema = z
  .string({ message: "Share code must be a string" })
  .min(1, "Share code cannot be empty")
  .trim();

/**
 * Validates share code format and content
 */
export const isValidShareCode = (code: string): boolean => {
  const result = ShareCodeSchema.safeParse(code);

  if (!result.success) {
    logger.warn("isValidShareCode validation failed:", {
      code,
      errors: result.error.issues,
    });
    return false;
  }

  return true;
};
