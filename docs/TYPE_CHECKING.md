# TypeScript Type Checking

This document describes the TypeScript type checking system for the Violet Vault project.

**Last Updated:** September 30, 2025
**Current Status:** 0 type errors ✅

## Overview

The project uses TypeScript's `tsc --noEmit` to perform type checking without compilation. This provides static type safety for JavaScript files with JSDoc comments and ensures type correctness when TypeScript files are added to the project.

## Current Status

- **Total Type Errors:** 0
- **Target:** 0 (zero tolerance for regressions)
- **Policy:** Any PR that introduces new type errors will be blocked

## Configuration

### TypeScript Configuration (`tsconfig.json`)

The project uses a permissive TypeScript configuration designed for gradual adoption:

- **Target:** ES2020
- **Module:** ESNext (bundler mode)
- **Strict Mode:** Disabled (for gradual adoption)
- **Allow JS:** Enabled (checks JavaScript files with JSDoc)
- **Check JS:** Disabled (only checks typed files)

### NPM Scripts

```bash
# Check for type errors (one-time check)
npm run tsc:check

# Watch for type errors (continuous checking)
npm run tsc:watch
```

## GitHub Actions Integration

### Workflow: `type-errors-tracker.yml`

The type checking workflow runs on:

- **Pull Requests** to main and develop branches
- **Pushes** to main and develop branches
- **Manual trigger** via workflow_dispatch

### Regression Prevention

The workflow implements strict regression prevention:

1. **Compares** current type errors with the previous baseline
2. **Blocks** any PR that increases the error count
3. **Uploads** detailed error information as JSON artifacts
4. **Comments** on PRs with type checking results

### Workflow Steps

1. **Load previous error count** from `.github/data/type-errors.json`
2. **Run TypeScript check** with `tsc --noEmit`
3. **Parse errors** into structured JSON format
4. **Calculate delta** and determine if there's a regression
5. **Upload artifacts** for detailed analysis
6. **Update tracking data** on main/develop pushes
7. **Comment on PR** with results

## Error Tracking

### Data File: `.github/data/type-errors.json`

This file tracks:

- Total error count
- Error categories by TypeScript error code
- Affected files and line numbers
- Action plan with prioritized fixes

### Parser Script: `scripts/parse-tsc-errors.js`

Parses TypeScript compiler output into structured JSON:

- Extracts error code, file, line, and message
- Groups errors by error code
- Prioritizes errors by severity
- Generates actionable fix recommendations

## Common TypeScript Error Codes

| Code   | Description                     | Action                               |
| ------ | ------------------------------- | ------------------------------------ |
| TS2304 | Cannot find name                | Add type definitions or import types |
| TS2345 | Argument type mismatch          | Fix argument types                   |
| TS2322 | Type not assignable             | Ensure type compatibility            |
| TS2339 | Property does not exist         | Add property or fix spelling         |
| TS2307 | Cannot find module              | Install module or fix import path    |
| TS7006 | Implicit 'any' type             | Add explicit type annotations        |
| TS7016 | Could not find declaration file | Install @types/package-name          |

## Best Practices

### For JavaScript Files

1. **Use JSDoc comments** for type information:

   ```javascript
   /**
    * @param {string} name - The user's name
    * @param {number} age - The user's age
    * @returns {object} User object
    */
   function createUser(name, age) {
     return { name, age };
   }
   ```

2. **Import types** from TypeScript declaration files when available

3. **Run `npm run tsc:check`** before committing

### For TypeScript Files

1. **Enable strict mode** incrementally as files are converted
2. **Add explicit return types** for public functions
3. **Use interfaces** for complex object shapes
4. **Avoid `any` type** - use `unknown` if type is truly unknown

## Monitoring

### Automated Tracking

- **Frequency:** On every PR and push to main/develop
- **Threshold:** Zero tolerance - any increase blocks the PR
- **Artifacts:** JSON reports available for 30 days

### Manual Checks

```bash
# Check all files
npm run tsc:check

# Watch mode for development
npm run tsc:watch

# Check specific file
npx tsc --noEmit src/path/to/file.ts
```

## Gradual TypeScript Adoption

The current setup supports gradual TypeScript adoption:

1. **Phase 1 (Current):** Type checking infrastructure in place
2. **Phase 2:** Add JSDoc types to critical utility functions
3. **Phase 3:** Convert utility files to TypeScript (.ts)
4. **Phase 4:** Convert components to TypeScript (.tsx)
5. **Phase 5:** Enable strict mode incrementally

## Related Resources

- **TypeScript Config:** [`tsconfig.json`](../tsconfig.json)
- **Workflow:** [`.github/workflows/type-errors-tracker.yml`](../.github/workflows/type-errors-tracker.yml)
- **Parser Script:** [`scripts/parse-tsc-errors.js`](../scripts/parse-tsc-errors.js)
- **Tracking Data:** [`.github/data/type-errors.json`](../.github/data/type-errors.json)
- **Official TypeScript Docs:** [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

## Troubleshooting

### Common Issues

**Issue:** Type errors in node_modules

- **Solution:** Add to `exclude` in tsconfig.json or enable `skipLibCheck: true`

**Issue:** Can't find type definitions

- **Solution:** Install @types package: `npm install --save-dev @types/package-name`

**Issue:** False positives in JavaScript files

- **Solution:** Add `// @ts-ignore` comment above the line (use sparingly)

**Issue:** Workflow failing but local check passes

- **Solution:** Ensure package-lock.json is committed and dependencies match

## Notes

- The project is currently JavaScript-based with gradual TypeScript adoption
- Type checking helps catch potential bugs before runtime
- Zero tolerance policy ensures type safety doesn't regress
- Incremental adoption allows conversion at a comfortable pace
