/**
 * Component Props Validator Utility
 * Runtime validation for React component props in development
 * Part of Issue #987: Comprehensive Zod Schema Implementation (Phase 3)
 */

import { z } from "zod";
import logger from "@/utils/core/common/logger";

/**
 * Validates component props at runtime (development only)
 * Logs warnings for invalid props without throwing errors
 *
 * @param componentName - Name of the component for error reporting
 * @param props - Props object to validate
 * @param schema - Zod schema to validate against
 * @returns true if valid, false if invalid (only logs in development)
 *
 * @example
 * ```typescript
 * function MyComponent(props: MyComponentProps) {
 *   validateComponentProps('MyComponent', props, MyComponentPropsSchema);
 *   return <div>...</div>;
 * }
 * ```
 */
export const validateComponentProps = <T extends z.ZodType>(
  componentName: string,
  props: unknown,
  schema: T
): boolean => {
  // Only validate in development mode to avoid performance impact
  if (import.meta.env.MODE !== "development") {
    return true;
  }

  const result = schema.safeParse(props);

  if (!result.success) {
    // Safety check: ensure issues is an array before accessing
    const issues = result.error?.issues || [];
    const safeIssues = Array.isArray(issues) ? issues : [];

    logger.warn(`⚠️ Invalid props for ${componentName}:`, {
      component: componentName,
      errors: safeIssues,
      props,
    });

    // Format the errors in a more readable way
    const formattedErrors = safeIssues.map((issue) => ({
      path: issue?.path?.join(".") || "unknown",
      message: issue?.message || "Validation error",
      received:
        issue?.code === "invalid_type" ? (issue as { received?: string }).received : undefined,
    }));

    logger.warn(`📋 Validation errors for ${componentName}:`, { errors: formattedErrors });

    return false;
  }

  return true;
};

/**
 * Type guard to check if props are valid without logging
 * Useful for conditional logic based on prop validity
 *
 * @param props - Props object to validate
 * @param schema - Zod schema to validate against
 * @returns true if valid, false otherwise
 */
export const isValidProps = <T extends z.ZodType>(props: unknown, schema: T): boolean => {
  if (import.meta.env.MODE !== "development") {
    return true;
  }

  const result = schema.safeParse(props);
  return result.success;
};

/**
 * Validates props and throws an error if invalid
 * Only use this for critical props that MUST be valid
 *
 * @param componentName - Name of the component for error reporting
 * @param props - Props object to validate
 * @param schema - Zod schema to validate against
 * @throws Error if props are invalid
 */
export const validateComponentPropsStrict = <T extends z.ZodType>(
  componentName: string,
  props: unknown,
  schema: T
): void => {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  try {
    schema.parse(props);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`❌ Critical prop validation error in ${componentName}:`, error.issues);
      throw new Error(
        `Invalid props for ${componentName}: ${error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`
      );
    }
    throw error;
  }
};
