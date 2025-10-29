/**
 * useValidatedForm Hook
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * Standard hook validation pattern for form state management with Zod schemas
 * Provides consistent validation, error handling, and submission logic
 */

import React, { useState, useCallback, useMemo } from "react";
import type {
  UseValidatedFormOptions,
  UseValidatedFormReturn,
  ValidationErrors,
} from "./validationTypes";
import {
  parseWithSchema,
  removeErrors,
  hasErrors,
  logValidationErrors,
  hasFormChanged,
} from "./validationHookHelpers";
import logger from "@/utils/common/logger";

/**
 * Custom hook for validated form management
 * Provides standardized form state, validation, and submission handling
 *
 * @example
 * ```typescript
 * const form = useValidatedForm({
 *   schema: MyFormSchema,
 *   initialData: { name: '', email: '' },
 *   onSubmit: async (data) => {
 *     await saveData(data);
 *   },
 *   validateOnChange: true,
 * });
 * ```
 */
export function useValidatedForm<T extends Record<string, unknown>>({
  schema,
  initialData,
  onSubmit,
  validateOnChange = false,
}: UseValidatedFormOptions<T>): UseValidatedFormReturn<T> {
  // Form state
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track initial data for dirty state
  const [initialFormData] = useState<T>(initialData);

  // Computed state
  const isDirty = useMemo(() => hasFormChanged(data, initialFormData), [data, initialFormData]);
  const isValid = useMemo(() => !hasErrors(errors), [errors]);

  /**
   * Validates the entire form against the schema
   */
  const validate = useCallback(() => {
    const result = parseWithSchema(schema, data);
    setErrors(result.errors);
    logValidationErrors("useValidatedForm", result.errors);
    return result;
  }, [schema, data]);

  /**
   * Updates a single form field
   * Optionally validates the field on change
   */
  const updateField = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when updating
      setErrors((prev) => removeErrors(prev, [field]));

      // Optional: validate on change
      if (validateOnChange) {
        // Defer validation slightly to allow state to update
        setTimeout(() => {
          const result = parseWithSchema(schema, { ...data, [field]: value });
          if (result.errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
          }
        }, 0);
      }
    },
    [data, schema, validateOnChange]
  );

  /**
   * Updates multiple form fields at once
   */
  const updateFormData = useCallback(
    (updates: Partial<T>) => {
      setData((prev) => ({ ...prev, ...updates }));

      // Clear errors for updated fields
      const updatedFields = Object.keys(updates) as Array<keyof T>;
      setErrors((prev) => removeErrors(prev, updatedFields));

      // Optional: validate on change
      if (validateOnChange) {
        setTimeout(() => {
          const result = parseWithSchema(schema, { ...data, ...updates });
          setErrors((prev) => ({ ...prev, ...result.errors }));
        }, 0);
      }
    },
    [data, schema, validateOnChange]
  );

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clears a specific field error
   */
  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => removeErrors(prev, [field]));
  }, []);

  /**
   * Sets a specific field error
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Gets error for a specific field
   */
  const getFieldError = useCallback(
    (field: keyof T) => {
      return errors[field];
    },
    [errors]
  );

  /**
   * Checks if a specific field has an error
   */
  const hasError = useCallback(
    (field: keyof T) => {
      return !!errors[field];
    },
    [errors]
  );

  /**
   * Resets form to initial state
   */
  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Handles form submission with validation
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Validate before submission
      const result = validate();
      if (!result.success) {
        logger.warn("Form validation failed", result.errors);
        return;
      }

      if (!onSubmit) {
        logger.warn("No onSubmit handler provided");
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(result.data as T);
      } catch (error) {
        logger.error("Form submission error", error);
        // Re-throw to allow parent to handle
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, onSubmit]
  );

  return {
    // Form state
    data,
    errors,
    isDirty,
    isSubmitting,
    isValid,

    // Form actions
    updateField,
    updateFormData,
    setErrors,
    clearErrors,
    clearError,
    validate,
    resetForm,
    handleSubmit,

    // Utilities
    setFieldError,
    getFieldError,
    hasError,
  };
}
