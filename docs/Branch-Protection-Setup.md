# Branch Protection Setup for VioletVault

## Overview

Setting up branch protection ensures that production code in `main` branch cannot be accidentally modified or broken, providing safety for production users.

## GitHub Branch Protection Rules

### Main Branch Protection

Configure the following protection rules for the `main` branch:

#### Required Settings

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1 (you can approve your own PRs)
  - [x] Dismiss stale PR approvals when new commits are pushed
  - [x] Require review from code owners (optional)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - [x] ESLint check
    - [x] Build successful
    - [x] All tests pass (when implemented)

- [x] **Require conversation resolution before merging**
  - Ensures all PR discussions are resolved

- [x] **Require signed commits** (optional but recommended)

- [x] **Require linear history**
  - Prevents merge commits, keeps history clean

#### Administrative Controls

- [x] **Include administrators**
  - Even repo admins must follow these rules
- [x] **Allow force pushes**: ❌ DISABLED
  - Prevents accidental overwrites
- [x] **Allow deletions**: ❌ DISABLED
  - Prevents accidental branch deletion

### Develop Branch Protection (Optional)

Less strict rules for the integration branch:

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1
- [x] **Require status checks to pass before merging**
  - [x] Build successful
  - [x] ESLint passes

## Setting Up Branch Protection

### Via GitHub Web Interface

1. Go to repository settings
2. Click "Branches" in left sidebar
3. Click "Add rule" next to "Branch protection rules"
4. Enter branch name pattern: `main`
5. Configure protection settings as listed above
6. Click "Create" to save

### Via GitHub CLI (if available)

```bash
# Protect main branch
gh api repos/thef4tdaddy/violet-vault/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["eslint","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Workflow Impact

### Before Branch Protection

```bash
git checkout main
git push origin main  # ❌ This will now be blocked
```

### After Branch Protection

```bash
# Correct workflow
git checkout develop
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature

# Create PR: feature/my-feature → develop
# After review, merge to develop

# When ready for production:
# Create PR: develop → main
# Must pass all checks and get approval before merge
```

## Required Checks Setup

### ESLint Check

Add to GitHub Actions workflow:

```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint
```

### Build Check

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: "18"
    - run: npm ci
    - run: npm run build
```

## Emergency Override

### Hotfix Process

For critical production issues:

1. **Create hotfix branch from main**

   ```bash
   git checkout main
   git checkout -b hotfix/critical-issue
   ```

2. **Make minimal fix**

   ```bash
   # Fix the critical issue
   git commit -m "hotfix: fix critical issue"
   git push origin hotfix/critical-issue
   ```

3. **Create urgent PR**
   - Mark as urgent/critical
   - Get immediate review
   - Merge as soon as checks pass

4. **Backport to develop**
   ```bash
   git checkout develop
   git cherry-pick <hotfix-commit-hash>
   git push origin develop
   ```

### Administrative Override (Last Resort)

If absolutely necessary, repository admins can:

1. Temporarily disable branch protection
2. Make emergency changes
3. Re-enable protection immediately
4. Document the override reason

## Benefits of Branch Protection

### Production Safety

- Prevents accidental direct pushes to main
- Ensures all changes are reviewed
- Guarantees builds pass before merge
- Maintains code quality standards

### Development Quality

- Forces proper workflow adoption
- Encourages thorough testing
- Creates audit trail of changes
- Enables rollback if needed

### Collaboration

- Ensures knowledge sharing through PRs
- Documents decision-making process
- Provides discussion platform for changes
- Maintains team awareness

## Notifications

### PR Reviews

- Set up notifications for PR creation
- Configure review request notifications
- Enable status check notifications

### Branch Status

- Monitor protection rule compliance
- Track failed status checks
- Alert on force push attempts

## Best Practices

### PR Creation

- Always create meaningful PR titles
- Include description of changes
- Reference related issues
- Add testing notes

### Code Reviews

- Review for functionality
- Check for security issues
- Verify testing coverage
- Ensure documentation updates

### Merge Strategy

- Use "Squash and merge" for clean history
- Write clear merge commit messages
- Delete feature branches after merge
- Tag releases appropriately

## Monitoring

### Regular Checks

- Review branch protection settings monthly
- Audit successful/failed merges
- Monitor bypass attempts
- Update rules as needed

### Metrics

- Track PR review time
- Monitor failed status checks
- Measure deployment frequency
- Assess hotfix frequency

Last Updated: 2025-08-01
Version: 1.0.0
