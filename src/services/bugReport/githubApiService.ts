/**
 * GitHub API Service
 * Handles GitHub Issues integration for bug reports
 * Extracted from apiService.js for Issue #513
 */
import logger from "../../utils/common/logger";

/**
 * GitHub API success response
 */
interface GitHubAPISuccessResponse {
  success: true;
  issueNumber: number;
  url: string;
}

/**
 * GitHub API error response
 */
interface GitHubAPIErrorResponse {
  success: false;
  error: string;
}

/**
 * GitHub API response union type
 */
type GitHubAPIResponse = GitHubAPISuccessResponse | GitHubAPIErrorResponse;

/**
 * Bug report data interface
 */
interface BugReportData {
  title: string;
  description?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  labels?: string[];
  severity?: string;
  screenshot?: string;
  sessionUrl?: string;
  logs?: string[];
  systemInfo?: {
    appVersion?: string;
    browser?: { name: string; version: string };
    viewport?: { width: number; height: number };
    userAgent?: string;
    performance?: { memory?: { usedJSHeapSize: number } };
    timestamp?: string;
    errors?: {
      recentErrors?: Array<{
        type?: string;
        message?: string;
        stack?: string;
        filename?: string;
        lineno?: number;
        timestamp?: string;
      }>;
      consoleLogs?: Array<{
        level: string;
        message: string;
        timestamp: number;
      }>;
    };
  };
  contextInfo?: {
    url?: string;
    userLocation?: string;
  };
}

