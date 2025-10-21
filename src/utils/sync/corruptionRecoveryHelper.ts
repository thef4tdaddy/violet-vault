/**
 * Corruption Recovery Helper
 * Enhanced utilities for safely handling corruption recovery operations
 */
import { detectLocalData, hasLocalData } from "./dataDetectionHelper";
import logger from "../common/logger";

/**
 * Safe cloud data reset with comprehensive local data validation
 * Should be used instead of direct cloud reset operations
 */
export const safeCloudDataReset = async () => {
  try {
    logger.info("🚨 Starting safe cloud data reset procedure...");

    // Step 1: Comprehensive data detection
    logger.info("🔍 Step 1: Checking for local data...");
    const dataDetection = await detectLocalData();

    if (!dataDetection.hasData) {
      const errorMsg = `SAFETY ABORT: No local data found! Cannot clear cloud data as this would result in total data loss. Detection details: ${JSON.stringify(dataDetection.details)}`;
      logger.error(errorMsg);
      return {
        success: false,
        error: errorMsg,
        safetyAbort: true,
        detectionDetails: dataDetection,
      };
    }

    logger.info("✅ Local data confirmed:", {
      totalItems: dataDetection.totalItems,
      samplesFound: dataDetection.details.samplesFound,
    });

    // Step 2: Validate data is actually accessible
    logger.info("🔍 Step 2: Validating data accessibility...");
    const quickCheck = await hasLocalData();

    if (!quickCheck) {
      const errorMsg =
        "SAFETY ABORT: Quick data validation failed - data may be corrupted or inaccessible";
      logger.error(errorMsg);
      return {
        success: false,
        error: errorMsg,
        safetyAbort: true,
        detectionDetails: dataDetection,
      };
    }

    // Step 3: Proceed with cloud reset (this would be implemented by the calling function)
    logger.info("✅ Safety checks passed. Local data confirmed present and accessible.");

    return {
      success: true,
      message: "Safety validation passed - local data confirmed",
      localDataConfirmed: true,
      detectionDetails: dataDetection,
      readyForCloudReset: true,
    };
  } catch (error) {
    const errorMsg = `SAFETY ABORT: Data detection failed - ${error.message}`;
    logger.error(errorMsg, error);
    return {
      success: false,
      error: errorMsg,
      safetyAbort: true,
      exception: error.message,
    };
  }
};

/**
 * Expose enhanced corruption recovery to global scope for development
 */
if (typeof window !== "undefined") {
  // Enhanced version that provides better debugging
  window.safeCloudDataReset = safeCloudDataReset;

  // Also expose data detection for debugging
  window.detectLocalDataDebug = detectLocalData;
  window.hasLocalDataDebug = hasLocalData;

  logger.info("🔧 Enhanced corruption recovery tools exposed to window:", {
    functions: ["safeCloudDataReset", "detectLocalDataDebug", "hasLocalDataDebug"],
  });
}

export default { safeCloudDataReset };
