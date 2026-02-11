/**
 * Database Validation Utilities
 * Centralized validation helpers for database operations
 * Part of Issue #1537: Phase 1.8 - Add Zod Validation Layer to Database Operations
 */

import { z } from "zod";
import logger from "@/utils/core/common/logger";

/**
 * Validate data with Zod schema and log errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param entityType - Type of entity being validated (for logging)
 * @returns Validated data
 * @throws Error with descriptive message if validation fails
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  entityType: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e: z.ZodIssue) => e.message).join(", ");
      logger.error(`${entityType} validation failed`, {
        errors: error.issues,
        data,
      });
      throw new Error(`Invalid ${entityType}: ${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Safe validation - returns result object instead of throwing
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param entityType - Type of entity being validated (for logging)
 * @returns Result object with success flag and data or error
 */
export function safeValidateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  entityType: string
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errorMessages = result.error.issues.map((e: z.ZodIssue) => e.message).join(", ");

  logger.warn(`${entityType} validation failed`, {
    errors: result.error.issues,
    data,
  });

  return {
    success: false,
    error: errorMessages,
  };
}

/**
 * Validate array of data with Zod schema
 * @param schema - Zod schema to validate against
 * @param dataArray - Array of data to validate
 * @param entityType - Type of entity being validated (for logging)
 * @returns Array of validated data
 * @throws Error with descriptive message if any validation fails
 */
export function validateArrayWithSchema<T>(
  schema: z.ZodSchema<T>,
  dataArray: unknown[],
  entityType: string
): T[] {
  return dataArray.map((item, index) => {
    try {
      return schema.parse(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`${entityType} validation failed at index ${index}`, {
          errors: error.issues,
          data: item,
        });
        throw new Error(
          `Invalid ${entityType} at index ${index}: ${error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  });
}

/**
 * Safe array validation - returns result object instead of throwing
 * @param schema - Zod schema to validate against
 * @param dataArray - Array of data to validate
 * @param entityType - Type of entity being validated (for logging)
 * @returns Result object with success flag and data or error
 */
export function safeValidateArrayWithSchema<T>(
  schema: z.ZodSchema<T>,
  dataArray: unknown[],
  entityType: string
): { success: true; data: T[] } | { success: false; error: string; failedIndices: number[] } {
  const results: T[] = [];
  const failedIndices: number[] = [];
  const errors: string[] = [];

  dataArray.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      results.push(result.data);
    } else {
      failedIndices.push(index);
      errors.push(
        `Index ${index}: ${result.error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`
      );
      logger.warn(`${entityType} validation failed at index ${index}`, {
        errors: result.error.issues,
        data: item,
      });
    }
  });

  if (failedIndices.length === 0) {
    return { success: true, data: results };
  }

  return {
    success: false,
    error: errors.join("; "),
    failedIndices,
  };
}
