/**
 * Unified Bug Reporting Service
 * Combines all bug reporting services into a single interface
 * Addresses screenshot upload issues and provides comprehensive bug reporting
 * Created for Issue #513
 */
import { ScreenshotService } from './screenshotService.js';
import { SystemInfoService } from './systemInfoService.js';
import { BugReportAPIService } from './apiService.js';
import { ContextAnalysisService } from './contextAnalysisService.js';
import logger from '../../utils/common/logger.js';
import { APP_VERSION } from '../../utils/common/version.js';

export class BugReportService {
  /**
   * Submit a complete bug report with all data collection and submission
   * @param {Object} options - Bug report options
   * @param {string} options.title - Bug report title
   * @param {string} options.description - Bug description
   * @param {string} options.steps - Steps to reproduce
   * @param {string} options.expected - Expected behavior
   * @param {string} options.actual - Actual behavior
   * @param {boolean} options.includeScreenshot - Whether to include screenshot
   * @param {string} options.severity - Bug severity (low, medium, high, critical)
   * @param {Array} options.labels - Additional labels for the bug report
   * @param {Object} options.providers - Provider configurations for submission
   * @param {Object} options.customData - Additional custom data
   * @returns {Promise<Object>} Submission result
   */
  static async submitBugReport(options = {}) {
    try {
      logger.debug("Starting comprehensive bug report submission", {
        title: options.title,
        includeScreenshot: options.includeScreenshot,
      });

      // Step 1: Collect all data in parallel
      const dataCollection = await this.collectAllData(options);

      // Step 2: Prepare report data
      const reportData = this.prepareReportData(options, dataCollection);

      // Step 3: Validate report data
      const validation = BugReportAPIService.validateReportData(reportData);
      if (!validation.isValid) {
        throw new Error(`Invalid report data: ${validation.errors.join(', ')}`);
      }

      // Step 4: Submit with fallbacks
      const providers = this.getProviders(options.providers);
      const result = await this.submitWithProperScreenshotHandling(reportData, providers);

      logger.info("Bug report submitted successfully", {
        submissionId: result.submissionId,
        provider: result.primaryProvider || 'fallback',
        hasScreenshot: !!dataCollection.screenshot,
      });

      return {
        success: true,
        ...result,
        reportData: {
          title: reportData.title,
          hasScreenshot: !!dataCollection.screenshot,
          systemInfo: dataCollection.systemInfo,
        },
      };
    } catch (error) {
      logger.error("Bug report submission failed", error);
      
      // Fallback: Save locally
      try {
        await this.saveReportLocally(options, error);
      } catch (saveError) {
        logger.error("Failed to save report locally", saveError);
      }

      throw error;
    }
  }

