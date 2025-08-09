# GitHub Data Files

This directory contains data files used by GitHub Actions and other automated processes.

## Files

- **`lint-warnings.json`** - Automated lint warning tracking data
  - Updated automatically by `.github/workflows/lint-warnings-tracker.yml`
  - Contains current warning counts, categorization, and action plans
  - Used to enforce 20% warning increase threshold on PRs
  - Referenced in [Lint Warnings Documentation](../../docs/LINT_WARNINGS.md)

## Purpose

These files are kept separate from the main project files to:

- Reduce root directory clutter
- Group automation-related data together
- Make it clear these files are maintained by GitHub Actions
- Provide better organization for CI/CD data files
