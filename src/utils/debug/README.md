# Debug Utilities

This folder contains debugging and diagnostic tools that are exposed to the browser console for troubleshooting.

## Available Tools

### `dataDiagnostic.js`

**Browser Console Tool** for checking current data state

- **Usage**: `dataDiagnostic()` in browser console
- **Purpose**: Diagnose data integrity issues, check database state
- **Console Output**: Uses console.log for structured diagnostic output

### `syncDiagnostic.js`

**Browser Console Tool** for debugging sync issues

- **Usage**: `syncDiagnostic()` in browser console
- **Purpose**: Diagnose Firebase sync problems, check sync status
- **Console Output**: Uses console.log for detailed sync diagnostics

## ESLint Configuration

These files are excluded from the `no-console` rule because:

1. They are debugging utilities meant to output to browser console
2. They are not part of the normal application flow
3. Their console output is the intended functionality

```js
// In eslint.config.js
"**/debug/**", // Allow console in debug utilities
```

## Usage Notes

- These tools are automatically exposed as window globals in development
- They should not be imported by application code
- They are designed for manual execution in browser developer console
- All console.log usage in these files is intentional for diagnostic output
