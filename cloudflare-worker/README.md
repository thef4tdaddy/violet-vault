# VioletVault Bug Reporter - Cloudflare Worker

This Cloudflare Worker handles bug reports submitted from the VioletVault application, automatically creating GitHub issues and optionally storing screenshots.

**Note:** This worker is written in TypeScript and uses Wrangler's built-in TypeScript compilation for type safety and better developer experience.

## Quick Start

1. **Install Wrangler CLI:**

```bash
npm install -g wrangler
wrangler login
```

2. **Install dependencies:**

```bash
npm install
```

3. **Type check the worker:**

```bash
npm run typecheck
```

4. **Deploy the worker:**

```bash
npm run deploy
```

5. **Configure environment variables** in Cloudflare Dashboard:
   - `GITHUB_TOKEN`: Personal access token with Issues write permission
   - `GITHUB_REPO`: Repository in format "username/repo-name"
   - `R2_PUBLIC_DOMAIN`: Custom domain for R2 screenshots (optional)
   - `NOTIFICATION_WEBHOOK`: Slack/Discord webhook URL (optional)

## Files

- **`bug-report-worker.ts`** - Main worker code (TypeScript)
- **`tsconfig.json`** - TypeScript configuration for Cloudflare Workers
- **`wrangler.toml`** - Worker configuration
- **`package.json`** - Dependencies and scripts
- **`README.md`** - This file

## TypeScript Support

This worker is written in TypeScript for improved type safety and developer experience:

- **Type definitions:** Full type coverage for all functions and data structures
- **Cloudflare Workers types:** Uses `@cloudflare/workers-types` for platform-specific types
- **Type checking:** Run `npm run typecheck` to validate types before deployment
- **Build:** Wrangler automatically compiles TypeScript during deployment

### Type Checking

```bash
# Check types without deploying
npm run typecheck

# Build and dry-run deployment (includes type checking)
npm run build
```

## Environment Variables

### Required

| Variable       | Description                  | Example                 |
| -------------- | ---------------------------- | ----------------------- |
| `GITHUB_TOKEN` | GitHub personal access token | `ghp_xxxxxxxxxxxx`      |
| `GITHUB_REPO`  | Repository name              | `username/violet-vault` |

### Optional

| Variable               | Description                   | Example                       |
| ---------------------- | ----------------------------- | ----------------------------- |
| `R2_PUBLIC_DOMAIN`     | Custom domain for screenshots | `cdn.your-domain.com`         |
| `NOTIFICATION_WEBHOOK` | Webhook for notifications     | `https://hooks.slack.com/...` |

## API Endpoints

### POST /report-issue

Accepts bug reports and creates GitHub issues.

**Request Body:**

```json
{
  "description": "Bug description",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "sessionUrl": "https://app.highlight.io/sessions/...",
  "env": {
    "userAgent": "Mozilla/5.0...",
    "url": "https://app.violetVault.com/dashboard",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "appVersion": "1.6.1",
    "viewport": "1920x1080",
    "referrer": "https://app.violetVault.com"
  }
}
```

**Response:**

```json
{
  "success": true,
  "issueNumber": 123,
  "issueUrl": "https://github.com/username/repo/issues/123",
  "screenshotUrl": "https://cdn.your-domain.com/screenshots/..."
}
```

## Development

### Local Development

```bash
npm run dev
```

### Testing

```bash
curl -X POST http://localhost:8787/report-issue \
  -H "Content-Type: application/json" \
  -d '{"description":"Test bug report"}'
```

### View Logs

```bash
npm run tail
```

## Deployment

### Staging

```bash
npm run deploy
```

### Production

```bash
npm run deploy:production
```

### Using Deployment Script

From the project root:

```bash
./scripts/deploy-bug-reporter.sh production
```

## Configuration

### Custom Domains

Update `wrangler.toml` routes section:

```toml
[env.production]
routes = [
  "https://api.your-domain.com/bug-report/*"
]
```

### R2 Storage

Configure R2 bucket for screenshot storage:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "violet-vault-screenshots"
```

## Monitoring

- **Analytics**: Cloudflare Dashboard → Workers → Analytics
- **Logs**: `wrangler tail` or Cloudflare Dashboard
- **Errors**: Monitor GitHub API rate limits

## Security

- Store sensitive variables in Cloudflare environment (never in code)
- Use fine-grained GitHub tokens with minimal permissions
- Implement rate limiting for production
- Consider CORS restrictions for production domains

## Troubleshooting

### Common Issues

**1. CORS Errors**

- Check CORS headers in worker response
- Verify frontend domain is allowed

**2. GitHub API Errors**

- Verify token permissions
- Check API rate limits
- Ensure repository exists and is accessible

**3. R2 Upload Failures**

- Check R2 bucket permissions
- Verify R2_PUBLIC_DOMAIN configuration
- Check file size limits

### Debug Commands

```bash
# Test worker endpoint
curl -X POST https://your-worker.workers.dev/report-issue \
  -H "Content-Type: application/json" \
  -d '{"description":"test"}'

# Test GitHub token
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/username/repo

# View worker logs
wrangler tail

# Check worker status
wrangler dev
```

## Migration from JavaScript

If you previously deployed the JavaScript version of this worker:

1. Pull the latest changes from the repository
2. Install dependencies: `npm install`
3. Run type checking: `npm run typecheck`
4. Deploy the updated worker: `npm run deploy`

The TypeScript version is functionally identical to the JavaScript version. Wrangler handles all compilation automatically - no configuration changes needed beyond updating `wrangler.toml` to point to the `.ts` file (already done in the repository).

## License

MIT - See main project LICENSE file.
