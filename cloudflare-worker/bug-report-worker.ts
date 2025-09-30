/**
 * Cloudflare Worker for handling VioletVault bug reports
 * Receives bug reports from the frontend and creates GitHub issues
 * Stores screenshots in R2 and sends notifications
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface Env {
  R2_BUCKET: R2Bucket;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  R2_PUBLIC_DOMAIN?: string;
  NOTIFICATION_WEBHOOK?: string;
}

interface SystemInfo {
  userAgent: string;
  viewport: string;
  screen: string;
  language: string;
  timezone: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  [key: string]: unknown;
}

interface ReportEnv {
  appVersion: string;
  url: string;
  branch?: string;
  commitHash?: string;
  commitDate?: string;
  pageContext?: {
    path: string;
    title: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ContextInfo {
  currentPage?: string;
  previousPage?: string;
  userActions?: string[];
  [key: string]: unknown;
}

interface BugReport {
  title?: string;
  description?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  screenshot?: string;
  sessionUrl?: string;
  env?: ReportEnv;
  systemInfo?: SystemInfo;
  contextInfo?: ContextInfo;
  customData?: Record<string, unknown>;
  labels?: string[];
}

interface BugReportPayload {
  data?: BugReport;
  type?: string;
  [key: string]: unknown;
}

interface ProcessBugReportResult {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  screenshotUrl?: string;
  error?: string;
}

interface CleanupResult {
  success: boolean;
  filesDeleted: number;
  bytesFreed: number;
  errors?: string[];
}

interface UsageStats {
  totalFiles: number;
  totalSize: number;
  oldestFile: string | null;
  newestFile: string | null;
}

interface GitHubIssueData extends BugReport {
  screenshotUrl?: string;
}

interface GitHubMilestone {
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  due_on: string | null;
  html_url: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

interface NotificationData {
  title: string;
  description?: string;
  severity?: string;
  issueUrl?: string;
  screenshotUrl?: string;
}

// ============================================================================
// Constants
// ============================================================================

// CORS headers for all responses
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// ============================================================================
// Worker Export Handler
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Route handling
    if (url.pathname === "/cleanup" && request.method === "POST") {
      const result = await cleanupOldScreenshots(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      const result = await getUsageStats(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/milestones" && request.method === "GET") {
      const result = await getMilestones(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/releases" && request.method === "GET") {
      const result = await getReleasePleaseInfo(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default route: bug report submission
    if (url.pathname === "/report-issue" || url.pathname === "/") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
      }

      try {
        // Parse the bug report data
        const payload = await request.json() as BugReportPayload;

        // Handle nested structure from frontend (data field contains actual bug report)
        const bugReport = payload.data || payload as BugReport;

        // Debug log to understand the structure
        console.log("Payload structure:", {
          hasData: !!payload.data,
          hasTitle: !!bugReport.title,
          hasDescription: !!bugReport.description,
          payloadType: payload.type,
          payloadKeys: Object.keys(payload),
          bugReportKeys: Object.keys(bugReport || {}),
        });

        // Validate required fields (either title or description required)
        if (!bugReport.title && !bugReport.description) {
          return new Response(
            JSON.stringify({
              error: "Either title or description is required",
              received: {
                hasTitle: !!bugReport.title,
                hasDescription: !!bugReport.description,
                payloadStructure: Object.keys(payload),
                bugReportStructure: Object.keys(bugReport || {}),
              },
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Process the bug report
        const result = await processBugReport(bugReport, env);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Bug report processing failed:", error);

        return new Response(
          JSON.stringify({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Route not found
    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    });
  },

  // Handle scheduled events (cron triggers)
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    console.log("Running scheduled cleanup...");
    try {
      const result = await cleanupOldScreenshots(env);
      console.log("Cleanup result:", result);
    } catch (error) {
      console.error("Scheduled cleanup failed:", error);
    }
  },
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Process the bug report by creating GitHub issue and storing screenshot
 */
