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
        // Skip problematic CSS properties that html2canvas can't parse
        onclone: (clonedDoc) => {
          // Remove any elements with problematic CSS like oklch() colors
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el) => {
            try {
              const style = window.getComputedStyle(el);
              // Convert oklch() and other modern color functions to RGB
              if (
                style.backgroundColor?.includes("oklch") ||
                style.color?.includes("oklch") ||
                style.borderColor?.includes("oklch")
              ) {
                el.style.backgroundColor = "#ffffff";
                el.style.color = "#000000";
                el.style.borderColor = "#cccccc";
              }
            } catch (e) {
              // Ignore style access errors
            }
          });
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
        // Try different methods to get session URL based on Highlight.io SDK version
        if (typeof H.getSessionMetadata === "function") {
          const sessionMetadata = H.getSessionMetadata();
          if (sessionMetadata?.sessionUrl) {
            sessionUrl = sessionMetadata.sessionUrl;
          }
        } else if (typeof H.getSessionURL === "function") {
          sessionUrl = H.getSessionURL();
        } else if (typeof H.getSession === "function") {
          const session = H.getSession();
          sessionUrl = session?.url || session?.sessionUrl;
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

      // Submit to Cloudflare Worker if endpoint is configured
      const bugReportEndpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT;

      if (bugReportEndpoint) {
        console.log("Submitting bug report to:", bugReportEndpoint);

        const response = await fetch(bugReportEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Bug report submission failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });

          // Parse error response to provide better user feedback
          let parsedError = null;
          try {
            parsedError = JSON.parse(errorText);
          } catch (e) {
            // Error text isn't JSON, use as-is
          }

          // If it's a server configuration error, fall back to local logging
          if (
            response.status === 500 ||
            (parsedError &&
              parsedError.message &&
              parsedError.message.includes("GitHub API error"))
          ) {
            console.warn("Bug report service unavailable, logging locally:", {
              ...reportData,
              screenshot: screenshotData ? "[Screenshot captured]" : null,
              sessionUrl: sessionUrl || "[No session replay URL available]",
            });

            // Don't throw error, treat as successful local logging
            reportData.localFallback = true;
            reportData.fallbackReason =
              parsedError?.message || `Server error: ${response.status}`;
          } else {
            throw new Error(
              `HTTP error! status: ${response.status} - ${errorText}`,
            );
          }
        } else {
          const result = await response.json();
          console.log("Bug report submitted successfully:", result);

          // Store the issue URL for user feedback
          if (result.issueUrl) {
            reportData.issueUrl = result.issueUrl;
          }
        }
      } else {
        // Fallback: log the report data if no endpoint is configured
        console.log("No bug report endpoint configured. Report data:", {
          ...reportData,
          screenshot: screenshotData ? "[Screenshot captured]" : null,
          sessionUrl: sessionUrl || "[No session replay URL available]",
        });
      }

      // Reset form on success
      setDescription("");
      setScreenshot(null);
      setIsModalOpen(false);

      // Return result data for UI feedback
      return reportData;
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    // Ensure Highlight.io session is active when opening bug report modal
    try {
      // Check if Highlight is already recording before attempting to start
      if (typeof H.isRecording === "function" && !H.isRecording()) {
        H.start();
        if (import.meta.env.MODE === "development") {
          console.log("🔧 Started Highlight.io session for bug report");
        }
      } else if (
        typeof H.start === "function" &&
        typeof H.isRecording !== "function"
      ) {
        // Fallback for older SDK versions that don't have isRecording
        H.start();
        if (import.meta.env.MODE === "development") {
          console.log("🔧 Attempted Highlight.io session start for bug report");
        }
      }
    } catch (error) {
      // Don't throw error if Highlight is already recording
      if (!error.message?.includes("already recording")) {
        console.error("Failed to start Highlight.io session:", error);
      }
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
