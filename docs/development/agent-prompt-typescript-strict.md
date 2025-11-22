# TypeScript Strict Mode Error Fixing Agent Prompt

## Objective

Fix TypeScript strict mode errors **only**. Do NOT introduce normal TypeScript errors or ESLint problems. Work systematically from the top of the audit report.

## Current Status

- **ESLint Issues**: 0 ✅
- **TypeScript Errors**: 0 ✅
- **TypeScript Strict Mode Errors**: 2374 ⚠️ (reduced from 2501)

## Completed Files

1. ✅ `src/services/bugReport/githubApiService.ts` - 20 errors fixed
2. ✅ `src/hooks/debts/useDebtStrategies.ts` - 20 errors fixed
3. ✅ `src/hooks/common/useToast.ts` - 19 errors fixed
4. ✅ `src/components/savings/AddEditGoalModal.tsx` - 19 errors fixed

## ⚠️ CRITICAL: Zero Tolerance for New Errors

### Equal Priority Requirements

**Maintaining 0/0 for lint and normal TypeScript errors is JUST AS IMPORTANT as reducing strict mode errors.**

The goal is:

- ✅ **ESLint Issues**: Keep at **0** (never allow new errors)
- ✅ **Normal TypeScript Errors**: Keep at **0** (never allow new errors)
- ⚠️ **Strict Mode Errors**: Reduce from 2501 toward 0

### If You Introduce Normal TS or Lint Errors

**STOP IMMEDIATELY** and evaluate:

1. **Check what was introduced:**

   ```bash
   # Normal TypeScript errors
   npx tsc --noEmit 2>&1 | grep "error TS" | head -10

   # Lint errors
   npm run lint 2>&1 | grep "error" | head -10
   ```

2. **Decision Tree:**
   - **Can you fix the normal TS/lint error easily without breaking strict mode fixes?**
     - ✅ **YES**: Fix it immediately before proceeding
     - ❌ **NO**: Reset the file and try a different approach
   - **Is the normal TS/lint error a direct consequence of your strict mode fix?**
     - ✅ **YES**: Your approach may be wrong - reset and try again
     - ❌ **NO**: The error was pre-existing - document and continue (rare)

3. **Reset if necessary:**

   ```bash
   # Discard changes to the file
   git checkout -- path/to/file.ts

   # Try a different approach
   # Focus on type-only fixes that don't introduce side effects
   ```

4. **Never commit if:**
   - Normal TS errors > 0
   - Lint errors > 0
   - You've broken existing functionality

### Verification is Mandatory

After **EVERY** file edit, you **MUST** verify:

```bash
# Step 1: Check normal TS errors (MUST be 0)
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Expected: 0

# Step 2: Check lint errors (MUST be 0)
npm run lint 2>&1 | grep "error" | wc -l
# Expected: 0

# Step 3: Verify strict errors decreased
npx tsc --noEmit --strict --allowJs false 2>&1 | grep -c "error TS"
# Should be lower than before
```

**If any of these checks fail, DO NOT commit. Fix or reset.**

## Instructions

### 1. Start at the Top

Begin with the file that has the **most** strict mode errors. Refer to `docs/audits/sorted-typecheck-strict-report.txt` for the ordered list.

**Top 10 files to fix:**

1. ✅ `src/services/bugReport/githubApiService.ts` - 20 errors (COMPLETED)
2. ✅ `src/hooks/debts/useDebtStrategies.ts` - 20 errors (COMPLETED)
3. ✅ `src/hooks/common/useToast.ts` - 19 errors (COMPLETED)
4. ✅ `src/components/savings/AddEditGoalModal.tsx` - 19 errors (COMPLETED)
5. `src/components/sync/ActivityBanner.tsx` - 19 errors
6. `src/components/budgeting/EnvelopeSystem.tsx` - 19 errors
7. `src/components/automation/AutoFundingViewComponents.tsx` - 19 errors
8. `src/utils/receipts/receiptHelpers.tsx` - 18 errors
9. `src/utils/common/frequencyCalculations.ts` - 18 errors
10. `src/hooks/common/useImportData.ts` - 19 errors

### 2. How to Fix Errors