async function processBugReport(bugReport: BugReport, env: Env): Promise<ProcessBugReportResult> {
  const {
    title,
    description,
    steps,
    expected,
    actual,
    severity,
    screenshot,
    sessionUrl,
    env: reportEnv,
    systemInfo,
    contextInfo,
    customData,
  } = bugReport;

  // Debug logging to understand what data we're receiving
  console.log("Bug report data received:", {
    hasTitle: !!title,
    hasDescription: !!description,
    hasSteps: !!steps,
    hasScreenshot: !!screenshot,
    screenshotSize: screenshot ? screenshot.length : 0,
    severity,
    hasSystemInfo: !!systemInfo,
    systemInfoKeys: systemInfo ? Object.keys(systemInfo) : null,
    hasCustomData: !!customData,
    customDataKeys: customData ? Object.keys(customData) : null,
    hasReportEnv: !!reportEnv,
    reportEnvKeys: reportEnv ? Object.keys(reportEnv) : null,
    hasPageContext: !!(reportEnv && reportEnv.pageContext),
    pageContextKeys:
      reportEnv && reportEnv.pageContext
        ? Object.keys(reportEnv.pageContext)
        : null,
    hasContextInfo: !!contextInfo,
    contextInfoKeys: contextInfo ? Object.keys(contextInfo) : null,
    hasSessionUrl: !!sessionUrl,
    sessionUrl: sessionUrl || "null",
  });

  // Store screenshot if provided
  let screenshotUrl: string | null = null;
  if (screenshot) {
    try {
      screenshotUrl = await storeScreenshot(screenshot, env);
      console.log("Screenshot storage result:", {
        success: !!screenshotUrl,
        url: screenshotUrl,
        originalSize: screenshot.length,
        hasR2Bucket: !!env.R2_BUCKET,
        hasPublicDomain: !!env.R2_PUBLIC_DOMAIN,
      });
    } catch (error) {
      console.error("Screenshot storage failed:", error);
      // Continue with issue creation even if screenshot fails
    }
  }

  // Create GitHub issue
  try {
    const issueData: GitHubIssueData = {
      title,
      description,
      steps,
      expected,
      actual,
      severity,
      screenshotUrl: screenshotUrl || undefined,
      sessionUrl,
      env: reportEnv,
      systemInfo,
      contextInfo,
      customData,
    };

    const issue = await createGitHubIssue(issueData, env);

    // Send notification if webhook is configured
    if (env.NOTIFICATION_WEBHOOK) {
      try {
        await sendNotification(
          {
            title: title || "Bug Report",
            description,
            severity,
            issueUrl: issue.html_url,
            screenshotUrl: screenshotUrl || undefined,
          },
          env,
        );
      } catch (error) {
        console.error("Notification failed:", error);
        // Don't fail the whole request if notification fails
      }
    }

    return {
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      screenshotUrl: screenshotUrl || undefined,
    };
  } catch (error) {
    console.error("GitHub issue creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
    };
  }
}

/**
 * Store screenshot in Cloudflare R2 with cost protection
 */
