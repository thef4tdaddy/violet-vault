import { useState } from "react";
import BugReportService from "../../../services/logging/bugReportingService.ts";
import logger from "../../../utils/common/logger.ts";

/**
 * Screenshot state for bug reports V2
 */
interface BugReportScreenshotState {
  screenshot: string | null;
  previewScreenshot: string | null;
}

/**
 * Screenshot actions for bug reports V2
 */
interface BugReportScreenshotActions {
  setScreenshot: (screenshot: string | null) => void;
  captureScreenshot: () => Promise<string | null>;
  showScreenshotPreview: () => Promise<void>;
}

/**
 * Hook for managing bug report screenshots (V2)
 * Includes preview functionality and enhanced error handling
 * Extracted from useBugReportV2.ts to reduce complexity
 */
export const useBugReportScreenshotV2 = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  /**
   * Capture screenshot using service layer
   */
  const captureScreenshot = async (): Promise<string | null> => {
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
   * Get screenshot data, capturing if needed
   */
  const getScreenshotData = async (): Promise<string | null> => {
    let screenshotData = screenshot;
    if (!screenshotData) {
      screenshotData = await captureScreenshot();
    }
    return screenshotData;
  };

  /**
   * Style the preview window body
   */
  const stylePreviewWindow = (body: HTMLElement): void => {
    body.style.margin = "0";
    body.style.background = "#f5f5f5";
    body.style.display = "flex";
    body.style.justifyContent = "center";
    body.style.alignItems = "center";
    body.style.minHeight = "100vh";
  };

  /**
   * Create and style the image container
   */
  const createImageContainer = (screenshotData: string): HTMLElement => {
    const container = document.createElement("div");
    container.style.maxWidth = "95%";
    container.style.maxHeight = "95%";
    container.style.overflow = "auto";

    const img = document.createElement("img");
    img.src = screenshotData;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.border = "1px solid #ddd";
    img.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

    container.appendChild(img);
    return container;
  };

  /**
   * Preview screenshot in new window
   */
  const showScreenshotPreview = async (): Promise<void> => {
    try {
      const screenshotData = await getScreenshotData();

      if (screenshotData) {
        const win = window.open();
        if (win) {
          win.document.title = "Bug Report Screenshot Preview";
          stylePreviewWindow(win.document.body);

          const container = createImageContainer(screenshotData);
          win.document.body.appendChild(container);
        } else {
          logger.warn("Failed to open screenshot preview - popup may be blocked");
          setPreviewScreenshot(screenshotData);
        }
      }
    } catch (error) {
      logger.error("Error showing screenshot preview", error);
    }
  };

  const state: BugReportScreenshotState = {
    screenshot,
    previewScreenshot,
  };

  const actions: BugReportScreenshotActions = {
    setScreenshot,
    captureScreenshot,
    showScreenshotPreview,
  };

  return {
    ...state,
    ...actions,
    hasScreenshot: !!screenshot,
  };
};
