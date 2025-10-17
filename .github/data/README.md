# GitHub Data Files

This directory contains data files used by GitHub Actions and other automated processes.

## Files

- **`lint-warnings.json`** - Automated lint warning tracking data
  - Updated automatically by `.github/workflows/lint-warnings-tracker.yml`
  - Contains current warning counts, categorization, and action plans
  - Used to enforce 20% warning increase threshold on PRs
  - Referenced in [Lint Warnings Documentation](../../docs/LINT_WARNINGS.md)

- **`type-errors.json`** - TypeScript type error tracking data
  - Updated automatically by `.github/workflows/type-errors-tracker.yml`
  - Contains current type error counts, categorization, and action plans
  - Used to block PRs that introduce new type errors (zero tolerance)
  - Referenced in [Type Checking Documentation](../../docs/TYPE_CHECKING.md)

- **`lint-warnings-comment.md`** - Template for lint warning issue comments
  - Used by lint-warnings-tracker workflow to post consistent updates

- **`type-errors-comment.md`** - Template for type error issue comments
  - Used by type-errors-tracker workflow to post consistent updates

- **`milestone-closeout-checklist.md`** - Template for milestone completion checklist
  - Used during milestone closeout processes

## Purpose

These files are kept separate from the main project files to:

- Reduce root directory clutter
- Group automation-related data together
- Make it clear these files are maintained by GitHub Actions
- Provide better organization for CI/CD data files
