# Environment Configuration for VioletVault Backend

This file documents the environment variables required for the backend services.

## Required Environment Variables

### GitHub Bug Report API

#### GITHUB_TOKEN
**Required**: Yes  
**Type**: String  
**Description**: GitHub Personal Access Token for creating issues  
**Scope Required**: `public_repo` or `repo`  
**Where to Set**:
- Vercel Dashboard → Project Settings → Environment Variables
- Local testing: Create `.env.local` (DO NOT COMMIT)

**How to Create**:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scope: `repo` (for private repos) or `public_repo` (for public repos only)
4. Copy token and add to Vercel

**Example**:
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Optional Environment Variables

### VITE_API_BASE_URL
**Required**: No  
**Type**: String  
**Default**: `/api`  
**Description**: Base URL for backend API endpoints  
**Where to Set**: `.env.development`, `.env.production`

**Examples**:
```bash
# Development (local Vercel dev server)
VITE_API_BASE_URL=http://localhost:3000/api

# Production (Vercel deployment)
VITE_API_BASE_URL=/api  # Or leave unset to use default
```

## Environment Files

### `.env.development` (for local development)
```bash
# Frontend development server
VITE_API_BASE_URL=http://localhost:3000/api
```

### `.env.production` (for production builds)
```bash
# Production API endpoint (usually relative)
VITE_API_BASE_URL=/api
```

### `.env.local` (for local testing - NOT COMMITTED)
```bash
# GitHub token for local backend testing
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Override API URL if needed
VITE_API_BASE_URL=http://localhost:3000/api
```

## Vercel Configuration

### Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GITHUB_TOKEN` | `ghp_xxx...` | Production, Preview |

### Scopes

- **Production**: Variables available in production deployments
- **Preview**: Variables available in preview deployments (PRs)
- **Development**: Variables available in local `vercel dev`

**Best Practice**: Set sensitive tokens only for Production and Preview, not Development.

## Security Best Practices

### DO ✅
- Store `GITHUB_TOKEN` in Vercel environment variables
- Use different tokens for production and development
- Rotate tokens periodically
- Use tokens with minimal required scopes
- Add `.env.local` to `.gitignore`

### DON'T ❌
- Commit `.env.local` or any file with secrets
- Share tokens in public repositories
- Use personal tokens with broad scopes
- Hardcode tokens in source code
- Store tokens in client-side code

## Testing Locally

To test backend functions locally with Vercel CLI:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Start local dev server:
```bash
vercel dev
```

5. Access endpoints:
- Bug Report: http://localhost:3000/api/bug-report
- Analytics: http://localhost:3000/api/analytics

## Troubleshooting

### "GitHub token not configured" error
- Check that `GITHUB_TOKEN` is set in Vercel environment variables
- Verify the token has correct permissions
- Redeploy after adding environment variables

### "Invalid token" error
- Token may have expired - generate a new one
- Token may not have required scope - regenerate with `repo` scope
- Token may be for wrong GitHub account

### Local development not working
- Ensure `.env.local` exists with `GITHUB_TOKEN`
- Run `vercel dev` instead of `npm run dev` for backend testing
- Check that `VITE_API_BASE_URL` points to correct local server

## CI/CD Configuration

For GitHub Actions workflows that need to test backend:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.BACKEND_GITHUB_TOKEN }}
```

**Note**: Use a separate secret for CI/CD, not your personal token.

## Monitoring

### Vercel Logs
View function logs in Vercel dashboard:
1. Go to Deployments
2. Click on a deployment
3. View Function Logs

### Local Logs
When running `vercel dev`, logs appear in terminal:
```bash
> Ready! Available at http://localhost:3000
> [POST] /api/bug-report - 200 OK (1234ms)
```

## Support

If you encounter issues with environment configuration:
1. Check Vercel deployment logs
2. Verify token permissions on GitHub
3. Test locally with `vercel dev`
4. Open an issue with error messages
