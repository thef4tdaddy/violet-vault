/* eslint-disable no-architecture-violations/no-architecture-violations */
import { useState } from "react";
import { validateBugReportForm } from "@/utils/validation";

/**
 * Form state for bug reports
 */
interface BugReportFormState {
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  severity: string;
  labels: string[];
  includeScreenshot: boolean;
}

/**
 * Form actions for bug reports
 */
interface BugReportFormActions {
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSteps: (steps: string) => void;
  setExpected: (expected: string) => void;
  setActual: (actual: string) => void;
  setSeverity: (severity: string) => void;
  setLabels: (labels: string[]) => void;
  setIncludeScreenshot: (include: boolean) => void;
  resetForm: () => void;
  getFormCompletion: () => number;
  validateForm: () => boolean;
}

/**
 * Hook for managing bug report form state
 * Extracted from useBugReportV2.ts to reduce complexity
 */
export const useBugReportForm = (defaultSeverity = "medium") => {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [severity, setSeverity] = useState(defaultSeverity);
  const [labels, setLabels] = useState<string[]>([]);
  const [includeScreenshot, setIncludeScreenshot] = useState(true);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSteps("");
    setExpected("");
    setActual("");
    setSeverity(defaultSeverity);
    setLabels([]);
    setIncludeScreenshot(true);
  };

  /**
   * Get form completion percentage
   */
  const getFormCompletion = () => {
    let completed = 0;
    const fields = [title, description, steps, expected, actual];

    fields.forEach((field) => {
      if (field && field.trim()) completed++;
    });

    return Math.round((completed / fields.length) * 100);
  };

  /**
   * Validate form data using utils/validation
   */
  const validateForm = () => {
    // Validation logic is in utils/validation/bugReportValidation.ts
    const validation = validateBugReportForm(title, description);
    return validation.isValid;
  };

  const state: BugReportFormState = {
    title,
    description,
    steps,
    expected,
    actual,
    severity,
    labels,
    includeScreenshot,
  };

  const actions: BugReportFormActions = {
    setTitle,
    setDescription,
    setSteps,
    setExpected,
    setActual,
    setSeverity,
    setLabels,
    setIncludeScreenshot,
    resetForm,
    getFormCompletion,
    validateForm,
  };

  return {
    ...state,
    ...actions,
    canSubmit: validateForm(),
    formCompletion: getFormCompletion(),
  };
};
