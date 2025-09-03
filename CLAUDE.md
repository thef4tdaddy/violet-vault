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
- **EditLockIndicator**: For multi-user edit conflict prevention
- **ConfirmModal** (via `useConfirm()` hook): For all confirmation dialogs
- **UniversalConnectionManager**: For entity connection management
- **Toast System**: For notifications instead of alerts
- **BillModalHeader/BillFormFields**: For bill modal components

Never create custom implementations when shared components exist.
