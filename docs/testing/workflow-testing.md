# Workflow Testing Guide

This guide documents the recently updated GitHub Actions workflows and how to test them.

## Updated Workflows

### 1. Bundle Size Monitor (`.github/workflows/bundle-size.yml`)

**Changes Made:**

- Fixed `build:nightly` → `build:staging` script reference
- Added baseline tracking: ~11.07 MB total, ~1.56 MB gzipped (measured 2026-01-14)
- Added 15% maximum growth threshold from baseline
- Enhanced PR comments with baseline comparison
- Fails CI if bundle exceeds baseline by >15% OR exceeds 250KB gzipped budget

**How to Test:**

1. Create a PR that targets `main` or `nightly` branch
2. Make a code change that affects bundle size
3. Verify workflow runs and posts a comment with:
   - Bundle size comparison (base vs PR)
   - Baseline comparison (baseline vs PR)
   - Status indicators (🟢/🟡/🔴)
   - Detailed chunk breakdown

**Expected Behavior:**

- Workflow runs on every PR to `main` or `nightly`
- Builds both PR and base branch for comparison
- Posts detailed bundle size report as PR comment
- Updates existing comment instead of creating new ones
- Fails if bundle exceeds 15% growth or 250KB gzipped limit

---

### 2. Issue Labeler (`.github/workflows/issue-labeler.yml`)

**Changes Made:**

- **Reduced keyword matches** to be more specific:
  - Before: "bug", "error", "broken" → Applied too broadly
  - After: "typeerror", "throws error", "crashes" → More precise
- **Stricter component labels**:
  - Before: "auth", "login" → Too generic
  - After: "authentication", "login page", "sign in" → Specific contexts
- **Stricter priority labels**:
  - Before: "critical", "urgent" → Applied too easily
  - After: "critical bug", "production down" → Requires strong context
- **Maximum 4 labels per issue** to prevent over-tagging

**How to Test:**

1. Create a test issue with title: "TypeError when clicking submit button"
2. Verify it gets labeled with `bug` (should match "typeerror")
3. Create another issue: "Add dark mode feature"
4. Verify it gets `enhancement` label (should match "add")
5. Create issue: "How do I export data?"
6. Verify it gets `question` label
7. Verify none get more than 4 labels total

**Expected Behavior:**

- New issues automatically get labeled based on content
- Labels are more specific and relevant
- Maximum 4 labels applied per issue
- Priority labels only applied when explicitly mentioned
- Console logs show which labels were applied and which were skipped

---

### 3. Auto-Approve Copilot Workflows (`.github/workflows/auto-approve-copilot-workflows.yml`)

**Changes Made:**

- Added debug step that outputs:
  - Event name
  - Actor
  - Branch
  - PR number and author
  - PR state

**How to Test:**

1. Create a PR from Copilot (or manually trigger with copilot user)
2. Check workflow run logs for debug output
3. Verify workflow only runs for copilot bot PRs
4. Check if workflows get auto-approved

**Expected Behavior:**

- Only runs for PRs from copilot bot users
- Debug info helps identify why workflow may skip
- Auto-approves pending workflow runs for Copilot PRs

**Note:** This workflow may show "skipped" if:

- PR is not from copilot bot
- No workflow runs are waiting for approval
- Permissions are insufficient

---

### 4. Recurring Milestone Docs (`.github/workflows/recurring-milestone-docs.yml`)

**Changes Made:**

- Updated checklist template to include:
  - Multi-language tooling verification (`full_salvo.sh`)
  - Release planning section
  - Version strategy verification
  - Deployment strategy confirmation

**How to Test:**

1. Create a new milestone in GitHub
2. Verify workflow runs automatically
3. Check that an issue is created with the milestone checklist
4. Verify checklist includes new sections:
   - Dependencies & Tooling (with `full_salvo.sh`)
   - Release Planning (with versioning details)

**Expected Behavior:**

