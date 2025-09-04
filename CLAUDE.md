- If there is a bug on main, create an issue for it, in case we are unable to fix it in the moment so there is tracking.
- If I suggest a new feature, create a GH issue for it so it can be tracked to completion.
- When creating issues, if its a GH issue for a bug use label "bug" , if its a new feature / enhancement use the label "enhancement" and "roadmap" on the issue

- Always Commit Changes Frequently so changes can be easily reverted

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
- **Glassmorphism Styling**: Apply `.glassmorphism rounded-lg` with proper borders and shadows
- **Tab Connection**: Tabs must visually connect to content below using rounded tops and negative margins
- **Consistent Spacing**: Standard padding and margins across components
- **Color Theming**: Pastel-to-bright transitions matching summary card colors

Never create custom implementations when shared components exist.

## Refactoring Standards

- **Preserved Visual Appearance**: Exact same UI while dramatically reducing complexity when refactoring
- Component extractions must maintain pixel-perfect visual appearance
- User experience should remain identical after refactoring
- Focus on code organization and maintainability without UI changes
