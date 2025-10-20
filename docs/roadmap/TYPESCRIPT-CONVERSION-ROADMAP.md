# TypeScript Conversion Roadmap

**Status**: 11% Complete (66 TS/TSX files | 742 JS/JSX files remaining)

---

## 📊 Conversion Summary

| Category            | Remaining | Priority                      |
| ------------------- | --------- | ----------------------------- |
| **Hooks**           | 140 files | 🔴 HIGH (blocking components) |
| **Components**      | 192 files | 🔴 HIGH (core functionality)  |
| **Utils**           | 134 files | 🟡 MEDIUM (supporting logic)  |
| **Services**        | 16 files  | 🔴 HIGH (backend integration) |
| **Contexts/Stores** | 5 files   | 🔴 HIGH (state management)    |
| **Constants**       | 3 files   | 🟢 LOW (simple data)          |
| **Database**        | 2 files   | 🔴 HIGH (data layer)          |
| **Other**           | 250 files | 🟡 MEDIUM (misc files)        |

---

## 🎯 Priority Conversion Order

### Phase 1: Foundation & State (Critical Path)

**Estimated**: 20-30 hours | **Impact**: Unblocks everything

1. **Services** (16 files) - API/Firebase integration
   - `services/authService.js`
   - `services/firebaseSyncService.js`
   - `services/chunkedSyncService.js`
   - `services/cloudSyncService.js`
   - `services/budgetHistoryService.js`
   - Others (10 more)

2. **Contexts & Stores** (5 files)
   - `contexts/AuthContext.jsx`
   - `stores/auth/` (remaining)
   - `stores/ui/` (remaining)

3. **Database** (2 files)
   - `db/budgetDb.js` (already mostly TypeScript, just needs fixes)
   - `db/__tests__/`

4. **Core Hooks** (30 critical hooks)
   - `hooks/auth/*` (22 files)
   - `hooks/sync/*` (4 files)
   - High-usage hooks first

### Phase 2: UI Components (Bulk Work)

**Estimated**: 40-50 hours | **Impact**: App UI becomes TS

1. **Core Components** (192 files)
   - UI primitives: `components/ui/*` (20 files)
   - Layout: `components/layout/*` (7 files)
   - Auth UI: `components/auth/*` (14 files)
   - Modals: `components/modals/*` (4 files)
   - Then category-by-category: accounts, bills, budgeting, debt, etc.

2. **Supporting Hooks** (110+ hooks)
   - Group by category and convert alongside components
   - `hooks/budgeting/*` (40 files)
   - `hooks/analytics/*` (18 files)
   - `hooks/transactions/*` (25 files)
   - `hooks/common/*` (37 files)

### Phase 3: Utilities & Supporting Logic

**Estimated**: 30-40 hours | **Impact**: Performance & stability

1. **Utilities** (134 files)
   - `utils/common/*` (21 files)
   - `utils/budgeting/*` (23 files)
   - `utils/sync/*` (29 files)
   - `utils/transactions/*` (12 files)
   - Others

2. **Constants** (3 files)
   - `constants/debts.js`
   - `constants/categories.js`
   - `constants/frequency.js`

### Phase 4: Polish & Edge Cases

**Estimated**: 20-30 hours | **Impact**: Completeness

1. **Special Purpose** (250+ files)
   - Dev/testing utilities
   - Receipts handling
   - Mobile-specific code
   - Analytics
   - Automation

---

## 🚀 Current Blockers (44 TS Errors to Fix First)

**Top Issues**:

1. **Debt Components** (8 errors) - Prop type mismatches
2. **Database** (13 errors) - Dexie type issues
3. **Services** (15 errors) - Firebase/sync type conflicts
4. **Modal Components** (2 errors) - Ref/callback issues
5. **Transactions** (1 error) - Filter config typing
6. **Auth** (1 error) - Callback signature mismatch

**Fix Timeline**: 2-4 hours to resolve all 44

---

## 📈 Recommended Weekly Targets

**Week 1**: Fix 44 TS errors + convert Phase 1 (Services, Contexts, DB)