async function storeScreenshot(screenshotDataUrl: string, env: Env): Promise<string | null> {
  if (!env.R2_BUCKET) {
    console.log("R2_BUCKET not configured, skipping screenshot storage");
    return null;
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filename = `screenshots/${timestamp}-${randomId}.png`;

    // Convert data URL to buffer
    const base64Data = screenshotDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload to R2
    await env.R2_BUCKET.put(filename, buffer, {
      httpMetadata: {
        contentType: "image/png",
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return public URL
    if (env.R2_PUBLIC_DOMAIN) {
      return `https://${env.R2_PUBLIC_DOMAIN}/${filename}`;
    }

    // Fallback to R2.dev URL (note: requires public bucket)
    return `https://pub-${filename}`;
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw error;
  }
}

/**
 * 🛡️ COST PROTECTION: Cleanup old screenshots (call this periodically)
 * This should be called from a cron trigger or manually
 */
async function cleanupOldScreenshots(env: Env): Promise<CleanupResult> {
  if (!env.R2_BUCKET) {
    return {
      success: false,
      filesDeleted: 0,
      bytesFreed: 0,
      errors: ["R2_BUCKET not configured"],
    };
  }

  try {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffDate = new Date(Date.now() - maxAge);

    let filesDeleted = 0;
    let bytesFreed = 0;
    const errors: string[] = [];

    // List all objects in the screenshots folder
    const listed = await env.R2_BUCKET.list({ prefix: "screenshots/" });

    for (const object of listed.objects) {
      if (object.uploaded < cutoffDate) {
        try {
          await env.R2_BUCKET.delete(object.key);
          filesDeleted++;
          bytesFreed += object.size;
        } catch (error) {
          console.error(`Failed to delete ${object.key}:`, error);
          errors.push(`Failed to delete ${object.key}: ${error}`);
        }
      }
    }

    return {
      success: true,
      filesDeleted,
      bytesFreed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Cleanup failed:", error);
    return {
      success: false,
      filesDeleted: 0,
      bytesFreed: 0,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Get usage statistics for R2 storage
 */
async function getUsageStats(env: Env): Promise<UsageStats> {
  if (!env.R2_BUCKET) {
    return {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null,
      newestFile: null,
    };
  }

  try {
    const listed = await env.R2_BUCKET.list({ prefix: "screenshots/" });
    
    let totalSize = 0;
    let oldestFile: Date | null = null;
    let newestFile: Date | null = null;

    for (const object of listed.objects) {
      totalSize += object.size;
      
      if (!oldestFile || object.uploaded < oldestFile) {
        oldestFile = object.uploaded;
      }
      
      if (!newestFile || object.uploaded > newestFile) {
        newestFile = object.uploaded;
      }
    }

    return {
      totalFiles: listed.objects.length,
      totalSize,
      oldestFile: oldestFile ? oldestFile.toISOString() : null,
      newestFile: newestFile ? newestFile.toISOString() : null,
    };
  } catch (error) {
    console.error("Failed to get usage stats:", error);
    return {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null,
      newestFile: null,
    };
  }
}

/**
 * Get Release Please information
 */
async function getReleasePleaseInfo(env: Env): Promise<{ releases: GitHubRelease[] }> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    throw new Error("GitHub configuration missing");
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/releases`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-Worker",
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releases = await response.json() as GitHubRelease[];
    return { releases };
  } catch (error) {
    console.error("Failed to fetch releases:", error);
    throw error;
  }
}

/**
 * Get GitHub milestones
 */
async function getMilestones(env: Env): Promise<{ milestones: GitHubMilestone[] }> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    throw new Error("GitHub configuration missing");
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/milestones?state=all&sort=due_on&direction=desc`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-Worker",
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const milestones = await response.json() as GitHubMilestone[];
    return { milestones };
  } catch (error) {
    console.error("Failed to fetch milestones:", error);
    throw error;
  }
}

/**
 * Generate smart labels based on bug report content and context
 * Uses existing GitHub labels instead of creating new ones
 */
async function generateSmartLabels(
  description: string | undefined,
  reportEnv: ReportEnv | undefined,
  _env: Env,
  severity: string = "medium",
): Promise<string[]> {
  const labels: string[] = ["bug"];

  // Add severity label
  if (severity) {
    labels.push(`severity:${severity}`);
  }

  const descriptionLower = (description || "").toLowerCase();

  // UI/UX related
  if (
    descriptionLower.includes("ui") ||
    descriptionLower.includes("button") ||
    descriptionLower.includes("layout") ||
    descriptionLower.includes("display") ||
    descriptionLower.includes("visual") ||
    descriptionLower.includes("style")
  ) {
    labels.push("ui/ux");
  }

  // Performance related
  if (
    descriptionLower.includes("slow") ||
    descriptionLower.includes("performance") ||
    descriptionLower.includes("lag") ||
    descriptionLower.includes("freeze") ||
    descriptionLower.includes("crash")
  ) {
    labels.push("performance");
  }

  // Data/sync related
  if (
    descriptionLower.includes("data") ||
    descriptionLower.includes("sync") ||
    descriptionLower.includes("firebase") ||
    descriptionLower.includes("database")
  ) {
    labels.push("data");
  }

  // Mobile related
  if (
    descriptionLower.includes("mobile") ||
    descriptionLower.includes("touch") ||
    descriptionLower.includes("swipe") ||
    descriptionLower.includes("responsive")
  ) {
    labels.push("mobile");
  }

  // Security related
  if (
    descriptionLower.includes("security") ||
    descriptionLower.includes("encryption") ||
    descriptionLower.includes("password") ||
    descriptionLower.includes("auth")
  ) {
    labels.push("security");
  }

  // Enhancement suggestion
  if (
    descriptionLower.includes("feature") ||
    descriptionLower.includes("suggestion") ||
    descriptionLower.includes("could we") ||
    descriptionLower.includes("would be nice")
  ) {
    labels.push("enhancement");
  }

  // Documentation related
  if (
    descriptionLower.includes("documentation") ||
    descriptionLower.includes("help") ||
    descriptionLower.includes("tutorial")
  ) {
    labels.push("documentation");
  }

  // Branch/Environment detection for dev vs live
  if (reportEnv?.url) {
    const url = reportEnv.url.toLowerCase();

    // Detect development/staging environments
    if (
      url.includes("localhost") ||
      url.includes("127.0.0.1") ||
      url.includes("dev.") ||
      url.includes("staging.") ||
      url.includes("preview") ||
      url.includes("git-") ||
      url.includes("vercel.app") ||
      url.includes("netlify.app")
    ) {
      labels.push("dev-environment");
    } else {
      // Production environment
      labels.push("production");
    }
  }

  return labels;
}

/**
 * Create GitHub issue using the GitHub API
 */
async function createGitHubIssue(data: GitHubIssueData, env: Env): Promise<{ number: number; html_url: string }> {
  const {
    title,
    description,
    steps,
    expected,
    actual,
    severity,
    screenshotUrl,
    sessionUrl,
    env: reportEnv,
    systemInfo,
    contextInfo,
    customData,
  } = data;

  // Build issue body with all available information
  // Parse line breaks into checklist items ONLY if it's NOT code content
  let processedDescription = description || "";

  // Check if description contains code blocks or technical content that should NOT be converted to tasks
  const hasCodeBlocks =
    /```[\s\S]*?```/.test(processedDescription) || // Code blocks
    /`[^`\n]+`/.test(processedDescription) || // Inline code
    /function\s+\w+\s*\(/.test(processedDescription) || // Function definitions
    /const\s+\w+\s*=/.test(processedDescription) || // Variable declarations
    /import\s+.*from/.test(processedDescription) || // Import statements
    /class\s+\w+/.test(processedDescription) || // Class definitions
    /TypeError:|ReferenceError:|SyntaxError:/.test(processedDescription) || // Error types
    /at\s+\w+\s*\(/.test(processedDescription) || // Stack traces
    /console\.(log|error|warn)/.test(processedDescription) || // Console statements
    processedDescription.includes("Error:") || // General error messages
    processedDescription.includes("Exception") || // Exception references
    /\w+\.\w+\([^)]*\)/.test(processedDescription); // Method calls

  // Only parse into task lists if it's clearly a user task list (not technical content)
  const shouldParse =
    !hasCodeBlocks &&
    ((processedDescription.includes("\n") &&
      (processedDescription.includes("- ") ||
        processedDescription.includes("* ") ||
        processedDescription.includes("• ") ||
        /^\d+\./m.test(processedDescription))) ||
      // Only parse single lines if they have clear list indicators
      processedDescription.includes("- ") ||
      processedDescription.includes("* ") ||
      processedDescription.includes("• "));

  if (shouldParse) {
    // Split by lines and convert to task list format
    processedDescription = processedDescription
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        // Skip empty lines
        if (!trimmed) return "";

        // Convert numbered lists (1., 2., etc.)
        if (/^\d+\.\s/.test(trimmed)) {
          return `- [ ] ${trimmed.replace(/^\d+\.\s/, "")}`;
        }

        // Convert bullet points (-, *, •)
        if (/^[-*•]\s/.test(trimmed)) {
          return `- [ ] ${trimmed.replace(/^[-*•]\s/, "")}`;
        }

        // Regular line without list marker
        return trimmed;
      })
      .join("\n");
  }

  let issueBody = "";

  // Add description
  if (processedDescription) {
    issueBody += `## Description\n${processedDescription}\n\n`;
  }

  // Add steps to reproduce
  if (steps) {
    issueBody += `## Steps to Reproduce\n${steps}\n\n`;
  }

  // Add expected vs actual
  if (expected || actual) {
    issueBody += `## Expected vs Actual Behavior\n`;
    if (expected) {
      issueBody += `**Expected:** ${expected}\n`;
    }
    if (actual) {
      issueBody += `**Actual:** ${actual}\n`;
    }
    issueBody += `\n`;
  }

  // Add screenshot
  if (screenshotUrl) {
    issueBody += `## Screenshot\n![Bug Screenshot](${screenshotUrl})\n\n`;
  }

  // Add session replay link
  if (sessionUrl) {
    issueBody += `## Session Replay\n[View Session Recording](${sessionUrl})\n\n`;
  }

  // Add environment information
  if (reportEnv) {
    issueBody += `## Environment\n`;
    issueBody += `- **App Version:** ${reportEnv.appVersion}\n`;

    // Detect and show environment type
    let environmentType = "Unknown";
    if (reportEnv.url) {
      const url = reportEnv.url.toLowerCase();
      if (
        url.includes("localhost") ||
        url.includes("127.0.0.1") ||
        url.includes("dev.") ||
        url.includes("staging.")
      ) {
        environmentType = "🚧 Development/Local";
      } else if (
        url.includes("preview") ||
        url.includes("git-") ||
        url.includes("vercel.app")
      ) {
        environmentType = "🔄 Preview/Staging";
      } else {
        environmentType = "✅ Production/Live";
      }
    }
    issueBody += `- **Environment:** ${environmentType}\n`;

    if (reportEnv.url) {
      issueBody += `- **URL:** ${reportEnv.url}\n`;
    }
    if (reportEnv.branch) {
      issueBody += `- **Branch:** ${reportEnv.branch}\n`;
    }
    if (reportEnv.commitHash) {
      issueBody += `- **Commit:** ${reportEnv.commitHash}\n`;
    }
    if (reportEnv.commitDate) {
      issueBody += `- **Build Date:** ${reportEnv.commitDate}\n`;
    }

    // Add page context if available
    if (reportEnv.pageContext) {
      issueBody += `\n### Page Context\n`;
      if (reportEnv.pageContext.path) {
        issueBody += `- **Current Page:** ${reportEnv.pageContext.path}\n`;
      }
      if (reportEnv.pageContext.title) {
        issueBody += `- **Page Title:** ${reportEnv.pageContext.title}\n`;
      }
    }

    issueBody += `\n`;
  }

  // Add system information
  if (systemInfo) {
    issueBody += `## System Information\n`;
    issueBody += `- **Browser:** ${systemInfo.userAgent || "Unknown"}\n`;
    issueBody += `- **Viewport:** ${systemInfo.viewport || "Unknown"}\n`;
    issueBody += `- **Screen:** ${systemInfo.screen || "Unknown"}\n`;
    issueBody += `- **Language:** ${systemInfo.language || "Unknown"}\n`;
    issueBody += `- **Timezone:** ${systemInfo.timezone || "Unknown"}\n`;
    issueBody += `- **Platform:** ${systemInfo.platform || "Unknown"}\n`;
    issueBody += `\n`;
  }

  // Add context information
  if (contextInfo) {
    issueBody += `## Context Information\n`;
    if (contextInfo.currentPage) {
      issueBody += `- **Current Page:** ${contextInfo.currentPage}\n`;
    }
    if (contextInfo.previousPage) {
      issueBody += `- **Previous Page:** ${contextInfo.previousPage}\n`;
    }
    if (contextInfo.userActions && Array.isArray(contextInfo.userActions)) {
      issueBody += `\n**Recent User Actions:**\n`;
      contextInfo.userActions.forEach((action) => {
        issueBody += `- ${action}\n`;
      });
    }
    issueBody += `\n`;
  }

  // Add custom data if available
  if (customData && Object.keys(customData).length > 0) {
    issueBody += `## Additional Data\n`;
    issueBody += `\`\`\`json\n${JSON.stringify(customData, null, 2)}\n\`\`\`\n\n`;
  }

  // Add footer
  issueBody += `---\n`;
  issueBody += `*This issue was automatically generated from a bug report.*\n`;

  // Generate smart labels
  const labels = await generateSmartLabels(description, reportEnv, env, severity);

  // Create the issue
  const issueTitle = title || `Bug Report: ${description?.substring(0, 50) || "No description"}`;

  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "VioletVault-Worker",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  const issue = await response.json() as { number: number; html_url: string };
  return issue;
}

/**
 * Send notification to webhook (Slack/Discord)
 */
async function sendNotification(data: NotificationData, env: Env): Promise<void> {
  if (!env.NOTIFICATION_WEBHOOK) {
    return;
  }

  const { title, description, severity, issueUrl, screenshotUrl } = data;

  // Build notification message
  let message = `🐛 **New Bug Report**\n\n`;
  message += `**Title:** ${title}\n`;
  if (description) {
    message += `**Description:** ${description.substring(0, 200)}${description.length > 200 ? "..." : ""}\n`;
  }
  if (severity) {
    message += `**Severity:** ${severity}\n`;
  }
  if (issueUrl) {
    message += `**Issue:** ${issueUrl}\n`;
  }
  if (screenshotUrl) {
    message += `**Screenshot:** ${screenshotUrl}\n`;
  }

  // Send to webhook
  try {
    const response = await fetch(env.NOTIFICATION_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        username: "VioletVault Bug Reporter",
      }),
    });

    if (!response.ok) {
      console.error("Notification webhook failed:", response.status);
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}
