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

    // Support workers deployed behind a path prefix
    // e.g. https://api.example.com/bug-report/report-issue
    // by stripping optional /bug-report prefix before routing
    const pathname = url.pathname.replace(/^\/bug-report/, "");

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Route handling
    if (pathname === "/cleanup" && request.method === "POST") {
      const result = await cleanupOldScreenshots(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pathname === "/stats" && request.method === "GET") {
      const result = await getUsageStats(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pathname === "/milestones" && request.method === "GET") {
      const result = await getMilestones(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pathname === "/releases" && request.method === "GET") {
      const result = await getReleasePleaseInfo(env);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default route: bug report submission
    if (pathname === "/report-issue" || pathname === "/" || pathname === "") {
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
    screenshotUrl = await storeScreenshot(screenshot, env);
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
      : "1.6.1";

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

    // Current milestone is the lowest numbered open one
    const currentMilestone = processedMilestones[0];

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
 * Create GitHub issue using the GitHub API
 */
async function createGitHubIssue(data, env) {
  const { description, screenshotUrl, sessionUrl, env: reportEnv } = data;

  // Build issue body with all available information
  let issueBody = `## Bug Report\n\n${description}\n\n`;

  // Add environment information
  if (reportEnv) {
    issueBody += `## Environment\n`;
    issueBody += `- **App Version:** ${reportEnv.appVersion}\n`;
    issueBody += `- **URL:** ${reportEnv.url}\n`;
    issueBody += `- **User Agent:** ${reportEnv.userAgent}\n`;
    issueBody += `- **Viewport:** ${reportEnv.viewport}\n`;
    issueBody += `- **Timestamp:** ${reportEnv.timestamp}\n\n`;
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

  // Create the GitHub issue
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VioletVault-BugReporter/1.0",
      },
      body: JSON.stringify({
        title: `Bug Report: ${description.substring(0, 80)}${description.length > 80 ? "..." : ""}`,
        body: issueBody,
        labels: ["bug", "user-reported"],
      }),
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
