/**
 * Bug Report Hook Compatibility Layer
 * Provides backward compatibility with the original useBugReport.js interface
 * Maps old API to new useBugReportV2 implementation
 * Created for Issue #513 to ensure zero regressions
 */
import useBugReportV2 from './useBugReportV2.js';
import logger from '../../utils/common/logger.js';

/**
 * Compatibility wrapper that maintains the exact same API as the original useBugReport
 * @param {Object} options - Hook options
 * @returns {Object} Original useBugReport API interface
 */
const useBugReportCompat = (options = {}) => {
  const v2Hook = useBugReportV2(options);

  // Create compatibility layer that maps old API to new implementation
  return {
    // State - exact same names and meanings
    isModalOpen: v2Hook.isModalOpen,
    description: v2Hook.description,
    includeScreenshot: v2Hook.includeScreenshot,
    isSubmitting: v2Hook.isSubmitting,
    screenshot: v2Hook.screenshot,

    // Actions - exact same function signatures
    openModal: v2Hook.openModal,
    closeModal: v2Hook.closeModal,
    setDescription: v2Hook.setDescription,
    setIncludeScreenshot: v2Hook.setIncludeScreenshot,
    setScreenshot: v2Hook.setScreenshot,
    
    /**
     * Submit report - maintains original interface
     * @returns {Promise<boolean|Object>} Success boolean or report data
     */
    submitReport: async () => {
      try {
        const success = await v2Hook.submitReport();
        
        // Original hook returned the report data on success, boolean on failure
        if (success && v2Hook.submitResult) {
          return v2Hook.submitResult;
        }
        
        return success;
      } catch (error) {
        logger.error("Compatibility layer: submitReport failed", error);
        return false;
      }
    },

    /**
     * Capture screenshot - maintains original interface
     * @returns {Promise<string|null>} Screenshot data URL
     */
    captureScreenshot: async () => {
      try {
        return await v2Hook.captureScreenshot();
      } catch (error) {
        logger.error("Compatibility layer: captureScreenshot failed", error);
        return null;
      }
    },

    /**
     * Preview screenshot - maintains original interface
     * @returns {Promise<void>}
     */
    previewScreenshot: async () => {
      try {
        await v2Hook.showScreenshotPreview();
      } catch (error) {
        logger.error("Compatibility layer: previewScreenshot failed", error);
      }
    },

    // Additional properties that may be accessed (for backward compatibility)
    get formCompletion() {
      return v2Hook.formCompletion;
    },

    get canSubmit() {
      return v2Hook.canSubmit;
    },

    get hasScreenshot() {
      return v2Hook.hasScreenshot;
    },

    // Internal state that might be accessed
    get submitError() {
      return v2Hook.submitError;
    },

    get submitResult() {
      return v2Hook.submitResult;
    },

    // Enhanced V2 features (optional, won't break existing code)
    v2: {
      // Provide access to all V2 features for gradual migration
      ...v2Hook,
      
      // Migration helpers
      isUsingV2: true,
      version: '2.0.0',
      
      // Quick migration methods
      setTitle: v2Hook.setTitle,
      setSteps: v2Hook.setSteps,
      setExpected: v2Hook.setExpected,
      setActual: v2Hook.setActual,
      setSeverity: v2Hook.setSeverity,
      runDiagnostics: v2Hook.runDiagnostics,
      quickReport: v2Hook.quickReport,
    },
  };
};

export default useBugReportCompat;