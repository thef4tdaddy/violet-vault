This document outlines the ESLint rules configured for the project, providing a quick reference for developers.

---

### General Rules (`files: "**/*.{js,jsx}"`)

These rules apply to all `.js` and `.jsx` files in the project.

- `no-unused-vars`: Warns about unused variables. Arguments starting with `_` and all-caps variables are ignored.
- `no-undef`: Warns about undeclared global variables.
- `no-case-declarations`: Warns against lexical declarations in case clauses.
- `no-useless-escape`: Warns about unnecessary escape characters.
- `react-hooks/exhaustive-deps`: Warns when dependencies in React Hooks (like `useEffect`, `useCallback`, etc.) are not exhaustive.
- `no-console`: **Error**. Disallows all `console` statements. Use the project's `logger` utility instead.

#### Restricted Globals

- `alert`: **Error**. Use toast notifications (`globalToast.showError()`, `globalToast.showSuccess()`, etc.) instead.
- `confirm`: **Error**. Use `ConfirmModal` (via `useConfirm()` hook) instead.
- `prompt`: **Error**. Use `PromptModal` (via `usePrompt()` hook) instead.

#### Restricted Imports (React Context)

- `createContext`, `useContext` from `react`: **Error**. Avoid React Context. For data, use TanStack Query + Dexie. For UI/auth state, use Zustand stores.

#### File Size Enforcement (`max-lines`)

- **Warning** for files over 300 lines.
- **Error** for files over 400 lines (needs refactoring soon).
- **Error** for files over 500 lines (critical, must be refactored).
  - _Exclusions_: `**/budgetDb.js`, `**/budgetHistoryService.js`, `**/chunkedSyncService.js`, `**/budgetHistoryTracker.js`, `**/authStore.jsx`, `**/SyncHealthIndicator.jsx`, `**/ActivityFeed.jsx`. These core infrastructure and diagnostic files are exempt from the 500 LOC limit and `no-restricted-imports` for service imports.

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

These rules apply specifically to files within the `src/components` directory.

- `no-restricted-imports`: **Error**.
  - Components should not directly import services (`../services/*`, `../../services/*`, etc.). Use hooks in `src/hooks/` to encapsulate service calls.
  - Components should not import business logic utilities directly (`**/calculations/*`, `**/processors/*`, etc.). Extract to custom hooks instead.
  - Components should not import calculation/processing utilities (`**/utils/**/calculate*`, `**/utils/**/process*`, etc.). Use custom hooks to encapsulate business logic.

---
