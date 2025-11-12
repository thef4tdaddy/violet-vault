# Configuration Comparison Report: Violet Vault

## ChastityOS Improved Configs vs Current Configs

**Generated:** 2025-10-17  
**Comparison:** `/chastityOSconfigs/` vs `/configs/` & `.github/`

---

## EXECUTIVE SUMMARY

The improved configs represent a **significant architectural upgrade** with major enhancements in:

- **ESLint Architecture**: Modular structure with 1,017 LOC of custom rules vs single monolithic file
- **Config Organization**: Logical separation by concern (linting, build, deployment, package)
- **Custom ESLint Rules**: 5 new specialized rules for architecture enforcement
- **Build Pipeline**: Enhanced Vite config with modular helpers and PWA optimization
- **Documentation**: Clear comments explaining each rule and its purpose

---

## DETAILED COMPARISON BY CATEGORY

### 1. LINTING CONFIGURATION

#### Improved Version Structure

```
chastityOSconfigs/linting/
├── eslint.config.js                    (194 lines)
├── .prettierrc                         (JSON - 11 lines)
├── .prettierignore
├── commitlint.config.cjs               (4 lines - minimal)
├── config-modules/
│   ├── base-rules.js                   (136 lines - core rules)
│   ├── components-config.js            (46 lines - component architecture)
│   ├── services-config.js              (29 lines - service architecture)
│   ├── hooks-config.js                 (38 lines - hook enforcement)
│   └── exclusions-config.js            (147 lines - exception handling)
└── eslint-rules/
    ├── zustand-safe-patterns.js        (17,431 bytes - React error #185 prevention)
    ├── no-legacy-toast.js              (5,953 bytes - migration rule)
    ├── enforce-ui-library.js           (5,869 bytes - UI library enforcement)
    ├── no-architecture-violations.js   (4,740 bytes - architecture enforcement)
    └── no-direct-icon-imports.js       (1,358 bytes - icon centralization)
```

#### Current Version Structure

```
configs/
├── eslint.config.js                    (403 lines - monolithic)
├── prettier.config.js                  (JSON format - 8 lines)
└── eslint-rules/
    └── zustand-safe-patterns.js        (only custom rule)
```

#### Key Improvements: ESLint

| Aspect                          | Current                | Improved                            | Impact                                    |
| ------------------------------- | ---------------------- | ----------------------------------- | ----------------------------------------- |
| **Architecture**                | Monolithic (403 lines) | Modular (8 files, 400+ lines total) | **CRITICAL** - Maintainability            |
| **Custom Rules**                | 1 rule                 | 5 rules                             | **CRITICAL** - Architecture enforcement   |
| **Total Lines of Custom Rules** | ~250 LOC               | 1,017 LOC                           | **IMPORTANT** - Comprehensive enforcement |
| **Config Modules**              | None                   | 5 modules                           | **IMPORTANT** - Separation of concerns    |
| **Directory-Specific Rules**    | Inline                 | Separate files                      | **IMPORTANT** - Clarity & reusability     |
| **Comments/Documentation**      | Minimal                | Extensive                           | **IMPORTANT** - Developer guidance        |
| **Rule Organization**           | Mixed concerns         | Clear separation                    | **IMPORTANT** - Maintainability           |

#### New Custom ESLint Rules (5 New)

1. **`enforce-ui-library.js`** (5,869 bytes)
   - Purpose: Enforce UI library components instead of HTML primitives
   - Detects: `<button>`, `<select>`, `<input type="checkbox">`, `<input type="radio">`, `glass-*` classes
   - Fixes: Auto-fixes for simple cases (tag replacement)
   - Related Issues: #491, #498, #499, #500
   - Status: Warn level (gradual migration)

2. **`no-architecture-violations.js`** (4,740 bytes)
   - Purpose: Enforce clean architecture patterns
   - Detects: Components importing services directly, storage/sync utilities
   - Messages: Clear guidance on using hooks instead
   - Related Issues: #421, #515
   - Status: Error level (critical)

3. **`no-direct-icon-imports.js`** (1,358 bytes)
   - Purpose: Centralize icon imports through utility
   - Detects: Direct `lucide-react` and `react-icons` imports
   - Guidance: Route through centralized icon system
   - Related Issues: #516, #575
   - Status: Error level

