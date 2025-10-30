/**
 * Report Submission Service
 * Handles fallback strategies and multiple submission providers
 * Extracted from apiService.js for Issue #513
 */
import logger from "../../utils/common/logger";
import { GitHubAPIService } from "./githubApiService";

export class ReportSubmissionService {
  /**
   * Submit bug report with fallback providers
   * @param {Object} reportData - Bug report data
   * @param {Array} providers - Array of provider configurations
   * @returns {Promise<Object>} Submission result
   */
  static async submitWithFallbacks(reportData, providers = []) {
    // Default providers if none specified
    const defaultProviders = [
      { type: "github", priority: 1 },
      { type: "webhook", priority: 2, url: process.env.WEBHOOK_URL },
      { type: "console", priority: 3 }, // Last resort - just log it
    ];

    const providersToTry = providers.length > 0 ? providers : defaultProviders;
    const results = [];
    let successfulSubmission = null;

    // Sort by priority
    const sortedProviders = [...providersToTry].sort((a, b) => a.priority - b.priority);

    logger.info("Attempting bug report submission with fallbacks", {
      providersCount: sortedProviders.length,
      providers: sortedProviders.map((p) => p.type),
    });

    for (const provider of sortedProviders) {
      try {
        logger.debug(`Attempting submission with ${provider.type}`, provider);

        let result;
        switch (provider.type) {
          case "github":
            result = await GitHubAPIService.submitToGitHub(reportData);
            break;
          case "webhook":
            result = await this.submitToWebhook(reportData, provider.url);
            break;
          case "email":
            result = await this.submitToEmail(reportData, provider.config);
            break;
          case "console":
            result = await this.submitToConsole(reportData);
            break;
          default:
            result = {
              success: false,
              error: `Unknown provider type: ${provider.type}`,
              provider: provider.type,
            };
        }

        results.push({
          provider: provider.type,
          ...result,
          attemptedAt: new Date().toISOString(),
        });

        if (result.success && !successfulSubmission) {
          successfulSubmission = result;
          logger.info(`Bug report submitted successfully via ${provider.type}`, result);

          // Continue with remaining providers for redundancy if configured
          if (!provider.redundant) {
            break;
          }
        }
      } catch (error) {
        const errorResult = {
          provider: provider.type,
          success: false,
          error: error.message,
          attemptedAt: new Date().toISOString(),
        };

        results.push(errorResult);
        logger.warn(`Submission failed for ${provider.type}`, errorResult);
      }
    }

    const finalResult = {
      success: !!successfulSubmission,
      overallSuccess: !!successfulSubmission,
      successfulProvider: successfulSubmission?.provider || null,
      attempts: results.length,
      results,
      summary: {
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    };

    if (successfulSubmission) {
      logger.info("Bug report submission completed successfully", finalResult);
    } else {
      logger.error("All bug report submission attempts failed", finalResult);
    }

    return finalResult;
  }

  /**
   * Submit bug report to webhook
   * @param {Object} reportData - Bug report data
   * @param {string} webhookUrl - Webhook URL
   * @returns {Promise<Object>} Submission result
   */
  static async submitToWebhook(reportData, webhookUrl) {
    try {
      if (!webhookUrl) {
        return {
          success: false,
          error: "Webhook URL not provided",
          provider: "webhook",
        };
      }

      logger.debug("Submitting bug report to webhook", { url: webhookUrl });

      const payload = {
        type: "bug_report",
        timestamp: new Date().toISOString(),
        data: reportData,
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));

        return {
          success: true,
          response: responseData,
          status: response.status,
          provider: "webhook",
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          provider: "webhook",
        };
      }
    } catch (error) {
      logger.error("Webhook submission error", error);
      return {
        success: false,
        error: error.message,
        provider: "webhook",
      };
    }
  }

  /**
   * Submit bug report to email (placeholder)
   * @param {Object} _reportData - Bug report data
   * @param {Object} emailConfig - Email configuration
   * @returns {Promise<Object>} Submission result
   */
  static async submitToEmail(_reportData, emailConfig) {
    try {
      logger.debug("Email submission requested", emailConfig);

      // This is a placeholder - actual email integration would require
      // email service setup (SendGrid, AWS SES, etc.)

      return {
        success: false,
        error: "Email submission not yet implemented",
        provider: "email",
        note: "Email integration requires additional setup",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "email",
      };
    }
  }

  /**
   * Submit bug report to console (fallback)
   * @param {Object} reportData - Bug report data
   * @returns {Promise<Object>} Submission result
   */
  static async submitToConsole(reportData) {
    try {
      logger.info("📋 BUG REPORT SUBMISSION (Console Fallback)", {
        title: reportData.title,
        description: reportData.description,
        systemInfo: reportData.systemInfo,
        timestamp: new Date().toISOString(),
      });

      // Also try to store in localStorage for developer access
      try {
        const existingReports = JSON.parse(localStorage.getItem("bugReports") || "[]");
        existingReports.push({
          ...reportData,
          submittedAt: new Date().toISOString(),
          id: Date.now(),
        });

        // Keep only last 10 reports
        const recentReports = existingReports.slice(-10);
        localStorage.setItem("bugReports", JSON.stringify(recentReports));

        logger.debug("Bug report stored in localStorage", {
          totalReports: recentReports.length,
        });
      } catch (storageError) {
        logger.warn("Could not store bug report in localStorage", storageError);
      }

      return {
        success: true,
        note: "Bug report logged to console and localStorage",
        provider: "console",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "console",
      };
    }
  }

  /**
   * Get submission statistics
   * @returns {Object} Submission statistics
   */
  static getSubmissionStats() {
    try {
      const storedReports = JSON.parse(localStorage.getItem("bugReports") || "[]");

      return {
        totalReports: storedReports.length,
        recentReports: storedReports.filter((r) => {
          const reportTime = new Date(r.submittedAt).getTime();
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          return reportTime > oneDayAgo;
        }).length,
        oldestReport: storedReports[0]?.submittedAt || null,
        newestReport: storedReports[storedReports.length - 1]?.submittedAt || null,
      };
    } catch (error) {
      logger.debug("Error getting submission stats", error);
      return {
        totalReports: 0,
        recentReports: 0,
        oldestReport: null,
        newestReport: null,
        error: error.message,
      };
    }
  }

  /**
   * Clear stored bug reports
   */
  static clearStoredReports() {
    try {
      localStorage.removeItem("bugReports");
      logger.info("Stored bug reports cleared");
      return { success: true };
    } catch (error) {
      logger.error("Error clearing stored reports", error);
      return { success: false, error: error.message };
    }
  }
}