/**
 * Validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  provider: string;
}

export class GitHubAPIService {
  /**
   * Submit bug report to GitHub Issues API
   * @param {Object} reportData - Bug report data
   * @returns {Promise<Object>} Submission result
   */
  static async submitToGitHub(reportData: BugReportData): Promise<{
    success: boolean;
    issueNumber?: number;
    url?: string;
    error?: string;
    provider: string;
  }> {
    try {
      logger.debug("Submitting bug report to GitHub", {
        title: reportData.title,
      });

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
        };
      } else {
        logger.error("GitHub bug report submission failed", result);
        return {
          success: false,
          error: (result as GitHubAPIErrorResponse).error,
          provider: "github",
        };
      }
    } catch (error) {
      logger.error("GitHub API submission error", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        provider: "github",
      };
    }
  }

  /**
   * Format bug report data into GitHub issue body
   * @param {Object} reportData - Bug report data
   * @returns {string} Formatted issue body
   */
  static formatGitHubIssueBody(reportData: BugReportData): string {
    // Check if description contains multiple steps/todos for checklist formatting
    const description = reportData.description || "No description provided";
    const formattedDescription = this.formatDescriptionWithChecklists(description);

    const sections = [
      "## Bug Description",
      formattedDescription,
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
    ];

    // Add user location context if available
    if (reportData.contextInfo?.userLocation) {
      sections.push(
        "## 📍 User Location",
        `**URL:** ${reportData.contextInfo.url || window.location.href}`,
        `**Page Context:** ${reportData.contextInfo.userLocation}`,
        ""
      );
    }

    // Add environment info
    if (reportData.systemInfo) {
      sections.push("## Environment", this.formatEnvironmentInfo(reportData.systemInfo), "");
    }

    // Add console logs with better formatting
    sections.push(
      "## Console Logs & Errors",
      this.formatConsoleLogsForGitHub(reportData.systemInfo?.errors),
      ""
    );

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

      sections.push(
        "## Screenshot",
        reportData.screenshot.startsWith("data:image")
          ? `📸 Screenshot captured (${reportData.screenshot.length} chars) - available in original bug report data`
          : `![Bug Screenshot](${reportData.screenshot})`,
        ""
      );
    }

    if (reportData.sessionUrl) {
      sections.push(
        "## Session Replay",
        `[View Session Recording](${reportData.sessionUrl})`,
        "",
        "**Note:** Session replay may contain sensitive information. Review before sharing.",
        ""
      );
    }

    sections.push(
      "---",
      `**Severity:** ${reportData.severity || "Medium"}`,
      `**Reporter:** Automated Bug Reporter`,
      `**Timestamp:** ${new Date().toISOString()}`,
      "",
      "_This issue was automatically generated from a user bug report._"
    );

    return sections.join("\n");
  }

  /**
   * Format description with checklist detection for multiple steps
   * @param {string} description - Original description
   * @returns {string} Formatted description with checklists
   */
  static formatDescriptionWithChecklists(description: string): string {
    if (!description) return "No description provided";

    // Check for patterns that suggest multiple items/steps
    const patterns = [
      /(\d+[.)]\s.*)/g, // Numbered lists (1. item, 1) item)
      /(-\s.*)/g, // Dash lists (- item)
      /(\*\s.*)/g, // Star lists (* item)
      /(•\s.*)/g, // Bullet lists (• item)
    ];

    let formatted = description;
    let hasMultipleItems = false;

    // Check if description has multiple line items
    patterns.forEach((pattern) => {
      const matches = description.match(pattern);
      if (matches && matches.length > 1) {
        hasMultipleItems = true;
        // Convert to GitHub checkboxes
        formatted = formatted.replace(pattern, (match) => {
          const cleanedItem = match.replace(/^[\d.)•*-]\s*/, "").trim();
          return `- [ ] ${cleanedItem}`;
        });
      }
    });

    // Also detect "and" separated items in single lines
    if (!hasMultipleItems && description.includes(" and ")) {
      const parts = description.split(" and ").filter((part) => part.trim().length > 0);
      if (parts.length > 1) {
        formatted = parts.map((part) => `- [ ] ${part.trim()}`).join("\n");
        hasMultipleItems = true;
      }
    }

    return formatted;
  }

  /**
   * Format environment information in a concise way
   * @param {Object} systemInfo - System information object
   * @returns {string} Formatted environment info
   */
  static formatEnvironmentInfo(systemInfo: BugReportData["systemInfo"] | undefined): string {
    const sections: string[] = [];

    // App version and environment
    sections.push(`- **App Version:** ${systemInfo?.appVersion || "unknown"}`);
    sections.push(`- **Environment:** ${this.detectEnvironment()}`);

    // Browser info
    if (systemInfo?.browser) {
      sections.push(`- **Browser:** ${systemInfo.browser.name} ${systemInfo.browser.version}`);
    }

    // Viewport
    if (systemInfo?.viewport) {
      sections.push(`- **Viewport:** ${systemInfo.viewport.width}x${systemInfo.viewport.height}`);
    }

    // User agent (truncated)
    if (systemInfo?.userAgent) {
      const shortUA =
        systemInfo.userAgent.length > 100
          ? systemInfo.userAgent.substring(0, 100) + "..."
          : systemInfo.userAgent;
      sections.push(`- **User Agent:** ${shortUA}`);
    }

    // Memory usage if available
    if (systemInfo?.performance?.memory) {
      const memMB = Math.round(systemInfo.performance.memory.usedJSHeapSize / 1024 / 1024);
      sections.push(`- **Memory Usage:** ${memMB}MB used`);
    }

    sections.push(`- **Timestamp:** ${systemInfo?.timestamp || new Date().toISOString()}`);

    return sections.join("\n");
  }

  /**
   * Detect current environment
   * @returns {string} Environment description
   */
  static detectEnvironment(): string {
    const hostname = window.location.hostname;

    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "🏠 Local Development";
    } else if (hostname.includes("dev.") || hostname.includes("staging.")) {
      return "🚧 Development/Staging";
    } else {
      return "🌐 Production";
    }
  }

  /**
   * Format console logs and errors for GitHub
   * @param {Object} errors - Error object from system info
   * @returns {string} Formatted error information
   */
  static formatConsoleLogsForGitHub(
    errors: BugReportData["systemInfo"]["errors"] | undefined
  ): string {
    const sections: string[] = [];

    // Handle errors
    if (errors?.recentErrors && errors.recentErrors.length > 0) {
      sections.push("### Recent JavaScript Errors", "");

      // Show last 3 errors to avoid overwhelming the issue
      const recentErrors = errors.recentErrors.slice(-3);

      recentErrors.forEach((error, index) => {
        sections.push(
          `**Error ${index + 1}:**`,
          "```javascript",
          `${error?.type || "Error"}: ${error?.message || "Unknown error"}`,
          error?.stack ? `Stack: ${error.stack}` : "",
          error?.filename ? `File: ${error.filename} (Line: ${error?.lineno || "?"})` : "",
          `Time: ${error?.timestamp || "Unknown"}`,
          "```",
          ""
        );
      });

      if (errors.recentErrors.length > 3) {
        sections.push(`_... and ${errors.recentErrors.length - 3} more errors_`, "");
      }
    }

    // Handle console logs
    if (errors?.consoleLogs && errors.consoleLogs.length > 0) {
      sections.push("### Recent Console Logs", "");

      // Show last 10 console logs
      const recentLogs = errors.consoleLogs.slice(-10);

      // Detect code patterns for syntax highlighting
      const logText = recentLogs
        .map((log) => {
          const timeStr = new Date(log.timestamp).toLocaleTimeString();
          return `[${timeStr}] ${log.level.toUpperCase()}: ${log.message}`;
        })
        .join("\n");

      // Check if logs contain code-like patterns
      const hasCodePatterns = /(\{|\}|function|=>|const|let|var|import|export)/.test(logText);
      const codeType = hasCodePatterns ? "javascript" : "text";

      sections.push(`\`\`\`${codeType}`, logText, "```", "");
    }

    // Fallback message
    if (sections.length === 0) {
      return "No recent errors or console logs captured.";
    }

    return sections.join("\n");
  }

  /**
   * Make actual GitHub API call
   * @param {Object} payload - Issue payload
   * @returns {Promise<Object>} API response
   */
  static async makeGitHubAPICall(payload: {
    title: string;
    body: string;
    labels: string[];
  }): Promise<GitHubAPIResponse> {
    try {
      // This is a placeholder for actual GitHub API integration
      // In a real implementation, you would:
      // 1. Set up GitHub App or Personal Access Token
      // 2. Make authenticated request to GitHub Issues API
      // 3. Handle rate limiting and errors properly

      logger.debug("GitHub API call payload", payload);

      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful response
      const simulatedResponse: GitHubAPIResponse = {
        success: true,
        issueNumber: Math.floor(Math.random() * 1000) + 100,
        url: `https://github.com/your-repo/issues/${Math.floor(Math.random() * 1000) + 100}`,
      };

      logger.info(
        "GitHub API call completed",
        simulatedResponse as unknown as Record<string, unknown>
      );
      return simulatedResponse;
    } catch (error) {
      logger.error("GitHub API call failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate GitHub-specific report data
   * @param {Object} reportData - Report data to validate
   * @returns {Object} Validation result
   */
  static validateReportData(reportData: BugReportData): ValidationResult {
    const errors = [];
    const warnings = [];

    // Required fields for GitHub
    if (!reportData.title || reportData.title.trim().length === 0) {
      errors.push("Title is required for GitHub issues");
    }

    if (!reportData.description || reportData.description.trim().length === 0) {
      warnings.push("Description is recommended for better issue quality");
    }

    // GitHub-specific validations
    if (reportData.title && reportData.title.length > 256) {
      warnings.push("Title is very long and may be truncated");
    }

    if (reportData.labels && reportData.labels.length > 10) {
      warnings.push("Too many labels may clutter the issue");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      provider: "github",
    };
  }
}
