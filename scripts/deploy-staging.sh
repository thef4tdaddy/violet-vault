#!/usr/bin/env bash

# VioletVault Staging Deployment Script
# For testing before production deployment

set -e

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🧪 VioletVault Staging Deployment${NC}"
echo -e "${BLUE}==================================${NC}"

# Check if we're on develop branch (preferred) or allow other branches for testing
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" == "develop" ]; then
  echo -e "${GREEN}✅ Staging deployment from develop branch${NC}"
elif [ "$current_branch" == "main" ]; then
  echo -e "${YELLOW}⚠️  Staging deployment from main branch${NC}"
  echo -e "${YELLOW}💡 Consider using production deployment script instead${NC}"
  read -p "🔹 Continue with staging deployment from main? (y/n): " continue_anyway
  if [ "$continue_anyway" != "y" ]; then
    echo -e "${RED}❌ Deployment canceled${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Staging deployment from feature branch: '$current_branch'${NC}"
  echo -e "${YELLOW}💡 Recommended: Deploy from develop branch${NC}"
  read -p "🔹 Continue with feature branch deployment? (y/n): " continue_anyway
  if [ "$continue_anyway" != "y" ]; then
    echo -e "${RED}❌ Deployment canceled${NC}"
    exit 1
  fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}❌ You have uncommitted changes. Please commit them first.${NC}"
  git status --short
  exit 1
fi

# Auto-format and fix common issues
echo -e "${YELLOW}🎨 Running auto-formatting and lint fixes...${NC}"
npm run format
npm run lint:fix

# Check if formatting created changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${YELLOW}📝 Auto-formatting made changes. Committing...${NC}"
  git add .
  git commit -m "style: auto-fix formatting and lint issues for staging deployment"
fi

# Run quality checks
echo -e "${YELLOW}🧪 Running quality checks...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ ESLint failed. Fix remaining issues.${NC}"
  exit 1
fi

# Create staging build
echo -e "${YELLOW}🔨 Creating staging build...${NC}"
npm run build:staging
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Staging build failed${NC}"
  exit 1
fi

# Validate build
echo -e "${YELLOW}🔍 Validating staging build...${NC}"
if [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ Build validation failed: index.html not found${NC}"
  exit 1
fi

build_size=$(du -sh dist | cut -f1)
echo -e "${GREEN}📦 Staging build size: ${build_size}${NC}"

# Create staging tag
echo -e "${YELLOW}🏷️  Creating staging tag...${NC}"
staging_time=$(date +%Y%m%d-%H%M%S)
version=$(node -p "require('./package.json').version")
staging_tag="v${version}-staging-${staging_time}"
git tag "$staging_tag" -m "Staging deployment - ${staging_time}"

echo -e "${GREEN}✅ Staging deployment prepared${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo -e "${YELLOW}1. Upload contents of 'dist/' directory to staging server${NC}"
echo -e "${YELLOW}2. Test all critical functionality on staging${NC}"
echo -e "${YELLOW}3. Run manual testing checklist${NC}"
echo -e "${YELLOW}4. If successful, proceed with production deployment${NC}"
echo ""
echo -e "${BLUE}🏷️  Staging tag: ${staging_tag}${NC}"
echo -e "${BLUE}🌟 Branch: ${current_branch}${NC}"
echo ""
echo -e "${GREEN}🎉 Staging deployment ready!${NC}"

# Offer to start preview server
echo ""
read -p "🔹 Start local preview server? (y/n): " start_preview
if [ "$start_preview" = "y" ]; then
  echo -e "${BLUE}🌐 Starting preview server...${NC}"
  echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
  npm run preview:staging
fi