- When you update Claude's rules, also update Gemini.

- If there is a bug on main, create an issue for it, in case we are unable to fix it in the moment so there is tracking.
- If I suggest a new feature, create a GH issue for it so it can be tracked to completion.
- When creating issues, if its a GH issue for a bug use label "bug" , if its a new feature / enhancement use the label "enhancement" and "roadmap" on the issue

- Always Commit Changes Frequently so changes can be easily reverted

## Code Standards

- **Error Logging**: ALWAYS use the logger system (`logger.error`, `logger.warn`, etc.) instead of `console.*` methods
- **ESLint Rules**: NEVER disable the `no-console` ESLint rule - use proper logging instead
- **Error Handling**: Properly handle and log errors using the existing logger utility

## Branch Strategy

- **feature/\* → milestone-X.Y**: Individual features
- **milestone-X.Y → develop**: Complete milestones only
- **develop → main**: Production releases only

## Commit Rules

- Only fix/docs/CI/revert commits allowed directly on main
- All features must go through milestone branch first
- feat/style/perf must go to milestone, then develop, then main
- Always run prettier before committing

## PR Rules

- Features: Squash and merge to milestone branch
- Milestones: Create merge commit to develop
- Releases: Create merge commit to main
- Always ensure branch is up to date before merging

## Data Structure

- Firebase (if enabled) -> Dexie -> TanStack
- Zustand only is for ui state, and auth settings

## Zustand Store Standards

### **Store Types & Use Cases**

- **Core State**: Authentication, global UI settings (authStore, uiStore)
- **Feature State**: Scoped functionality (fabStore when enabled)
- **Ephemeral State**: Temporary UI (toasts, modals) - minimal scope

### **Safe Patterns - ALWAYS USE**

