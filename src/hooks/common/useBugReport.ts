/**
 * Enhanced Bug Report Hook
 * Refactored using extracted sub-hooks for better maintainability
 * Created for Issue #513 - replaces the monolithic useBugReport.js
 */
import { useState } from "react";
import logger from "../../utils/common/logger";
import { useBugReportForm } from "./bug-report/useBugReportForm";
import { useBugReportScreenshotV2 as useBugReportScreenshot } from "./bug-report/useBugReportScreenshot";
import { useBugReportSubmissionV2 as useBugReportSubmission } from "./bug-report/useBugReportSubmission";
import { useBugReportDiagnosticsV2 as useBugReportDiagnostics } from "./bug-report/useBugReportDiagnostics";

/**
 * Configuration options for the bug report hook
 */
interface BugReportOptions {
  providers?: Record<string, unknown>;
  autoCapture?: boolean;
  defaultSeverity?: string;
}

/**
 * Enhanced bug report hook with service layer architecture
 * @param options - Configuration options
 * @returns Bug report hook interface
 */
const useBugReport = (options: BugReportOptions = {}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use extracted sub-hooks
  const form = useBugReportForm(options.defaultSeverity);
  const screenshot = useBugReportScreenshot();
  const submission = useBugReportSubmission({
    providers: options.providers,
    title: form.title,
    description: form.description,
    includeScreenshot: form.includeScreenshot,
    severity: form.severity as "low" | "medium" | "high" | "critical",
    labels: form.labels,
    screenshot: screenshot.screenshot,
  });
  const diagnostics = useBugReportDiagnostics();

  /**
   * Open bug report modal and initialize
   */
  const openModal = async () => {
    try {
      // Initialize Highlight.io session
      await submission.initializeHighlightSession();

      // Auto-capture screenshot if enabled
      if (options.autoCapture && form.includeScreenshot) {
        await screenshot.captureScreenshot();
      }

      setIsModalOpen(true);
    } catch (error) {
      logger.warn("Error opening bug report modal", error);
      setIsModalOpen(true); // Still open modal even if initialization fails
    }
  };

  /**
   * Close modal and reset state
   */
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetForm();
  };

  return {
    // Modal state
    isModalOpen,

    // Form state (from sub-hook)
    ...form,

    // Screenshot state (from sub-hook)
    screenshot: screenshot.screenshot,
    previewScreenshot: screenshot.previewScreenshot,

    // Submission state (from sub-hook)
    isSubmitting: submission.isSubmitting,
    submitError: submission.submitError,
    submitResult: submission.submitResult,

    // Diagnostics state (from sub-hook)
    diagnostics: diagnostics.diagnostics,

    // Modal actions
    openModal,
    closeModal,

    // Screenshot actions (from sub-hook)
    setScreenshot: screenshot.setScreenshot,
    captureScreenshot: screenshot.captureScreenshot,
    showScreenshotPreview: screenshot.showScreenshotPreview,

    // Submission actions (from sub-hook)
    submitReport: submission.submitReport,
    quickReport: submission.quickReport,

    // Utility actions (from sub-hooks)
    runDiagnostics: diagnostics.runDiagnostics,
    getLocalReports: diagnostics.getLocalReports,
    clearLocalReports: diagnostics.clearLocalReports,
  };
};

export default useBugReport;
