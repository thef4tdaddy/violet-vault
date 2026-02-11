/**
 * Validation Types for Hook-level Validation Patterns
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * Provides TypeScript types for standardized form validation in hooks
 */

import React from "react";
import { z } from "zod";

/**
 * Validation error structure
 * Maps field names to error messages
 */
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Validation result from Zod schema
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationErrors<T>;
}

/**
 * Form state for validated forms
 */
export interface ValidatedFormState<T> {
  data: T;
  errors: ValidationErrors<T>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Options for useValidatedForm hook
 */
export interface UseValidatedFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialData: T;
  onSubmit?: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Return type for useValidatedForm hook
 */
export interface UseValidatedFormReturn<T> {
  // Form state
  data: T;
  errors: ValidationErrors<T>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;

  // Form actions
  updateField: (field: keyof T, value: T[keyof T]) => void;
  updateFormData: (updates: Partial<T>) => void;
  setErrors: (errors: ValidationErrors<T>) => void;
  clearErrors: () => void;
  clearError: (field: keyof T) => void;
  validate: () => ValidationResult<T>;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;

  // Utilities
  setFieldError: (field: keyof T, error: string) => void;
  getFieldError: (field: keyof T) => string | undefined;
  hasError: (field: keyof T) => boolean;
}
