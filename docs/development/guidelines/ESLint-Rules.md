# ESLint Rules Documentation

**Last Updated:** January 18, 2026
**Branch:** main (v2.0.0 - TypeScript Baseline)
**Current Status:** Production-ready with comprehensive TypeScript linting

This document outlines the ESLint rules configured for the project, providing a quick reference for developers.

## 🎯 V2.0.0 Code Quality Achievements

The v2.0.0 milestone achieved full TypeScript conversion with strict linting:

- ✅ **100% TypeScript** - All `.js` files converted to `.ts`/`.tsx`
- ✅ **Strict Mode** - Zero tolerance for `any` types
- ✅ **@ Imports** - All imports use `@/` path aliases
- ✅ **Zod Validation** - Runtime type safety for all external data
- ✅ **ESLint Clean** - Zero errors, minimal warnings

## 📊 Current Status

**Linting:** Production-ready with comprehensive coverage

**Most Common Issues:**

- `max-lines-per-function`: Functions exceeding 75-line limit (primary focus of #569)
- `complexity`: Functions with complexity above 15
- `max-statements`: Functions with too many statements (>25)
- `no-unused-vars`: Unused variables (requires underscore prefix for future-use variables)

**Resolution Strategy:**

- Extract UI components for large functions
- Use custom hooks for business logic
- Apply component refactoring standards from [Component-Refactoring-Standards.md](Component-Refactoring-Standards.md)

---

## 📋 ESLint Rule Reference

### General Rules (`files: "**/*.{js,jsx}"`)

These rules apply to all `.js` and `.jsx` files in the project.

- `no-unused-vars`: **Warning**. Unused variables (arguments starting with `_` and all-caps variables are ignored)
- `no-undef`: **Warning**. Undeclared global variables
- `no-case-declarations`: **Warning**. Lexical declarations in case clauses
- `no-useless-escape`: **Warning**. Unnecessary escape characters
- `react-hooks/exhaustive-deps`: **Warning**. Missing dependencies in React Hooks
- `react-refresh/only-export-components`: **Warning**. React Refresh compatibility
- `no-console`: **Error**. All `console` statements (use project's `logger` utility instead)

#### Restricted Globals

- `alert`: **Error**. Use toast notifications (`globalToast.showError()`, `globalToast.showSuccess()`, etc.) instead.
- `confirm`: **Error**. Use `ConfirmModal` (via `useConfirm()` hook) instead.
- `prompt`: **Error**. Use `PromptModal` (via `usePrompt()` hook) instead.

#### Function Complexity and Size Rules

- `complexity`: **Warning** for functions with complexity above 15
- `max-depth`: **Warning** for nesting deeper than 5 levels
- `max-params`: **Warning** for functions with more than 5 parameters
- `max-statements`: **Warning** for functions with more than 25 statements
- `max-lines-per-function`: **Warning** for functions over 75 lines (excluding comments/blanks)
- `max-nested-callbacks`: **Warning** for callbacks nested more than 4 levels deep
- `max-lines`: **Warning** at 300 lines, **Error** at 400+ lines (critical at 500+)

#### Restricted Imports

**React Context (Issue #491):**

- `createContext`, `useContext` from `react`: **Error** for data fetching. Use TanStack Query + Dexie for data, Zustand stores for UI state only. **Note**: Auth state uses React Context (v2.0+), not Zustand.

**Icon System (Issue #575):**

- `lucide-react`: **Error**. Use centralized icon system from `@/utils/icons` or `{ getIcon, renderIcon }` from `@/utils`

#### File Size Enforcement (`max-lines`)

- **Warning** for files over 300 lines.
- **Error** for files over 400 lines (needs refactoring soon).
- **Error** for files over 500 lines (critical, must be refactored).
  - _Exclusions_: `**/budgetDb.js`, `**/budgetHistoryService.js`, `**/chunkedSyncService.js`, `**/budgetHistoryTracker.js`, `**/SyncHealthIndicator.jsx`, `**/ActivityFeed.jsx`. These core infrastructure and diagnostic files are exempt from the 500 LOC limit and `no-restricted-imports` for service imports.
  - **Note**: `authStore.jsx` was removed in v2.0 - auth state is now in React Context (`AuthContext`).

#### Complexity Rules

- `complexity`: **Warning** for functions with complexity over 15.
- `max-depth`: **Warning** for nesting depth over 5.
- `max-params`: **Warning** for functions with more than 5 parameters.
- `max-statements`: **Warning** for functions with more than 25 statements.
- `max-lines-per-function`: **Warning** for functions over 75 lines.
- `max-nested-callbacks`: **Warning** for callbacks nested more than 4 levels deep.
  - _Exclusions_: `src/utils/**/calculations/**/*.js`, `src/utils/**/strategies/**/*.js`, `src/utils/**/operations/**/*.js`, `src/utils/sync/**/*.js`, `src/utils/security/**/*.js`, `src/utils/query/**/*.js`, `src/utils/debts/**/*.js`, `src/utils/transactions/**/*.js`, `src/utils/budgeting/autofunding/**/*.js`. These complex utilities are exempt from complexity rules.
  - _Specific Exclusion_: `src/utils/dataManagement/validationUtils.js` is also exempt from the `complexity` rule to allow for necessary logging.

### Component Architecture Enforcement (`files: "src/components/**/*.{js,jsx}"`)

These rules apply specifically to files within the `src/components` directory and enforce clean architecture.

**Restricted Imports (Issues #515, #575):**

- **Services**: Cannot import `../services/*`, `../../services/*`, etc. Use hooks in `src/hooks/` instead
- **Business Logic**: Cannot import `**/calculations/*`, `**/processors/*`, `**/validators/*`, `**/transformers/*`. Extract to custom hooks
- **Utilities**: Cannot import `**/utils/**/calculate*`, `**/utils/**/process*`, `**/utils/**/validate*`, `**/utils/**/transform*`. Use hooks for business logic
- **Icons**: Cannot import `lucide-react` directly. Use centralized icon system from `@/utils/icons`

## 📋 Rule Exclusions and Special Cases

### Complex Utility Files (Complexity Rules Disabled)

**Files exempt from complexity, depth, statements, and function size rules:**

- `src/utils/**/calculations/**/*.js` - Financial algorithms
- `src/utils/**/strategies/**/*.js` - Business strategy logic
- `src/utils/**/operations/**/*.js` - Data operations
- `src/utils/sync/**/*.js` - Synchronization logic
- `src/utils/security/**/*.js` - Security implementations
- `src/utils/query/**/*.js` - Database queries
- `src/utils/debts/**/*.js` - Debt calculations
- `src/utils/transactions/**/*.js` - Transaction processing
- `src/utils/budgeting/autofunding/**/*.js` - Auto-funding algorithms

### Core Infrastructure Files (Size Rules Disabled)

**Files exempt from max-lines rules:**

- `**/budgetHistoryService.js` - History tracking
- `**/budgetHistoryTracker.js` - Audit logging
- `**/SyncHealthIndicator.jsx` - System monitoring
- `**/ActivityFeed.jsx` - Activity display
- `**/budgetDb.js` - Database layer (all complexity rules disabled)
- `**/AuthContext.tsx` - Authentication context (all complexity rules disabled) - **Note**: Auth moved from Zustand to React Context in v2.0
- `**/chunkedSyncService.js` - Sync operations (all complexity rules disabled)
- `**/cloudSyncService.js` - Cloud sync (all complexity rules disabled)

### Console Statement Exceptions

**Files allowed to use console statements:**

- `**/logger.js` - Logging utility
- `**/errorTrackingService.js` - Error tracking

### Icon Import Exceptions (Issue #575)

**Files allowed to import lucide-react directly:**

- `src/utils/icons/index.js` - Centralized icon system
- `src/utils/billIcons/**/*.js` - Legacy bill icons (compatibility)
- `src/utils/receipts/receiptHelpers.jsx` - Receipt utilities

---
