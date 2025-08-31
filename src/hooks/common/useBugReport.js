import { useState } from "react";
import { H } from "../../utils/common/highlight.js";
import { APP_VERSION } from "../../utils/common/version";
import { BugReportAPIService } from "../../services/bugReport/apiService";
import { ScreenshotService } from "../../services/bugReport/screenshotService";
import { SystemInfoService } from "../../services/bugReport/systemInfoService";
import logger from "../../utils/common/logger";

/**
 * Custom hook for bug report functionality
 * Uses centralized services for screenshot, system info, and API submission
 */
const useBugReport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const captureScreenshot = async () => {
    try {
      logger.info("🔧 Starting screenshot capture using ScreenshotService");

      const screenshotData = await ScreenshotService.captureScreenshot({
        compress: true,
      });

      if (screenshotData) {
        setScreenshot(screenshotData);
        logger.info("✅ Screenshot captured successfully", {
          size: screenshotData.length,
          format: screenshotData.substring(0, 50),
        });
        return screenshotData;
      } else {
        logger.warn("ScreenshotService returned null, screenshot capture failed");
        return null;
      }
    } catch (error) {
      logger.error("Screenshot capture failed completely", error);
      return null;
    }
  };

  const submitReport = async () => {
    if (!description.trim()) return false;

    setIsSubmitting(true);

    try {
      // Capture screenshot if requested
      let screenshotData = null;
      if (includeScreenshot) {
        try {
          screenshotData = screenshot || (await captureScreenshot());
          logger.info("Screenshot capture result", {
            hasScreenshot: !!screenshotData,
            size: screenshotData?.length || 0,
            isBase64DataURL: screenshotData?.startsWith("data:image/") || false,
          });
        } catch (screenshotError) {
          logger.error(
            "Screenshot capture failed, proceeding without screenshot:",
            screenshotError
          );
          screenshotData = null;
        }
      }

      // Get Highlight.io session URL
      let sessionUrl = null;
      try {
        if (typeof H.getSessionMetadata === "function") {
          const sessionMetadata = await Promise.resolve(H.getSessionMetadata());
          sessionUrl = sessionMetadata?.sessionUrl || sessionMetadata?.url;
        }

        if (!sessionUrl && typeof H.getSessionURL === "function") {
          sessionUrl = await Promise.resolve(H.getSessionURL());
        }

        if (!sessionUrl && typeof H.getCurrentSessionURL === "function") {
          sessionUrl = await Promise.resolve(H.getCurrentSessionURL());
        }
      } catch (error) {
        logger.warn("Failed to get Highlight.io session URL:", error.message);
      }

      // Get system information
      const systemInfo = SystemInfoService.collectSystemInfo();

      // Get current page context for better location tracking
      const getCurrentPageContext = () => {
        const path = window.location.pathname;
        const hash = window.location.hash;

        // Detect active view from navigation or URL
        let currentPage = "unknown";
        let screenTitle = document.title || "Unknown";

        // Detect from URL path
        if (path.includes("/bills") || path.includes("bill")) currentPage = "bills";
        else if (path.includes("/debt") || path.includes("debt")) currentPage = "debt";
        else if (path.includes("/envelope") || path.includes("budget")) currentPage = "envelope";
        else if (path.includes("/transaction")) currentPage = "transaction";
        else if (path.includes("/saving")) currentPage = "savings";
        else if (path.includes("/analytic")) currentPage = "analytics";
        else if (path.includes("/setting")) currentPage = "settings";

        // Try to get more specific screen info
        const mainHeader = document.querySelector("h1, h2, [class*='title'], [class*='header']");
        if (mainHeader) {
          screenTitle = mainHeader.textContent?.trim() || screenTitle;
        }

        // Detect visible modals
        const visibleModals = [];
        const modals = document.querySelectorAll(
          '[role="dialog"], [class*="modal"], [class*="Modal"]'
        );
        modals.forEach((modal) => {
          if (modal.offsetParent !== null) {
            // visible
            const modalTitle = modal.querySelector('h1, h2, h3, [class*="title"]');
            if (modalTitle) {
              visibleModals.push(modalTitle.textContent?.trim());
            }
          }
        });

        return {
          page: currentPage,
          screenTitle,
          documentTitle: document.title,
          userLocation: `${currentPage} > ${screenTitle}${visibleModals.length ? ` > ${visibleModals[0]}` : ""}`,
          visibleModals,
          url: window.location.href,
          path,
          hash,
        };
      };

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
        // Reset form
        setDescription("");
        setScreenshot(null);
        setIsModalOpen(false);
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
    // State
    isModalOpen,
    description,
    includeScreenshot,
    isSubmitting,
    screenshot,

    // Actions
    setIsModalOpen,
    setDescription,
    setIncludeScreenshot,
    captureScreenshot,
    submitReport,
  };
};

export default useBugReport;