- Automatically creates recurring issue when milestone is created
- Issue includes comprehensive checklist for milestone closeout
- Checklist references v2.0 processes and multi-language tooling
- Issue is assigned to the milestone

---

### 5. Dependabot Configuration (`.github/dependabot.yml`)

**Changes Made:**

- Added priority labels:
  - NPM dependencies: `🟡 Medium`
  - GitHub Actions: `⚪ Low`
- Added security-critical dependency group:
  - Patterns: firebase, crypto-\*, bcrypt, jsonwebtoken
  - Update types: security patches only

**How to Test:**

1. Wait for Dependabot to create a PR (runs weekly on Monday 06:00)
2. Verify PR has appropriate priority label
3. Check that security-related deps are grouped separately
4. Verify PRs target `develop` branch

**Expected Behavior:**

- Weekly dependency PRs on Monday mornings
- PRs have priority labels based on ecosystem
- Security patches grouped and prioritized
- Max 5 npm PRs and 3 GH Actions PRs open at once

---

## Testing Checklist

- [ ] **Bundle Size**: Create PR with code changes, verify size report
- [ ] **Issue Labeler**: Create 3-4 test issues with different keywords
- [ ] **Auto-Approve**: Test with Copilot PR (or check logs for skip reason)
- [ ] **Milestone Docs**: Create new milestone, verify checklist issue
- [ ] **Dependabot**: Wait for next run or manually trigger (if possible)

## CI/CD Best Practices

### When Creating PRs

1. Use conventional commit format: `type: description`
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `chore:` for maintenance

2. Check bundle size report in PR comments
3. Verify CI passes before merging
4. Review auto-applied labels and adjust if needed

### When Creating Issues

1. Use clear, descriptive titles
2. Include keywords for automatic labeling
3. Provide context for priority (e.g., "critical bug" vs "nice to have")
4. Verify labels are appropriate (max 4)

### When Creating Milestones

1. Follow version naming: `v2.0.0`, `v2.1.0`, etc.
2. Check that recurring checklist issue is created
3. Follow checklist before closing milestone
4. Run `full_salvo.sh` before milestone closeout

## Troubleshooting

### Bundle Size Workflow Issues

**Problem**: Workflow fails with "command not found: bc"
**Solution**: Ensure ubuntu-latest runner has bc installed (should be default)

**Problem**: Workflow shows wrong baseline
**Solution**: Update `BUNDLE_SIZE_BASELINE_BYTES` in workflow env vars

**Problem**: Bundle size exceeds limit
**Solution**: Optimize code, use dynamic imports, review largest chunks

### Issue Labeler Issues

**Problem**: Too many labels applied
**Solution**: Labels are now limited to 4 max - oldest functionality

**Problem**: Wrong labels applied
**Solution**: Keywords are now more specific - if still wrong, adjust patterns

**Problem**: No labels applied
**Solution**: Check that labels exist in repo and patterns match content

### Auto-Approve Issues

**Problem**: Workflow shows "skipped"
**Solution**: Check debug output - likely not a copilot bot PR

**Problem**: Workflows not approved
**Solution**: Check permissions in workflow file (needs `actions: write`)

## Documentation Updates

The following documentation has been updated:

- `README.md`: Added versioning strategy and bundle size sections
- `.github/data/milestone-closeout-checklist.md`: Added release planning section
- `.github/workflows/bundle-size.yml`: Added baseline tracking and comparison
- `.github/workflows/issue-labeler.yml`: Reduced keyword matches, added 4-label limit
- `.github/workflows/auto-approve-copilot-workflows.yml`: Added debug output
- `.github/dependabot.yml`: Added priority labels and security group

## Related Issues

- Parent Issue: #1470 (Workflow Consolidation)
- This Issue: #[issue-number] (Fix & Tune Existing Workflows)

## Questions?

If you encounter issues with any workflow:

1. Check workflow logs for detailed error messages
2. Review debug output (especially for auto-approve)
3. Verify permissions and environment variables
4. Create an issue with logs and reproduction steps
