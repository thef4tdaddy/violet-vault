import { useState } from "react";
import { H } from "../../utils/common/highlight.js";
import { BugReportAPIService } from "../../services/bugReport/apiService";
import { SystemInfoService } from "../../services/bugReport/systemInfoService";
import { getCurrentPageContext } from "../../utils/bugReport/pageContextHelper";
import logger from "../../utils/common/logger";

/**
 * Hook for bug report submission operations
 * Extracted from useBugReport.js for better maintainability
 */
export const useBugReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHighlightSessionUrl = async () => {
    try {
      if (typeof H.getSessionMetadata === "function") {
        const sessionMetadata = await Promise.resolve(H.getSessionMetadata());
        return sessionMetadata?.sessionUrl || sessionMetadata?.url;
      }

      if (typeof H.getSessionURL === "function") {
        return await Promise.resolve(H.getSessionURL());
      }

      if (typeof H.getCurrentSessionURL === "function") {
        return await Promise.resolve(H.getCurrentSessionURL());
      }
    } catch (error) {
      logger.warn("Failed to get Highlight.io session URL:", error.message);
    }
    return null;
  };

  const submitReport = async (description, screenshotData) => {
    if (!description.trim()) return false;

    setIsSubmitting(true);

    try {
      // Get Highlight.io session URL
      const sessionUrl = await getHighlightSessionUrl();

      // Get system information
      const systemInfo = SystemInfoService.collectSystemInfo();

      // Get current page context
      const contextInfo = getCurrentPageContext();

      // Submit the bug report
      const reportData = {
        title: description.substring(0, 100),
        description,
        screenshot: screenshotData,
        sessionUrl,
        systemInfo,
        contextInfo,
        severity: "medium",
        labels: ["bug", "automated-report"],
      };

      logger.info("Submitting bug report", {
        hasScreenshot: !!screenshotData,
        hasSessionUrl: !!sessionUrl,
        pageContext: contextInfo.page,
        location: contextInfo.userLocation,
      });

      const result = await BugReportAPIService.submitToGitHub(reportData);

      if (result.success) {
        logger.info("Bug report submitted successfully", result);
        return true;
      } else {
        logger.error("Bug report submission failed", result);
        return false;
      }
    } catch (error) {
      logger.error("Bug report submission error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitReport,
  };
};
