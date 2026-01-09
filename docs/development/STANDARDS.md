# VioletVault Code Standards & Architecture

This document outlines the architectural standards and coding patterns for the VioletVault codebase. These standards are enforced via ESLint where possible, and by code review otherwise.

## ⚛️ React Hooks Architecture

We follow the **Unified Hook Pattern** to reduce fragmentation, simplify imports, and improve testability.

### 1. The Unified Hook Pattern

Instead of splitting logic across multiple files (e.g., `useBills.ts`, `useBillOperations.ts`, `billQueries.ts`), all logic for a specific domain entity should be consolidated into a single hook file.

**✅ DO:**

- Create one main hook file per entity (e.g., `src/hooks/bills/useBills.ts`).
- Define and export individual mutation hooks from this file (e.g., `export const useAddBillMutation = ...`).
- Define the main query hook in this file.
- Export a default hook that aggregates data and operations (optional but recommended for backward compatibility).

**❌ DON'T:**

- Create separate `mutations/` or `queries/` directories for a single entity.
- Create files named `*Operations.ts` or `*Queries.ts` unless they are purely stateless utility functions.
- Hide mutations inside a generic `ops` object without exporting them individually.

### 2. Export Strategy

Individual mutation hooks **MUST** be exported to allow for:

- **Granular Usage**: Components can import only what they need (e.g., just `useAddBillMutation`).
- **Better Performance**: Avoids re-rendering components that only need to perform an action.
- **Easier Testing**: Mutations can be tested in isolation.

```typescript
// src/hooks/bills/useBills.ts

// 1. Export Mutation Hooks
export const useAddBillMutation = () => { ... };
export const useUpdateBillMutation = () => { ... };

// 2. Main Hook
export const useBills = (options) => {
  const query = useQuery(...);
  // ...
  return { ...query.data, ...ops };
};
```

### 3. File Structure

Hook files should be flat within their domain directory.

```text
src/hooks/
  ├── bills/
  │   ├── useBills.ts          # Unified hook
  │   ├── useBillAnalytics.ts  # Distinct analytics logic
  │   └── __tests__/           # Co-located tests
  │       ├── useBills.test.tsx
  │       └── useBillAnalytics.test.ts
```

### 4. Testing Standards

- **Coverage Goal**: >80% Statement Coverage.
- **Co-location**: Tests must be located in a `__tests__` directory next to the hook.
- **Structure**:
  - `useEntity.test.tsx`: Tests for **Query** logic (data fetching, filtering, sorting).
  - `useEntityMutations.test.ts` (or inside main test file): Tests for **Mutation** logic (add, update, delete).
- **Wrapper**: Use `createWrapper()` with a `QueryClientProvider` for all hook tests.

### 5. ESLint Configuration

- **Max Lines**: `src/hooks/` files are allowed up to **600 lines** to accommodate the unified pattern.
- **Ignores**: Legacy "operations" and "mutations" file patterns typically ignored by linting are now **deprecated**. Avoid creating new files matching `*Operations.ts` or `*Mutations.ts`.

## 🔄 State Management

- **Server State**: Managed by `@tanstack/react-query` (Queries/Mutations).
- **Client UI State**: Managed by `zustand` (Modals, temporary form state).
- **Auth State**: Managed by React Context.

## 🛡️ Database

- **Local-First**: Primary interaction is with `Dexie.js` (IndexedDB).
- **Sync**: Changes are synced to Firebase/Cloud via separate sync services.
