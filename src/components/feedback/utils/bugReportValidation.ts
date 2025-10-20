export interface BugReportFormData {
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  severity: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates bug report form data
 */
export const validateBugReport = (data: BugReportFormData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!data.title.trim() && !data.description.trim()) {
    errors.push("Either title or description is required");
  }

  // Severity validation
  const validSeverities = ["low", "medium", "high", "critical"];
  if (!validSeverities.includes(data.severity)) {
    errors.push("Invalid severity level");
  }

  // Content quality warnings
  if (data.description.trim().length < 10) {
    warnings.push("Description seems brief - more details help us fix issues faster");
  }

  if (data.steps.trim() && data.steps.trim().length < 20) {
    warnings.push("Steps to reproduce could be more detailed");
  }

  if (!data.expected.trim() && !data.actual.trim()) {
    warnings.push("Expected vs actual behavior helps clarify the issue");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Checks if the form can be submitted
 */
export const canSubmitBugReport = (data: BugReportFormData): boolean => {
  return validateBugReport(data).isValid;
};

/**
 * Gets a summary of validation issues
 */
export const getValidationSummary = (data: BugReportFormData): string => {
  const validation = validateBugReport(data);

  if (validation.errors.length > 0) {
    return `Cannot submit: ${validation.errors.join(", ")}`;
  }

  if (validation.warnings.length > 0) {
    return `Ready to submit (${validation.warnings.length} suggestions)`;
  }

  return "Ready to submit";
};
