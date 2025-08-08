/**
 * Cloudflare Worker for handling VioletVault bug reports
 * Receives bug reports from the frontend and creates GitHub issues
 * Stores screenshots in R2 and sends notifications
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      // Parse the bug report data
      const bugReport = await request.json();
      
      // Validate required fields
      if (!bugReport.description) {
        return new Response(JSON.stringify({ 
          error: 'Description is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process the bug report
      const result = await processBugReport(bugReport, env);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Bug report processing failed:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
  const githubIssue = await createGitHubIssue({
    description,
    screenshotUrl,
    sessionUrl,
    env: reportEnv,
  }, env);
  
  // Send notification (optional)
  if (env.NOTIFICATION_WEBHOOK) {
    await sendNotification({
      description,
      screenshotUrl,
      sessionUrl,
      githubIssueUrl: githubIssue.html_url,
    }, env);
  }
  
  return {
    success: true,
    issueNumber: githubIssue.number,
    issueUrl: githubIssue.html_url,
    screenshotUrl,
  };
}

/**
 * Store screenshot in Cloudflare R2
 */
async function storeScreenshot(screenshotDataUrl, env) {
  if (!env.R2_BUCKET) {
    console.warn('R2_BUCKET not configured, skipping screenshot storage');
    return null;
  }
  
  try {
    // Extract base64 data from data URL
    const base64Data = screenshotDataUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bug-reports/screenshot-${timestamp}-${Math.random().toString(36).substring(7)}.png`;
    
    // Store in R2
    await env.R2_BUCKET.put(filename, imageBuffer, {
      httpMetadata: {
        contentType: 'image/png',
      },
    });
    
    // Return public URL (adjust based on your R2 setup)
    return `https://${env.R2_PUBLIC_DOMAIN}/${filename}`;
  } catch (error) {
    console.error('Failed to store screenshot:', error);
    return null;
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
  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'VioletVault-BugReporter/1.0',
    },
    body: JSON.stringify({
      title: `Bug Report: ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`,
      body: issueBody,
      labels: ['bug', 'user-reported'],
    }),
  });
  
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
      attachments: [{
        color: '#ff6b6b',
        fields: [
          {
            title: 'Description',
            value: data.description.substring(0, 200) + (data.description.length > 200 ? '...' : ''),
            short: false,
          },
          {
            title: 'GitHub Issue',
            value: `<${data.githubIssueUrl}|View Issue>`,
            short: true,
          },
          {
            title: 'Session Replay',
            value: data.sessionUrl ? `<${data.sessionUrl}|View Session>` : 'Not available',
            short: true,
          },
        ],
      }],
    };
    
    await fetch(env.NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}