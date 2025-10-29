# VioletVault Bug Reporter API Documentation

## Overview

The VioletVault Bug Reporter API is a Cloudflare Worker that handles bug report submissions, screenshot storage, and GitHub integration for the VioletVault application.

## API Documentation

The complete API specification is available in OpenAPI 3.0 format:

- **OpenAPI Spec**: [`openapi.yaml`](./openapi.yaml)
- **Interactive Documentation**: Use [Swagger Editor](https://editor.swagger.io/) to view and test the API
- **Redoc Documentation**: [Generate docs with Redoc](https://github.com/Redocly/redoc)

## Quick Start

### View API Documentation

**Option 1: Swagger UI**
1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Load the [`openapi.yaml`](./openapi.yaml) file
3. Explore endpoints and test requests

**Option 2: Redoc (Recommended)**
```bash
npm install -g @redocly/cli
redoc-cli serve openapi.yaml
```

**Option 3: Local Development**
```bash
npm run dev  # Start the Cloudflare Worker locally
```

### API Base URL

- **Production**: `https://bug-reporter.violetvault.workers.dev`
- **Local Development**: `http://localhost:8787`

## Endpoints

### Bug Report Submission

#### POST /report-issue

Submit a bug report to create a GitHub issue with optional screenshot.

**Request:**
```bash
curl -X POST https://bug-reporter.violetvault.workers.dev/report-issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "App crashes on envelope creation",
    "description": "Detailed description of the issue",
    "severity": "high",
    "screenshot": "data:image/png;base64,iVBORw0KGgo...",
    "env": {
      "userAgent": "Mozilla/5.0...",
      "url": "https://app.violetvault.com/dashboard",
      "appVersion": "1.9.0"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "issueNumber": 123,
  "issueUrl": "https://github.com/thef4tdaddy/violet-vault/issues/123",
  "screenshotUrl": "https://cdn.violetvault.com/screenshots/abc123.png"
}
```

### Administrative Endpoints

#### POST /cleanup

Clean up screenshots older than 30 days (requires authentication).

**Request:**
```bash
curl -X POST https://bug-reporter.violetvault.workers.dev/cleanup \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "deleted": 15,
  "errors": 0,
  "message": "Cleanup completed successfully"
}
```

#### GET /stats

Get usage statistics (requires authentication).

**Request:**
```bash
curl https://bug-reporter.violetvault.workers.dev/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "totalReports": 150,
  "totalScreenshots": 120,
  "storageUsedMB": 45.3,
  "errorRate": 0.02,
  "lastReport": "2024-01-15T10:30:00Z"
}
```

### GitHub Integration

#### GET /milestones

Fetch active GitHub milestones.

**Request:**
```bash
curl https://bug-reporter.violetvault.workers.dev/milestones
```

**Response:**
```json
{
  "milestones": [
    {
      "number": 1,
      "title": "v2.0 - TypeScript Conversion",
      "state": "open",
      "dueOn": "2024-09-01T00:00:00Z",
      "openIssues": 15,
      "closedIssues": 32
    }
  ]
}
```

#### GET /releases

Fetch release information.

**Request:**
```bash
curl https://bug-reporter.violetvault.workers.dev/releases
```

**Response:**
```json
{
  "releases": [
    {
      "tagName": "v1.9.0",
      "name": "Version 1.9.0",
      "publishedAt": "2024-01-15T10:00:00Z",
      "htmlUrl": "https://github.com/thef4tdaddy/violet-vault/releases/tag/v1.9.0"
    }
  ]
}
```

## Request/Response Formats

### Bug Report Schema

```typescript
interface BugReport {
  title?: string;           // Bug report title
  description?: string;     // Detailed description (required if no title)
  steps?: string;          // Steps to reproduce
  expected?: string;       // Expected behavior
  actual?: string;         // Actual behavior
  severity?: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;     // Base64-encoded image (data URL)
  sessionUrl?: string;     // Highlight.io session URL
  env?: {
    userAgent?: string;
    url?: string;
    timestamp?: string;
    appVersion?: string;
    viewport?: string;
  };
  systemInfo?: {
    browser?: string;
    version?: string;
    os?: string;
    platform?: string;
  };
}
```

### Environment Info

The `env` field captures the application context:

```typescript
interface EnvironmentInfo {
  userAgent: string;       // Browser user agent
  url: string;            // Current page URL
  timestamp: string;      // ISO 8601 timestamp
  appVersion: string;     // App version (e.g., "1.9.0")
  viewport: string;       // Screen size (e.g., "1920x1080")
  referrer?: string;      // Previous page URL
  pageContext?: object;   // Additional context data
}
```

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "received": {
    "hasTitle": false,
    "hasDescription": false
  }
}
```

### HTTP Status Codes

- **200 OK**: Request successful
- **400 Bad Request**: Invalid request (missing required fields)
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Endpoint not found
- **405 Method Not Allowed**: Invalid HTTP method
- **500 Internal Server Error**: Server-side error

## Authentication

Administrative endpoints require authentication via API key:

```bash
Authorization: Bearer YOUR_API_KEY
```

The API key is configured in Cloudflare Worker environment variables.

## CORS Support

All endpoints support CORS with the following headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## Rate Limiting

Currently, no rate limiting is enforced. Consider implementing rate limiting for production deployments.

## Cron Jobs

The worker includes a scheduled cleanup job that runs periodically:

```javascript
async scheduled(controller, env) {
  // Runs screenshot cleanup automatically
  await cleanupOldScreenshots(env);
}
```

Configure the schedule in `wrangler.toml`:

```toml
[triggers]
crons = ["0 0 * * *"]  # Daily at midnight
```

## Environment Variables

Required environment variables:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx          # GitHub Personal Access Token
GITHUB_REPO=thef4tdaddy/violet-vault   # GitHub repository
R2_PUBLIC_DOMAIN=cdn.violetvault.com   # R2 public domain (optional)
NOTIFICATION_WEBHOOK=https://...        # Webhook URL (optional)
```

## Development

### Local Testing

Start the local development server:

```bash
npm run dev
```

Test endpoints locally:

```bash
# Submit test bug report
curl -X POST http://localhost:8787/report-issue \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Testing locally"}'

# Check stats
curl http://localhost:8787/stats
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy              # Deploy to staging
npm run deploy:production   # Deploy to production
```

### Testing

Run tests:

```bash
npm test  # Run unit tests (if configured)
```

## API Versioning

The current API version is `1.0.0`. Future breaking changes will increment the major version.

## Support

- **Issues**: [GitHub Issues](https://github.com/thef4tdaddy/violet-vault/issues)
- **Documentation**: [Main README](./README.md)
- **Discord**: [VioletVault Community](https://discord.gg/violetvault) *(if available)*

## License

This API is part of VioletVault and is licensed under CC-BY-NC-SA-4.0.

See [LICENSE](../LICENSE) for details.
