import { useState } from "react";
import { ScreenshotService } from "../../services/bugReport/screenshotService";
import logger from "../../utils/common/logger";

/**
 * Hook for screenshot capture operations
 * Extracted from useBugReport.js for better maintainability
 */
export const useBugReportScreenshot = () => {
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
        logger.warn(
          "ScreenshotService returned null, screenshot capture failed",
        );
        return null;
      }
    } catch (error) {
      logger.error("Screenshot capture failed completely", error);
      return null;
    }
  };

  return {
    screenshot,
    setScreenshot,
    captureScreenshot,
  };
};
