/**
 * Enhanced Bug Report Hook (V2)
 * Lightweight hook using extracted bug reporting services
 * Created for Issue #513 - replaces the monolithic useBugReport.js
 */
import { useState } from "react";
import BugReportService from "../../services/bugReport/index.js";
// Dynamic import of Highlight.io to avoid bundle size impact
import logger from "../../utils/common/logger.js";

/**
 * Enhanced bug report hook with service layer architecture
 * @param {Object} options - Configuration options
 * @param {Object} options.providers - Custom provider configurations
 * @param {boolean} options.autoCapture - Auto-capture screenshot on modal open
 * @param {string} options.defaultSeverity - Default severity level
 * @returns {Object} Bug report hook interface
 */
const useBugReportV2 = (options = {}) => {
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [severity, setSeverity] = useState(options.defaultSeverity || "medium");
  const [labels, setLabels] = useState([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [previewScreenshot, setPreviewScreenshot] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // Diagnostic state
  const [diagnostics, setDiagnostics] = useState(null);

  /**
   * Open bug report modal and initialize
   */
  const openModal = async () => {
    try {
      // Initialize Highlight.io session
      await initializeHighlightSession();

      // Auto-capture screenshot if enabled
      if (options.autoCapture && includeScreenshot) {
        await captureScreenshot();
      }

      setIsModalOpen(true);
      setSubmitError(null);
      setSubmitResult(null);
    } catch (error) {
      logger.error("Error opening bug report modal", error);
      setIsModalOpen(true); // Still open modal even if initialization fails
    }
  };

  /**
   * Close modal and reset state
   */
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSteps("");
    setExpected("");
    setActual("");
    setScreenshot(null);
    setPreviewScreenshot(null);
    setSeverity(options.defaultSeverity || "medium");
    setLabels([]);
    setSubmitError(null);
    setSubmitResult(null);
  };

  /**
   * Capture screenshot using service layer
   */
  const captureScreenshot = async () => {
    try {
      logger.debug("Capturing screenshot for bug report");
      const screenshotData = await BugReportService.captureScreenshotSafely();

      if (screenshotData) {
        setScreenshot(screenshotData);
        logger.info("Screenshot captured successfully");
        return screenshotData;
      } else {
        logger.warn("Screenshot capture returned null");
        return null;
      }
    } catch (error) {
      logger.error("Screenshot capture failed", error);
      return null;
    }
  };

  /**
   * Preview screenshot in new window
   */
  const showScreenshotPreview = async () => {
    try {
      let screenshotData = screenshot;

      if (!screenshotData) {
        screenshotData = await captureScreenshot();
      }

      if (screenshotData) {
        const win = window.open();
        if (win) {
          win.document.write(`
            <html>
              <head><title>Bug Report Screenshot Preview</title></head>
              <body style="margin: 0; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <div style="max-width: 95%; max-height: 95%; overflow: auto;">
                  <img src="${screenshotData}" style="max-width: 100%; height: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                </div>
              </body>
            </html>
          `);
        } else {
          logger.warn("Failed to open screenshot preview - popup may be blocked");
          setPreviewScreenshot(screenshotData);
        }
      }
    } catch (error) {
      logger.error("Error showing screenshot preview", error);
    }
  };

  /**
   * Submit bug report using service layer
   */
  const submitReport = async () => {
    if (!title.trim() && !description.trim()) {
      setSubmitError("Please provide either a title or description");
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      logger.debug("Submitting bug report", {
        title: title || "Untitled",
        hasScreenshot: includeScreenshot && !!screenshot,
        severity,
      });

      const reportOptions = {
        title: title || `Bug Report - ${new Date().toLocaleDateString()}`,
        description,
        steps,
        expected,
        actual,
        includeScreenshot: includeScreenshot && !!screenshot,
        severity,
        labels,
        providers: options.providers,
        customData: {
          highlightSession: await getHighlightSessionData(),
        },
      };

      const result = await BugReportService.submitBugReport(reportOptions);

      if (result.success) {
        setSubmitResult({
          success: true,
          submissionId: result.submissionId,
          url: result.url,
          provider: result.primaryProvider,
          screenshotStatus: result.screenshotStatus,
        });

        logger.info("Bug report submitted successfully", {
          submissionId: result.submissionId,
          provider: result.primaryProvider,
        });

        // Close modal on successful submission
        setTimeout(() => {
          closeModal();
        }, 2000);

        return true;
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error) {
      logger.error("Bug report submission failed", error);
      setSubmitError(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Run diagnostics on bug reporting system
   */
  const runDiagnostics = async () => {
    try {
      logger.debug("Running bug report diagnostics");
      const diagnosticResults = await BugReportService.runDiagnostics();
      setDiagnostics(diagnosticResults);
      return diagnosticResults;
    } catch (error) {
      logger.error("Diagnostics failed", error);
      const failedDiagnostics = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      setDiagnostics(failedDiagnostics);
      return failedDiagnostics;
    }
  };

  /**
   * Quick bug report with minimal setup
   */
  const quickReport = async (description, severity = "medium") => {
    try {
      return await BugReportService.quickReport(description, {
        severity,
        providers: options.providers,
      });
    } catch (error) {
      logger.error("Quick report failed", error);
      throw error;
    }
  };

  /**
   * Initialize Highlight.io session management
   */
  const initializeHighlightSession = async () => {
    try {
      if (typeof H.isRecording === "function") {
        if (!H.isRecording()) {
          try {
            H.start();
            logger.debug("Started new Highlight.io session for bug report");
          } catch (startError) {
            logger.debug(
              "Highlight.io start failed (session may already be active)",
              startError.message
            );
          }
        } else {
          logger.debug("Highlight.io session already active - using existing session");
        }
      } else if (typeof H.start === "function") {
        try {
          if (typeof H.getSessionMetadata === "function" || typeof H.getSessionURL === "function") {
            logger.debug("Using existing Highlight.io session (no isRecording method available)");
          } else {
            H.start();
            logger.debug("Started Highlight.io session (no session detection available)");
          }
        } catch (error) {
          logger.debug("Highlight.io start attempt ignored", error.message);
        }
      }
    } catch (error) {
      logger.debug("Highlight.io session management info", error.message);
    }
  };

  /**
   * Get Highlight.io session data
   */
  const getHighlightSessionData = async () => {
    try {
      let sessionUrl = null;
      let sessionId = null;

      if (typeof H.getSessionURL === "function") {
        sessionUrl = H.getSessionURL();
      }

      if (typeof H.getSessionMetadata === "function") {
        const metadata = H.getSessionMetadata();
        sessionId = metadata?.sessionId;
      }

      return {
        sessionUrl: sessionUrl || "Session replay unavailable",
        sessionId,
        available: !!(sessionUrl || sessionId),
      };
    } catch (error) {
      logger.debug("Error getting Highlight.io session data", error);
      return {
        sessionUrl: "Session replay unavailable (error retrieving)",
        sessionId: null,
        available: false,
        error: error.message,
      };
    }
  };

  /**
   * Get local bug reports
   */
  const getLocalReports = () => {
    return BugReportService.getLocalReports();
  };

  /**
   * Clear local bug reports
   */
  const clearLocalReports = () => {
    BugReportService.clearLocalReports();
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = [];

    if (!title.trim() && !description.trim()) {
      errors.push("Either title or description is required");
    }

    if (title.length > 200) {
      errors.push("Title is too long (max 200 characters)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
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

    if (screenshot && includeScreenshot) completed++;

    return Math.round((completed / (fields.length + 1)) * 100);
  };

  return {
    // Form state
    isModalOpen,
    title,
    description,
    steps,
    expected,
    actual,
    includeScreenshot,
    severity,
    labels,

    // UI state
    isSubmitting,
    screenshot,
    previewScreenshot,
    submitError,
    submitResult,
    diagnostics,

    // Form actions
    setTitle,
    setDescription,
    setSteps,
    setExpected,
    setActual,
    setIncludeScreenshot,
    setSeverity,
    setLabels,
    setScreenshot,

    // Modal actions
    openModal,
    closeModal,
    resetForm,

    // Screenshot actions
    captureScreenshot,
    showScreenshotPreview,

    // Submission actions
    submitReport,
    quickReport,

    // Utility actions
    runDiagnostics,
    getLocalReports,
    clearLocalReports,
    validateForm,
    getFormCompletion,

    // Computed properties
    canSubmit: !isSubmitting && (title.trim() || description.trim()),
    formCompletion: getFormCompletion(),
    hasScreenshot: !!screenshot,
  };
};

export default useBugReportV2;
