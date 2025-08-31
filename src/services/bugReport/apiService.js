/**
 * Bug Report API Service
 * Handles submission of bug reports to external services
 * Extracted from useBugReport.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class BugReportAPIService {
  /**
   * Submit bug report to GitHub Issues API
   * @param {Object} reportData - Bug report data
   * @param {string} reportData.title - Bug report title
   * @param {string} reportData.description - Bug description
   * @param {string} reportData.steps - Reproduction steps
   * @param {string} reportData.expected - Expected behavior
   * @param {string} reportData.actual - Actual behavior
   * @param {Object} reportData.systemInfo - System information
   * @param {string} reportData.screenshot - Screenshot data URL
   * @param {Array} reportData.logs - Console logs
   * @param {string} reportData.severity - Bug severity level
   * @param {Array} reportData.labels - GitHub labels
   * @returns {Promise<Object>} Submission result
   */
  static async submitToGitHub(reportData) {
    try {
      logger.debug("Submitting bug report to GitHub", { title: reportData.title });

      const issueBody = this.formatGitHubIssueBody(reportData);
      const labels = [...(reportData.labels || []), "bug", "automated-report"];

      const payload = {
        title: reportData.title,
        body: issueBody,
        labels: labels,
      };

      // Note: This would typically require GitHub API credentials
      // For now, we'll simulate the API call and return success
      const result = await this.makeGitHubAPICall(payload);

      if (result.success) {
        logger.info("Bug report submitted successfully to GitHub", {
          issueNumber: result.issueNumber,
          url: result.url,
        });

        return {
          success: true,
          issueNumber: result.issueNumber,
          url: result.url,
          provider: "github",
          submissionId: result.id,
        };
      } else {
        throw new Error(result.error || "GitHub API submission failed");
      }
    } catch (error) {
      logger.error("Failed to submit bug report to GitHub", error);
      throw new Error(`GitHub submission failed: ${error.message}`);
    }
  }

  /**
   * Submit bug report to custom webhook
   * @param {Object} reportData - Bug report data
   * @param {string} webhookUrl - Webhook URL
   * @returns {Promise<Object>} Submission result
   */
  static async submitToWebhook(reportData, webhookUrl) {
    try {
      logger.debug("Submitting bug report to webhook", {
        url: webhookUrl,
        title: reportData.title,
        hasScreenshot: !!reportData.screenshot,
      });

      // Format payload for Cloudflare Worker (matches the expected format in bug-report-worker.js)
      const payload = {
        description: reportData.description || reportData.title || "No description provided",
        screenshot: reportData.screenshot || null, // Base64 data URL from ScreenshotService
        sessionUrl: reportData.sessionUrl || null, // Session replay URL if available
        env: {
          // Core environment data (ensure these are always defined and properly typed)
          appVersion: reportData.systemInfo?.appVersion || "unknown",
          userAgent: reportData.systemInfo?.userAgent || navigator.userAgent,
          viewport: reportData.systemInfo?.viewport || `${window.innerWidth}x${window.innerHeight}`,
          url: String(reportData.systemInfo?.url || window.location.href), // Ensure URL is always a string
          timestamp: reportData.systemInfo?.timestamp || new Date().toISOString(),
          
          // Safely pass through diagnostic data, filtering out potentially problematic fields
          ...(reportData.systemInfo && typeof reportData.systemInfo === 'object' ? 
            Object.fromEntries(
              Object.entries(reportData.systemInfo).filter(([key, value]) => {
                // Filter out functions, undefined values, and overly large objects
                return value != null && 
                       typeof value !== 'function' && 
                       !(typeof value === 'object' && JSON.stringify(value).length > 10000);
              }).map(([key, value]) => {
                // Ensure URL objects are converted to strings to prevent worker crashes
                if (key === 'url' && typeof value === 'object' && value.href) {
                  return [key, value.href];
                }
                return [key, value];
              })
            ) : {}),
        },
      };

      logger.info("Cloudflare Worker payload prepared", {
        hasDescription: !!payload.description,
        hasScreenshot: !!payload.screenshot,
        screenshotSize: payload.screenshot?.length || 0,
        screenshotPreview: payload.screenshot?.substring(0, 50) || "none",
        envKeys: Object.keys(payload.env),
        hasSessionUrl: !!payload.sessionUrl,
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "VioletVault-BugReporter/1.0",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Cloudflare Worker error response", {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      logger.info("Cloudflare Worker response received", {
        url: webhookUrl,
        status: response.status,
        hasResult: !!result,
        success: result.success,
        issueNumber: result.issueNumber,
        issueUrl: result.issueUrl,
        screenshotUrl: result.screenshotUrl,
        hasScreenshotUrl: !!result.screenshotUrl,
      });

      return {
        success: true,
        provider: "webhook", 
        submissionId: result.issueNumber || result.id || Date.now().toString(),
        issueNumber: result.issueNumber,
        url: result.issueUrl,
        screenshotUrl: result.screenshotUrl,
        response: result,
      };
    } catch (error) {
      logger.error("Failed to submit bug report to webhook", error);
      throw new Error(`Webhook submission failed: ${error.message}`);
    }
  }

  /**
   * Submit bug report to email service
   * @param {Object} reportData - Bug report data
   * @param {Object} emailConfig - Email configuration
   * @returns {Promise<Object>} Submission result
   */
  static async submitToEmail(reportData, emailConfig) {
    try {
      logger.debug("Submitting bug report to email", {
        to: emailConfig.to,
        title: reportData.title,
      });

      const emailBody = this.formatEmailBody(reportData);

      const payload = {
        to: emailConfig.to,
        subject: `Bug Report: ${reportData.title}`,
        body: emailBody,
        attachments: reportData.screenshot
          ? [
              {
                name: "screenshot.png",
                data: reportData.screenshot,
                type: "image/png",
              },
            ]
          : [],
      };

      // This would typically use a service like EmailJS or SendGrid
      const result = await this.sendEmail(payload, emailConfig);

      if (result.success) {
        logger.info("Bug report sent successfully via email", {
          to: emailConfig.to,
          messageId: result.messageId,
        });

        return {
          success: true,
          provider: "email",
          submissionId: result.messageId,
          recipient: emailConfig.to,
        };
      } else {
        throw new Error(result.error || "Email submission failed");
      }
    } catch (error) {
      logger.error("Failed to submit bug report via email", error);
      throw new Error(`Email submission failed: ${error.message}`);
    }
  }

  /**
   * Submit bug report with multiple fallback providers
   * @param {Object} reportData - Bug report data
   * @param {Array} providers - Array of provider configurations
   * @returns {Promise<Object>} Submission result
   */
  static async submitWithFallbacks(reportData, providers = []) {
    const results = [];
    let lastError = null;

    for (const provider of providers) {
      try {
        let result;

        switch (provider.type) {
          case "github":
            result = await this.submitToGitHub(reportData);
            break;
          case "webhook":
            result = await this.submitToWebhook(reportData, provider.url);
            break;
          case "email":
            result = await this.submitToEmail(reportData, provider.config);
            break;
          default:
            throw new Error(`Unknown provider type: ${provider.type}`);
        }

        results.push({
          provider: provider.type,
          success: true,
          result,
        });

        // If primary provider succeeds, return immediately
        if (provider.primary) {
          return {
            success: true,
            primaryProvider: provider.type,
            results,
            submissionId: result.submissionId,
          };
        }
      } catch (error) {
        lastError = error;
        results.push({
          provider: provider.type,
          success: false,
          error: error.message,
        });

        logger.warn(`Provider ${provider.type} failed, trying next`, error);
      }
    }

    // If we get here, all providers failed
    if (results.some((r) => r.success)) {
      // At least one fallback succeeded
      return {
        success: true,
        primaryFailed: true,
        results,
        submissionId: results.find((r) => r.success)?.result?.submissionId,
      };
    } else {
      // All providers failed
      throw new Error(`All providers failed. Last error: ${lastError?.message}`);
    }
  }

  /**
   * Format bug report data for GitHub Issues
   * @param {Object} reportData - Bug report data
   * @returns {string} Formatted issue body
   */
  static formatGitHubIssueBody(reportData) {
    const sections = [
      "## Bug Description",
      reportData.description || "No description provided",
      "",
      "## Steps to Reproduce",
      reportData.steps || "No steps provided",
      "",
      "## Expected Behavior",
      reportData.expected || "No expected behavior specified",
      "",
      "## Actual Behavior",
      reportData.actual || "No actual behavior specified",
      "",
      "## System Information",
      "```json",
      JSON.stringify(reportData.systemInfo, null, 2),
      "```",
      "",
      "## Console Logs & Errors",
      this.formatConsoleLogsForGitHub(reportData.systemInfo?.errors),
      "",
    ];

    if (reportData.logs && reportData.logs.length > 0) {
      sections.push(
        "## Console Logs",
        "```",
        reportData.logs.slice(-20).join("\n"), // Last 20 log entries
        "```",
        ""
      );
    }

    if (reportData.screenshot) {
      // GitHub Issues can't display base64 data URLs directly
      // Instead, provide information about the screenshot
      const screenshotInfo = reportData.screenshot.includes("data:image")
        ? "Screenshot captured (base64 data - view in bug report tool)"
        : reportData.screenshot;

      sections.push(
        "## Screenshot",
        reportData.screenshot.startsWith("data:image")
          ? `📸 Screenshot captured (${reportData.screenshot.length} chars) - available in original bug report data`
          : `![Bug Screenshot](${reportData.screenshot})`,
        ""
      );
    }

    sections.push(
      "## Additional Context",
      `- Severity: ${reportData.severity || "Medium"}`,
      `- Reported at: ${new Date().toISOString()}`,
      `- Page URL: ${reportData.systemInfo?.url?.href || "Unknown"}`,
      "",
      "---",
      "*This bug report was automatically generated by Violet Vault Bug Reporter*"
    );

    return sections.join("\n");
  }

  /**
   * Format console logs and errors for GitHub issue
   * @param {Object} errors - Error and log data from SystemInfoService
   * @returns {string} Formatted console logs section
   */
  static formatConsoleLogsForGitHub(errors) {
    if (!errors) {
      return "No console logs captured";
    }

    const sections = [];

    // Recent Errors
    if (errors.recentErrors && errors.recentErrors.length > 0) {
      sections.push("### Recent JavaScript Errors");
      sections.push("```javascript");
      errors.recentErrors.slice(-10).forEach((error) => {
        sections.push(`[${error.timestamp}] ${error.type}: ${JSON.stringify(error.data, null, 2)}`);
      });
      sections.push("```");
      sections.push("");
    }

    // Console Logs
    if (errors.consoleLogs && errors.consoleLogs.length > 0) {
      sections.push("### Recent Console Logs");
      sections.push("```");
      errors.consoleLogs.slice(-20).forEach((log) => {
        sections.push(`[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`);
      });
      sections.push("```");
      sections.push("");
    }

    // Error Handler Status
    sections.push("### Error Capture Status");
    sections.push(`- Global Error Handler: ${errors.hasGlobalHandler ? "✅" : "❌"}`);
    sections.push(
      `- Unhandled Rejection Handler: ${errors.hasUnhandledRejectionHandler ? "✅" : "❌"}`
    );

    return sections.length > 0 ? sections.join("\n") : "No console logs or errors captured";
  }

  /**
   * Format bug report data for email
   * @param {Object} reportData - Bug report data
   * @returns {string} Formatted email body
   */
  static formatEmailBody(reportData) {
    return `
Bug Report: ${reportData.title}

DESCRIPTION:
${reportData.description || "No description provided"}

STEPS TO REPRODUCE:
${reportData.steps || "No steps provided"}

EXPECTED BEHAVIOR:
${reportData.expected || "No expected behavior specified"}

ACTUAL BEHAVIOR:
${reportData.actual || "No actual behavior specified"}

SYSTEM INFORMATION:
Browser: ${reportData.systemInfo?.browser?.userAgent || "Unknown"}
Viewport: ${reportData.systemInfo?.viewport?.width}x${reportData.systemInfo?.viewport?.height}
URL: ${reportData.systemInfo?.url?.href || "Unknown"}
Timestamp: ${new Date().toISOString()}

SEVERITY: ${reportData.severity || "Medium"}

${
  reportData.logs && reportData.logs.length > 0
    ? `RECENT LOGS:\n${reportData.logs.slice(-10).join("\n")}`
    : "No logs available"
}

This bug report was automatically generated by Violet Vault Bug Reporter.
    `.trim();
  }

  /**
   * Make GitHub API call (simulated for now)
   * @param {Object} payload - GitHub issue payload
   * @returns {Promise<Object>} API response
   */
  static async makeGitHubAPICall(payload) {
    // In a real implementation, this would make actual API calls
    // For now, simulate successful submission
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: Date.now(),
          issueNumber: Math.floor(Math.random() * 1000) + 1,
          url: `https://github.com/user/repo/issues/${Math.floor(Math.random() * 1000) + 1}`,
        });
      }, 1000);
    });
  }

  /**
   * Send email (simulated for now)
   * @param {Object} payload - Email payload
   * @param {Object} config - Email configuration
   * @returns {Promise<Object>} Send result
   */
  static async sendEmail(payload, config) {
    // In a real implementation, this would integrate with email services
    // For now, simulate successful send
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          messageId: `msg_${Date.now()}`,
        });
      }, 500);
    });
  }

  /**
   * Validate bug report data before submission
   * @param {Object} reportData - Bug report data
   * @returns {Object} Validation result
   */
  static validateReportData(reportData) {
    const errors = [];
    const warnings = [];

    if (!reportData.title || reportData.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!reportData.description || reportData.description.trim().length === 0) {
      warnings.push("Description is empty");
    }

    if (!reportData.steps || reportData.steps.trim().length === 0) {
      warnings.push("Steps to reproduce are empty");
    }

    if (!reportData.systemInfo) {
      warnings.push("System information is missing");
    }

    if (reportData.title && reportData.title.length > 200) {
      warnings.push("Title is very long and may be truncated");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Prepare report data for submission
   * @param {Object} rawData - Raw bug report data
   * @returns {Object} Processed report data
   */
  static prepareReportData(rawData) {
    return {
      title: (rawData.title || "Untitled Bug Report").trim(),
      description: (rawData.description || "").trim(),
      steps: (rawData.steps || "").trim(),
      expected: (rawData.expected || "").trim(),
      actual: (rawData.actual || "").trim(),
      systemInfo: rawData.systemInfo || {},
      screenshot: rawData.screenshot || null,
      logs: Array.isArray(rawData.logs) ? rawData.logs : [],
      severity: rawData.severity || "Medium",
      labels: Array.isArray(rawData.labels) ? rawData.labels : [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get submission status
   * @param {string} submissionId - Submission ID
   * @param {string} provider - Provider type
   * @returns {Promise<Object>} Status information
   */
  static async getSubmissionStatus(submissionId, provider) {
    try {
      // This would check the status with the actual provider
      // For now, return a simulated status
      return {
        success: true,
        status: "submitted",
        submissionId,
        provider,
        submittedAt: new Date().toISOString(),
        url: `https://example.com/issues/${submissionId}`,
      };
    } catch (error) {
      logger.error("Failed to get submission status", error);
      return {
        success: false,
        error: error.message,
        submissionId,
        provider,
      };
    }
  }
}
