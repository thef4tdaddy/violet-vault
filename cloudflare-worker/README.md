# VioletVault Bug Reporter - Cloudflare Worker

This Cloudflare Worker handles bug reports submitted from the VioletVault application, automatically creating GitHub issues and optionally storing screenshots.

## 📚 API Documentation

**Complete API documentation is available in:**

- **[API.md](./API.md)** - Full API reference with examples
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification
- **[Swagger Editor](https://editor.swagger.io/)** - Interactive API explorer

## Quick Start

1. **Install Wrangler CLI:**

```bash
npm install -g wrangler
wrangler login
```

2. **Deploy the worker:**

```bash
npm run deploy
```

3. **Configure environment variables** in Cloudflare Dashboard:
   - `GITHUB_TOKEN`: Personal access token with Issues write permission
   - `GITHUB_REPO`: Repository in format "username/repo-name"
   - `R2_PUBLIC_DOMAIN`: Custom domain for R2 screenshots (optional)
   - `NOTIFICATION_WEBHOOK`: Slack/Discord webhook URL (optional)

## Files

- **`bug-report-worker.js`** - Main worker code
- **`wrangler.toml`** - Worker configuration
- **`package.json`** - Dependencies and scripts
- **`README.md`** - This file

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

This worker provides 5 main endpoints:

1. **POST /report-issue** - Submit bug reports (main endpoint)
2. **POST /cleanup** - Clean up old screenshots (admin only)
3. **GET /stats** - Get usage statistics (admin only)
4. **GET /milestones** - Fetch GitHub milestones
5. **GET /releases** - Fetch release information

For complete endpoint documentation, examples, and request/response schemas, see **[API.md](./API.md)**.

### Quick Example: POST /report-issue

```bash
curl -X POST http://localhost:8787/report-issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "App crashes on envelope creation",
    "description": "Detailed description",
    "screenshot": "data:image/png;base64,..."
  }'
```

See [API.md](./API.md) for all available fields and response formats.

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

## License

MIT - See main project LICENSE file.
