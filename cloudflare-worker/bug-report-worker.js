/**
 * Cloudflare Worker for handling VioletVault bug reports
 * Receives bug reports from the frontend and creates GitHub issues
 * Stores screenshots in R2 and sends notifications
 */

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env) {
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
        const bugReport = await request.json();

        // Validate required fields
        if (!bugReport.description) {
          return new Response(
            JSON.stringify({
              error: "Description is required",
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
            message: error.message,
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
  async scheduled(controller, env) {
    console.log("Running scheduled cleanup...");
    try {
      const result = await cleanupOldScreenshots(env);
      console.log("Cleanup result:", result);
    } catch (error) {
      console.error("Scheduled cleanup failed:", error);
    }
  },
};

/**
 * Process the bug report by creating GitHub issue and storing screenshot
 */
async function processBugReport(bugReport, env) {
  const { description, screenshot, sessionUrl, env: reportEnv } = bugReport;

  // Store screenshot if provided
  let screenshotUrl = null;
  if (screenshot) {
    try {
      screenshotUrl = await storeScreenshot(screenshot, env);
      console.log(`Screenshot storage result: ${screenshotUrl ? 'success' : 'failed'}`);
    } catch (error) {
      console.error('Screenshot storage error:', error);
      screenshotUrl = null;
    }
  }

  // Create GitHub issue
  const githubIssue = await createGitHubIssue(
    {
      description,
      screenshotUrl,
      sessionUrl,
      env: reportEnv,
    },
    env,
  );

  // Send notification (optional)
  if (env.NOTIFICATION_WEBHOOK) {
    await sendNotification(
      {
        description,
        screenshotUrl,
        sessionUrl,
        githubIssueUrl: githubIssue.html_url,
      },
      env,
    );
  }

  return {
    success: true,
    issueNumber: githubIssue.number,
    issueUrl: githubIssue.html_url,
    screenshotUrl,
  };
}

/**
 * Store screenshot in Cloudflare R2 with cost protection
 */
async function storeScreenshot(screenshotDataUrl, env) {
  if (!env.R2_BUCKET) {
    console.warn("R2_BUCKET not configured, skipping screenshot storage");
    return null;
  }

  try {
    // Extract base64 data from data URL
    const base64Data = screenshotDataUrl.replace(
      /^data:image\/png;base64,/,
      "",
    );
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0),
    );

    // 🛡️ COST PROTECTION: Check file size (max 5MB to stay well under free tier)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (imageBuffer.length > maxSizeBytes) {
      console.warn(
        `Screenshot too large: ${imageBuffer.length} bytes (max: ${maxSizeBytes})`,
      );
      return null;
    }

    // 🛡️ COST PROTECTION: Check monthly usage (basic check - you can enhance this)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageKey = `usage-${currentMonth}`;

    try {
      // Get current month's usage count
      const usageData = await env.R2_BUCKET.head(usageKey);
      const currentCount = usageData
        ? parseInt(usageData.customMetadata?.count || "0")
        : 0;

      // 🛡️ LIMIT: Max 1000 screenshots per month (well under 1M operations limit)
      const maxScreenshotsPerMonth = 1000;
      if (currentCount >= maxScreenshotsPerMonth) {
        console.warn(
          `Monthly screenshot limit reached: ${currentCount}/${maxScreenshotsPerMonth}`,
        );
        return null;
      }

      // Update usage counter
      await env.R2_BUCKET.put(
        usageKey,
        JSON.stringify({
          count: currentCount + 1,
          month: currentMonth,
        }),
        {
          customMetadata: { count: (currentCount + 1).toString() },
        },
      );
    } catch (usageError) {
      // If usage tracking fails, still allow upload but log warning
      console.warn("Usage tracking failed:", usageError);
    }

    // Generate unique filename with size info for monitoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sizeKB = Math.round(imageBuffer.length / 1024);
    const filename = `bug-reports/screenshot-${timestamp}-${sizeKB}kb-${Math.random().toString(36).substring(7)}.png`;

    // Store in R2 with automatic cleanup metadata
    await env.R2_BUCKET.put(filename, imageBuffer, {
      httpMetadata: {
        contentType: "image/png",
        cacheControl: "public, max-age=2592000", // 30 days
      },
      customMetadata: {
        uploadDate: new Date().toISOString(),
        sizeBytes: imageBuffer.length.toString(),
        autoDelete: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 90 days
      },
    });

    console.log(`Screenshot stored: ${filename} (${sizeKB}KB)`);

    // Return public URL (adjust based on your R2 setup)
    return env.R2_PUBLIC_DOMAIN
      ? `https://${env.R2_PUBLIC_DOMAIN}/${filename}`
      : null;
  } catch (error) {
    console.error("Failed to store screenshot:", error);
    return null;
  }
}

/**
 * 🛡️ COST PROTECTION: Cleanup old screenshots (call this periodically)
 * This should be called from a cron trigger or manually
 */
async function cleanupOldScreenshots(env) {
  if (!env.R2_BUCKET) {
    return { error: "R2_BUCKET not configured" };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    let deletedCount = 0;
    let totalSize = 0;

    // List all objects in bug-reports folder
    const objects = await env.R2_BUCKET.list({ prefix: "bug-reports/" });

    for (const object of objects.objects) {
      try {
        const objectDetails = await env.R2_BUCKET.head(object.key);
        const uploadDate = objectDetails.customMetadata?.uploadDate;

        if (uploadDate) {
          const fileDate = new Date(uploadDate);
          if (fileDate < cutoffDate) {
            await env.R2_BUCKET.delete(object.key);
            deletedCount++;
            totalSize += object.size || 0;
            console.log(`Deleted old screenshot: ${object.key}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to process ${object.key}:`, error);
      }
    }

    return {
      success: true,
      deletedCount,
      totalSizeFreed: Math.round(totalSize / (1024 * 1024)), // MB
      message: `Cleaned up ${deletedCount} screenshots, freed ${Math.round(totalSize / (1024 * 1024))}MB`,
    };
  } catch (error) {
    console.error("Cleanup failed:", error);
    return { error: error.message };
  }
}

/**
 * Get usage statistics for monitoring
 */
async function getUsageStats(env) {
  if (!env.R2_BUCKET) {
    return { error: "R2_BUCKET not configured" };
  }

  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageKey = `usage-${currentMonth}`;

    // Get current month usage
    const usageData = await env.R2_BUCKET.head(usageKey);
    const currentCount = usageData
      ? parseInt(usageData.customMetadata?.count || "0")
      : 0;

    // List objects to get storage stats
    const objects = await env.R2_BUCKET.list({ prefix: "bug-reports/" });
    const totalObjects = objects.objects.length;
    const totalSize = objects.objects.reduce(
      (sum, obj) => sum + (obj.size || 0),
      0,
    );

    return {
      success: true,
      currentMonth,
      uploadsThisMonth: currentCount,
      maxUploadsPerMonth: 1000,
      percentageUsed: Math.round((currentCount / 1000) * 100),
      totalStoredScreenshots: totalObjects,
      totalStorageUsed: Math.round(totalSize / (1024 * 1024)), // MB
      freeStorageLimit: 10 * 1024, // 10GB in MB
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get release-please information for next version targeting
 */
async function getReleasePleaseInfo(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return {
      error: "GitHub configuration not found",
      fallback: { nextVersion: "1.9.0", currentVersion: "1.8.0" },
    };
  }

  try {
    // Get the latest releases
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/releases?per_page=10`,
      {
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-BugReporter/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!releasesResponse.ok) {
      throw new Error(`GitHub API error: ${releasesResponse.status}`);
    }

    const releases = await releasesResponse.json();

    // Get release-please PRs (these contain the next version)
    const prsResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/pulls?state=open&per_page=10`,
      {
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-BugReporter/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!prsResponse.ok) {
      throw new Error(`GitHub API error: ${prsResponse.status}`);
    }

    const prs = await prsResponse.json();

    // Find release-please PR (contains "chore(main): release" in title)
    const releasePR = prs.find(
      (pr) =>
        pr.title.includes("chore(main): release") &&
        pr.head.ref.includes("release-please"),
    );

    // Extract version from release PR title: "chore(main): release violet-vault 1.8.0"
    let nextVersion = null;
    if (releasePR) {
      const versionMatch = releasePR.title.match(
        /release\s+\S+\s+(\d+\.\d+\.\d+)/,
      );
      nextVersion = versionMatch ? versionMatch[1] : null;
    }

    // Get current/latest version from releases
    const latestRelease = releases.find((release) => !release.prerelease);
    const currentVersion = latestRelease
      ? latestRelease.tag_name.replace(/^v/, "")
      : "1.8.0";

    // If no release PR found, increment the current version
    if (!nextVersion) {
      const [major, minor] = currentVersion.split(".").map(Number);
      nextVersion = `${major}.${minor + 1}.0`;
    }

    return {
      success: true,
      nextVersion,
      currentVersion,
      latestRelease: {
        version: currentVersion,
        name: latestRelease?.name,
        publishedAt: latestRelease?.published_at,
        htmlUrl: latestRelease?.html_url,
      },
      releasePR: releasePR
        ? {
            number: releasePR.number,
            title: releasePR.title,
            htmlUrl: releasePR.html_url,
            createdAt: releasePR.created_at,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch release-please info:", error);
    return {
      error: error.message,
      fallback: { nextVersion: "1.9.0", currentVersion: "1.8.0" },
    };
  }
}

/**
 * Fetch GitHub milestones for version targeting
 */
async function getMilestones(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return {
      error: "GitHub configuration not found",
      fallback: {
        version: "1.8.0",
        title: "v1.8.0 - Cash Management (Fallback)",
      },
    };
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/milestones?state=open&sort=due_on&direction=asc`,
      {
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-BugReporter/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const milestones = await response.json();

    if (!milestones.length) {
      return {
        milestones: [],
        current: {
          version: "1.8.0",
          title: "v1.8.0 - Cash Management (Fallback)",
        },
      };
    }

    // Extract version from milestone titles and sort by version number
    const processedMilestones = milestones
      .map((milestone) => {
        const versionMatch = milestone.title.match(/v?(\d+\.\d+\.\d+)/);
        return {
          ...milestone,
          version: versionMatch ? versionMatch[1] : null,
        };
      })
      .filter((m) => m.version) // Only keep milestones with valid versions
      .sort((a, b) => {
        // Sort by version number (lowest first)
        const aVersion = a.version.split(".").map(Number);
        const bVersion = b.version.split(".").map(Number);

        for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
          const aPart = aVersion[i] || 0;
          const bPart = bVersion[i] || 0;
          if (aPart !== bPart) return aPart - bPart;
        }
        return 0;
      });

    // Current milestone logic: prefer closest due date, fallback to highest version
    let currentMilestone = processedMilestones[0]; // Default fallback
    
    // Find milestone with closest due date (if any have due dates)
    const milestonesWithDueDate = processedMilestones.filter(m => m.due_on);
    if (milestonesWithDueDate.length > 0) {
      const now = new Date();
      currentMilestone = milestonesWithDueDate
        .sort((a, b) => {
          const aDiff = Math.abs(new Date(a.due_on) - now);
          const bDiff = Math.abs(new Date(b.due_on) - now);
          return aDiff - bDiff; // Closest due date first
        })[0];
    } else {
      // No due dates available, use highest version number (most recent)
      currentMilestone = processedMilestones
        .sort((a, b) => {
          const aVersion = a.version.split(".").map(Number);
          const bVersion = b.version.split(".").map(Number);
          for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
            const aPart = aVersion[i] || 0;
            const bPart = bVersion[i] || 0;
            if (aPart !== bPart) return bPart - aPart; // Highest version first
          }
          return 0;
        })[0];
    }

    return {
      success: true,
      milestones: processedMilestones.map((m) => ({
        version: m.version,
        title: m.title,
        description: m.description,
        dueDate: m.due_on,
        state: m.state,
        progress: {
          openIssues: m.open_issues,
          closedIssues: m.closed_issues,
          total: m.open_issues + m.closed_issues,
          percentComplete:
            m.open_issues + m.closed_issues > 0
              ? Math.round(
                  (m.closed_issues / (m.open_issues + m.closed_issues)) * 100,
                )
              : 0,
        },
      })),
      current: {
        version: currentMilestone.version,
        title: currentMilestone.title,
        description: currentMilestone.description,
        dueDate: currentMilestone.due_on,
        progress: {
          openIssues: currentMilestone.open_issues,
          closedIssues: currentMilestone.closed_issues,
          total: currentMilestone.open_issues + currentMilestone.closed_issues,
          percentComplete:
            currentMilestone.open_issues + currentMilestone.closed_issues > 0
              ? Math.round(
                  (currentMilestone.closed_issues /
                    (currentMilestone.open_issues +
                      currentMilestone.closed_issues)) *
                    100,
                )
              : 0,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch milestones:", error);
    return {
      error: error.message,
      fallback: {
        version: "1.8.0",
        title: "v1.8.0 - Cash Management (Fallback)",
      },
    };
  }
}

/**
 * Generate smart labels based on bug report content and context
 */
async function generateSmartLabels(description, reportEnv) {
  const labels = ["bug", "user-reported"];

  const descriptionLower = description.toLowerCase();
  const urlPath = reportEnv?.url ? new URL(reportEnv.url).pathname : "";
  const pageContext = reportEnv?.pageContext;

  // Priority-based labeling
  const criticalKeywords = [
    "crash",
    "error",
    "broken",
    "not working",
    "fail",
    "exception",
    "500",
    "404",
  ];
  const highPriorityKeywords = ["slow", "performance", "timeout", "loading"];
  const mediumPriorityKeywords = ["improvement", "enhance", "better", "should"];

  if (criticalKeywords.some((keyword) => descriptionLower.includes(keyword))) {
    labels.push("🔴 Critical");
  } else if (
    highPriorityKeywords.some((keyword) => descriptionLower.includes(keyword))
  ) {
    labels.push("🟡 Medium");
  } else if (
    mediumPriorityKeywords.some((keyword) => descriptionLower.includes(keyword))
  ) {
    labels.push("🟢 Low");
  }

  // Enhanced component/feature-based labeling with page context
  const componentMap = {
    debt: ["debt", "payoff", "payment", "creditor"],
    envelope: ["envelope", "budget", "allocation"],
    transaction: ["transaction", "ledger", "import", "export"],
    savings: ["savings", "goal", "target"],
    auth: ["login", "password", "security", "lock"],
    sync: ["sync", "firebase", "cloud"],
    analytics: ["chart", "analytics", "graph", "report"],
    mobile: ["mobile", "responsive", "phone", "tablet"],
    ui: ["ui", "interface", "button", "modal", "dropdown"],
    performance: ["slow", "performance", "memory", "speed"],
  };

  // Use page context for more accurate labeling
  if (pageContext?.page && pageContext.page !== "unknown") {
    labels.push(pageContext.page);
  }

  // Component hints from DOM analysis
  if (pageContext?.componentHints) {
    for (const hint of pageContext.componentHints) {
      for (const [component, keywords] of Object.entries(componentMap)) {
        if (keywords.some((keyword) => hint.includes(keyword))) {
          labels.push(component);
          break;
        }
      }
    }
  }

  // Fallback to description and URL analysis
  for (const [component, keywords] of Object.entries(componentMap)) {
    if (
      keywords.some(
        (keyword) =>
          descriptionLower.includes(keyword) || urlPath.includes(keyword),
      )
    ) {
      labels.push(component);
      break; // Only add one component label to avoid clutter
    }
  }

  // URL-based labeling for specific pages (enhanced)
  if (urlPath.includes("/debt") || pageContext?.page === "debt")
    labels.push("debt");
  else if (urlPath.includes("/envelope") || pageContext?.page === "envelope")
    labels.push("envelope");
  else if (
    urlPath.includes("/transaction") ||
    pageContext?.page === "transaction"
  )
    labels.push("transaction");
  else if (urlPath.includes("/savings") || pageContext?.page === "savings")
    labels.push("savings");
  else if (urlPath.includes("/analytics") || pageContext?.page === "analytics")
    labels.push("analytics");

  // Device/Browser specific - be truthful about what browser reports
  if (reportEnv?.userAgent) {
    const userAgent = reportEnv.userAgent.toLowerCase();
    if (
      userAgent.includes("mobile") ||
      userAgent.includes("android") ||
      userAgent.includes("iphone")
    ) {
      labels.push("mobile");
    }

    // Browser detection - clean and truthful
    if (userAgent.includes("firefox/")) {
      labels.push("firefox");
    } else if (userAgent.includes("safari/") && !userAgent.includes("chrome")) {
      labels.push("safari");
    } else if (userAgent.includes("chrome/")) {
      labels.push("chrome");
    } else if (userAgent.includes("edg/") || userAgent.includes("edge/")) {
      labels.push("edge");
    } else if (userAgent.includes("webkit/")) {
      labels.push("webkit");
    }

    // Engine detection for additional context
    if (userAgent.includes("webkit/")) {
      labels.push("webkit-engine");
    }
    if (userAgent.includes("gecko/")) {
      labels.push("gecko-engine");
    }
  }

  // Screen size based labeling
  if (reportEnv?.viewport) {
    const [width] = reportEnv.viewport.split("x").map(Number);
    if (width <= 768) {
      labels.push("mobile");
    } else if (width <= 1024) {
      labels.push("tablet");
    }
  }

  // Enhanced context analysis using comprehensive browser info
  if (reportEnv?.browserInfo) {
    // Memory-related issues
    if (
      reportEnv.browserInfo.memory &&
      typeof reportEnv.browserInfo.memory === "object"
    ) {
      const usedMemory =
        parseInt(reportEnv.browserInfo.memory.usedJSHeapSize) || 0;
      if (usedMemory > 100) {
        // More than 100MB JS heap usage
        labels.push("performance", "memory");
      }
    }

    // Touch/mobile device indicators
    if (reportEnv.browserInfo.maxTouchPoints > 0) {
      labels.push("mobile", "touch");
    }

    // Offline/connectivity issues
    if (reportEnv.browserInfo.onLine === false) {
      labels.push("connectivity", "offline");
    }
  }

  // Storage-related issues
  if (reportEnv?.storageInfo) {
    const localStorageKB = parseInt(reportEnv.storageInfo.localStorage) || 0;
    const sessionStorageKB =
      parseInt(reportEnv.storageInfo.sessionStorage) || 0;

    if (localStorageKB > 1024 || sessionStorageKB > 512) {
      // Large storage usage
      labels.push("storage", "performance");
    }

    if (reportEnv.storageInfo.error) {
      labels.push("storage", "permissions");
    }
  }

  // DOM/UI-related context
  if (reportEnv?.domInfo) {
    // Large document size indicating performance issues
    if (reportEnv.domInfo.documentDimensions) {
      const docWidth = reportEnv.domInfo.documentDimensions.width;
      const docHeight = reportEnv.domInfo.documentDimensions.height;

      if (docHeight > 10000 || docWidth > 3000) {
        labels.push("performance", "ui");
      }
    }

    // Focus-related issues
    if (reportEnv.domInfo.focusedElement) {
      const focusedType = reportEnv.domInfo.focusedElement.type;
      if (
        focusedType === "text" ||
        focusedType === "email" ||
        focusedType === "password"
      ) {
        labels.push("forms", "input");
      }
    }
  }

  // Performance timing analysis
  if (reportEnv?.performanceInfo && Array.isArray(reportEnv.performanceInfo)) {
    const perfData = reportEnv.performanceInfo.join(" ").toLowerCase();
    if (perfData.includes("slow") || perfData.includes("timeout")) {
      labels.push("performance", "loading");
    }
  }

  // Active modals and UI state context
  if (pageContext?.visibleModals && pageContext.visibleModals.length > 0) {
    labels.push("modal", "ui");

    // Check for specific modal types
    const modalText = pageContext.visibleModals.join(" ").toLowerCase();
    if (modalText.includes("edit") || modalText.includes("add")) {
      labels.push("forms");
    }
    if (modalText.includes("debt")) {
      labels.push("debt");
    }
    if (modalText.includes("envelope") || modalText.includes("budget")) {
      labels.push("envelope");
    }
  }

  // Button context for interaction issues
  if (pageContext?.activeButtons && pageContext.activeButtons.length > 0) {
    const buttonText = pageContext.activeButtons.join(" ").toLowerCase();
    if (buttonText.includes("save") || buttonText.includes("submit")) {
      labels.push("forms", "save");
    }
    if (buttonText.includes("delete") || buttonText.includes("remove")) {
      labels.push("delete");
    }
    if (buttonText.includes("sync") || buttonText.includes("backup")) {
      labels.push("sync");
    }
  }

  // Enhanced accessibility and device context
  if (reportEnv?.colorScheme === "dark") {
    labels.push("dark-mode");
  }

  if (reportEnv?.reducedMotion === true) {
    labels.push("accessibility", "motion");
  }

  if (reportEnv?.standaloneMode === true) {
    labels.push("pwa", "standalone");
  }

  // Network/connection type analysis
  if (reportEnv?.connectionType) {
    const conn = reportEnv.connectionType.toLowerCase();
    if (conn.includes("slow") || conn === "2g" || conn === "3g") {
      labels.push("performance", "slow-connection");
    }
  }

  // Feature request detection
  if (
    descriptionLower.includes("feature") ||
    descriptionLower.includes("request") ||
    descriptionLower.includes("add") ||
    descriptionLower.includes("implement")
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
    } else if (
      url.includes("violevault.com") ||
      url.includes("production") ||
      !url.includes("localhost")
    ) {
      labels.push("live-environment");
    }
  }

  // App version analysis for branch detection
  if (reportEnv?.appVersion) {
    const version = reportEnv.appVersion.toLowerCase();
    if (
      version.includes("dev") ||
      version.includes("preview") ||
      version.includes("staging") ||
      version.includes("alpha") ||
      version.includes("beta")
    ) {
      labels.push("dev-build");
    } else {
      labels.push("production-build");
    }
  }

  // Remove duplicates and return
  return [...new Set(labels)];
}

/**
 * Create GitHub issue using the GitHub API
 */
async function createGitHubIssue(data, env) {
  const { description, screenshotUrl, sessionUrl, env: reportEnv } = data;

  // Build issue body with all available information
  // Parse line breaks into checklist items if description contains line breaks or list indicators
  let processedDescription = description;

  // Very lenient parsing - trigger on ANY line breaks (single \n or multiple)
  const shouldParse =
    description.includes("\n") ||
    description.includes("- ") ||
    description.includes("* ") ||
    description.includes("• ") ||
    /^\d+\./m.test(description);

  if (shouldParse) {
    // Convert multi-line descriptions into GitHub checklist format
    const lines = description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0); // Remove empty lines

    // Always process if we have multiple non-empty lines, OR if single line has list indicators
    if (lines.length > 1) {
      const firstLine = lines[0];
      const remainingLines = lines.slice(1);

      processedDescription =
        `${firstLine}\n\n### Tasks/Steps:\n` +
        remainingLines
          .map((line) => {
            // Convert to checklist items - handle existing list formats
            if (
              line.startsWith("- ") ||
              line.startsWith("* ") ||
              line.startsWith("• ")
            ) {
              return `- [ ] ${line.substring(2).trim()}`;
            } else if (line.match(/^\d+\.\s*/)) {
              // Convert numbered list to checklist
              return `- [ ] ${line.replace(/^\d+\.\s*/, "")}`;
            } else {
              // Convert plain text lines to checklist items
              return `- [ ] ${line}`;
            }
          })
          .join("\n");
    } else if (
      lines.length === 1 &&
      (lines[0].includes("- ") ||
        lines[0].includes("* ") ||
        lines[0].includes("• ") ||
        /^\d+\./.test(lines[0]))
    ) {
      // Handle single line with list indicators - split on list markers
      const line = lines[0];
      let parts = [];

      if (line.includes("- ")) {
        parts = line.split("- ").filter((p) => p.trim().length > 0);
      } else if (line.includes("* ")) {
        parts = line.split("* ").filter((p) => p.trim().length > 0);
      } else if (line.includes("• ")) {
        parts = line.split("• ").filter((p) => p.trim().length > 0);
      }

      if (parts.length > 1) {
        const firstPart = parts[0].trim();
        const remainingParts = parts.slice(1);

        processedDescription =
          `${firstPart}\n\n### Tasks/Steps:\n` +
          remainingParts.map((part) => `- [ ] ${part.trim()}`).join("\n");
      }
    }
  }

  let issueBody = `## Bug Report\n\n${processedDescription}\n\n`;

  // Add user location prominently at the top
  if (reportEnv?.pageContext) {
    issueBody += `## 📍 User Location\n`;
    issueBody += `**Page:** ${reportEnv.pageContext.page || "unknown"}\n`;
    issueBody += `**Screen:** ${reportEnv.pageContext.screenTitle || "Unknown"}\n`;
    issueBody += `**URL:** ${reportEnv.url}\n`;

    if (
      reportEnv.pageContext.visibleModals &&
      reportEnv.pageContext.visibleModals.length > 0
    ) {
      issueBody += `**Active Modal(s):** ${reportEnv.pageContext.visibleModals.join(", ")}\n`;
    }

    if (reportEnv.pageContext.userLocation) {
      issueBody += `**Context:** ${reportEnv.pageContext.userLocation}\n`;
    }

    issueBody += `\n`;
  } else if (reportEnv?.url) {
    issueBody += `## 📍 User Location\n`;
    issueBody += `**URL:** ${reportEnv.url}\n\n`;
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

    issueBody += `- **User Agent:** ${reportEnv.userAgent}\n`;
    issueBody += `- **Viewport:** ${reportEnv.viewport}\n`;
    issueBody += `- **Timestamp:** ${reportEnv.timestamp}\n`;

    // Add enhanced page context information
    if (reportEnv.pageContext) {
      issueBody += `\n## Page Context\n`;
      issueBody += `- **Current Page:** ${reportEnv.pageContext.page || "unknown"}\n`;
      issueBody += `- **Screen Title:** ${reportEnv.pageContext.screenTitle || "Unknown"}\n`;
      issueBody += `- **Document Title:** ${reportEnv.pageContext.documentTitle || "N/A"}\n`;

      if (
        reportEnv.pageContext.visibleModals &&
        reportEnv.pageContext.visibleModals.length > 0
      ) {
        issueBody += `- **Active Modals:** ${reportEnv.pageContext.visibleModals.join(", ")}\n`;
      }

      if (
        reportEnv.pageContext.activeButtons &&
        reportEnv.pageContext.activeButtons.length > 0
      ) {
        issueBody += `- **Available Actions:** ${reportEnv.pageContext.activeButtons.slice(0, 3).join(", ")}\n`;
      }

      if (
        reportEnv.pageContext.componentHints &&
        reportEnv.pageContext.componentHints.length > 0
      ) {
        issueBody += `- **Component Hints:** ${reportEnv.pageContext.componentHints.join(", ")}\n`;
      }
    }

    // Add device/connection info if available
    if (reportEnv.windowSize) {
      issueBody += `- **Screen Size:** ${reportEnv.windowSize}\n`;
    }
    if (reportEnv.devicePixelRatio) {
      issueBody += `- **Device Pixel Ratio:** ${reportEnv.devicePixelRatio}\n`;
    }
    if (reportEnv.connectionType && reportEnv.connectionType !== "unknown") {
      issueBody += `- **Connection Type:** ${reportEnv.connectionType}\n`;
    }

    // Add enhanced context information
    if (reportEnv.colorScheme) {
      issueBody += `- **Color Scheme:** ${reportEnv.colorScheme}\n`;
    }
    if (reportEnv.timezone) {
      issueBody += `- **Timezone:** ${reportEnv.timezone}\n`;
    }

    // Add geographic location context if available
    if (reportEnv.language) {
      issueBody += `- **Language:** ${reportEnv.language}\n`;
    }
    if (reportEnv.locale) {
      issueBody += `- **Locale:** ${reportEnv.locale}\n`;
    }
    if (reportEnv.touchSupport !== undefined) {
      issueBody += `- **Touch Support:** ${reportEnv.touchSupport ? "Yes" : "No"}\n`;
    }
    if (reportEnv.standaloneMode !== undefined) {
      issueBody += `- **PWA Mode:** ${reportEnv.standaloneMode ? "Standalone" : "Browser"}\n`;
    }

    // Add browser performance info
    if (reportEnv.browserInfo) {
      issueBody += `\n## Browser Performance\n`;
      if (
        reportEnv.browserInfo.memory &&
        typeof reportEnv.browserInfo.memory === "object"
      ) {
        issueBody += `- **JS Memory Usage:** ${reportEnv.browserInfo.memory.usedJSHeapSize} / ${reportEnv.browserInfo.memory.totalJSHeapSize}\n`;
      }
      if (reportEnv.browserInfo.hardwareConcurrency) {
        issueBody += `- **CPU Cores:** ${reportEnv.browserInfo.hardwareConcurrency}\n`;
      }
      if (reportEnv.browserInfo.onLine !== undefined) {
        issueBody += `- **Online Status:** ${reportEnv.browserInfo.onLine ? "Online" : "Offline"}\n`;
      }
    }

    // Add storage information
    if (reportEnv.storageInfo) {
      issueBody += `\n## Storage Info\n`;
      if (reportEnv.storageInfo.localStorage && !reportEnv.storageInfo.error) {
        issueBody += `- **Local Storage:** ${reportEnv.storageInfo.localStorage} (${reportEnv.storageInfo.localStorageItems} items)\n`;
      }
      if (
        reportEnv.storageInfo.sessionStorage &&
        !reportEnv.storageInfo.error
      ) {
        issueBody += `- **Session Storage:** ${reportEnv.storageInfo.sessionStorage} (${reportEnv.storageInfo.sessionStorageItems} items)\n`;
      }
      if (reportEnv.storageInfo.error) {
        issueBody += `- **Storage Access:** ${reportEnv.storageInfo.error}\n`;
      }
    }

    // Add DOM state information
    if (reportEnv.domInfo) {
      issueBody += `\n## DOM State\n`;
      if (reportEnv.domInfo.scrollPosition) {
        issueBody += `- **Scroll Position:** x:${reportEnv.domInfo.scrollPosition.x}, y:${reportEnv.domInfo.scrollPosition.y}\n`;
      }
      if (reportEnv.domInfo.documentDimensions) {
        issueBody += `- **Document Size:** ${reportEnv.domInfo.documentDimensions.width}x${reportEnv.domInfo.documentDimensions.height}px\n`;
      }
      if (reportEnv.domInfo.focusedElement) {
        issueBody += `- **Focused Element:** ${reportEnv.domInfo.focusedElement.tagName}${reportEnv.domInfo.focusedElement.id ? `#${reportEnv.domInfo.focusedElement.id}` : ""}${reportEnv.domInfo.focusedElement.type ? ` (${reportEnv.domInfo.focusedElement.type})` : ""}\n`;
      }
    }

    // Add performance timing if available
    if (
      reportEnv.performanceInfo &&
      Array.isArray(reportEnv.performanceInfo) &&
      reportEnv.performanceInfo.length > 0
    ) {
      issueBody += `\n## Performance Timing\n`;
      reportEnv.performanceInfo.forEach((info) => {
        issueBody += `- ${info}\n`;
      });
    }

    issueBody += `\n`;
  }

  // Add session replay link
  if (sessionUrl) {
    issueBody += `## Session Replay\n[View session replay](${sessionUrl})\n\n`;
  }

  // Add screenshot
  if (screenshotUrl) {
    issueBody += `## Screenshot\n![Screenshot](${screenshotUrl})\n\n`;
  }

  issueBody += `---\n*This issue was automatically created from a bug report submitted via the VioletVault app.*`;

  // Generate smart labels and get milestone info
  const smartLabels = await generateSmartLabels(description, reportEnv);
  console.log(`Generated smart labels: ${JSON.stringify(smartLabels)}`);
  
  const milestoneInfo = await getMilestones(env);
  console.log(`Milestone info: ${JSON.stringify({ success: milestoneInfo.success, current: milestoneInfo.current?.title })}`);

  // Prepare issue data
  const issueData = {
    title: `Bug Report: ${description.substring(0, 80)}${description.length > 80 ? "..." : ""}`,
    body: issueBody,
    labels: smartLabels,
  };

  // Add milestone if available
  if (milestoneInfo.success && milestoneInfo.current) {
    // Find the milestone by title match from GitHub API response
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/milestones?state=open`,
      {
        headers: {
          Authorization: `token ${env.GITHUB_TOKEN}`,
          "User-Agent": "VioletVault-BugReporter/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    
    if (response.ok) {
      const allMilestones = await response.json();
      const targetMilestone = allMilestones.find(
        (m) => m.title === milestoneInfo.current.title,
      );
      if (targetMilestone) {
        issueData.milestone = targetMilestone.number;
        console.log(`Assigned bug report to milestone: ${targetMilestone.title} (#${targetMilestone.number})`);
      } else {
        console.log(`Milestone not found: ${milestoneInfo.current.title}`);
      }
    } else {
      console.log('Failed to fetch milestones for assignment');
    }
  } else {
    console.log('No milestone info available for bug report assignment');
  }

  // Create the GitHub issue
  console.log(`Creating GitHub issue with data: ${JSON.stringify({
    title: issueData.title,
    labels: issueData.labels,
    milestone: issueData.milestone,
    hasScreenshot: !!screenshotUrl
  })}`);
  
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VioletVault-BugReporter/1.0",
      },
      body: JSON.stringify(issueData),
    },
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}

/**
 * Send notification webhook (optional - for Slack, Discord, etc.)
 */
async function sendNotification(data, env) {
  if (!env.NOTIFICATION_WEBHOOK) return;

  try {
    const payload = {
      text: `🐛 New bug report received`,
      attachments: [
        {
          color: "#ff6b6b",
          fields: [
            {
              title: "Description",
              value:
                data.description.substring(0, 200) +
                (data.description.length > 200 ? "..." : ""),
              short: false,
            },
            {
              title: "GitHub Issue",
              value: `<${data.githubIssueUrl}|View Issue>`,
              short: true,
            },
            {
              title: "Session Replay",
              value: data.sessionUrl
                ? `<${data.sessionUrl}|View Session>`
                : "Not available",
              short: true,
            },
          ],
        },
      ],
    };

    await fetch(env.NOTIFICATION_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}
