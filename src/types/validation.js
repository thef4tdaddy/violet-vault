/**
 * Common validation utilities for VioletVault domain types
 * Provides reusable Zod schemas and validation functions
 */
import { z } from "zod";

// Common field validations
export const CommonSchemas = {
  // ID validation - flexible to support various ID formats
  id: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val.length > 0, "ID cannot be empty"),

  // Money amounts - allows strings or numbers, converts to number
  monetaryAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const parsed = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(parsed) ? 0 : parsed;
    })
    .refine((val) => !isNaN(val), "Must be a valid number"),

  // Positive monetary amounts
  positiveAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const parsed = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(parsed) ? 0 : Math.abs(parsed);
    })
    .refine((val) => !isNaN(val) && val >= 0, "Must be a positive number"),

  // Date validation - accepts ISO strings or Date objects
  dateField: z
    .union([z.string(), z.date()])
    .transform((val) => {
      try {
        if (val instanceof Date) return val.toISOString();
        // If it's already an ISO string, validate it
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          // Return current date as fallback for invalid dates
          return new Date().toISOString();
        }
        return date.toISOString();
      } catch {
        // Return current date as fallback
        return new Date().toISOString();
      }
    }),

  // Optional date field
  optionalDate: z
    .union([z.string(), z.date(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString();
      const date = new Date(val);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    }),

  // Timestamp (Unix timestamp or ISO string)
  timestamp: z
    .union([z.number(), z.string(), z.date()])
    .transform((val) => {
      if (typeof val === "number") return val;
      if (val instanceof Date) return val.getTime();
      return new Date(val).getTime();
    }),

  // Non-empty string
  nonEmptyString: z.string().min(1, "Field cannot be empty").trim(),

  // Optional string that gets trimmed
  optionalString: z.string().optional().transform((val) => val?.trim() || ""),

  // Boolean with default false
  booleanDefault: (defaultValue = false) => z.boolean().default(defaultValue),

  // Frequency enum
  frequency: z.enum([
    "daily",
    "weekly", 
    "biweekly",
    "monthly",
    "quarterly",
    "semiannual",
    "yearly",
    "custom"
  ]).default("monthly"),
};

// Validation utilities
export const ValidationUtils = {
  /**
   * Create a schema for objects with common timestamp fields
   */
  withTimestamps: (baseSchema) => {
    return baseSchema.extend({
      createdAt: CommonSchemas.timestamp.optional(),
      lastModified: CommonSchemas.timestamp.optional(),
      updatedAt: CommonSchemas.timestamp.optional(),
    });
  },

  /**
   * Create a schema with audit fields
   */
  withAuditFields: (baseSchema) => {
    return baseSchema.extend({
      createdBy: CommonSchemas.optionalString,
      updatedBy: CommonSchemas.optionalString,
      importSource: CommonSchemas.optionalString,
    });
  },

  /**
   * Validate and transform form data
   */
  validateFormData: (schema, data) => {
    try {
      return {
        success: true,
        data: schema.parse(data),
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        };
      }
      return {
        success: false,
        data: null,
        errors: [{ field: "general", message: error.message }],
      };
    }
  },

  /**
   * Safe parse with detailed error reporting
   */
  safeParse: (schema, data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        formattedErrors: result.error.issues ? result.error.issues.reduce((acc, err) => {
          const field = err.path.join(".");
          acc[field] = err.message;
          return acc;
        }, {}) : {},
      };
    }
    return { success: true, data: result.data };
  },
};