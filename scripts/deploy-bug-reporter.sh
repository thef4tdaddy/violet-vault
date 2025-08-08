#!/bin/bash

# VioletVault Bug Reporter Deployment Script
# This script helps deploy and configure the Cloudflare Worker for bug reporting

set -e  # Exit on any error

echo "🚀 VioletVault Bug Reporter Deployment Script"
echo "=============================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
    echo "✅ Wrangler installed"
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Get environment (default to staging)
ENVIRONMENT=${1:-staging}
echo "📦 Deploying to environment: $ENVIRONMENT"

# Check if cloudflare-worker directory exists
if [ ! -d "cloudflare-worker" ]; then
    echo "❌ cloudflare-worker directory not found!"
    echo "   Please ensure you have the worker files in the cloudflare-worker/ directory"
    exit 1
fi

cd cloudflare-worker

# Validate wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    echo "   Please ensure wrangler.toml exists in the cloudflare-worker/ directory"
    exit 1
fi

# Deploy the worker
echo "🔧 Deploying worker..."
if [ "$ENVIRONMENT" = "production" ]; then
    wrangler deploy --env production
else
    wrangler deploy
fi

echo "✅ Worker deployed successfully!"

# Get the worker URL
WORKER_NAME=$(grep "name = " wrangler.toml | sed 's/name = "\(.*\)"/\1/')
if [ "$ENVIRONMENT" = "production" ]; then
    WORKER_URL="https://$WORKER_NAME.your-domain.workers.dev"
else
    WORKER_URL="https://$WORKER_NAME.your-username.workers.dev"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Configure environment variables in Cloudflare Dashboard:"
echo "   - Go to Workers → $WORKER_NAME → Settings → Variables"
echo "   - Add GITHUB_TOKEN: your-github-personal-access-token"
echo "   - Add GITHUB_REPO: your-username/violet-vault"
echo "   - Add R2_PUBLIC_DOMAIN: your-r2-domain.com (optional)"
echo "   - Add NOTIFICATION_WEBHOOK: your-webhook-url (optional)"
echo ""
echo "2. Update your environment file (.env.$ENVIRONMENT):"
echo "   VITE_BUG_REPORT_ENDPOINT=$WORKER_URL/report-issue"
echo ""
echo "3. Test the deployment:"
echo "   curl -X POST $WORKER_URL/report-issue \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"description\":\"Test report\"}'"
echo ""
echo "🎉 Deployment complete! Check the full setup guide in docs/Bug-Report-System-Setup.md"

# Offer to open the Cloudflare dashboard
read -p "🌐 Open Cloudflare Workers dashboard to configure environment variables? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://dash.cloudflare.com/workers"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://dash.cloudflare.com/workers"
    else
        echo "Please open https://dash.cloudflare.com/workers manually"
    fi
fi