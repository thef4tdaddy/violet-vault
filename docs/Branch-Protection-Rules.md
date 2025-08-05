# VioletVault Branch Protection & Workflow Rules

## 🛡️ Overview

This document outlines the branch protection rules, workflow configurations, and development conventions for the VioletVault repository. These rules ensure code quality, maintain clean commit history, and enforce proper development workflow.

## 📋 Table of Contents

- [Branch Structure](#branch-structure)
- [Branch Protection Rules](#branch-protection-rules)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Rules](#pull-request-rules)
- [Workflow Automation](#workflow-automation)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

---

## 🌳 Branch Structure

### **Main Branches:**

- **`main`** - Production-ready code, protected with strict rules
- **`develop`** - Integration branch for all feature development

### **Supporting Branches:**

- **`feat/*`** - Feature development branches
- **`fix/*`** - Bug fix branches
- **`style/*`** - UI/styling improvements
- **`perf/*`** - Performance optimizations
- **`docs/*`** - Documentation updates

---

## 🛡️ Branch Protection Rules

### **Main Branch (`main`)**

#### **Protection Settings:**

- ✅ **Branch protection enabled**
- ✅ **Require status checks before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Restrict pushes that create files**
- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**
- ✅ **Include administrators**

#### **Required Status Checks:**

- `check-commits` - Validates commit message format
- `test` - Runs CI pipeline (lint, build, test)
- `block-unapproved-prs` - Ensures PRs only come from `develop`

#### **Direct Commit Restrictions:**

Only these commit types are allowed directly to `main`:

```bash
fix:       # Bug fixes and error corrections
docs:      # Documentation updates
chore(main): # Maintenance tasks specific to main branch
ci:        # CI/CD configuration changes
revert:    # Reverting previous commits
```

#### **Pull Request Restrictions:**

- ❌ **Feature branches cannot PR directly to `main`**
- ✅ **Only `develop` branch can create PRs to `main`**

### **Develop Branch (`develop`)**

#### **Protection Settings:**

- ✅ **Branch protection enabled**
- ✅ **Require status checks before merging**
- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**
- ❌ **Administrators can bypass** (for emergency fixes)

#### **Required Status Checks:**

- `check-commits` - Validates commit message format

#### **Allowed Commit Types:**

```bash
fix:       # Bug fixes
docs:      # Documentation updates
style:     # UI/UX improvements, styling changes
perf:      # Performance optimizations
ci:        # CI/CD configuration changes
revert:    # Reverting previous commits
```

---

## 📝 Commit Message Conventions

We follow **Conventional Commits** specification with specific prefixes:

### **Format:**

```
<type>: <description>

[optional body]

[optional footer(s)]
```

### **Allowed Types:**

| Type          | Scope                    | Description                     | Example                                 |
| ------------- | ------------------------ | ------------------------------- | --------------------------------------- |
| `feat`        | Feature branches only    | New features or enhancements    | `feat: add dark mode toggle`            |
| `fix`         | All branches             | Bug fixes and error corrections | `fix: resolve login validation error`   |
| `docs`        | All branches             | Documentation updates           | `docs: update API documentation`        |
| `style`       | Develop/feature branches | UI/UX, CSS, formatting changes  | `style: improve button hover effects`   |
| `perf`        | Develop/feature branches | Performance improvements        | `perf: optimize chart rendering`        |
| `ci`          | All branches             | CI/CD pipeline changes          | `ci: update GitHub Actions workflow`    |
| `revert`      | All branches             | Reverting previous commits      | `revert: undo feature X implementation` |
| `chore(main)` | Main branch only         | Maintenance tasks for main      | `chore(main): update dependencies`      |

### **Guidelines:**

- **Use lowercase** for type and description
- **Be descriptive** but concise (50-72 characters)
- **Use imperative mood** ("add" not "added")
- **Reference issues** when applicable: `fix: resolve #123 login error`

---

## 🔀 Pull Request Rules

### **Target Branch Rules:**

#### **To `main` branch:**

- ✅ **Source must be `develop`**
- ✅ **Must pass all status checks**
- ✅ **Auto-formatting must be applied**
- ✅ **Build must succeed**
- ❌ **Direct PRs from feature branches are blocked**

#### **To `develop` branch:**

- ✅ **Feature branches can PR to develop**
- ✅ **Must pass commit message validation**
- ✅ **Auto-formatting applied**
- ✅ **Build must succeed**

### **Status Check Requirements:**

#### **For `main` PRs:**

1. **`check-commits`** - All commits follow conventional format
2. **`test`** - CI pipeline passes (lint + build)
3. **`block-unapproved-prs`** - Source branch is `develop`

#### **For `develop` PRs:**

1. **`check-commits`** - All commits follow conventional format

---

## ⚙️ Workflow Automation

### **CI Workflows:**

#### **Main Branch CI** (`.github/workflows/ci.yml`)

- **Triggers:** Push to `main`, PRs to `main`
- **Jobs:**
  - Install dependencies (`npm ci`)
  - Auto-format code (`npm run format`)
  - Commit formatting changes if needed
  - Lint code (`npm run lint`)
  - Build application (`npm run build`)
  - Verify build output

#### **Develop Branch CI** (`.github/workflows/ci-develop.yml`)

- **Triggers:** Push to `develop`, PRs to `develop`
- **Jobs:** Same as main branch CI

#### **Commit Validation Workflows:**

#### **Main Branch Validation** (`.github/workflows/restrict-commits-on-main.yml`)

- **Triggers:** Push to `main`, PRs to `main`
- **Validation:** Only allows `fix:`, `docs:`, `chore(main):`, `ci:`, `revert:`
- **Action:** Blocks invalid commits with detailed error messages

#### **Develop Branch Validation** (`.github/workflows/restrict-commits-on-develop.yml`)

- **Triggers:** Push to `develop`, PRs to `develop`
- **Validation:** Allows `fix:`, `docs:`, `style:`, `perf:`, `ci:`, `revert:`
- **Action:** Blocks invalid commits with detailed error messages

#### **PR Source Validation** (`.github/workflows/block-pr-not-from-develop.yml`)

- **Triggers:** PRs to `main`
- **Validation:** Ensures PR source is `develop` branch
- **Action:** Blocks PRs from feature branches with guidance

---

## 🔄 Development Workflow

### **Standard Feature Development:**

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name

# 2. Develop your feature
git add .
git commit -m "feat: add user authentication system"

# 3. Push feature branch
git push origin feat/your-feature-name

# 4. Create PR: feat/your-feature-name → develop
# 5. After PR approval and merge, delete feature branch
```

### **Release Process:**

```bash
# 1. Create PR: develop → main
# 2. PR automatically triggers:
#    - Commit validation
#    - CI pipeline
#    - Build verification
# 3. After approval, merge to main
# 4. Main branch deployment triggers automatically
```

### **Hotfix Process:**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b fix/critical-bug

# 2. Fix the issue
git add .
git commit -m "fix: resolve critical authentication bug"

# 3. Option A: Direct to main (if urgent)
git push origin main

# 4. Option B: Through develop (recommended)
git checkout develop
git merge fix/critical-bug
# Create PR: develop → main
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **"Branch protection rule violations" Error**

```
remote: error: GH013: Repository rule violations found for refs/heads/main
remote: - Required status check "check-commits" is expected
```

**Solution:** Your commit message doesn't follow the allowed format for the target branch.

**For main branch:**

- ✅ Use: `fix:`, `docs:`, `chore(main):`, `ci:`, `revert:`
- ❌ Avoid: `feat:`, `style:`, `perf:`, etc.

**For develop branch:**

- ✅ Use: `fix:`, `docs:`, `style:`, `perf:`, `ci:`, `revert:`
- ❌ Avoid: `feat:` (use feature branches instead)

#### **"Pull request blocked" Error**

```
🚫 Only pull requests from the 'develop' branch are allowed to merge into 'main'
```

**Solution:**

1. Merge your changes to `develop` first
2. Create PR from `develop` to `main`

#### **Status Check Failures**

**`check-commits` failing:**

- Review commit messages in your PR
- Ensure all commits follow conventional format
- Amend or rewrite commits if needed

**`test` failing:**

- Check CI logs for lint errors
- Fix any build failures
- Ensure all tests pass

### **Emergency Procedures:**

#### **Bypass Protection (Admin Only):**

For critical production fixes, administrators can:

1. Temporarily disable branch protection
2. Push emergency fix directly to main
3. Re-enable branch protection
4. Create follow-up PR to document changes

---

## 📚 Examples

### **Correct Commit Messages:**

#### **For Main Branch:**

```bash
✅ fix: resolve user authentication timeout issue
✅ docs: update deployment instructions
✅ chore(main): update production dependencies to v2.1.0
✅ ci: add automated security scanning workflow
✅ revert: undo problematic caching implementation
```

#### **For Develop Branch:**

```bash
✅ fix: correct form validation logic
✅ docs: add component usage examples
✅ style: improve responsive layout for mobile devices
✅ perf: optimize database query performance
✅ ci: update test automation scripts
✅ revert: undo experimental feature flag
```

#### **For Feature Branches:**

```bash
✅ feat: implement user profile management system
✅ feat: add real-time notifications
✅ feat: integrate third-party payment gateway
```

### **Incorrect Commit Messages:**

```bash
❌ Add new feature                    # Missing type prefix
❌ feat: new login system            # feat: not allowed on main
❌ Fix bug                           # Should be "fix: description"
❌ style: update main layout         # style: not allowed on main
❌ FEAT: add user system             # Should be lowercase
❌ chore: update deps                # Should be "chore(main):" for main
```

### **Branch Flow Examples:**

#### **Feature Development:**

```bash
develop
├── feat/user-authentication    → PR to develop
├── feat/dashboard-redesign     → PR to develop
├── style/mobile-improvements   → PR to develop
└── develop                     → PR to main (release)
```

#### **Release Flow:**

```bash
feat/new-feature → develop → main → production
     ↓               ↓        ↓         ↓
   Feature PR    Release PR  Deploy   Live
```

---

## 🔗 Related Documentation

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [VioletVault Development Guide](./Development-Guide.md)
- [VioletVault Testing Strategy](./Testing-Strategy.md)

---

## 📞 Support

If you encounter issues with branch protection rules or need clarification:

1. **Check this documentation** for common solutions
2. **Review the workflow logs** in GitHub Actions
3. **Contact the development team** for rule modifications
4. **Create an issue** for documentation improvements

---

**Last Updated:** August 5, 2025  
**Document Version:** 1.0.0
