# Bug Report System Setup Guide

This guide covers the complete setup of the VioletVault bug report system with Cloudflare Workers, GitHub Issues API integration, and Highlight.io session replay.

## Overview

The bug report system consists of:
- **Frontend**: Floating bug report button with screenshot capability
- **Backend**: Cloudflare Worker for processing reports
- **Storage**: Cloudflare R2 for screenshot hosting (optional)
- **Integration**: Automatic GitHub issue creation
- **Session Replay**: Highlight.io integration for debugging

## Prerequisites

1. **GitHub Account** with repository access
2. **Cloudflare Account** with Workers enabled
3. **Highlight.io Account** (already configured)
4. **Domain** for worker routing (optional but recommended)

## Step 1: GitHub Setup

### 1.1 Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Generate new token with these permissions:
   - **Repository permissions** for your VioletVault repo:
     - Issues: Write
     - Metadata: Read
     - Pull requests: Read (optional)
3. Copy the token (you'll need it for Cloudflare Worker)

### 1.2 Verify Repository Settings

Ensure your repository has Issues enabled:
1. Go to your repository
2. Settings → General → Features
3. Ensure "Issues" is checked

## Step 2: Cloudflare R2 Setup (Optional)

If you want to store screenshots:

### 2.1 Create R2 Bucket

1. Go to Cloudflare Dashboard → R2 Object Storage
2. Create bucket named: `violet-vault-screenshots`
3. Configure public access (optional) or use custom domain

### 2.2 Configure Custom Domain (Recommended)

1. R2 → Settings → Connect Domain
2. Add custom domain (e.g., `cdn.your-domain.com`)
3. Configure DNS records as instructed

## Step 3: Cloudflare Worker Setup

### 3.1 Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 3.2 Deploy Worker

1. Copy the worker files to your project:
```bash
# From your project root
mkdir -p cloudflare-worker
# Copy the provided bug-report-worker.js and wrangler.toml files
```

2. Update `wrangler.toml` with your settings:
```toml
name = "violet-vault-bug-reporter"
# Update routes for your domain
# Configure R2 bucket name if using
```

3. Deploy the worker:
```bash
cd cloudflare-worker
wrangler deploy
```

### 3.3 Configure Environment Variables

In Cloudflare Dashboard → Workers → Your Worker → Settings → Variables:

**Required Variables:**
- `GITHUB_TOKEN`: Your GitHub personal access token
- `GITHUB_REPO`: Your repository in format "username/repo-name"

**Optional Variables:**
- `R2_PUBLIC_DOMAIN`: Your R2 custom domain (if using screenshots)
- `NOTIFICATION_WEBHOOK`: Slack/Discord webhook for notifications

**Example Configuration:**
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=yourusername/violet-vault
R2_PUBLIC_DOMAIN=cdn.your-domain.com
NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/...
```

## Step 4: Frontend Configuration

### 4.1 Update Environment Variables

Update your environment files with the worker endpoints:

**`.env.development`:**
```env
VITE_BUG_REPORT_ENDPOINT=https://violet-vault-bug-reporter.your-username.workers.dev/report-issue
```

**`.env.production`:**
```env
VITE_BUG_REPORT_ENDPOINT=https://violet-vault-bug-reporter.your-domain.workers.dev/report-issue
```

**`.env.staging`:**
```env
VITE_BUG_REPORT_ENDPOINT=https://violet-vault-bug-reporter-staging.your-domain.workers.dev/report-issue
```

### 4.2 Custom Domain Setup (Production)

For production, configure custom routes in `wrangler.toml`:

```toml
[env.production]
routes = [
  "https://api.your-domain.com/bug-report/*"
]
```

Then update production environment:
```env
VITE_BUG_REPORT_ENDPOINT=https://api.your-domain.com/bug-report/report-issue
```

## Step 5: Testing the System

### 5.1 Local Testing

1. Start your development server:
```bash
npm run dev
```

2. Open the app and click the floating bug report button (red bug icon)
3. Submit a test report with screenshot
4. Check browser console for submission logs

### 5.2 Worker Testing

Test the worker directly:
```bash
curl -X POST https://your-worker.workers.dev/report-issue \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test bug report",
    "env": {
      "userAgent": "Test Browser",
      "url": "https://test.com",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "appVersion": "1.6.1",
      "viewport": "1920x1080"
    }
  }'