- ~5-10 files converted
- ~44 errors resolved

**Week 2**: Convert Phase 2 Part A (UI Core + supporting hooks)

- ~50-70 files converted
- Should reach 30-35% completion

**Week 3**: Convert Phase 2 Part B (Main components)

- ~80-100 files converted
- Should reach 50%+ completion

**Week 4**: Phase 3 (Utilities) + Phase 4 (Polish)

- Completion to 100%

---

## 💡 Conversion Best Practices

### For Each File:

1. **Rename**: `.js`/`.jsx` → `.ts`/`.tsx`
2. **Add types**:
   - Function parameters
   - Return types
   - React props (use `React.FC<Props>` or direct props type)
3. **Fix imports**: Add `.ts`/`.tsx` extensions where needed
4. **Test locally**: `npm run typecheck` to verify
5. **Commit**: Small, focused commits per file or logical group

### Hook Conversion Template

```typescript
// Before
export const useMyHook = (param) => {
  const [state, setState] = useState(defaultValue);
  return { state, setState };
};

// After
interface UseMyHookReturn {
  state: StateType;
  setState: React.Dispatch<React.SetStateAction<StateType>>;
}

export const useMyHook = (param: ParamType): UseMyHookReturn => {
  const [state, setState] = useState<StateType>(defaultValue);
  return { state, setState };
};
```

### Component Conversion Template

```typescript
// Before
const MyComponent = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>
}

// After
interface MyComponentProps {
  prop1: string
  prop2?: number
}

const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>
}
export default MyComponent
```

---

## 🎯 Success Criteria

- ✅ All 44 current TS errors resolved
- ✅ 100% of files converted to TS (66 → 808 files)
- ✅ Full `npm run typecheck` pass with zero errors
- ✅ All imports use `.ts`/`.tsx` extensions
- ✅ No `any` types used (except where explicitly needed)
- ✅ Build completes without warnings

---

## 📋 File-by-File Breakdown

### Top Priority (Convert First)

**Services** (11 files):

- authService.js
- firebaseSyncService.js
- chunkedSyncService.js
- cloudSyncService.js
- budgetHistoryService.js
- budgetDatabaseService.js
- activityLogger.js
- firebaseMessaging.js
- firebaseLazyLoader.js
- editLockService.js
- syncServiceInitializer.js

**State Management** (5 files):

- AuthContext.jsx
- stores/auth (1-2 files)
- stores/ui (2-3 files)

**Database** (2 files):

- budgetDb.js
- db/**tests**/

### Medium Priority (Convert Next)

**Critical Hooks** (50 files):

- hooks/auth/\* (22 files)
- hooks/sync/\* (4 files)
- hooks/common/critical ones (24 files)

**Core Components** (50 files):

- components/ui/core (15 files)
- components/auth/\* (14 files)
- components/layout/core (7 files)
- components/modals/\* (4 files)
- Other critical UI (10 files)

### Lower Priority (Convert Last)

**Everything else** (642 files):

- Analytics, Automation, Bills, Debt, etc.
- These don't block other work

---

## ⏱️ Estimated Timeline

| Milestone          | Files   | Errors | Est. Time       |
| ------------------ | ------- | ------ | --------------- |
| Fix current errors | 0       | 44 → 0 | 2-4 hrs         |
| Phase 1 complete   | 25-30   | 0-5    | 20-30 hrs       |
| Phase 2A (50%)     | 100+    | 0-10   | 40-50 hrs       |
| Phase 2B (100%)    | 200+    | 0-20   | 80-100 hrs      |
| Phase 3-4          | 600+    | 0-50   | 100-150 hrs     |
| **TOTAL**          | **808** | **0**  | **240-300 hrs** |

---

## 🔗 Related Docs

- Type Checking: `docs/TYPE_CHECKING.md`
- TypeScript Patterns: `docs/TypeScript-Patterns-Guide.md`
- Firebase Types: `src/services/types/firebaseServiceTypes.ts`
- Type Definitions: `src/types/index.ts`
