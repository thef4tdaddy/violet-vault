import { useState } from "react";
import { H } from "../utils/highlight.js";

/**
 * Custom hook for bug report functionality
 * Handles screenshot capture, form state, submission logic, and Highlight.io session replay
 */
const useBugReport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const captureScreenshot = async () => {
    try {
      // Dynamic import to avoid bundle size issues
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        logging: false,
        scale: 0.5, // Reduce size for better performance
        allowTaint: true,
        backgroundColor: "#ffffff",
        // Exclude the bug report button and modal from screenshot
        ignoreElements: (element) => {
          return element.getAttribute("data-bug-report") === "true";
        },
      });

      const screenshotDataUrl = canvas.toDataURL("image/png", 0.7);
      setScreenshot(screenshotDataUrl);
      return screenshotDataUrl;
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return null;
    }
  };

  const submitReport = async () => {
    if (!description.trim()) return false;

    setIsSubmitting(true);

    try {
      let screenshotData = null;

      if (includeScreenshot) {
        screenshotData = screenshot || (await captureScreenshot());
      }

      // Get Highlight.io session URL for the bug report
      let sessionUrl = null;
      try {
        const sessionMetadata = H.getSessionMetadata();
        if (sessionMetadata?.sessionUrl) {
          sessionUrl = sessionMetadata.sessionUrl;
        }
      } catch (error) {
        console.warn("Failed to get Highlight.io session metadata:", error);
      }

      const reportData = {
        description: description.trim(),
        screenshot: screenshotData,
        sessionUrl, // Include Highlight.io session replay URL
        env: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          appVersion: import.meta.env.VITE_APP_VERSION || "1.6.1",
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          referrer: document.referrer || "direct",
        },
      };

      // For now, just log the report data - in production this would go to Cloudflare Worker
      console.log("Bug report submitted:", {
        ...reportData,
        screenshot: screenshotData ? "[Screenshot captured]" : null,
        sessionUrl: sessionUrl || "[No session replay URL available]",
      });

      // TODO: Send to Cloudflare Worker endpoint
      // const response = await fetch("https://your-worker.workers.dev/report-issue", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(reportData),
      // });
      //
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // Reset form on success
      setDescription("");
      setScreenshot(null);
      setIsModalOpen(false);

      return true;
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    // Force start a Highlight.io session when opening bug report modal
    try {
      H.start();
      if (import.meta.env.MODE === "development") {
        console.log("🔧 Forced Highlight.io session start for bug report");
      }
    } catch (error) {
      console.error("Failed to start Highlight.io session:", error);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDescription("");
    setScreenshot(null);
  };

  const previewScreenshot = async () => {
    const screenshotData = await captureScreenshot();
    if (screenshotData) {
      // Open screenshot in new tab for preview
      const win = window.open();
      win.document.write(`
        <html>
          <head><title>Screenshot Preview</title></head>
          <body style="margin: 0; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${screenshotData}" style="max-width: 90%; max-height: 90%; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
          </body>
        </html>
      `);
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
    openModal,
    closeModal,
    setDescription,
    setIncludeScreenshot,
    submitReport,
    captureScreenshot,
    previewScreenshot,
  };
};

export default useBugReport;
