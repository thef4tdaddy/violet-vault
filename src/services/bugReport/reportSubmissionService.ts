/**
 * Report Submission Service
 * Handles fallback strategies and multiple submission providers
 * Extracted from apiService.js for Issue #513
 */
import logger from "../../utils/common/logger";
import { GitHubAPIService } from "./githubApiService";

// Define types for the service
interface ReportData {
  title: string;
  description?: string;
  systemInfo?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Provider {
  type: "github" | "webhook" | "email" | "console";
  priority: number;
  url?: string;
  config?: Record<string, unknown>;
  redundant?: boolean;
}

interface SubmissionResult {
  success: boolean;
  error?: string;
  provider?: string;
  response?: unknown;
  status?: number;
  note?: string;
  [key: string]: unknown;
}

interface FinalResult {
  success: boolean;
  overallSuccess: boolean;
  successfulProvider: string | null;
  attempts: number;
  results: (SubmissionResult & { attemptedAt: string })[];
  summary: {
    successful: number;
    failed: number;
  };
  [key: string]: unknown;
}

interface StoredReport {
  title: string;
  description?: string;
  systemInfo?: Record<string, unknown>;
  submittedAt: string;
  id: number;
  [key: string]: unknown;
}

interface SubmissionStats {
  totalReports: number;
  recentReports: number;
  oldestReport: string | null;
  newestReport: string | null;
  error?: string;
  [key: string]: unknown;
}

export class ReportSubmissionService {
  /**
   * Submit to a specific provider type
   * Extracted to reduce complexity of submitWithFallbacks
   */
  private static async submitToProvider(
    provider: Provider,
    reportData: ReportData
  ): Promise<SubmissionResult> {
    switch (provider.type) {
      case "github":
        return await GitHubAPIService.submitToGitHub(reportData);
      case "webhook":
        return await this.submitToWebhook(reportData, provider.url);
      case "email":
        return await this.submitToEmail(reportData, provider.config || {});
      case "console":
        return await this.submitToConsole(reportData);
      default:
        return {
          success: false,
          error: `Unknown provider type: ${provider.type}`,
          provider: provider.type,
        };
    }
  }

  /**
   * Submit bug report with fallback providers
   */
  static async submitWithFallbacks(
    reportData: ReportData,
    providers: Provider[] = []
  ): Promise<FinalResult> {
    // Default providers if none specified
    const defaultProviders: Provider[] = [
      { type: "github", priority: 1 },
      { type: "webhook", priority: 2, url: process.env.WEBHOOK_URL },
      { type: "console", priority: 3 }, // Last resort - just log it
    ];

    const providersToTry = providers.length > 0 ? providers : defaultProviders;
    const results: (SubmissionResult & { attemptedAt: string })[] = [];
    let successfulSubmission: (SubmissionResult & { provider: string }) | null = null;

    // Sort by priority
    const sortedProviders = [...providersToTry].sort((a, b) => a.priority - b.priority);

    logger.info("Attempting bug report submission with fallbacks", {
      providersCount: sortedProviders.length,
      providers: sortedProviders.map((p) => p.type),
    });

    for (const provider of sortedProviders) {
      try {
        logger.debug(`Attempting submission with ${provider.type}`, {
          type: provider.type,
          priority: provider.priority,
          url: provider.url,
        });

        const result = await this.submitToProvider(provider, reportData);

        results.push({
          provider: provider.type,
          ...result,
          attemptedAt: new Date().toISOString(),
        });

        if (result.success && !successfulSubmission) {
          successfulSubmission = { ...result, provider: provider.type };
          logger.info(`Bug report submitted successfully via ${provider.type}`, {
            success: result.success,
            provider: result.provider,
            status: result.status,
          });

          // Continue with remaining providers for redundancy if configured
          if (!provider.redundant) {
            break;
          }
        }
      } catch (error) {
        const errorResult = {
          provider: provider.type,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          attemptedAt: new Date().toISOString(),
        };

        results.push(errorResult);
        logger.warn(`Submission failed for ${provider.type}`, {
          provider: provider.type,
          error: errorResult.error,
          attemptedAt: errorResult.attemptedAt,
        });
      }
    }

    const finalResult: FinalResult = {
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
   */
  static async submitToWebhook(
    reportData: ReportData,
    webhookUrl?: string
  ): Promise<SubmissionResult> {
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
        error: error instanceof Error ? error.message : String(error),
        provider: "webhook",
      };
    }
  }

  /**
   * Submit bug report to email (placeholder)
   */
  static async submitToEmail(
    _reportData: ReportData,
    emailConfig: Record<string, unknown> = {}
  ): Promise<SubmissionResult> {
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
        error: error instanceof Error ? error.message : String(error),
        provider: "email",
      };
    }
  }

  /**
   * Submit bug report to console (fallback)
   */
  static async submitToConsole(reportData: ReportData): Promise<SubmissionResult> {
    try {
      logger.info("📋 BUG REPORT SUBMISSION (Console Fallback)", {
        title: reportData.title,
        description: reportData.description,
        systemInfo: reportData.systemInfo,
        timestamp: new Date().toISOString(),
      });

      // Also try to store in localStorage for developer access
      try {
        const existingReports: StoredReport[] = JSON.parse(
          localStorage.getItem("bugReports") || "[]"
        );
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
        logger.warn("Could not store bug report in localStorage", {
          error: storageError instanceof Error ? storageError.message : String(storageError),
        });
      }

      return {
        success: true,
        note: "Bug report logged to console and localStorage",
        provider: "console",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: "console",
      };
    }
  }

  /**
   * Get submission statistics
   */
  static getSubmissionStats(): SubmissionStats {
    try {
      const storedReports: StoredReport[] = JSON.parse(localStorage.getItem("bugReports") || "[]");

      return {
        totalReports: storedReports.length,
        recentReports: storedReports.filter((r: StoredReport) => {
          const reportTime = new Date(r.submittedAt).getTime();
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          return reportTime > oneDayAgo;
        }).length,
        oldestReport: storedReports[0]?.submittedAt || null,
        newestReport: storedReports[storedReports.length - 1]?.submittedAt || null,
      };
    } catch (error) {
      logger.debug("Error getting submission stats", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalReports: 0,
        recentReports: 0,
        oldestReport: null,
        newestReport: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clear stored bug reports
   */
  static clearStoredReports(): { success: boolean; error?: string } {
    try {
      localStorage.removeItem("bugReports");
      logger.info("Stored bug reports cleared");
      return { success: true };
    } catch (error) {
      logger.error("Error clearing stored reports", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
