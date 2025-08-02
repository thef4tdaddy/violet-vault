# VioletVault Production Deployment Guide

## Overview

This document outlines the production-ready development and deployment workflow for VioletVault, designed to ensure stability for production users while allowing safe development.

## Branch Strategy

### Branch Structure

```
main        → Production-ready code (your wife uses this)
develop     → Integration branch for testing features
feature/*   → Individual feature development
bugfix/*    → Bug fixes from develop
hotfix/*    → Emergency production fixes (from main)
```

### Branch Rules

- **main**: Only production-ready, thoroughly tested code
- **develop**: All new features merge here first
- **feature/**: Branch from develop, merge back to develop
- **hotfix/**: Branch from main for emergency fixes, merge to both main and develop

## Environment Configuration

### Environment Files

- `.env.development` - Development settings with debug enabled
- `.env.staging` - Pre-production testing environment
- `.env.production` - Production settings with optimizations

### Key Environment Variables

```bash
VITE_APP_ENV=production|staging|development
VITE_HIGHLIGHT_PROJECT_ID=your-project-id
VITE_DEBUG_MODE=true|false
VITE_VERBOSE_LOGGING=true|false
```

## Development Workflow

### 1. Starting New Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
```

### 2. Development Process

```bash
# Work on feature
npm run dev  # Runs in development mode

# Test thoroughly
npm run lint
npm run format
npm run build:dev
```

### 3. Integration to Develop

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/feature-name

# Create PR: feature/feature-name → develop
# After review and approval, merge to develop
```

### 4. Testing on Develop

```bash
git checkout develop
git pull origin develop
npm run dev:staging  # Test in staging mode
npm run build:staging
```

### 5. Production Release

```bash
# Only when develop is stable and tested
# Create PR: develop → main
# After thorough review, merge to main
git checkout main
git pull origin main
npm run build  # Production build
```

## Deployment Commands

### Development

```bash
npm run dev                # Development server
npm run build:dev          # Development build
```

### Staging

```bash
npm run dev:staging        # Staging server
npm run build:staging      # Staging build
npm run deploy:staging     # Deploy to staging
```

### Production

```bash
npm run build              # Production build
npm run deploy:production  # Deploy to production
```

## Testing Checklist

### Before Merging to Develop

- [ ] Feature works in development mode
- [ ] No console errors or warnings
- [ ] ESLint passes (npm run lint)
- [ ] Code formatted (npm run format)
- [ ] Manual testing of core functionality

### Before Merging to Main

- [ ] Feature tested on develop branch
- [ ] Staging build successful
- [ ] Manual testing on staging environment
- [ ] All critical user flows tested
- [ ] Performance acceptable
- [ ] No data corruption issues
- [ ] Error monitoring shows no new critical errors

## Deployment Safety

### Data Backup

- Automatic backup before deployments
- Local storage backup via `npm run backup:data`
- Manual export functionality available to users

### Rollback Procedure

1. Keep previous working build
2. Monitor error rates after deployment
3. Quick rollback if issues detected
4. Document any rollback reasons

### Monitoring

- Highlight.io/Sentry for error tracking
- Performance monitoring
- User feedback channels

## Emergency Procedures

### Hotfix Process

```bash
git checkout main
git checkout -b hotfix/critical-fix
# Make minimal fix
git commit -m "hotfix: critical issue description"
git push origin hotfix/critical-fix

# Create PR to main for immediate deploy
# After deploy, merge hotfix to develop as well
```

### Production Issues

1. Assess severity
2. If critical: deploy hotfix immediately
3. If non-critical: fix in develop, schedule next release
4. Always communicate with production users

## Communication

### Release Notes

- Document all changes
- Highlight breaking changes
- Provide migration steps if needed

### User Communication

- Notify before major updates
- Provide maintenance windows for significant changes
- Document known issues and workarounds

## Scripts and Automation

### Available Scripts

```json
{
  "dev": "Development server",
  "dev:staging": "Staging development server",
  "build": "Production build",
  "build:staging": "Staging build",
  "deploy:staging": "Deploy to staging",
  "deploy:production": "Deploy to production",
  "backup:data": "Backup user data",
  "test:manual": "Manual testing checklist"
}
```

## File Structure

```
violet-vault/
├── docs/                    # All documentation
├── scripts/                 # Deployment and utility scripts
├── .env.development         # Development environment
├── .env.staging            # Staging environment
├── .env.production         # Production environment
└── src/                    # Application source
```

Last Updated: 2025-08-01
Version: 1.0.0
