#!/usr/bin/env bash

# VioletVault Production Deployment Script
# Integrates with existing workflow and safety checks

set -e

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🚀 VioletVault Production Deployment${NC}"
echo -e "${BLUE}====================================${NC}"

# Check if we're on main branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo -e "${RED}❌ Production deployments must be from 'main' branch. Current: '$current_branch'${NC}"
  echo -e "${YELLOW}💡 Switch to main or use staging deployment instead${NC}"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}❌ You have uncommitted changes. Please commit them first.${NC}"
  exit 1
fi

# Ensure we're up to date with remote
echo -e "${YELLOW}📥 Fetching latest changes...${NC}"
git fetch origin

# Check if local main is behind remote
if ! git diff --quiet HEAD origin/main; then
  echo -e "${RED}❌ Your local main is behind origin/main. Please pull first.${NC}"
  echo -e "${YELLOW}💡 Run: git pull origin main${NC}"
  exit 1
fi

# Final confirmation
echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
echo -e "${YELLOW}📋 This will:${NC}"
echo -e "${YELLOW}   1. Run quality checks (lint, format)${NC}"
echo -e "${YELLOW}   2. Create production build${NC}"
echo -e "${YELLOW}   3. Create backup point${NC}"
echo -e "${YELLOW}   4. Deploy to production${NC}"
echo ""
read -p "🔹 Continue with production deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Deployment canceled${NC}"
  exit 0
fi

# Create deployment backup point
echo -e "${YELLOW}💾 Creating deployment backup...${NC}"
deployment_time=$(date +%Y%m%d-%H%M%S)
git tag "deploy-backup-${deployment_time}" -m "Backup before production deployment ${deployment_time}"

# Run quality checks
echo -e "${YELLOW}🧪 Running quality checks...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ ESLint failed. Fix issues before deployment.${NC}"
  exit 1
fi

npm run format:check
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}🎨 Auto-fixing formatting...${NC}"
  npm run format
  echo -e "${RED}❌ Code formatting was not up to date. Changes applied.${NC}"
  echo -e "${RED}   Please review, commit, and re-run deployment.${NC}"
  exit 1
fi

# Run tests if available
if npm run test:manual > /dev/null 2>&1; then
  echo -e "${YELLOW}🧪 Running tests...${NC}"
  npm run test:manual
fi

# Create production build
echo -e "${YELLOW}🔨 Creating production build...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Production build failed${NC}"
  exit 1
fi

# Validate build
echo -e "${YELLOW}🔍 Validating build...${NC}"
if [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ Build validation failed: index.html not found${NC}"
  exit 1
fi

build_size=$(du -sh dist | cut -f1)
echo -e "${GREEN}📦 Build size: ${build_size}${NC}"

# Create deployment tag
echo -e "${YELLOW}🏷️  Creating deployment tag...${NC}"
version=$(node -p "require('./package.json').version")
deployment_tag="v${version}-prod-${deployment_time}"
git tag "$deployment_tag" -m "Production deployment v${version} - ${deployment_time}"

echo -e "${GREEN}✅ Pre-deployment checks complete${NC}"
echo -e "${BLUE}📤 Ready for deployment upload${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo -e "${YELLOW}1. Upload contents of 'dist/' directory to production server${NC}"
echo -e "${YELLOW}2. Verify deployment at production URL${NC}"
echo -e "${YELLOW}3. Run post-deployment checks${NC}"
echo -e "${YELLOW}4. Monitor error rates and performance${NC}"
echo ""
echo -e "${BLUE}🏷️  Deployment tag: ${deployment_tag}${NC}"
echo -e "${BLUE}💾 Backup tag: deploy-backup-${deployment_time}${NC}"
echo ""
echo -e "${GREEN}🎉 Production deployment prepared successfully!${NC}"

# Ask if user wants to push tags
echo ""
read -p "🔹 Push deployment tags to remote? (y/n): " push_tags
if [ "$push_tags" = "y" ]; then
  git push origin "$deployment_tag"
  git push origin "deploy-backup-${deployment_time}"
  echo -e "${GREEN}✅ Tags pushed to remote${NC}"
fi

# Clean up old backup tags (keep last 10)
echo -e "${YELLOW}🧹 Cleaning up old backup tags...${NC}"
old_backup_tags=$(git tag -l "deploy-backup-*" | sort -r | tail -n +11)
if [ -n "$old_backup_tags" ]; then
  echo "$old_backup_tags" | xargs git tag -d
  echo -e "${GREEN}✅ Cleaned up old backup tags${NC}"
fi