#### Step 1: View the Strict Mode Errors

```bash
cd /Users/thef4tdaddy/Git/violet-vault
npx tsc --noEmit --strict --allowJs false 2>&1 | grep "FILE_NAME" | head -50
```

#### Step 2: Fix One File at a Time

- Read the file
- Identify all strict mode errors (TS2xxx errors when using `--strict`)
- Fix them systematically
- **DO NOT** change code logic unless absolutely necessary for type safety
- **DO NOT** use `any` types - use proper types, `unknown`, or `z.infer<>`

#### Step 3: Verify After Each File

After fixing a file, verify you haven't broken anything:

```bash
# Check no new normal TypeScript errors
npx tsc --noEmit 2>&1 | grep -E "error TS[^2]" | wc -l
# Should be 0

# Check no new lint errors
npm run lint 2>&1 | grep "error" | wc -l
# Should be 0

# Check strict mode errors decreased
npx tsc --noEmit --strict --allowJs false 2>&1 | grep -c "error TS"
# Should be lower than before
```

### 3. What NOT to Do

❌ **DO NOT**:

- Fix normal TypeScript errors (only strict mode with `--strict` flag)
- Introduce ESLint errors or warnings (this breaks the 0/0 requirement)
- Introduce normal TypeScript errors (this breaks the 0/0 requirement)
- Commit if normal TS or lint errors > 0
- Use `any` types
- Change business logic
- Break existing functionality
- Skip verification steps
- Use `// @ts-ignore` or `// @ts-expect-error` without justification
- Modify unrelated code

✅ **DO**:

- Fix strict mode type errors only
- **ALWAYS verify 0/0 for normal TS and lint errors after every edit**
- Reset the file (`git checkout -- path/to/file.ts`) if you can't maintain 0/0
- Use proper TypeScript types, `unknown`, or `z.infer<>`
- Add type guards where needed
- Use type assertions (`as`) only when necessary and safe
- Run full verification after each file
- Commit only when all checks pass (0/0 maintained AND strict errors decreased)

⚠️ **IF YOU INTRODUCE NORMAL TS OR LINT ERRORS:**

1. **STOP** - Do not continue
2. **EVALUATE** - Can you fix them easily?
3. **DECIDE** - Fix immediately OR reset file and try different approach
4. **NEVER** commit with normal TS or lint errors > 0

### 4. Common Strict Mode Fixes

#### Fix `Object is possibly 'null'` / `Object is possibly 'undefined'`

```typescript
// Bad
const value = obj.prop;

// Good - Add null check
const value = obj?.prop;

// Good - Type guard
if (obj) {
  const value = obj.prop;
}

// Good - Non-null assertion (only when absolutely certain)
const value = obj!.prop;
```

#### Fix `Property does not exist on type`

```typescript
// Bad
const data = obj.unknownProp;

// Good - Type assertion with unknown
const data = (obj as { unknownProp?: unknown })?.unknownProp;

// Good - Type guard
if ("unknownProp" in obj) {
  const data = obj.unknownProp;
}
```

#### Fix `Parameter implicitly has 'any' type`

```typescript
// Bad
function handler(param) {}

// Good
function handler(param: unknown) {}
function handler(param: SomeType) {}
function handler<T>(param: T) {}
```

#### Fix `Variable is used before being assigned`

```typescript
// Bad
let value: number;
if (condition) {
  value = 10;
}
console.log(value); // Error

// Good
let value: number | undefined;
if (condition) {
  value = 10;
}
if (value !== undefined) {
  console.log(value);
}
```

### 5. Workflow

1. **Pick the next file** from the sorted list
2. **Read the file** and understand its purpose
3. **Record baseline counts**:
   ```bash
   # Note these counts BEFORE making changes
   NORMAL_TS_BEFORE=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
   LINT_BEFORE=$(npm run lint 2>&1 | grep -c "error")
   STRICT_BEFORE=$(npx tsc --noEmit --strict --allowJs false 2>&1 | grep -c "error TS")
   ```
4. **Check strict errors** for that file:
   ```bash
   npx tsc --noEmit --strict --allowJs false 2>&1 | grep "FILENAME"
   ```
