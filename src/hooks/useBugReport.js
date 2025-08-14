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
      // Check if we're on mobile - use simpler approach
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth <= 768;

      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Screenshot capture timed out")),
          isMobile ? 10000 : 15000,
        ),
      );

      // Dynamic import to avoid bundle size issues
      const html2canvas = (await import("html2canvas")).default;

      const screenshotPromise = html2canvas(document.body, {
        useCORS: true,
        logging: false,
        scale: isMobile ? 0.3 : 0.5, // Even smaller scale for mobile
        allowTaint: true,
        backgroundColor: "#ffffff",
        // Mobile-specific optimizations
        height: isMobile ? Math.min(window.innerHeight, 2000) : undefined,
        width: isMobile ? Math.min(window.innerWidth, 1200) : undefined,
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
              // Convert oklch() and other modern color functions to safe RGB values
              const hasProblematicColors =
                style.backgroundColor?.includes("oklch") ||
                style.color?.includes("oklch") ||
                style.borderColor?.includes("oklch") ||
                style.backgroundColor?.includes("lab(") ||
                style.color?.includes("lab(") ||
                style.borderColor?.includes("lab(") ||
                style.backgroundColor?.includes("lch(") ||
                style.color?.includes("lch(") ||
                style.borderColor?.includes("lch(");

              if (hasProblematicColors) {
                // Use safe fallback colors
                if (
                  style.backgroundColor?.includes("oklch") ||
                  style.backgroundColor?.includes("lab(") ||
                  style.backgroundColor?.includes("lch(")
                ) {
                  el.style.backgroundColor = "#ffffff";
                }
                if (
                  style.color?.includes("oklch") ||
                  style.color?.includes("lab(") ||
                  style.color?.includes("lch(")
                ) {
                  el.style.color = "#000000";
                }
                if (
                  style.borderColor?.includes("oklch") ||
                  style.borderColor?.includes("lab(") ||
                  style.borderColor?.includes("lch(")
                ) {
                  el.style.borderColor = "#cccccc";
                }
              }

              // Also handle any CSS variables that might contain problematic values
              const cssVariables = style.cssText.match(/--[\w-]+:\s*[^;]+/g);
              if (cssVariables) {
                cssVariables.forEach((variable) => {
                  if (
                    variable.includes("oklch") ||
                    variable.includes("lab(") ||
                    variable.includes("lch(")
                  ) {
                    // Remove the problematic CSS variable
                    const varName = variable.split(":")[0];
                    el.style.removeProperty(varName.trim());
                  }
                });
              }
            } catch {
              // Ignore style access errors
            }
          });
        },
      });

      // Race between screenshot capture and timeout
      const canvas = await Promise.race([screenshotPromise, timeoutPromise]);

      const screenshotDataUrl = canvas.toDataURL(
        "image/png",
        isMobile ? 0.5 : 0.7,
      );
      setScreenshot(screenshotDataUrl);
      return screenshotDataUrl;
    } catch (error) {
      console.warn("Failed to capture screenshot:", error.message);
      // Return null instead of throwing - this allows the bug report to continue without screenshot
      return null;
    }
  };

  const submitReport = async () => {
    if (!description.trim()) return false;

    setIsSubmitting(true);

    // Add overall timeout to prevent infinite hanging
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(
          () => reject(new Error("Bug report submission timed out")),
          30000,
        ), // 30 second timeout
    );

    const submissionPromise = async () => {
      try {
        let screenshotData = null;

        if (includeScreenshot) {
          try {
            screenshotData = screenshot || (await captureScreenshot());
          } catch (screenshotError) {
            console.warn(
              "Screenshot capture failed, proceeding without screenshot:",
              screenshotError,
            );
            screenshotData = null;
          }
        }

        // Get Highlight.io session URL for the bug report
        let sessionUrl = null;
        try {
          // Try different methods to get session URL based on Highlight.io SDK version
          if (typeof H.getSessionMetadata === "function") {
            const sessionMetadata = H.getSessionMetadata();
            if (sessionMetadata?.sessionUrl) {
              sessionUrl = String(sessionMetadata.sessionUrl);
            }
          } else if (typeof H.getSessionURL === "function") {
            const rawUrl = H.getSessionURL();
            sessionUrl = typeof rawUrl === "string" ? rawUrl : String(rawUrl);
          } else if (typeof H.getSession === "function") {
            const session = H.getSession();
            const rawUrl = session?.url || session?.sessionUrl;
            sessionUrl = rawUrl ? String(rawUrl) : null;
          }
        } catch (error) {
          console.warn("Failed to get Highlight.io session metadata:", error);
        }

        // Get current page context for smart labeling
        const getCurrentPageContext = () => {
          const path = window.location.pathname;
          const hash = window.location.hash;

          // Detect active view from navigation tabs (VioletVault uses tab-based navigation)
          let currentPage = "unknown";
          
          // First try to detect from active navigation tab
          const activeTab = document.querySelector('[aria-current="page"], .border-t-2.border-purple-500, .text-purple-600.bg-purple-50');
          if (activeTab) {
            const tabText = activeTab.textContent?.toLowerCase().trim();
            if (tabText) {
              if (tabText.includes('dashboard')) currentPage = 'dashboard';
              else if (tabText.includes('envelope')) currentPage = 'envelopes';
              else if (tabText.includes('savings')) currentPage = 'savings';
              else if (tabText.includes('supplemental')) currentPage = 'supplemental';
              else if (tabText.includes('paycheck')) currentPage = 'paycheck';
              else if (tabText.includes('bills') || tabText.includes('manage')) currentPage = 'bills';
              else if (tabText.includes('debt')) currentPage = 'debt';
              else if (tabText.includes('analytics') || tabText.includes('chart')) currentPage = 'analytics';
              else if (tabText.includes('settings')) currentPage = 'settings';
            }
          }
          
          // Fallback to URL-based detection for other pages
          if (currentPage === "unknown") {
            if (path.includes("/debt") || hash.includes("debt"))
              currentPage = "debt";
            else if (path.includes("/envelope") || hash.includes("envelope"))
              currentPage = "envelopes";
            else if (
              path.includes("/transaction") ||
              hash.includes("transaction")
            )
              currentPage = "transaction";
            else if (path.includes("/savings") || hash.includes("savings"))
              currentPage = "savings";
            else if (path.includes("/analytics") || hash.includes("analytics"))
              currentPage = "analytics";
            else if (path === "/" || path === "" || hash === "#/")
              currentPage = "dashboard";
          }
          
          // Additional detection from main content area
          if (currentPage === "unknown") {
            const mainContent = document.querySelector('main, [role="main"], .main-content');
            if (mainContent) {
              const contentText = mainContent.textContent?.toLowerCase() || '';
              if (contentText.includes('envelope') && contentText.includes('budget')) currentPage = 'envelopes';
              else if (contentText.includes('debt') && contentText.includes('payoff')) currentPage = 'debt';
              else if (contentText.includes('savings') && contentText.includes('goal')) currentPage = 'savings';
              else if (contentText.includes('bill') && contentText.includes('manage')) currentPage = 'bills';
              else if (contentText.includes('paycheck') || contentText.includes('income')) currentPage = 'paycheck';
            }
          }

          // Try to detect active component from DOM classes/attributes
          const activeElements = document.querySelectorAll(
            '[data-active="true"], .active, [aria-current="page"]',
          );
          const componentHints = Array.from(activeElements)
            .map((el) => el.textContent?.toLowerCase().trim())
            .filter((text) => text && text.length < 50);

          // Get additional verbose context about the current screen
          const getScreenTitle = () => {
            const titleElement = document.querySelector(
              "h1, h2, .page-title, [data-page-title]",
            );
            return titleElement?.textContent?.trim() || "Unknown Screen";
          };

          const getActiveButtons = () => {
            const buttons = document.querySelectorAll(
              'button:not([disabled]), [role="button"]:not([disabled])',
            );
            return Array.from(buttons)
              .map((btn) => btn.textContent?.trim())
              .filter((text) => text && text.length < 30 && text.length > 2)
              .slice(0, 5); // Top 5 button labels
          };

          const getVisibleModals = () => {
            const modals = document.querySelectorAll(
              '[role="dialog"], .modal, [data-modal]',
            );
            return Array.from(modals)
              .filter((modal) => modal.offsetParent !== null) // Only visible modals
              .map((modal) => {
                const title = modal.querySelector(
                  "h1, h2, h3, .modal-title, [data-modal-title]",
                );
                return title?.textContent?.trim() || "Untitled Modal";
              })
              .slice(0, 3);
          };

          return {
            page: currentPage,
            pathname: path,
            hash: hash,
            fullUrl: window.location.href,
            componentHints: componentHints.slice(0, 3), // Limit to avoid too much data
            screenTitle: getScreenTitle(),
            activeButtons: getActiveButtons(),
            visibleModals: getVisibleModals(),
            documentTitle: document.title,
            userLocation: `${currentPage} page${getScreenTitle() !== "Unknown Screen" ? ` - ${getScreenTitle()}` : ""}`,
            activeModals: getVisibleModals().join(", ") || "None",
            recentInteractions:
              getActiveButtons().slice(0, 3).join(", ") || "None detected",
          };
        };

        // Get comprehensive browser and performance info
        const getBrowserInfo = () => {
          const nav = navigator;
          return {
            cookiesEnabled: nav.cookieEnabled,
            language: nav.language,
            languages: nav.languages?.slice(0, 3) || [],
            platform: nav.platform,
            hardwareConcurrency: nav.hardwareConcurrency,
            maxTouchPoints: nav.maxTouchPoints || 0,
            onLine: nav.onLine,
            doNotTrack: nav.doNotTrack || "unset",
            memory: performance.memory
              ? {
                  usedJSHeapSize:
                    Math.round(
                      performance.memory.usedJSHeapSize / 1024 / 1024,
                    ) + "MB",
                  totalJSHeapSize:
                    Math.round(
                      performance.memory.totalJSHeapSize / 1024 / 1024,
                    ) + "MB",
                }
              : "unavailable",
          };
        };

        // Get local storage and session info
        const getStorageInfo = () => {
          try {
            const localStorageSize = JSON.stringify(localStorage).length;
            const sessionStorageSize = JSON.stringify(sessionStorage).length;
            return {
              localStorage: Math.round(localStorageSize / 1024) + "KB",
              sessionStorage: Math.round(sessionStorageSize / 1024) + "KB",
              localStorageItems: localStorage.length,
              sessionStorageItems: sessionStorage.length,
            };
          } catch (error) {
            return { error: "Storage access denied" };
          }
        };

        // Get DOM state information
        const getDOMInfo = () => {
          const body = document.body;
          const html = document.documentElement;

          return {
            scrollPosition: {
              x: window.pageXOffset || document.documentElement.scrollLeft,
              y: window.pageYOffset || document.documentElement.scrollTop,
            },
            documentDimensions: {
              width: Math.max(
                body.scrollWidth,
                html.scrollWidth,
                body.offsetWidth,
                html.offsetWidth,
                body.clientWidth,
                html.clientWidth,
              ),
              height: Math.max(
                body.scrollHeight,
                html.scrollHeight,
                body.offsetHeight,
                html.offsetHeight,
                body.clientHeight,
                html.clientHeight,
              ),
            },
            focusedElement: document.activeElement
              ? {
                  tagName: document.activeElement.tagName,
                  id: document.activeElement.id || null,
                  className: document.activeElement.className || null,
                  type: document.activeElement.type || null,
                }
              : null,
            errorCount: window.onerror ? "handler-attached" : "no-handler",
          };
        };

        // Get recent console logs if available
        const getRecentErrors = () => {
          try {
            // Try to capture any recent errors from performance entries
            const errors = [];
            const entries = performance.getEntriesByType("navigation");
            if (entries.length > 0) {
              errors.push(
                `Load time: ${Math.round(entries[0].loadEventEnd - entries[0].fetchStart)}ms`,
              );
            }

            // Add timing information
            if (performance.timing) {
              const timing = performance.timing;
              errors.push(
                `DNS: ${timing.domainLookupEnd - timing.domainLookupStart}ms`,
              );
              errors.push(
                `Connect: ${timing.connectEnd - timing.connectStart}ms`,
              );
            }

            return errors.length > 0
              ? errors
              : ["No performance data available"];
          } catch (error) {
            return ["Performance API unavailable"];
          }
        };

        const reportData = {
          description: description.trim(),
          screenshot: screenshotData,
          sessionUrl:
            sessionUrl ||
            "Session replay unavailable (possibly blocked by adblocker)",
          env: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            appVersion: import.meta.env.VITE_APP_VERSION || "1.6.1",
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer || "direct",
            pageContext: getCurrentPageContext(), // Enhanced context for smart labeling
            windowSize: window.screen
              ? `${window.screen.width}x${window.screen.height}`
              : "unknown",
            devicePixelRatio: window.devicePixelRatio || 1,
            connectionType: navigator.connection?.effectiveType || "unknown",

            // Comprehensive browser info
            browserInfo: getBrowserInfo(),
            storageInfo: getStorageInfo(),
            domInfo: getDOMInfo(),
            performanceInfo: getRecentErrors(),

            // Additional context
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            colorScheme: window.matchMedia("(prefers-color-scheme: dark)")
              .matches
              ? "dark"
              : "light",
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches,
            touchSupport: "ontouchstart" in window,
            standaloneMode:
              window.navigator.standalone ||
              window.matchMedia("(display-mode: standalone)").matches,
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
            } catch {
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
              // For other errors, also fallback to local logging instead of throwing
              console.warn("Bug report submission failed, logging locally:", {
                ...reportData,
                screenshot: screenshotData ? "[Screenshot captured]" : null,
                sessionUrl: sessionUrl || "[No session replay URL available]",
              });
              reportData.localFallback = true;
              reportData.fallbackReason = `HTTP error: ${response.status} - ${errorText}`;
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
      } catch (innerError) {
        console.error("Error in bug report submission:", innerError);
        throw innerError; // Re-throw to be caught by the outer handler
      }
    };

    try {
      // Race between submission and timeout
      const result = await Promise.race([submissionPromise(), timeoutPromise]);
      return result;
    } catch (error) {
      console.error("Failed to submit bug report:", error);

      // Even on timeout/error, log the report locally
      try {
        console.warn("Bug report failed, logging locally:", {
          description: description.trim(),
          screenshot: screenshot ? "[Screenshot available]" : null,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          error: error.message,
        });
      } catch (logError) {
        console.error("Failed to log bug report locally:", logError);
      }

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
    try {
      const screenshotData = await captureScreenshot();
      if (screenshotData) {
        // Open screenshot in new tab for preview
        const win = window.open();
        if (win) {
          win.document.write(`
            <html>
              <head><title>Screenshot Preview</title></head>
              <body style="margin: 0; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <img src="${screenshotData}" style="max-width: 90%; max-height: 90%; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
              </body>
            </html>
          `);
        } else {
          // Popup blocked or failed
          console.warn(
            "Failed to open screenshot preview - popup may be blocked",
          );
          // Could set screenshot to show inline preview instead
          setScreenshot(screenshotData);
        }
      } else {
        console.warn("Screenshot capture failed during preview");
      }
    } catch (error) {
      console.error("Error during screenshot preview:", error);
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
