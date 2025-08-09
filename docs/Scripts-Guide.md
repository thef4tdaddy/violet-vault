# VioletVault Scripts Guide

## 🛠️ Overview

This document provides comprehensive guidance for using VioletVault's development and deployment scripts. All scripts have been updated to work with the new branch protection workflow: **feature branches → develop → main**.

## 📂 Available Scripts

### **Development Scripts**

#### **🌿 Branch Management**

##### **`scripts/create-branch.sh`**

Creates feature branches with proper naming conventions.

**Usage:**

```bash
./scripts/create-branch.sh
```

**Interactive Prompts:**

- **Branch Type:** `feat`, `fix`, `style`, `perf`, `docs`, `chore`
- **Description:** Brief kebab-case description

**Examples:**

- `feat/user-authentication`
- `fix/login-validation-error`
- `style/mobile-responsive-layout`

**Workflow Integration:**

- Creates branches from current location (preferably `develop`)
- Automatically pushes new branch to origin
- Provides next steps guidance for PR workflow

---

##### **`scripts/rebase-super-script`**

Automated rebasing with commit validation and squashing.

**Usage:**

```bash
./scripts/rebase-super-script
```

**Smart Target Selection:**

- **Feature branches** → rebase onto `develop`
- **Develop branch** → rebase onto `main`
- **Main branch** → prevents self-rebase

**Process:**

1. Runs Prettier and ESLint auto-fixes
2. Commits any formatting changes
3. Fetches latest target branch
4. Performs interactive rebase
5. Validates conventional commit messages
6. Squashes local commits if needed
7. Force-pushes with `--force-with-lease`

---

##### **`scripts/clean-branches`**

Cleans up merged branches and stale remote references.

**Usage:**

```bash
./scripts/clean-branches
```

**Actions:**

- Deletes local branches merged into `main`
- Prunes remote-tracking branches
- Skips protected branches (`main`, current branch)

---

### **Deployment Scripts**

#### **🧪 Staging Deployment**

##### **`scripts/deploy-staging.sh`**

Deploys to staging environment with quality checks.

**Usage:**

```bash
./scripts/deploy-staging.sh
```

**Branch Support:**

- **Recommended:** Deploy from `develop` branch
- **Allowed:** Deploy from `main` (with warning)
- **Testing:** Deploy from feature branches (with confirmation)

**Process:**

1. Branch validation and confirmation
2. Auto-formatting and lint fixes
3. Commits formatting changes if needed
4. Runs quality checks (lint, build)
5. Creates staging build
6. Validates build output
7. Creates staging tag
8. Offers local preview server

---

#### **🚀 Production Deployment**

##### **`scripts/deploy-production.sh`**

Production-ready deployment with comprehensive safety checks.

**Usage:**

```bash
./scripts/deploy-production.sh
```

**Requirements:**

- **Must be on `main` branch**
- **No uncommitted changes**
- **Local main must be up-to-date with origin**

**Process:**

1. Strict branch and state validation
2. Creates deployment backup tag
3. Runs comprehensive quality checks
4. Validates code formatting
5. Runs tests (if available)
6. Creates production build
7. Validates build integrity
8. Creates deployment and backup tags
9. Provides deployment instructions
10. Offers to push tags to remote
11. Cleans up old backup tags

---

### **Advanced Scripts**

#### **🎯 Deployment Manager**

##### **`scripts/deploy.js`**

Comprehensive deployment management system.

**Usage:**

```bash
node scripts/deploy.js [environment]
```

**Environments:**

- `development` - Local development deployment
- `staging` - Staging environment deployment
- `production` - Production deployment

**Features:**

- Branch validation per environment
- Pre-deployment safety checks
- Quality gate enforcement
- Build validation and integrity checks
- Environment-specific configurations
- Post-deployment validation checklist

---

#### **🔄 Rollback Manager**

##### **`scripts/rollback.js`**

Emergency rollback procedures for deployment issues.

**Usage:**

```bash
node scripts/rollback.js [target]
```

**Rollback Targets:**

- `commit` - Rollback to specific commit
- `tag` - Rollback to tagged version
- `backup` - Rollback from backup files

**Safety Features:**

- Creates rollback snapshots
- Validates rollback targets
- Provides rollback confirmation
- Documents rollback procedures

---

#### **💾 Data Management**

##### **`scripts/backup-data.js`**

User data backup utility with instructions.

**Usage:**

```bash
node scripts/backup-data.js
```

**Features:**

- Generates backup instructions for localStorage data
- Creates timestamped backup directories
- Manages backup retention (keeps last 10)
- Provides manual backup guidance
- Lists existing backups with dates

---

## 🔧 VS Code Integration

All scripts are integrated into VS Code tasks for easy access:

### **Quick Access Tasks:**

- `Ctrl+Shift+P` → "Tasks: Run Task"
- Select from categorized script tasks

