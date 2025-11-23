# Combined Audit Report

## Summary

| Category | Current | Change |
|----------|---------|--------|
| ESLint Issues | 0 | 0 |
| TypeScript Errors | 1 | +1 |
| TypeScript Strict Mode Errors | 1 | +1 |

*Last updated: 2025-11-23 19:15:35 UTC*

## Table of Contents
- [Lint Audit](#lint-audit)
  - [Files with Most Issues](#files-with-most-issues)
  - [Issue Count by Category](#issue-count-by-category)
  - [Detailed Lint Report](#detailed-lint-report)
- [Typecheck Audit](#typecheck-audit)
  - [Files with Most Type Errors](#files-with-most-type-errors)
  - [Type Error Breakdown by Category](#type-error-breakdown-by-category)
  - [Detailed Type Error Report](#detailed-type-error-report)
- [Typecheck Strict Mode Audit](#typecheck-strict-mode-audit)
  - [Files with Most Strict Mode Errors](#files-with-most-strict-mode-errors)
  - [Strict Mode Error Breakdown](#strict-mode-error-breakdown)
  - [Detailed Strict Mode Report](#detailed-strict-mode-report)

## Lint Audit

✅ **All files passed ESLint validation!**

Last check: 2025-11-23 19:15:31 UTC

## Typecheck Audit

### Files with Most Type Errors
- 1 errors in `error`

### Type Error Breakdown by Category
| Count | Error Code |
|---|---|
| 1 | `TS2688` |

### Detailed Type Error Report
```
error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
  The file is in the program because:
    Entry point of type library '@testing-library/jest-dom' specified in compilerOptions
```

## Typecheck Strict Mode Audit

### Files with Most Strict Mode Errors
- 1 errors in `error`

### Strict Mode Error Breakdown
| Count | Error Code |
|---|---|
| 1 | `TS2688` |

### Detailed Strict Mode Report
```
error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
  The file is in the program because:
    Entry point of type library '@testing-library/jest-dom' specified in compilerOptions
```

