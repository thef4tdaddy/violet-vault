/**
 * Validates bug report form data using Zod schemas
 */
import { z } from "zod";

/**
 * Zod schema for bug report form validation
 */
const BugReportFormSchema = z
  .object({
    title: z.string().max(200, "Title is too long (max 200 characters)"),
    description: z.string(),
  })
  .refine(
    (data) => data.title.trim() !== "" || data.description.trim() !== "",
    "Either title or description is required"
  );

/**
 * Validates bug report form data
 */
export const validateBugReportForm = (
  title: string,
  description: string
): { isValid: boolean; errors: string[] } => {
  const result = BugReportFormSchema.safeParse({ title, description });

  if (result.success) {
    return { isValid: true, errors: [] };
  }

  // Safety check: ensure issues is an array before map
  if (!result.error || !result.error.issues) {
    return { isValid: false, errors: ["Validation error: Invalid error structure"] };
  }

  const issues = Array.isArray(result.error.issues) ? result.error.issues : [];
  return {
    isValid: false,
    errors: issues.map((err) => err?.message || "Validation error"),
  };
};

/**
 * Zod schema for bug report submission validation
 */
const BugReportSubmissionSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => data.title?.trim() || data.description?.trim(),
    "Please provide either a title or description"
  );

/**
 * Validates bug report submission requirements
 */
export const validateBugReportSubmission = (
  title?: string,
  description?: string
): { isValid: boolean; error?: string } => {
  const result = BugReportSubmissionSchema.safeParse({ title, description });

  if (result.success) {
    return { isValid: true };
  }

  // Safety check: ensure issues is an array before accessing
  if (!result.error || !result.error.issues) {
    return { isValid: false, error: "Validation failed: Invalid error structure" };
  }

  const issues = Array.isArray(result.error.issues) ? result.error.issues : [];
  return {
    isValid: false,
    error: issues[0]?.message || "Validation failed",
  };
};