```

### 5.3 Verify GitHub Integration

1. Submit a test bug report
2. Check your GitHub repository's Issues tab
3. Verify the issue was created with correct labels
4. Check that screenshot (if included) displays correctly

## Step 6: Production Deployment

### 6.1 Update Production Environment

Ensure production `.env.production` has correct endpoint URL

### 6.2 Deploy Worker to Production

```bash
cd cloudflare-worker
wrangler deploy --env production
```

### 6.3 Configure DNS (If Using Custom Domain)

Add CNAME record pointing to your worker:
```
api.your-domain.com CNAME violet-vault-bug-reporter.your-username.workers.dev
```

## Step 7: Monitoring and Maintenance

### 7.1 Monitor Worker Logs

```bash
wrangler tail --env production
```

### 7.2 Check Error Rates

Monitor in Cloudflare Dashboard → Workers → Analytics

### 7.3 Update GitHub Token

GitHub tokens expire. Update in Cloudflare Dashboard when needed.

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure worker includes proper CORS headers
- Check if frontend URL is whitelisted

**2. GitHub API Rate Limits**
- Monitor GitHub API rate limits
- Consider using GitHub App instead of personal token for higher limits

**3. Screenshot Upload Failures**
- Check R2 bucket permissions
- Verify R2_PUBLIC_DOMAIN is correctly configured
- Consider implementing retry logic

**4. Worker Deployment Issues**
- Verify wrangler.toml configuration
- Check account permissions
- Ensure all required environment variables are set

### Debug Steps

1. **Check Worker Logs:**
```bash
wrangler tail
```

2. **Test Worker Directly:**
```bash
curl -X POST https://your-worker.workers.dev/report-issue \
  -H "Content-Type: application/json" \
  -d '{"description":"test"}'
```

3. **Verify Environment Variables:**
Check in Cloudflare Dashboard that all variables are set

4. **Test GitHub Token:**
```bash
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/username/repo/issues
```

## Security Considerations

### 1. GitHub Token Security
- Use fine-grained tokens with minimal permissions
- Rotate tokens regularly
- Store securely in Cloudflare environment variables

### 2. Screenshot Privacy
- Screenshots may contain sensitive financial data
- Consider implementing screenshot sanitization
- Use private R2 buckets with signed URLs

### 3. Rate Limiting
- Implement rate limiting to prevent abuse
- Consider implementing authentication for production

### 4. CORS Configuration
- Restrict CORS to your domain in production
- Avoid using wildcard (*) in production

## Advanced Configuration

### Slack/Discord Notifications

Add webhook URL to environment variables:
```env
NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

The worker will automatically send notifications for new bug reports.

### Custom Issue Templates

Modify the `createGitHubIssue` function in `bug-report-worker.js` to customize the GitHub issue format.

### Screenshot Processing

Implement image optimization in the worker:
- Resize large screenshots
- Convert to optimal formats
- Add watermarks or privacy blurring

## Cost Considerations

### Cloudflare Workers
- 100,000 requests/day on free tier
- $0.50 per million requests above free tier

### Cloudflare R2
- 10GB storage free
- $0.015/GB-month above free tier
- No egress charges

### GitHub API
- 5,000 requests/hour for authenticated requests
- Consider GitHub Apps for higher limits

## Maintenance Checklist

**Monthly:**
- [ ] Review worker analytics
- [ ] Check GitHub API rate limit usage
- [ ] Verify screenshot storage costs
- [ ] Test bug report functionality

**Quarterly:**
- [ ] Rotate GitHub tokens
- [ ] Review and clean old screenshots
- [ ] Update worker dependencies
- [ ] Review error logs and improve error handling

## Support

If you encounter issues:

1. Check Cloudflare Worker logs
2. Verify GitHub token permissions
3. Test endpoints manually with curl
4. Review environment variable configuration

For additional support, refer to:
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Highlight.io Documentation](https://www.highlight.io/docs)