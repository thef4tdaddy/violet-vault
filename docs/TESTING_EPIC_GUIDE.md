# Testing Epic & QA Framework Guide

## Overview

The Testing Epic (#919) provides a comprehensive framework for testing and validating every feature area of Violet Vault. All sub-issues follow a consistent structure for easy management and reproduction.

## Structure

### Epic Hierarchy

```
Epic #919: 🧪 E2E Testing & QA
├── Core Features (6 issues)
├── Analytics & Insights (3 issues)
├── Advanced Features (4 issues)
├── Platform Features (4 issues)
└── System & DevOps (4 issues)
```

### Sub-Issue Template

Each sub-issue includes:

1. **Test Scope** - What is being tested
2. **Test Checklist** - Organized by testing level:
   - Unit Tests
   - Integration Tests
   - E2E Tests
   - Manual QA
3. **Reporting** - What metrics to track

## Testing Levels Explained

### Unit Tests

Component and function-level tests. Test individual pieces in isolation.

```bash
npm run test
```

### Integration Tests

Test how components and services work together.

### E2E Tests

Full user workflow tests using browser automation.

```bash
npm run test:e2e
```

### Manual QA

Human validation of UI/UX, visual appearance, and user experience.

## How to Use Sub-Issues

### For Manual Testing

1. Open a sub-issue (e.g., #920 - Authentication Testing)
2. Go through the test checklist
3. Document results in comments
4. Report bugs with reproduction steps
5. Close issue when all tests pass

### For Test Automation

1. Use the sub-issue as a specification
2. Create test files matching the scope
3. Add tests for each checklist item
4. Reference the issue number in commits: `refs #920`
5. Update issue with coverage metrics

### For Bug Reporting

Create bugs and link to the relevant sub-issue:

```bash
gh issue create --title "Bug: [description]" \
  --body "Related to #920 (Authentication Testing)\n\nSteps to reproduce..."
```

## Regenerating the Epic

### Automatic (Recommended)

Run the creation script to generate a fresh epic with all 20 sub-issues:

```bash
./.github/scripts/create-testing-epic.sh
```

### When to Regenerate

- After major release (to start fresh testing cycle)
- When adding significant new features
- Quarterly testing sweeps
- Before major version releases

### What Gets Created

- 1 master epic issue
- 20 sub-issues across 5 categories
- All properly labeled with `testing`
- Links back to this guide

## Test Reporting

### Individual Sub-Issue Reports

Each sub-issue should track:

- ✅ Test cases passed/failed
- 📊 Coverage percentage
- 🐛 Bugs found
- 📈 Performance metrics
- ♿ Accessibility score

Example report in issue comment:

```
## Test Results - [Date]

### Summary
- ✅ Unit Tests: 24/24 passed (100%)
- ✅ Integration Tests: 18/18 passed (100%)
- ✅ E2E Tests: 12/12 passed (100%)
- ⚠️ Manual QA: 5 issues found

### Coverage
- Statements: 95%
- Branches: 92%
- Functions: 94%
- Lines: 95%

### Performance (Lighthouse)
- Performance: 95
- Accessibility: 100
- Best Practices: 96
- SEO: 100

### Bugs Found
1. #XXX - [Bug title] - CRITICAL
2. #XXX - [Bug title] - HIGH
```

### Aggregated Epic Report

Run commands to generate reports across all areas:

```bash
# Full test coverage
npm run test:ci

# E2E test results
npm run test:e2e

# Performance audit
npm run lighthouse

# Accessibility check
npx axe-core [url]

# Type checking
npm run typecheck

# Lint analysis
npm run lint
```

## Common Workflows

### Scenario: Complete Testing for a Release

1. Clone the epic: `./.github/scripts/create-testing-epic.sh`
2. Assign sub-issues to team members
3. Each person completes their section
4. Track progress via epic view
5. Aggregate results and create release notes
6. Close completed sub-issues

### Scenario: Hotfix Testing

1. Create a temporary epic for just affected areas
2. Focus on those 2-3 sub-issues
3. Verify fixes don't regress
4. Deploy with confidence
5. Archive focused epic

### Scenario: New Feature Testing

1. Create a sub-issue for the new feature area
2. Add detailed test cases
3. Run through all 4 testing levels
4. Report results
5. Merge into main epic results

## Best Practices

### ✅ Do

- Link related PRs and issues to sub-issues
- Update sub-issue status regularly
- Document all bugs found with reproducible steps
- Include performance metrics in results
- Assign sub-issues for accountability

### ❌ Don't

- Leave sub-issues without documentation
- Skip testing levels
- Close without verifying all items pass
- Ignore accessibility requirements
- Skip mobile testing

## Advanced Features

### Progress Tracking

Use GitHub's epic view to see:

- Overall completion percentage
- Sub-issue burndown
- Related PRs and branches
- Team member assignments

### Automation

Link this epic to your CI/CD pipeline:

```yaml
# In workflow file
- name: Update testing issue
  run: |
    gh issue edit 919 --body "$(npm run test:ci)"
```

### Integration with Other Tools

- Link to Jira for additional tracking
- Export results to spreadsheets
- Create dashboards from data
- Integrate with APM tools

## Support & Questions

For questions about:

- **Testing approach**: See `docs/testing/` directory
- **Component testing**: See specific component tests
- **E2E setup**: See `playwright.config.ts`
- **CI/CD integration**: See `.github/workflows/`

---

**Version**: 1.0
**Last Updated**: 2025-10-27
**Maintained By**: QA Team
**Related Epic**: #919
