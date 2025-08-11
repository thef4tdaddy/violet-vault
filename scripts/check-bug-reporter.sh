#!/bin/bash

# VioletVault Bug Reporter Diagnostic Script
# Helps check and configure Cloudflare Worker secrets

echo "🔍 VioletVault Bug Reporter Diagnostic"
echo "======================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install: npm install -g wrangler"
    exit 1
fi

# Get worker name
WORKER_NAME="violet-vault-bug-reporter"

echo "📋 Checking worker secrets for: $WORKER_NAME"

# List current secrets (this will show secret names but not values)
echo ""
echo "Current secrets:"
wrangler secret list --name $WORKER_NAME

echo ""
echo "🔧 To fix the GitHub API 404 error, you need to set these secrets:"
echo "   1. GITHUB_REPO should be: thef4tdaddy/violet-vault"
echo "   2. GITHUB_TOKEN should be a valid GitHub personal access token"
echo ""
echo "Run these commands to set the secrets:"
echo "   wrangler secret put GITHUB_REPO --name $WORKER_NAME"
echo "   wrangler secret put GITHUB_TOKEN --name $WORKER_NAME"
echo ""
echo "When prompted:"
echo "   - For GITHUB_REPO: enter 'thef4tdaddy/violet-vault'"
echo "   - For GITHUB_TOKEN: enter your GitHub personal access token"
echo ""
echo "💡 To create a GitHub token:"
echo "   1. Go to https://github.com/settings/tokens"
echo "   2. Create a new token with 'repo' scope"
echo "   3. Copy the token and use it for GITHUB_TOKEN secret"

echo ""
echo "🧪 Testing current endpoint..."
ENDPOINT_URL="https://violet-vault-bug-reporter.fragrant-fog-c708.workers.dev/report-issue"
curl -s -X POST "$ENDPOINT_URL" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test diagnostic","env":{"userAgent":"diagnostic","url":"test","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}}' \
  | jq '.' || echo "Response not valid JSON"