5. **Fix strict mode errors** in that file
6. **MANDATORY VERIFICATION** (do not skip):

   ```bash
   # Check normal TS errors (MUST be 0)
   NORMAL_TS_AFTER=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
   if [ "$NORMAL_TS_AFTER" -gt 0 ]; then
     echo "ERROR: Introduced $NORMAL_TS_AFTER normal TS errors!"
     echo "Evaluate: fix them or reset the file"
     # DECISION: Fix or reset (git checkout -- path/to/file.ts)
   fi

   # Check lint errors (MUST be 0)
   LINT_AFTER=$(npm run lint 2>&1 | grep -c "error")
   if [ "$LINT_AFTER" -gt 0 ]; then
     echo "ERROR: Introduced $LINT_AFTER lint errors!"
     echo "Evaluate: fix them or reset the file"
     # DECISION: Fix or reset (git checkout -- path/to/file.ts)
   fi

   # Verify strict errors decreased
   STRICT_AFTER=$(npx tsc --noEmit --strict --allowJs false 2>&1 | grep -c "error TS")
   if [ "$STRICT_AFTER" -ge "$STRICT_BEFORE" ]; then
     echo "WARNING: Strict errors did not decrease ($STRICT_AFTER >= $STRICT_BEFORE)"
   fi
   ```

7. **If verification fails:**
   - **Option A**: Fix the normal TS/lint errors immediately if straightforward
   - **Option B**: Reset the file and try a different approach:
     ```bash
     git checkout -- path/to/file.ts
     # Try again with a different strategy
     ```
8. **Only proceed if all checks pass:**
   - Normal TS errors = 0 ✅
   - Lint errors = 0 ✅
   - Strict errors decreased ✅
9. **Format**: `npm run format`
10. **Final verification** (run all checks again after formatting)
11. **Commit only if still passing**:

    ```bash
    git add .
    git commit -m "fix: resolve TypeScript strict mode errors in FILENAME

    - Fix X strict mode type errors
    - Add proper type guards/assertions
    - Ensure type safety without breaking functionality
    - Verified: 0/0 normal TS/lint errors maintained"
    ```

### 6. Progress Tracking

After each commit, update the count:

- **Before**: Check `docs/audits/audit-report.md` for current count
- **After**: Re-run audit to verify reduction:
  ```bash
  npm run audit:full
  ```

### 7. Rules from Workspace

Follow these workspace rules strictly:

- **NO `any` types** - Use proper interfaces, `unknown`, or `z.infer`
- **ALWAYS use `@` import paths** - Never relative imports like `../../`
- **Use `logger` utility** - Never `console.log()`
- **No business logic in components** - All logic in services/hooks
- **Validate with Zod** - All external data via Zod schemas

### 8. Verification Commands

Before committing each fix:

```bash
# Verify no normal TS errors
npx tsc --noEmit

# Verify no lint errors
npm run lint

# Verify strict errors decreased
npx tsc --noEmit --strict --allowJs false 2>&1 | grep -c "error TS"

# Format code
npm run format
```

## Success Criteria

**EQUAL PRIORITY (all must be true):**

- ✅ **Normal TypeScript errors = 0** (MANDATORY - never allow new errors)
- ✅ **ESLint errors = 0** (MANDATORY - never allow new errors)
- ⚠️ **Strict mode errors decreased** (target: reduce from 2501 toward 0)

**Additional Requirements:**

- ✅ All tests still pass
- ✅ Code formatted with Prettier
- ✅ Each fix committed with descriptive message
- ✅ File reset if normal TS/lint errors cannot be resolved

**If any of the mandatory criteria fail, the fix is NOT successful.**
**Do not commit until ALL mandatory criteria pass.**

## Questions?

If you encounter:

- **Ambiguous type errors**: Use type guards or explicit type assertions
- **Complex type issues**: Check existing patterns in the codebase
- **Third-party type issues**: Check if types need to be imported or defined locally
- **Breaking changes required**: Document in commit message and proceed carefully

---

**Remember**: Work systematically from the top of the audit. Fix one file completely before moving to the next. Verify after each fix. Commit frequently.
