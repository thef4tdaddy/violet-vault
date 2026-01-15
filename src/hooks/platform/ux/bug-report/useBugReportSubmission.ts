import { useState } from "react";
import BugReportService from "@/services/logging/bugReportingService.ts";
import logger from "@/utils/core/common/logger.ts";
import { validateBugReportSubmission } from "@/utils/core/validation";
import { useBugReportSentry } from "./useBugReportSentry";

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
  quickReport: (
    description: string,
    severity?: "low" | "medium" | "high" | "critical"
  ) => Promise<unknown>;
  initializeSentrySession: () => Promise<void>;
  getSentrySessionData: () => Promise<{
    eventUrl: string | null;
    eventId: string | null;
    available: boolean;
  }>;
}

/**
 * Hook for managing bug report submission (V2)
 * Includes Sentry integration and comprehensive error handling
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

  // Use Sentry hook
  const sentry = useBugReportSentry();

  /**
   * Validate submission requirements using utils/validation
   */
  const checkSubmissionValidity = (): boolean => {
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
      sentrySession: await getSentrySessionData(),
    },
  });

  /**
   * Handle successful submission
   */
  const handleSuccessfulSubmission = (result: { provider: string; url?: string }): boolean => {
    setSubmitResult({
      success: true,
      submissionId: result.url || result.provider || "unknown",
      url: result.url,
      provider: result.provider,
      screenshotStatus: null,
    });

    logger.info("Bug report submitted successfully", {
      provider: result.provider,
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
    result?: { provider: string; url?: string };
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
    if (!checkSubmissionValidity()) return false;

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      setSubmitError(errorMessage);
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
   * Initialize Sentry session management
   */
  const initializeSentrySession = async (): Promise<void> => {
    return sentry.initializeSentrySession();
  };

  /**
   * Get Sentry session data
   */
  const getSentrySessionData = async () => {
    return sentry.getSentrySessionData();
  };

  const state: BugReportSubmissionState = {
    isSubmitting,
    submitError,
    submitResult,
  };

  const actions: BugReportSubmissionActions = {
    submitReport,
    quickReport,
    initializeSentrySession,
    getSentrySessionData,
  };

  return {
    ...state,
    ...actions,
  };
};
