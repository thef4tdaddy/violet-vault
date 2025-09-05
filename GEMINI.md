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
