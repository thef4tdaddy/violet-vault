import { useState } from "react";
import { H } from "../utils/highlight.js";
import { APP_VERSION } from "../utils/version";
import logger from "../utils/logger";

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
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

      // Try modern native screenshot API first (requires user interaction)
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          logger.debug("Attempting native screen capture API (user interaction required)");
          // This requires user permission and interaction
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 1, max: 5 },
            },
            audio: false,
          });

          // Create video element to capture frame
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          // Wait for video to be ready
          await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
          });

          // Capture frame to canvas
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0);

          // Stop the stream
          stream.getTracks().forEach((track) => track.stop());

          const screenshotDataUrl = canvas.toDataURL("image/png", 0.8);
          setScreenshot(screenshotDataUrl);
          logger.info("Native screen capture successful");
          return screenshotDataUrl;
        } catch (nativeError) {
          logger.debug("Native screen capture failed or cancelled by user:", nativeError.message);
          // Fall through to html2canvas method
        }
      }

      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Screenshot capture timed out")),
          isMobile ? 10000 : 15000
        )
      );

      // Fallback to html2canvas (original method)
      const html2canvas = (await import("html2canvas")).default;

      // Try simpler approach first - capture just the main content area
      let targetElement = document.body;

      // Look for main content container to avoid capturing complex layouts
      const mainContent = document.querySelector(
        'main, [role="main"], .main-content, .app, #root, #app'
      );
      if (mainContent && mainContent.offsetParent !== null) {
        targetElement = mainContent;
        logger.debug("Using main content element for screenshot capture");
      }

      const screenshotPromise = html2canvas(targetElement, {
        useCORS: true,
        logging: false,
        scale: isMobile ? 0.3 : 0.5, // Even smaller scale for mobile
        allowTaint: true,
        backgroundColor: "#ffffff",
        // Mobile-specific optimizations
        height: isMobile ? Math.min(window.innerHeight, 2000) : undefined,
        width: isMobile ? Math.min(window.innerWidth, 1200) : undefined,
        // Additional compatibility options
        foreignObjectRendering: false, // Disable to avoid modern CSS issues
        imageTimeout: 15000, // Increase timeout for slow image loading
        removeContainer: true, // Clean up after rendering
        // Exclude the bug report button and modal from screenshot
        ignoreElements: (element) => {
          return element.getAttribute("data-bug-report") === "true";
        },
        // Aggressive CSS cleanup to prevent oklch and other modern color function errors
        onclone: (clonedDoc) => {
          try {
            logger.debug("Starting CSS cleanup for screenshot compatibility");

            // Step 1: Remove ALL external stylesheets completely
            const externalStyles = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
            externalStyles.forEach((link) => {
              logger.debug("Removing external stylesheet:", link.href);
              link.remove();
            });

            // Step 2: Remove ALL existing style tags (including Tailwind/Vite injected styles)
            const styleTags = clonedDoc.querySelectorAll("style");
            styleTags.forEach((style, index) => {
              logger.debug(
                `Removing style tag ${index}:`,
                style.textContent?.substring(0, 100) + "..."
              );
              style.remove();
            });

            // Step 3: Remove any inline styles that might contain modern CSS
            const allElements = clonedDoc.querySelectorAll("*");
            let cleanedInlineStyles = 0;
            allElements.forEach((element) => {
              const inlineStyle = element.getAttribute("style");
              if (inlineStyle) {
                // Check for ANY modern CSS feature that might cause parsing issues
                const problematicFeatures = [
                  "oklch",
                  "lch",
                  "lab",
                  "color(",
                  "color-mix(",
                  "light-dark(",
                  "@container",
                  "@supports",
                  ":has(",
                  ":is(",
                  ":where(",
                  "clamp(",
                  "min(",
                  "max(",
                  "var(--",
                  "accent-color",
                  "backdrop-filter",
                  "filter:",
                  "-webkit-backdrop-filter",
                ];

                const hasProblematic = problematicFeatures.some((feature) =>
                  inlineStyle.toLowerCase().includes(feature.toLowerCase())
                );

                if (hasProblematic) {
                  element.removeAttribute("style");
                  cleanedInlineStyles++;
                }
              }
            });
            logger.debug(`Cleaned ${cleanedInlineStyles} inline styles with problematic CSS`);

            // Step 4: Remove CSS custom properties from document root
            const root = clonedDoc.documentElement;
            if (root) {
              root.removeAttribute("style");
              // Also remove any CSS custom property classes that Tailwind might have added
              const classList = Array.from(root.classList);
              classList.forEach((className) => {
                if (className.includes("--") || className.startsWith("tw-")) {
                  root.classList.remove(className);
                }
              });
            }

            // Step 5: Add minimal, safe CSS that won't cause parsing errors
            const safeStyle = clonedDoc.createElement("style");
            safeStyle.textContent = `
              /* Ultra-minimal safe CSS for screenshot - no modern features */
              body { 
                font-family: Arial, sans-serif; 
                color: #333333; 
                background-color: #ffffff;
                margin: 8px;
              }
              
              /* Basic element styling */
              h1, h2, h3, h4, h5, h6 { color: #1f2937; }
              button { 
                background-color: #f3f4f6; 
                border: 1px solid #d1d5db; 
                padding: 4px 8px;
                color: #374151;
              }
              
              /* Remove all advanced CSS that could cause parsing issues */
              * {
                filter: none;
                backdrop-filter: none;
                box-shadow: none;
                text-shadow: none;
                background-image: none;
                transform: none;
                transition: none;
                animation: none;
              }
            `;
            clonedDoc.head.appendChild(safeStyle);
            logger.debug("Added minimal safe CSS for screenshot compatibility");
          } catch (error) {
            logger.warn("Failed to apply CSS cleanup for screenshots:", error);
          }
        },
      });

      // Race between screenshot capture and timeout
      const canvas = await Promise.race([screenshotPromise, timeoutPromise]);

      const screenshotDataUrl = canvas.toDataURL("image/png", isMobile ? 0.5 : 0.7);
      setScreenshot(screenshotDataUrl);
      return screenshotDataUrl;
    } catch (error) {
      logger.warn("Primary screenshot capture failed:", error.message);

      // Try fallback screenshot with minimal options
      try {
        logger.debug("Attempting fallback screenshot with minimal configuration");
        const html2canvas = (await import("html2canvas")).default;

        const fallbackCanvas = await html2canvas(document.body, {
          logging: false,
          scale: 0.25, // Very small scale for compatibility
          backgroundColor: "#ffffff",
          useCORS: false, // Disable CORS for compatibility
          allowTaint: false,
          foreignObjectRendering: false,
          removeContainer: true,
          ignoreElements: (element) => {
            return element.getAttribute("data-bug-report") === "true";
          },
          // Skip onclone entirely for fallback
        });

        const fallbackDataUrl = fallbackCanvas.toDataURL("image/png", 0.3);
        setScreenshot(fallbackDataUrl);
        logger.info("Fallback screenshot captured successfully");
        return fallbackDataUrl;
      } catch (fallbackError) {
        logger.warn("Fallback screenshot also failed:", fallbackError.message);

        // Try one more super-simple approach with canvas-based screenshot
        try {
          logger.debug("Attempting canvas-based screenshot as final fallback");

          // Create a simple canvas representation of the viewport
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas size to viewport size
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          // Fill with white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add a simple text representation
          ctx.fillStyle = "#333333";
          ctx.font = "16px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("VioletVault App Screenshot", canvas.width / 2, 50);
          ctx.fillText(`Page: ${window.location.pathname}`, canvas.width / 2, 80);
          ctx.fillText(`Timestamp: ${new Date().toLocaleString()}`, canvas.width / 2, 110);
          ctx.fillText("(Automatic screenshot capture failed)", canvas.width / 2, 140);

          // Try to get page title or main content
          const pageTitle = document.title || "Unknown Page";
          ctx.fillText(`Title: ${pageTitle}`, canvas.width / 2, 170);

          // Add basic app state information
          const activeTab = document.querySelector(
            '[aria-current="page"], .border-t-2.border-purple-500'
          );
          if (activeTab) {
            ctx.fillText(
              `Active Section: ${activeTab.textContent?.trim() || "Unknown"}`,
              canvas.width / 2,
              200
            );
          }

          const fallbackDataUrl = canvas.toDataURL("image/png", 0.8);
          setScreenshot(fallbackDataUrl);
          logger.info("Canvas-based fallback screenshot created successfully");
          return fallbackDataUrl;
        } catch (canvasError) {
          logger.warn("Canvas fallback also failed:", canvasError.message);

          // Inform user about manual screenshot alternatives
          logger.info("📸 Screenshot auto-capture failed. Manual alternatives:", {
            desktop: "Use Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+4 (Mac)",
            mobile: "Use device screenshot gesture or settings menu",
            browser: "Browser dev tools or extensions can capture screenshots",
          });

          // Return null instead of throwing - this allows the bug report to continue without screenshot
          return null;
        }
      }
    }
  };

  const submitReport = async () => {
    if (!description.trim()) return false;

    setIsSubmitting(true);

    // Add overall timeout to prevent infinite hanging
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Bug report submission timed out")), 30000) // 30 second timeout
    );

    const submissionPromise = async () => {
      try {
        let screenshotData = null;

        if (includeScreenshot) {
          try {
            screenshotData = screenshot || (await captureScreenshot());
          } catch (screenshotError) {
            logger.warn(
              "Screenshot capture failed, proceeding without screenshot:",
              screenshotError
            );
            screenshotData = null;
          }
        }

        // Get Highlight.io session URL for the bug report
        let sessionUrl = null;
        try {
          // Enhanced session URL retrieval with better error handling and promise support
          if (typeof H.getSessionMetadata === "function") {
            try {
              const sessionMetadata = await Promise.resolve(H.getSessionMetadata());
              if (sessionMetadata?.sessionUrl) {
                sessionUrl = String(sessionMetadata.sessionUrl);
              } else if (sessionMetadata?.url) {
                sessionUrl = String(sessionMetadata.url);
              }
            } catch (metadataError) {
              logger.warn("getSessionMetadata failed:", metadataError.message);
            }
          }

          // Fallback methods if primary method failed
          if (!sessionUrl && typeof H.getSessionURL === "function") {
            try {
              const rawUrl = await Promise.resolve(H.getSessionURL());
              // Check if it's a promise object that wasn't properly awaited
              if (rawUrl && typeof rawUrl === "object" && rawUrl.constructor.name === "Promise") {
                logger.warn("getSessionURL returned unresolved promise, attempting to resolve");
                const resolvedUrl = await rawUrl;
                sessionUrl = typeof resolvedUrl === "string" ? resolvedUrl : String(resolvedUrl);
              } else {
                sessionUrl = typeof rawUrl === "string" ? rawUrl : String(rawUrl);
              }
            } catch (urlError) {
              logger.warn("getSessionURL failed:", urlError.message);
            }
          }

          if (!sessionUrl && typeof H.getSession === "function") {
            try {
              const session = await Promise.resolve(H.getSession());
              const rawUrl = session?.url || session?.sessionUrl || session?.replayUrl;
              sessionUrl = rawUrl ? String(rawUrl) : null;
            } catch (sessionError) {
              logger.warn("getSession failed:", sessionError.message);
            }
          }

          // Additional fallback for newer SDK versions
          if (!sessionUrl && typeof H.getCurrentSessionURL === "function") {
            try {
              const currentUrl = await Promise.resolve(H.getCurrentSessionURL());
              // Handle case where this might return a promise
              if (
                currentUrl &&
                typeof currentUrl === "object" &&
                currentUrl.constructor.name === "Promise"
              ) {
                logger.warn(
                  "getCurrentSessionURL returned unresolved promise, attempting to resolve"
                );
                const resolvedUrl = await currentUrl;
                sessionUrl = typeof resolvedUrl === "string" ? resolvedUrl : String(resolvedUrl);
              } else {
                sessionUrl = typeof currentUrl === "string" ? currentUrl : String(currentUrl);
              }
            } catch (currentError) {
              logger.warn("getCurrentSessionURL failed:", currentError.message);
            }
          }
        } catch (error) {
          logger.warn("Failed to get Highlight.io session metadata:", error.message);
        }

        // Get current page context for smart labeling
        const getCurrentPageContext = () => {
          const path = window.location.pathname;
          const hash = window.location.hash;

          // Detect active view from navigation tabs (VioletVault uses tab-based navigation)
          let currentPage = "unknown";
          let suggestedLabels = ["bug"];

          // First try to detect from active navigation tab
          const activeTab = document.querySelector(
            '[aria-current="page"], .border-t-2.border-purple-500, .text-purple-600.bg-purple-50'
          );
          if (activeTab) {
            const tabText = activeTab.textContent?.toLowerCase().trim();
            if (tabText) {
              if (tabText.includes("dashboard")) {
                currentPage = "dashboard";
                suggestedLabels.push("ui", "overview");
              } else if (tabText.includes("envelope")) {
                currentPage = "envelopes";
                suggestedLabels.push("budget", "envelopes");
              } else if (tabText.includes("savings")) {
                currentPage = "savings";
                suggestedLabels.push("savings", "goals");
              } else if (tabText.includes("supplemental")) {
                currentPage = "supplemental";
                suggestedLabels.push("supplemental-income", "budget");
              } else if (tabText.includes("paycheck")) {
                currentPage = "paycheck";
                suggestedLabels.push("paycheck", "income");
              } else if (tabText.includes("bills") || tabText.includes("manage")) {
                currentPage = "bills";
                suggestedLabels.push("bills", "payments");
              } else if (tabText.includes("debt")) {
                currentPage = "debt";
                suggestedLabels.push("debt", "tracking");
              } else if (tabText.includes("analytics") || tabText.includes("chart")) {
                currentPage = "analytics";
                suggestedLabels.push("analytics", "charts");
              } else if (tabText.includes("settings")) {
                currentPage = "settings";
                suggestedLabels.push("settings", "configuration");
              }
            }
          }

          // Fallback to URL-based detection for other pages
          if (currentPage === "unknown") {
            if (path.includes("/debt") || hash.includes("debt")) currentPage = "debt";
            else if (path.includes("/envelope") || hash.includes("envelope"))
              currentPage = "envelopes";
            else if (path.includes("/transaction") || hash.includes("transaction"))
              currentPage = "transaction";
            else if (path.includes("/savings") || hash.includes("savings")) currentPage = "savings";
            else if (path.includes("/analytics") || hash.includes("analytics"))
              currentPage = "analytics";
            else if (path === "/" || path === "" || hash === "#/") currentPage = "dashboard";
          }

          // Additional detection from main content area
          if (currentPage === "unknown") {
            const mainContent = document.querySelector('main, [role="main"], .main-content');
            if (mainContent) {
              const contentText = mainContent.textContent?.toLowerCase() || "";
              if (contentText.includes("envelope") && contentText.includes("budget"))
                currentPage = "envelopes";
              else if (contentText.includes("debt") && contentText.includes("payoff"))
                currentPage = "debt";
              else if (contentText.includes("savings") && contentText.includes("goal"))
                currentPage = "savings";
              else if (contentText.includes("bill") && contentText.includes("manage"))
                currentPage = "bills";
              else if (contentText.includes("paycheck") || contentText.includes("income"))
                currentPage = "paycheck";
            }
          }

          // Try to detect active component from DOM classes/attributes
          const activeElements = document.querySelectorAll(
            '[data-active="true"], .active, [aria-current="page"]'
          );
          const componentHints = Array.from(activeElements)
            .map((el) => el.textContent?.toLowerCase().trim())
            .filter((text) => text && text.length < 50);

          // Get additional verbose context about the current screen
          const getScreenTitle = () => {
            const titleElement = document.querySelector("h1, h2, .page-title, [data-page-title]");
            return titleElement?.textContent?.trim() || "Unknown Screen";
          };

          const getActiveButtons = () => {
            const buttons = document.querySelectorAll(
              'button:not([disabled]), [role="button"]:not([disabled])'
            );
            return Array.from(buttons)
              .map((btn) => btn.textContent?.trim())
              .filter((text) => text && text.length < 30 && text.length > 2)
              .slice(0, 5); // Top 5 button labels
          };

          const getVisibleModals = () => {
            const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal]');
            return Array.from(modals)
              .filter((modal) => modal.offsetParent !== null) // Only visible modals
              .map((modal) => {
                const title = modal.querySelector("h1, h2, h3, .modal-title, [data-modal-title]");
                return title?.textContent?.trim() || "Untitled Modal";
              })
              .slice(0, 3);
          };

          // Analyze description for intelligent labeling
          const analyzeDescription = (description) => {
            const text = description.toLowerCase();
            const additionalLabels = [];

            // Detect error types
            if (text.includes("error") || text.includes("fail") || text.includes("broken")) {
              additionalLabels.push("error");
            }
            if (text.includes("crash") || text.includes("freeze")) {
              additionalLabels.push("crash");
            }
            if (text.includes("slow") || text.includes("performance")) {
              additionalLabels.push("performance");
            }
            if (text.includes("sync") || text.includes("cloud")) {
              additionalLabels.push("sync");
            }
            if (text.includes("mobile") || text.includes("phone")) {
              additionalLabels.push("mobile");
            }
            if (text.includes("desktop") || text.includes("laptop")) {
              additionalLabels.push("desktop");
            }

            return additionalLabels;
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
            recentInteractions: getActiveButtons().slice(0, 3).join(", ") || "None detected",
            suggestedLabels: [...suggestedLabels, ...analyzeDescription(description.trim())],
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
                    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + "MB",
                  totalJSHeapSize:
                    Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + "MB",
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
          } catch {
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
                html.clientWidth
              ),
              height: Math.max(
                body.scrollHeight,
                html.scrollHeight,
                body.offsetHeight,
                html.offsetHeight,
                body.clientHeight,
                html.clientHeight
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
                `Load time: ${Math.round(entries[0].loadEventEnd - entries[0].fetchStart)}ms`
              );
            }

            // Add timing information
            if (performance.timing) {
              const timing = performance.timing;
              errors.push(`DNS: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
              errors.push(`Connect: ${timing.connectEnd - timing.connectStart}ms`);
            }

            return errors.length > 0 ? errors : ["No performance data available"];
          } catch {
            return ["Performance API unavailable"];
          }
        };

        // Format description to properly handle code blocks and prevent task list conversion
        const formatDescription = (desc) => {
          // Preserve code blocks by temporarily replacing them
          const codeBlocks = [];
          let formattedDesc = desc;

          // Extract code blocks (both ``` and single ` formats)
          formattedDesc = formattedDesc.replace(/```[\s\S]*?```/g, (match) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push({
              content: match,
              placeholder: placeholder,
            });
            return placeholder;
          });

          // Extract inline code
          formattedDesc = formattedDesc.replace(/`[^`]+`/g, (match) => {
            const placeholder = `__INLINE_CODE_${codeBlocks.length}__`;
            codeBlocks.push({
              content: match,
              placeholder: placeholder,
            });
            return placeholder;
          });

          // Now restore code blocks
          codeBlocks.forEach(({ content, placeholder }) => {
            formattedDesc = formattedDesc.replace(placeholder, content);
          });

          return {
            formatted: formattedDesc,
            hasCodeBlocks: codeBlocks.length > 0,
            codeBlockCount: codeBlocks.length,
          };
        };

        const descriptionData = formatDescription(description.trim());

        const reportData = {
          description: descriptionData.formatted,
          originalDescription: description.trim(),
          hasCodeBlocks: descriptionData.hasCodeBlocks,
          codeBlockCount: descriptionData.codeBlockCount,
          screenshot: screenshotData,
          sessionUrl: sessionUrl || "Session replay unavailable (possibly blocked by adblocker)",
          env: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            appVersion: APP_VERSION,
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
            colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light",
            reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            touchSupport: "ontouchstart" in window,
            standaloneMode:
              window.navigator.standalone ||
              window.matchMedia("(display-mode: standalone)").matches,
          },
        };

        // Submit to Cloudflare Worker if endpoint is configured
        const bugReportEndpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT;

        if (bugReportEndpoint) {
          logger.production("Bug report submitted", {
            endpoint: bugReportEndpoint,
            page: getCurrentPageContext().page,
            hasScreenshot: !!screenshotData,
          });

          const response = await fetch(bugReportEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            logger.error("Bug report submission failed", {
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
              logger.warn("Bug report service unavailable, logging locally", {
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
              logger.warn("Bug report submission failed, logging locally", {
                ...reportData,
                screenshot: screenshotData ? "[Screenshot captured]" : null,
                sessionUrl: sessionUrl || "[No session replay URL available]",
              });
              reportData.localFallback = true;
              reportData.fallbackReason = `HTTP error: ${response.status} - ${errorText}`;
            }
          } else {
            const result = await response.json();
            logger.production("Bug report created successfully", {
              issueNumber: result.issueNumber,
              issueUrl: result.issueUrl,
              page: getCurrentPageContext().page,
            });

            // Store the issue URL for user feedback
            if (result.issueUrl) {
              reportData.issueUrl = result.issueUrl;
            }
          }
        } else {
          // Fallback: log the report data if no endpoint is configured
          logger.info("No bug report endpoint configured. Report data:", {
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
        logger.error("Error in bug report submission:", innerError);
        throw innerError; // Re-throw to be caught by the outer handler
      }
    };

    try {
      // Race between submission and timeout
      const result = await Promise.race([submissionPromise(), timeoutPromise]);
      return result;
    } catch (error) {
      logger.error("Failed to submit bug report:", error);

      // Even on timeout/error, log the report locally
      try {
        logger.warn("Bug report failed, logging locally", {
          description: description.trim(),
          screenshot: screenshot ? "[Screenshot available]" : null,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          error: error.message,
        });
      } catch (logError) {
        logger.error("Failed to log bug report locally:", logError);
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    // Simplified Highlight.io session management to avoid conflicts
    try {
      // Only check if we need to start a session, don't try to stop/restart existing ones
      if (typeof H.isRecording === "function") {
        // Modern SDK with isRecording method
        if (!H.isRecording()) {
          try {
            H.start();
            if (import.meta.env.MODE === "development") {
              logger.debug("Started new Highlight.io session for bug report");
            }
          } catch (startError) {
            // If start fails, session might already be active - that's fine
            if (import.meta.env.MODE === "development") {
              logger.debug(
                "Highlight.io start failed (session may already be active):",
                startError.message
              );
            }
          }
        } else {
          if (import.meta.env.MODE === "development") {
            logger.debug("Highlight.io session already active - using existing session");
          }
        }
      } else if (typeof H.start === "function") {
        // Older SDK - only try to start if no session management available
        try {
          // Check if H object has any indication of existing session
          if (typeof H.getSessionMetadata === "function" || typeof H.getSessionURL === "function") {
            // Session likely exists, don't try to start new one
            if (import.meta.env.MODE === "development") {
              logger.debug("Using existing Highlight.io session (no isRecording method available)");
            }
          } else {
            // No clear session indication, try to start
            H.start();
            if (import.meta.env.MODE === "development") {
              logger.debug("Started Highlight.io session (no session detection available)");
            }
          }
        } catch (error) {
          // Any error in starting is fine - session might already exist
          if (import.meta.env.MODE === "development") {
            logger.debug("Highlight.io start attempt ignored:", error.message);
          }
        }
      }
    } catch (error) {
      // Don't log session management errors as warnings - they're expected
      if (import.meta.env.MODE === "development") {
        logger.debug("Highlight.io session management info:", error.message);
      }
      // Don't block the bug report modal from opening due to Highlight issues
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
          logger.warn("Failed to open screenshot preview - popup may be blocked");
          // Could set screenshot to show inline preview instead
          setScreenshot(screenshotData);
        }
      } else {
        logger.warn("Screenshot capture failed during preview");
      }
    } catch (error) {
      logger.error("Error during screenshot preview:", error);
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
    setScreenshot,
    submitReport,
    captureScreenshot,
    previewScreenshot,
  };
};

export default useBugReport;