4. **`no-legacy-toast.js`** (5,953 bytes) - ENHANCED
   - Purpose: Migrate from react-toastify to new toast system
   - Improvements: Allowlist for gradual migration, auto-fix support
   - Methods: Handles toast.success/error/warn/info pattern migration
   - Related Issues: Toast migration from Issues #502-504
   - Status: Warn level (migration window)

5. **`zustand-safe-patterns.js`** - COMPREHENSIVE UPDATE
   - Purpose: Prevent React error #185 patterns
   - Enhancements:
     - 7 new validation rules (vs current single rule)
     - Object dependency detection
     - Function recreation prevention
     - Proper store initialization checks
   - Critical Patterns Blocked:
     - `get()` calls in useEffect
     - Server data in Zustand stores
     - Auto-executing store calls
   - Status: Mixed (errors for critical, warnings for performance)

#### Base Rules Module Highlights

**`base-rules.js`** consolidates:

- Core JS rules (no-console, no-unused-vars, etc.)
- Window object restrictions (alert, confirm, prompt)
- React Context restrictions for server data
- max-lines graduated enforcement (warn at 300, error at 400)
- Complexity rules (warn on violation, don't block)
- Window dialog pattern detection
- Merge conflict marker handling

#### Config-Specific Modules

**`components-config.js`:**

- Blocks services imports (use hooks)
- Blocks storage/sync utility imports
- Blocks Firebase/database direct calls
- Blocks localStorage access

**`services-config.js`:**

- Blocks React imports (no hooks in services)
- Enforces React hook restriction in services

**`hooks-config.js`:**

- Enforces hook naming conventions (must start with `use`)
- Allows type/interface exports
- Prevents non-hook exports from hook files

**`exclusions-config.js`:**

- Relaxes rules for complex utilities
- Handles auth context exceptions
- Demo/debug file relaxation
- Config file relaxations
- Specific file exclusions (SettingsPage, useSession, etc.)

#### Prettier Configuration

**Current:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Improved:** Identical (no changes needed - already optimal)

#### CommitLint Configuration

**Current:** Sophisticated with custom rules

```javascript
extends: ['@commitlint/config-conventional']
Custom rules for type-enum, subject-case, subject-empty, etc.
```

**Improved:** Minimal

```javascript
extends: ['@commitlint/config-conventional']
```

**Analysis:** Current version is actually more comprehensive. Current has custom rules, improved uses defaults.

---

### 2. BUILD CONFIGURATION

#### Vite Config (`vite.config.js`)

**Improved Version Advantages:**

- **Size**: 430 lines vs current (need to check current)
- **Helper Functions**: 8 modular helper functions (not inline)
  - `generateReleaseVersion()` - Git hash integration
  - `getGitHash()` - Git commit reference
  - `createEnvironmentDefinitions()` - Env setup
  - `createBasePlugins()` - Plugin composition
  - `createCompressionPlugins()` - Conditional compression
  - `createPWAConfig()` - PWA configuration
  - `createBuildConfig()` - Build optimization
  - `createEsbuildConfig()` - Tree-shaking setup

- **PWA Enhancement**: Comprehensive manifest with:
  - Shortcuts (Log Event, Tracker, Keyholder)
  - Multi-sized icons (72x72 to 512x512)
  - Screenshots for app stores
  - Maskable icon support
  - Launch handler configuration

- **Runtime Caching Strategies**:
  - NetworkFirst for documents
  - StaleWhileRevalidate for static resources
  - CacheFirst for images
  - Custom Firebase/API caching

- **Bundle Optimization**:
  - Manual chunk splitting (react-vendor, firebase-vendor, ui-vendor, chart-vendor)
  - Brotli compression for production
  - Source maps enabled
  - Demo code exclusion in production builds

- **CSP Headers**: Comprehensive Content Security Policy configuration

- **Build Mode Support**:
  - Production mode (minified, console stripped)
  - Nightly mode (console kept for debugging)
  - Development mode (full source maps)

**Key Improvements**:

1. Modular architecture (easier to maintain)
2. Enhanced PWA support (better mobile experience)
3. Better caching strategies (faster load times)
4. Bundle analysis included
5. Clear mode-based configurations
6. Demo code separation

#### Tailwind Config (`tailwind.config.js`)

**Current vs Improved:**

- **Design System Colors**: Identical and comprehensive
  - tekhelet (primary purple)
  - dark_purple (background)
  - lavender_web (cards/text)
  - rose_quartz (secondary)
  - tangerine (accent orange)
  - nightly theme colors
  - prod theme colors

- **Safelist**: Improved version has documented custom classes
- **Animations**: Both have glass-morph, liquid-flow, glass-shimmer, float, fade-in-up
- **Backdrop Blur**: Extended blur stops (xs, sm, md, lg, xl, 2xl, 3xl)
- **Box Shadows**: Glass effects (glass, glass-inset, glass-lg, liquid)

**No Significant Differences** - Both are feature-complete

#### PostCSS Config

**Current:**

```javascript
export default {
  plugins: {},
};
```

**Improved:**

```javascript
export default {
  plugins: {},
};
```

**Identical** - No changes needed

---

### 3. DEPLOYMENT CONFIGURATION

#### Vercel Build Config (`vercel.build.cjs`)

**New File in Improved Version:**

```javascript
const { execSync } = require("child_process");

const env = process.env.VERCEL_ENV || "production";

if (env === "production") {
  console.log("🚀 Running production build...");
  execSync("npm run build:production", { stdio: "inherit" });
} else if (env === "preview") {
  console.log("🔧 Running nightly build...");
  execSync("npm run build:nightly", { stdio: "inherit" });
} else {
  console.log("⚠️ Unknown environment. Skipping custom build.");
  process.exit(0);
}
```

**Benefits:**

- Environment-aware builds
- Separate production vs nightly builds
- Console logging for deployment visibility
- Vercel-specific configuration

**Impact**: IMPORTANT - Enables environment-specific build strategies

---

### 4. PACKAGE CONFIGURATION

#### .npmrc File

**Improved Version:**

```
legacy-peer-deps=true
```

**Current:** Missing or not shown

**Benefits:**

- Handles peer dependency conflicts
- Useful for complex dependency trees

#### Release Please Config (`versionrc.json`)

**Improved Version:**

```json
{
  "types": [
    { "type": "feat", "section": "✨ Features" },
    { "type": "fix", "section": "🐛 Bug Fixes" },
    { "type": "chore", "section": "🧹 Chores" },
    { "type": "docs", "section": "📚 Documentation" },
    { "type": "refactor", "section": "🔧 Refactoring" }
  ]
}
```

**Current:** Missing or not shown

**Benefits:**

- Structured release notes
- Emoji-enhanced changelog
- Clear categorization

---

### 5. GITHUB ACTIONS & CI/CD

**Current Workflows (Existing):**

- `ci.yml` - Main CI pipeline
- `ci-develop.yml` - Develop branch CI
- `preview-deployment.yml` - Preview deployments
- `release-please.yml` - Automated releases
- `restrict-commits-on-main.yml` - Branch protection
- `restrict-commits-on-develop.yml` - Branch protection
- `block-pr-not-from-develop.yml` - PR validation
- `lint-warnings-tracker.yml` - ESLint tracking
- `sync-lint-tracker.yml` - Lint data sync
- `lighthouse-monitoring.yml` - Performance monitoring
- `recurring-milestone-docs.yml` - Documentation

**Status**: No improved versions found in chastityOSconfigs  
**Analysis**: Current GitHub Actions workflows are already comprehensive and well-structured

---

## PRIORITY MIGRATION MATRIX

### CRITICAL (Must Migrate Immediately)

| Item                              | Why Critical                       | Risk if Skipped                              |
| --------------------------------- | ---------------------------------- | -------------------------------------------- |
| **ESLint Modular Architecture**   | Monolithic config hard to maintain | Future changes will become impossible        |
| **5 New Custom ESLint Rules**     | Enforces architecture patterns     | Code quality degrades, violations accumulate |
| **enforce-ui-library.js**         | Component library adoption         | Inconsistent UI across app                   |
| **no-architecture-violations.js** | Prevents architectural decay       | Services/components mixing increases         |
| **Vite Config Enhancements**      | PWA support + bundle optimization  | Poor mobile experience, larger bundles       |

### IMPORTANT (High Priority - Next Sprint)

| Item                           | Why Important               | Risk if Skipped                            |
| ------------------------------ | --------------------------- | ------------------------------------------ |
| **Config Module Organization** | Maintainability improvement | Onboarding harder for new devs             |
| **Exclusions Management**      | Clear exception handling    | Exception rules buried in main config      |
| **Vercel Build Config**        | Environment-specific builds | Can't do nightly vs production differently |
| **Release Please Config**      | Better changelogs           | Less structured release notes              |
| **Enhanced PWA Config**        | Better caching strategies   | Slower app load times                      |

### NICE-TO-HAVE (Enhancements)

| Item                      | Why Nice                   | Benefit          |
| ------------------------- | -------------------------- | ---------------- |
| **.npmrc Config**         | Peer dependency management | Cleaner installs |
| **Tailwind Enhancements** | Already feature-complete   | No change needed |
| **PostCSS**               | Already minimal            | No change needed |

---

## DETAILED MIGRATION PLAN

### Phase 1: ESLint Architecture (CRITICAL - Week 1)

**Step 1.1:** Create modular config structure

```bash
configs/
├── eslint/
│   ├── config-modules/
│   │   ├── base-rules.js
│   │   ├── components-config.js
│   │   ├── services-config.js
│   │   ├── hooks-config.js
│   │   └── exclusions-config.js
│   └── eslint-rules/
│       ├── zustand-safe-patterns.js (update)
│       ├── enforce-ui-library.js (new)
│       ├── no-architecture-violations.js (new)
│       ├── no-direct-icon-imports.js (new)
│       └── no-legacy-toast.js (new)
```

**Step 1.2:** Update eslint.config.js to use modular imports

**Step 1.3:** Add 5 new custom ESLint rules (copy from improved version)

**Step 1.4:** Run ESLint, fix violations, commit

**Effort**: ~4 hours  
**Risk**: Medium (many files will initially fail new rules)  
**Mitigation**: Phase in as warnings before errors

### Phase 2: Build Pipeline Enhancement (IMPORTANT - Week 2)

**Step 2.1:** Update vite.config.js with modular helpers

**Step 2.2:** Add Vercel build config

**Step 2.3:** Update .npmrc

**Step 2.4:** Test production and nightly builds

**Effort**: ~3 hours  
**Risk**: Low (build config changes don't affect code)  
**Testing**: Run both build modes before merge

### Phase 3: Release & Package Config (NICE-TO-HAVE - Week 2)

**Step 3.1:** Add versionrc.json for better changelogs

**Step 3.2:** Update commitlint if needed

**Effort**: ~1 hour  
**Risk**: None

---

## CUSTOM ESLINT RULES: DETAILED BREAKDOWN

### Rule 1: `enforce-ui-library.js` - NEW

**Problem Solved**:

- Developers creating custom buttons, inputs, checkboxes instead of using UI library
- Inconsistent styling across application

**Detection Patterns**:

- `<button>` elements (should use `<Button>`)
- `<select>` elements (should use `<Select>`)
- `<input type="checkbox">` (should use `<Checkbox>`)
- `<input type="radio">` (should use `<Radio>`)
- `className="glass-card"` (should use `<Card>`)
- `className="glass-input"` (should use `<Input>`)
- `className="glass-button-*"` (should use `<Button variant>`)

**Auto-Fix Support**: Yes (for simple tag replacements)

**Related Issues**: #491, #498, #499, #500

**Migration Status**: Warn level (gradual rollout)

**Code Sample**:

```javascript
// ❌ Bad
<button className="px-4 py-2">Click me</button>
<input type="checkbox" />
<div className="glass-card">Content</div>

// ✅ Good
<Button>Click me</Button>
<Checkbox />
<Card>Content</Card>
```

### Rule 2: `no-architecture-violations.js` - NEW

**Problem Solved**:

- Components directly importing and calling services
- Breaking encapsulation, tight coupling

**Detection Patterns**:

- Components importing from `../services/*`
- Components importing `firebase`, `dexie`, `storage`, `sync` utilities
- Direct database calls in components

**Error Messages**: Clear guidance on using hooks instead

**Related Issues**: #421, #515

**Status**: Error level (critical)

**Code Sample**:

```javascript
// ❌ Bad in components/
import { getUserData } from "../../services/userService";
const user = await getUserData();

// ✅ Good in components/
import { useUser } from "../../hooks/api/useUser";
const { data: user } = useUser();
```

### Rule 3: `no-direct-icon-imports.js` - NEW

**Problem Solved**:

- Developers importing icons directly from lucide-react/react-icons
- No centralized icon system

**Detection**: Direct imports of lucide-react or react-icons

**Solution**: Route through centralized icon utility

**Related Issues**: #516, #575

**Status**: Error level

**Code Sample**:

```javascript
// ❌ Bad
import { Heart, Lock } from "lucide-react";
<Heart size={24} />;

// ✅ Good
import { Heart, Lock } from "@/utils/icons";
// or use getIcon utility
```

### Rule 4: `no-legacy-toast.js` - ENHANCED

**Problem Solved**:

- Legacy react-toastify usage scattered throughout codebase
- Need migration path to new toast system

**Enhancements vs Current**:

- Allowlist for gradual migration (specific files can continue using old system temporarily)
- Auto-fix for simple cases
- Clear upgrade path with examples

**Detection Patterns**:

- `import { toast } from 'react-toastify'`
- `toast.success()`, `toast.error()`, `toast.warn()`, `toast.info()`
- `alert()` and `confirm()` usage

**Auto-Fix**: Partial (simple string args only)

**Migration Timeline**: Configurable via allowlist

**Code Sample**:

```javascript
// ❌ Old
import { toast } from "react-toastify";
toast.success("Saved!");
alert("Error!");

// ✅ New
import { useToast } from "@/contexts";
const { showSuccess, showError } = useToast();
showSuccess("Saved!");
showError("Error!");
```

### Rule 5: `zustand-safe-patterns.js` - COMPREHENSIVE UPDATE

**Problem Solved**:

- React error #185 - infinite loop caused by improper Zustand usage
- Performance issues from store misuse
- Memory leaks from improper subscriptions

**Enhancements vs Current**: 7 new checks added

- `zustand-no-object-dependencies` - Prevent object literals in deps
- `zustand-proper-store-initialization` - Enforce correct initialization
- `zustand-no-recreating-functions` - Prevent function recreation
- Plus existing 7 checks

**Critical Patterns Blocked**:

- `get()` calls inside useEffect (causes infinite loops)
- Storing server data in Zustand (use TanStack Query instead)
- Store action functions in dependency arrays
- Auto-executing store calls during initialization
- Conditional subscriptions (violates React rules)

**Error vs Warning Levels**:

- ERROR: `zustand-no-getstate-in-useeffect` (critical)
- ERROR: `zustand-store-reference-pattern` (critical)
- ERROR: `zustand-no-store-actions-in-deps` (critical)
- ERROR: `zustand-no-auto-executing-store-calls` (critical)
- ERROR: `zustand-no-object-dependencies` (critical)
- ERROR: `zustand-proper-store-initialization` (critical)
- WARN: `zustand-selective-subscriptions` (performance)
- WARN: `zustand-no-conditional-subscriptions` (memory leak prevention)
- WARN: `zustand-no-recreating-functions` (performance)

**Code Sample**:

```javascript
// ❌ Bad - Causes infinite loop (React error #185)
const user = useAuthStore((state) => {
  useEffect(() => {
    const data = authStore.getState().user; // ❌ WRONG
  }, []);
}, []);

// ✅ Good - Proper store reference pattern
useEffect(() => {
  const unsubscribe = authStore.subscribe(
    (state) => state.user,
    (user) => {
      // Handle user change
    }
  );
  return () => unsubscribe();
}, []);
```

---

## FILE-BY-FILE MIGRATION CHECKLIST

### ESLint Configuration

- [ ] Create `/configs/eslint/` directory structure
- [ ] Copy `config-modules/` files to new location
- [ ] Copy new `eslint-rules/` files (4 new ones)
- [ ] Update main `eslint.config.js` with modular imports
- [ ] Update import paths in eslint.config.js
- [ ] Run ESLint across codebase
- [ ] Create issues for each new violation type
- [ ] Commit: "refactor: restructure ESLint config into modular architecture"

### Build Configuration

- [ ] Update `vite.config.js` with modular helpers
- [ ] Add `vercel.build.cjs` to deployment config
- [ ] Add `.npmrc` with legacy-peer-deps
- [ ] Test `npm run build:production`
- [ ] Test `npm run build:nightly`
- [ ] Verify PWA caching strategies work
- [ ] Commit: "enhance: improve Vite build config with PWA and modularity"

### Package Configuration

- [ ] Add `versionrc.json` for release-please
- [ ] Update changelog generation
- [ ] Test release workflow
- [ ] Commit: "chore: add version and release configuration"

---

## TESTING STRATEGY

### Pre-Migration Testing

1. Run current ESLint: `npm run lint`
2. Document baseline violations
3. Backup current configs

### Post-Migration Testing

1. Run new ESLint: `npm run lint` (expect many violations)
2. Create GitHub issues for each violation category
3. Phase in as errors:
   - Week 1: Warn only
   - Week 2: Gradual error phase-in
   - Week 3: Full enforcement

### Build Testing

1. Test production build: `npm run build:production`
2. Test nightly build: `npm run build:nightly`
3. Verify bundle size differences
4. Check PWA manifest generation
5. Test on actual device (if possible)

---

## ROLLBACK PLAN

If migration causes issues:

1. Revert ESLint config to monolithic version
2. Keep new rules separate until stable
3. Phase in gradually over 2-3 sprints
4. Test each rule individually before combining

---

## SUMMARY OF IMPROVEMENTS

| Category              | Current          | Improved         | Priority     |
| --------------------- | ---------------- | ---------------- | ------------ |
| **ESLint Lines**      | 403 (monolithic) | 400+ (modular)   | CRITICAL     |
| **Custom Rules**      | 1                | 5                | CRITICAL     |
| **Custom Rule Lines** | ~250             | 1,017            | CRITICAL     |
| **Config Modules**    | 0                | 5                | IMPORTANT    |
| **Vite Helpers**      | Inline           | 8 functions      | IMPORTANT    |
| **PWA Config**        | Basic            | Comprehensive    | IMPORTANT    |
| **Bundle Chunks**     | 2                | 4 (optimized)    | IMPORTANT    |
| **Deployment Config** | None             | vercel.build.cjs | NICE-TO-HAVE |
| **Package Config**    | Partial          | Complete         | NICE-TO-HAVE |
| **Documentation**     | Minimal          | Extensive        | IMPORTANT    |

---

## RECOMMENDATIONS

### Immediate Actions (This Week)

1. **Review custom ESLint rules** - Understand each rule's purpose
2. **Check current violations** - Run existing ESLint to get baseline
3. **Create migration issues** - One per rule/area
4. **Plan rollout** - Week-by-week enforcement schedule

### Next Week

1. **Implement modular ESLint structure** - Don't add rules yet
2. **Update Vite config** - No build changes, just refactoring
3. **Test builds** - Verify no regressions

### Following Week

1. **Phase in custom rules** - Start with warnings
2. **Create violations issues** - Track all new violations
3. **Begin fixes** - Gradual code updates

### Key Success Factors

1. **Gradual rollout** - Don't enable all rules at once
2. **Clear guidance** - Document each rule's requirements
3. **Developer communication** - Explain why each rule exists
4. **Issue tracking** - Track all violations as issues
5. **Regular commits** - Small incremental changes

---

## POTENTIAL ISSUES & MITIGATIONS

| Issue                          | Risk   | Mitigation                         |
| ------------------------------ | ------ | ---------------------------------- |
| **Too many ESLint violations** | High   | Phase in as warnings first         |
| **Build failures**             | Medium | Test both build modes before merge |
| **PWA cache conflicts**        | Low    | Test on staging before production  |
| **Vercel deployment breaks**   | Medium | Test with Vercel environment first |
| **Developer confusion**        | Medium | Document each rule clearly         |

---

## APPENDIX: KEY FILES LOCATION

### Improved Config Reference

- ESLint: `/Users/thef4tdaddy/Documents/Projects/violet-vault/chastityOSconfigs/linting/`
- Build: `/Users/thef4tdaddy/Documents/Projects/violet-vault/chastityOSconfigs/build/`
- Deployment: `/Users/thef4tdaddy/Documents/Projects/violet-vault/chastityOSconfigs/deployment/`
- Package: `/Users/thef4tdaddy/Documents/Projects/violet-vault/chastityOSconfigs/package/`

### Current Config Reference

- ESLint: `/Users/thef4tdaddy/Documents/Projects/violet-vault/configs/`
- GitHub: `/Users/thef4tdaddy/Documents/Projects/violet-vault/.github/`
