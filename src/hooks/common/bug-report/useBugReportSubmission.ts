import { useState } from "react";
import BugReportService from "../../../services/bugReport/index.ts";
import logger from "../../../utils/common/logger.ts";
import { validateBugReportSubmission } from "../../../utils/validation";
import { useBugReportHighlight } from "./useBugReportHighlight";

/// <reference types="../../../vite-env.d.ts" />

/**
 * Submission result state
 */
interface SubmitResult {
  success: boolean;
  submissionId?: string;
  url?: string;
  provider?: string;
  screenshotStatus?: unknown;
}

/**
 * Submission state for bug reports V2
 */
interface BugReportSubmissionState {
  isSubmitting: boolean;
  submitError: string | null;
  submitResult: SubmitResult | null;
}

/**
 * Submission actions for bug reports V2
 */
interface BugReportSubmissionActions {
  submitReport: () => Promise<boolean>;
  quickReport: (description: string, severity?: string) => Promise<unknown>;
  initializeHighlightSession: () => Promise<void>;
  getHighlightSessionData: () => Promise<{
    sessionUrl: string;
    sessionId: string | null;
    available: boolean;
  }>;
}

/**
 * Hook for managing bug report submission (V2)
 * Includes Highlight.io integration and comprehensive error handling
 * Extracted from useBugReportV2.ts to reduce complexity
 */
export const useBugReportSubmissionV2 = (
  options: {
    providers?: Record<string, unknown>;
    title?: string;
    description?: string;
    includeScreenshot?: boolean;
    severity?: "low" | "medium" | "high" | "critical";
    labels?: string[];
    screenshot?: string | null;
  } = {}
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Use Highlight.io hook
  const highlight = useBugReportHighlight();

  /**
   * Validate submission requirements using utils/validation
   */
  // eslint-disable-next-line no-architecture-violations/no-architecture-violations
  const validateSubmission = (): boolean => {
    // Validation logic is in utils/validation/bugReportValidation.ts
    const validation = validateBugReportSubmission(options.title, options.description);
    if (!validation.isValid && validation.error) {
      setSubmitError(validation.error);
      return false;
    }
    return true;
  };

  /**
   * Prepare report options for submission
   */
  const prepareReportOptions = async () => ({
    title: options.title || `Bug Report - ${new Date().toLocaleDateString()}`,
    description: options.description || "",
    includeScreenshot: options.includeScreenshot && !!options.screenshot,
    severity: options.severity,
    labels: options.labels,
    providers: options.providers as {
      github?: Record<string, unknown>;
      email?: Record<string, unknown>;
      webhook?: { url: string };
    },
    customData: {
      highlightSession: await getHighlightSessionData(),
    },
  });

  /**
   * Handle successful submission
   */
  const handleSuccessfulSubmission = (result: {
    successfulProvider?: string;
    attempts?: number;
  }): boolean => {
    setSubmitResult({
      success: true,
      submissionId: result.successfulProvider || "unknown",
      url: null,
      provider: result.successfulProvider,
      screenshotStatus: null,
    });

    logger.info("Bug report submitted successfully", {
      provider: result.successfulProvider,
      attempts: result.attempts,
    });

    return true;
  };

  /**
   * Handle failed submission
   */
  const handleFailedSubmission = (result: { error?: string }): boolean => {
    const errorMessage = result.error || "Submission failed";
    logger.error("Bug report submission failed", errorMessage);
    setSubmitError(errorMessage);
    return false;
  };

  /**
   * Log submission attempt
   */
  const logSubmissionAttempt = (): void => {
    logger.debug("Submitting bug report", {
      title: options.title || "Untitled",
      hasScreenshot: options.includeScreenshot && !!options.screenshot,
      severity: options.severity,
    });
  };

  /**
   * Execute the submission
   */
  const executeSubmission = async (): Promise<{
    success: boolean;
    result?: { successfulProvider?: string; attempts?: number };
    error?: { error?: string };
  }> => {
    const reportOptions = await prepareReportOptions();
    const result = await BugReportService.submitBugReport(reportOptions);

    return {
      success: result.success,
      result: result.success ? result : undefined,
      error: !result.success ? result : undefined,
    };
  };

  /**
   * Submit bug report using service layer
   */
  const submitReport = async (): Promise<boolean> => {
    if (!validateSubmission()) return false;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      logSubmissionAttempt();
      const submission = await executeSubmission();

      return submission.success
        ? handleSuccessfulSubmission(submission.result!)
        : handleFailedSubmission(submission.error!);
    } catch (error) {
      logger.error("Bug report submission failed", error);
      setSubmitError(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Quick bug report with minimal setup
   */
  const quickReport = async (
    description: string,
    severity: "low" | "medium" | "high" | "critical" = "medium"
  ) => {
    try {
      return await BugReportService.quickReport(description, {
        severity,
        providers: options.providers as {
          github?: Record<string, unknown>;
          email?: Record<string, unknown>;
          webhook?: { url: string };
        },
      });
    } catch (error) {
      logger.error("Quick report failed", error);
      throw error;
    }
  };

  /**
   * Initialize Highlight.io session management
   */
  const initializeHighlightSession = async (): Promise<void> => {
    return highlight.initializeHighlightSession();
  };

  /**
   * Get Highlight.io session data
   */
  const getHighlightSessionData = async () => {
    return highlight.getHighlightSessionData();
  };

  const state: BugReportSubmissionState = {
    isSubmitting,
    submitError,
    submitResult,
  };

  const actions: BugReportSubmissionActions = {
    submitReport,
    quickReport,
    initializeHighlightSession,
    getHighlightSessionData,
  };

  return {
    ...state,
    ...actions,
  };
};