### **Key Tasks:**

- **🌿 Create Branch** - Interactive branch creation
- **🔄 Rebase Branch** - Automated rebase workflow
- **🧹 Clean Branches** - Branch cleanup
- **🧪 Deploy Staging** - Staging deployment
- **🚀 Deploy Production** - Production deployment
- **🎯 Deploy Manager** - Advanced deployment options
- **🔄 Rollback Manager** - Emergency rollback
- **💾 Backup Data** - Data backup utility

### **Composite Tasks:**

- **✨ Format & Lint** - Code quality checks
- **🚢 Full Deploy Staging** - Complete staging workflow
- **🎯 Full Deploy Production** - Complete production workflow
- **🔧 Pre-commit Checks** - Pre-commit validation

---

## 🌊 Workflow Integration

### **Feature Development Workflow:**

```bash
# 1. Create feature branch
./scripts/create-branch.sh
# → Choose: feat/new-authentication-system

# 2. Work on feature, commit changes
git add .
git commit -m "feat: implement user authentication system"

# 3. Rebase onto develop before PR
./scripts/rebase-super-script
# → Automatically rebases feat/new-authentication-system onto develop

# 4. Create PR: feat/new-authentication-system → develop
gh pr create --base develop --title "feat: implement user authentication system"

# 5. After merge, clean up
./scripts/clean-branches
```

### **Release Workflow:**

```bash
# 1. Deploy to staging for testing
git checkout develop
./scripts/deploy-staging.sh

# 2. Test staging deployment thoroughly

# 3. Create release PR: develop → main
gh pr create --base main --title "release: v1.8.0 - Cash Management Features"

# 4. After PR merge, deploy production
git checkout main
git pull origin main
./scripts/deploy-production.sh
```

### **Emergency Rollback:**

```bash
# If production issues occur
node scripts/rollback.js commit
# → Interactive rollback to previous stable commit
```

---

## ⚙️ Configuration

### **Script Permissions:**

```bash
# Make scripts executable (if needed)
chmod +x scripts/*.sh
```

### **Dependencies:**

- **GitHub CLI** (`gh`) - For GitHub operations
- **Node.js** - For JavaScript scripts
- **npm** - For package management
- **Git** - For version control operations

### **Environment Setup:**

All scripts work with the current repository setup and respect:

- Branch protection rules
- Commit message conventions
- Quality gate requirements
- Deployment environment configurations

---

## 🚨 Safety Features

### **Branch Protection Compliance:**

- Scripts respect main branch protection rules
- Only allowed commit types can be pushed to main
- Develop branch workflow enforced
- PR-only access to main branch

### **Quality Gates:**

- Automatic code formatting with Prettier
- ESLint validation and auto-fixes
- Build validation before deployment
- Commit message convention enforcement

### **Backup & Recovery:**

- Automatic backup tags before deployments
- Rollback procedures for emergencies
- Data backup utilities for user data
- Git history preservation

### **Interactive Confirmations:**

- Branch validation warnings
- Deployment environment confirmations
- Destructive operation confirmations
- Clear process guidance and next steps

---

## 📚 Best Practices

### **Branch Naming:**

- Use conventional prefixes: `feat/`, `fix/`, `style/`, `perf/`, `docs/`, `chore/`
- Keep descriptions concise and kebab-case
- Reflect the actual work being done

### **Commit Messages:**

- Follow conventional commits specification
- Use imperative mood: "add feature" not "added feature"
- Reference issues when applicable: "fix: resolve #123 login error"

### **Deployment Strategy:**

- Always test on staging before production
- Use feature flags for risky changes
- Deploy during low-traffic periods
- Have rollback plan ready

### **Script Usage:**

- Run scripts from repository root
- Ensure clean working directory before major operations
- Review script output and confirmations
- Keep scripts updated with workflow changes

---

## 🔗 Related Documentation

- [Branch Protection Rules](./Branch-Protection-Rules.md) - Complete workflow documentation
- [VSCode Tasks Guide](./VSCode-Tasks-Guide.md) - VS Code integration details
- [Development Guide](./Development-Guide.md) - General development practices
- [Testing Strategy](./Testing-Strategy.md) - Testing and quality assurance

---

## 🆘 Troubleshooting

### **Common Issues:**

#### **Permission Denied**

```bash
chmod +x scripts/*.sh
```

#### **Branch Protection Violations**

- Check commit message format
- Ensure you're on correct source branch
- Verify PR targets correct branch

#### **Script Dependencies Missing**

```bash
# Install GitHub CLI
brew install gh

# Authenticate with GitHub
gh auth login
```

#### **Deployment Failures**

- Check build logs for errors
- Verify environment configurations
- Ensure dependencies are installed
- Review quality gate failures

---

**Last Updated:** August 5, 2025  
**Version:** 2.0.0 - Updated for new branch protection workflow