- **NEVER** call `get()` inside store actions (causes React error #185)
- Use `useStore.getState()` for external store access in async operations
- Use `set((state) => ...)` instead of `get()` calls for state updates
- Subscribe selectively: `useStore(state => state.specificValue)` not `useStore()`

### **Store Architecture Rules**

- **Persistent State**: Core settings that survive page refreshes
- **Computed State**: Use TanStack Query, not Zustand
- **Temporary State**: Use React useState, not global stores
- **Async Operations**: Use store reference pattern, never `get()` in timeouts/promises

### **Forbidden Patterns**

- ❌ `get()` calls inside store actions (triggers React error #185)
- ❌ Conditional store subscriptions (violates React hooks rules)
- ❌ Mixing persistent and ephemeral state in same store
- ❌ Complex computed values in stores (use TanStack Query)

### **ESLint Protection**

Custom rules prevent unsafe patterns - configured in `configs/eslint.config.js`:

- Rules validate all new Zustand code
- Violations blocked at development time
- See `docs/ESLint-Zustand-Rules.md` for details

## UI Component Standards

**ALWAYS use standardized shared UI components** - See [docs/Shared-UI-Components.md](docs/Shared-UI-Components.md)

Key components to use:

- **StandardTabs**: For all tabbed navigation with colored variants and consistent styling
- **StandardFilters**: For compact, space-efficient filtering across all pages
- **PageSummaryCard**: For page-specific metrics with gradient backgrounds
- **EditLockIndicator**: For multi-user edit conflict prevention
- **ConfirmModal** (via `useConfirm()` hook): For all confirmation dialogs
- **UniversalConnectionManager**: For entity connection management
- **Toast System**: For notifications instead of alerts
- **BillModalHeader/BillFormFields**: For bill modal components

**Design Standards:**

- **Hard Black Borders**: Use `border border-white/20 ring-1 ring-gray-800/10` on all major UI components
- **Main Container Purple Tint**: Use `rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm` for page containers
- **Typography Hierarchy**:
  - Important headers: `font-black text-black text-base` with `text-lg` first letters (ALL CAPS pattern)
  - Subtext/descriptions: `text-purple-900` for branded consistency
  - Colored text borders: Use comprehensive text-shadow for visibility against complex backgrounds
  - Perfect justification: `textAlign: 'justify', textAlignLast: 'justify'` for formal content
- **Button Standards**: All buttons must have `border-2 border-black` for consistent visual weight
- **Background Patterns**:
  - Textured patterns: Radial gradient dots with `opacity-10` overlay for sophisticated backgrounds
  - Heavy blur overlays: `backdrop-blur-3xl` with colored backgrounds for modal focus
- **Glassmorphism Styling**: Apply `.glassmorphism rounded-lg` with proper borders and shadows
- **Tab Connection**: Tabs must visually connect to content below using rounded tops and negative margins
- **Consistent Spacing**: Standard padding and margins across components
- **Color Theming**: Pastel-to-bright transitions matching summary card colors

Never create custom implementations when shared components exist.

## Refactoring Standards

**COMPREHENSIVE METHODOLOGY** - See [docs/Component-Refactoring-Standards.md](docs/Component-Refactoring-Standards.md) for complete process

**ALWAYS LOOK FOR REFACTORING OPPORTUNITIES** - See [docs/Refactoring-Opportunities-Guide.md](docs/Refactoring-Opportunities-Guide.md)

**Key Principle:** Refactor components while doing regular development work for double value

**7-Phase Proven Process:**

1. **Analysis & Planning**: Size assessment, visual documentation, extraction strategy
2. **UI/Logic Separation**: Custom hooks, component extraction, utility functions
3. **UI Standards Compliance**: Main containers, typography, buttons, shared components
4. **Comprehensive Test Coverage**: Hook testing, utility testing, component testing
5. **ESLint Compliance**: Function size limits, unused variables, complexity reduction
6. **Visual Preservation**: Pixel-perfect maintenance, responsive behavior, animations
7. **Quality Assurance**: Pre/during/post checklists, success metrics

**Proven Results:**

- **71% average code reduction** across 5 major components
- **100% visual preservation** (pixel-perfect maintenance)
- **88% record reduction** achieved (TrendAnalysisCharts: 457→55 lines)
- **Zero functionality regression** across all refactorings
- **Full UI standards compliance** and comprehensive test coverage

**Standard Practice:** Always follow the complete 7-phase process for any component 400+ lines. Extract UI to focused components, business logic to custom hooks, calculations to utilities, apply UI standards, create comprehensive tests, ensure ESLint compliance, and maintain exact visual appearance.

## ESLint Warning Resolution

**SYSTEMATIC METHODOLOGY** - See [docs/ESLint-Warning-Resolution-Rules.md](docs/ESLint-Warning-Resolution-Rules.md) for complete guidelines

**Core Principles:**

- **Never Disable Warnings**: Address underlying issues, never use `eslint-disable`
- **Preserve Future-Intent Code**: Use underscore prefix for intentionally unused variables
- **Avoid Problem Transfer**: Each fix must not introduce new ESLint warnings
- **Maintain Functionality**: All existing features must work identically after fixes

**Resolution Priority:**

1. **High Priority**: Function size (75+ lines), complexity (15+), actual unused variables
2. **Medium Priority**: Hook dependencies, max statements, unused parameters
3. **Low Priority**: Style/formatting, import order, prop validation

**Standard Process:** Extract UI components for size violations, use strategy patterns for complexity, add underscore prefix for future-use variables, verify no new warnings introduced, maintain build stability and functionality.

## Feature Implementation Workflow

**For ALL feature implementation requests, follow this mandatory workflow:**

### 1. **Issue Analysis & Expansion**

- **ALWAYS** check if GitHub issue exists first
- If exists: Read thoroughly and expand with detailed technical analysis
- If missing: Create comprehensive issue with proper labels/milestones
- Add technical specifications and acceptance criteria
- Use labels: "enhancement" and "roadmap" for new features

### 2. **Sub-Issue Creation**

- Break down complex features into manageable sub-issues
- Each sub-issue should be independently completable
- Link sub-issues to parent epic for tracking
- Assign appropriate labels (enhancement, mobile, UX, etc.)

### 3. **Implementation Planning**

- Create detailed technical plan in issue comments
- Define architecture, components, and integration points
- Map out phase-by-phase implementation strategy
- Identify dependencies and potential blockers
- Set success criteria and testing requirements

### 4. **Pre-Implementation Checklist**

- ✅ Issue properly documented and expanded
- ✅ Sub-issues created if needed
- ✅ Implementation plan commented on issue
- ✅ Architecture decisions documented
- ✅ Integration points identified
- **ONLY THEN proceed with actual coding**

**Example Pattern:**

- Read/create GitHub issue → Expand with analysis → Create technical plan → Comment plan → Break into sub-issues if complex → Begin development

**This ensures proper planning, documentation, and tracking before diving into code.**