  /**
   * Collect all data for bug report
   * @param {Object} options - Collection options
   * @returns {Promise<Object>} Collected data
   */
  static async collectAllData(options) {
    try {
      // Collect data in parallel for better performance
      const [screenshot, systemInfo, contextInfo] = await Promise.all([
        options.includeScreenshot ? this.captureScreenshotSafely() : Promise.resolve(null),
        SystemInfoService.collectSystemInfo(),
        ContextAnalysisService.getCurrentPageContext(),
      ]);

      return {
        screenshot,
        systemInfo,
        contextInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Data collection failed", error);
      
      // Return partial data on failure
      return {
        screenshot: null,
        systemInfo: SystemInfoService.getFallbackSystemInfo(),
        contextInfo: ContextAnalysisService.getFallbackContext(),
        timestamp: new Date().toISOString(),
        collectionError: error.message,
      };
    }
  }

  /**
   * Capture screenshot with proper error handling
   * @returns {Promise<string|null>} Screenshot data URL or null
   */
  static async captureScreenshotSafely() {
    try {
      const screenshot = await ScreenshotService.captureScreenshot();
      
      if (screenshot) {
        // Check screenshot size and warn if too large
        const info = ScreenshotService.getScreenshotInfo(screenshot);
        if (info.sizeKB > 1024) { // > 1MB
          logger.warn(`Large screenshot captured: ${info.sizeKB}KB`, info);
        }
        
        return screenshot;
      }
      
      return null;
    } catch (error) {
      logger.error("Screenshot capture failed", error);
      return null;
    }
  }

  /**
   * Prepare comprehensive report data
   * @param {Object} options - Original options
   * @param {Object} dataCollection - Collected data
   * @returns {Object} Prepared report data
   */
  static prepareReportData(options, dataCollection) {
    const reportData = {
      // Basic report information
      title: options.title || "Bug Report",
      description: options.description || "",
      steps: options.steps || "",
      expected: options.expected || "",
      actual: options.actual || "",
      
      // Severity and classification
      severity: options.severity || "medium",
      labels: [...(options.labels || []), "automated-report", "bug"],
      
      // Technical data
      screenshot: dataCollection.screenshot,
      systemInfo: dataCollection.systemInfo,
      contextInfo: dataCollection.contextInfo,
      
      // Application context
      appVersion: APP_VERSION,
      timestamp: dataCollection.timestamp,
      
      // Custom data
      customData: options.customData || {},
      
      // Report metadata
      reportSource: "violet-vault-bug-reporter",
      reportVersion: "2.0.0",
    };

    return BugReportAPIService.prepareReportData(reportData);
  }

  /**
   * Submit with proper screenshot handling to avoid upload issues
   * @param {Object} reportData - Report data
   * @param {Array} providers - Provider configurations
   * @returns {Promise<Object>} Submission result
   */
  static async submitWithProperScreenshotHandling(reportData, providers) {
    // If screenshot is too large for JSON payload, handle separately
    if (reportData.screenshot) {
      const screenshotInfo = ScreenshotService.getScreenshotInfo(reportData.screenshot);
      
      if (screenshotInfo.sizeKB > 500) { // > 500KB
        logger.info("Large screenshot detected, using alternative upload method", screenshotInfo);
        
        // For large screenshots, we'll:
        // 1. Submit the bug report without the screenshot first
        // 2. Upload the screenshot separately (if provider supports it)
        // 3. Link them together
        
        const reportWithoutScreenshot = { ...reportData };
        delete reportWithoutScreenshot.screenshot;
        reportWithoutScreenshot.screenshotNote = `Large screenshot (${screenshotInfo.sizeKB}KB) - will be uploaded separately`;
        
        const result = await BugReportAPIService.submitWithFallbacks(reportWithoutScreenshot, providers);
        
        // TODO: Implement separate screenshot upload if provider supports it
        // For now, just note that screenshot was too large
        result.screenshotStatus = {
          captured: true,
          size: screenshotInfo.sizeKB,
          uploaded: false,
          reason: "Screenshot too large for JSON payload - separate upload needed",
        };
        
        return result;
      }
    }

    // Normal submission for smaller screenshots
    return await BugReportAPIService.submitWithFallbacks(reportData, providers);
  }

  /**
   * Get default providers configuration
   * @param {Object} customProviders - Custom provider configuration
   * @returns {Array} Provider configurations
   */
  static getProviders(customProviders = {}) {
    const defaultProviders = [];
    
    // GitHub provider (if endpoint configured)
    const bugReportEndpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT;
    if (bugReportEndpoint) {
      defaultProviders.push({
        type: 'webhook',
        url: bugReportEndpoint,
        primary: true,
      });
    }

    // Add custom providers
    if (customProviders.github) {
      defaultProviders.push({
        type: 'github',
        config: customProviders.github,
        primary: !defaultProviders.some(p => p.primary),
      });
    }

    if (customProviders.email) {
      defaultProviders.push({
        type: 'email',
        config: customProviders.email,
        primary: !defaultProviders.some(p => p.primary),
      });
    }

    if (customProviders.webhook) {
      defaultProviders.push({
        type: 'webhook',
        url: customProviders.webhook.url,
        primary: !defaultProviders.some(p => p.primary),
      });
    }

    return defaultProviders;
  }

  /**
   * Save report locally as fallback
   * @param {Object} options - Original options
   * @param {Error} error - The error that caused fallback
   */
  static async saveReportLocally(options, error) {
    try {
      const fallbackData = {
        title: options.title,
        description: options.description,
        timestamp: new Date().toISOString(),
        error: error.message,
        url: window.location.href,
        userAgent: navigator.userAgent,
        appVersion: APP_VERSION,
      };

      // Save to localStorage as last resort
      const existingReports = JSON.parse(localStorage.getItem('violet-vault-bug-reports') || '[]');
      existingReports.push(fallbackData);
      
      // Keep only last 10 reports
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10);
      }
      
      localStorage.setItem('violet-vault-bug-reports', JSON.stringify(existingReports));
      
      logger.info("Bug report saved locally as fallback", {
        reportCount: existingReports.length,
        title: options.title,
      });
    } catch (saveError) {
      logger.error("Failed to save bug report locally", saveError);
    }
  }

  /**
   * Get locally saved reports
   * @returns {Array} Saved reports
   */
  static getLocalReports() {
    try {
      return JSON.parse(localStorage.getItem('violet-vault-bug-reports') || '[]');
    } catch (error) {
      logger.error("Failed to retrieve local reports", error);
      return [];
    }
  }

  /**
   * Clear locally saved reports
   */
  static clearLocalReports() {
    try {
      localStorage.removeItem('violet-vault-bug-reports');
      logger.info("Local bug reports cleared");
    } catch (error) {
      logger.error("Failed to clear local reports", error);
    }
  }

  /**
   * Quick bug report submission with minimal options
   * @param {string} description - Bug description
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Submission result
   */
  static async quickReport(description, options = {}) {
    return this.submitBugReport({
      title: "Quick Bug Report",
      description,
      includeScreenshot: true,
      severity: "medium",
      ...options,
    });
  }

  /**
   * Test screenshot capture functionality
   * @returns {Promise<Object>} Test result
   */
  static async testScreenshot() {
    try {
      const screenshot = await ScreenshotService.captureScreenshot();
      const info = screenshot ? ScreenshotService.getScreenshotInfo(screenshot) : null;
      
      return {
        success: !!screenshot,
        screenshot: !!screenshot,
        info,
        methods: {
          displayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
          html2canvas: true, // Dynamically imported
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test system information collection
   * @returns {Promise<Object>} Test result
   */
  static async testSystemInfo() {
    try {
      const systemInfo = await SystemInfoService.collectSystemInfo();
      
      return {
        success: true,
        systemInfo: {
          browser: !!systemInfo.browser,
          viewport: !!systemInfo.viewport,
          performance: !!systemInfo.performance,
          storage: !!systemInfo.storage,
          network: !!systemInfo.network,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test context analysis
   * @returns {Promise<Object>} Test result
   */
  static async testContextAnalysis() {
    try {
      const context = ContextAnalysisService.getCurrentPageContext();
      
      return {
        success: true,
        context: {
          page: context.page,
          route: !!context.route,
          ui: !!context.ui,
          data: !!context.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run comprehensive diagnostics
   * @returns {Promise<Object>} Diagnostic results
   */
  static async runDiagnostics() {
    try {
      const [screenshot, systemInfo, contextAnalysis] = await Promise.all([
        this.testScreenshot(),
        this.testSystemInfo(),
        this.testContextAnalysis(),
      ]);

      const overallSuccess = screenshot.success && systemInfo.success && contextAnalysis.success;

      return {
        success: overallSuccess,
        components: {
          screenshot,
          systemInfo,
          contextAnalysis,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export individual services for direct use if needed
export { ScreenshotService, SystemInfoService, BugReportAPIService, ContextAnalysisService };

// Export default as the unified service
export default BugReportService;