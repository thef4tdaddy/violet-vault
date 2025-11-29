# Violet Vault Development Rules

GitHub Copilot Agent & Claude Code configuration for Violet Vault - Secure encrypted envelope budgeting application.

## Quick Start Commands

- Run Prettier, then commit to git when done: `npm run format && git add . && git commit -m "..."`
- Make an issue on GitHub for errors reported
- Check issues and connect commits to issues
- Push to `main` only for doc updates or error fixes; otherwise create a new branch
- When creating a new branch, make a PR and connect applicable issues

## Git & GitHub Workflow

**Always follow the git workflow for commits and branches:**

- Run Prettier before committing: `npm run format`
- Create a git commit when requested using conventional commits
- For commits: use imperative mood, be specific about changes
- Push to 'main' only for doc updates or error fixes
- For new features: create a feature branch, make PR, connect to issues
- Check existing issues and link commits to them
- Use commit message format: 'type: description' (e.g., 'fix: resolve lint errors')
- Do NOT commit files with secrets (.env, credentials.json, etc)

## ChastityOS Architecture (v4.0.0)

### Key Data Flow Architecture

```
Firebase (cloud) ↔ Dexie (local IndexedDB) ↔ TanStack Query (server state cache) ↔ React Components
```

**Critical pattern rules:**

- All external data flows through Firebase first
- Local data persists in Dexie IndexedDB
- TanStack Query manages server state caching
- Components receive data from TanStack Query hooks only

### State Management

- **TanStack Query** (`@tanstack/react-query`): ALL server state, Firebase data, API calls, caching, auth operations
- **React Context**: Auth state (user, session, auth status) - NOT Zustand
- **Zustand** (`@zustand`): UI STATE ONLY (modals, forms, user preferences, loading states, temporary interactions)
- **Auth Operations**: TanStack Query mutations/queries (login, logout, session management)
- CRITICAL: Never put server/Firebase data in Zustand - use TanStack Query
- CRITICAL: Never use Context for UI state - use Zustand
- CRITICAL: Auth state is in React Context, not Zustand (v2.0+)
- Pattern: `useQuery` for reads, `useMutation` for writes

## Directory Structure & Rules

- `/src/components/` - UI ONLY, zero business logic, zero API calls, pure presentation
- `/src/services/` - ALL business logic, Firebase operations, data processing, service layer
- `/src/hooks/api/` - TanStack Query hooks (useQuery, useMutation)
- `/src/hooks/state/` - Zustand store hooks (UI state only)
- `/src/stores/` - Zustand store definitions (UI state only)
- `/src/utils/` - Pure utility functions, validation, formatting, helpers
- `/src/contexts/` - React contexts (AuthContext, app-level state)
- `/src/types/` - TypeScript type definitions and interfaces
- `/src/domain/schemas/` - Zod validation schemas for all data models
- `/src/constants/` - Application constants and enums
- `/src/db/` - Dexie database setup and types

## 🚫 CRITICAL RULES - ZERO TOLERANCE

### NO 'ANY' TYPES - EVER

**CRITICAL: ZERO tolerance for 'any' types in TypeScript**

- ABSOLUTELY NO 'any' types in ANY file - this is non-negotiable
- Use proper TypeScript types or interfaces for ALL variables
- If type is unknown: use `unknown`, type guards, or `z.infer<>`
- If type is complex: create an interface or type definition
- Use Zod schemas to validate and infer types from unknown data
- For generic functions: use generics with proper constraints
- For third-party libraries without types: declare proper types
- Code review will REJECT any commits with 'any' types

### @ IMPORT PATHS - ALWAYS

**CRITICAL: ALL imports must use @ alias syntax**

- ALWAYS use `@` import alias: `import { foo } from '@/utils/bar'`
- NEVER use relative imports: `import { foo } from '../../utils/bar'` ❌
- All `@` paths resolve to `/src` directory
- Path alias prevents refactoring issues and improves readability
- Update `tsconfig.json` and `vite.config.js` if adding new paths
- Prettier will auto-format, but start with @ imports
- Code review will flag any relative imports

## Code Quality Standards

- Use `logger` utility instead of `console.log`: `import logger from '@/utils/common/logger'`
- TypeScript strict mode enabled - use proper types ONLY
- Use path alias `@` for imports: `import { foo } from '@/utils/bar'`
- All imports must resolve to @ paths when possible
- No unused variables - use underscore prefix if intentional: `const _unused = value`
- ESLint must pass with zero errors
- Prettier must format all code automatically
- Max 100 imports per file (split large files)
- Max 200 lines per component (extract logic to hooks/utils)
- Max 300 lines per service (split into focused services)

## Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with 'use' prefix (`useUserProfile.ts`)
- Utils/Services: camelCase (`userProfileUtils.ts`, `userProfileService.ts`)
- Constants: UPPER_SNAKE_CASE (`USER_PROFILE_MAX_LENGTH`)
- Types/Interfaces: PascalCase (`UserProfile`, `UserProfileProps`)
- Database collections: camelCase (`userProfiles`, `budgetData`)
- Zod schemas: PascalCase with 'Schema' suffix (`UserProfileSchema`)

## Type Safety with Zod

- Use Zod schemas for all data validation from Firebase
- All API responses must be validated with Zod schemas
- Use `z.infer<typeof Schema>` for type inference
- Pattern: `const validated = MySchema.parse(data)` for data validation
- Use `.safeParse()` to handle validation errors gracefully
- All service layer methods should return validated types
- Create schemas in `/src/domain/schemas/` organized by domain

## Testing Standards

- Use Vitest for unit tests
- Test files: `component/__tests__/Component.test.tsx`
- Test files: `service/__tests__/serviceName.test.ts`
- Mock Firebase calls using `vi.mock()` in tests
- Use `Mock` type from vitest for proper typing: `vi.fn() as Mock<...>`
- Test files should have zero 'any' types
- Aim for >80% code coverage on critical paths
- Run tests: `npm run test` or `npm run test:run` for CI

## React Component Patterns

- Functional components only (no class components)
- Use hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`
- Props must be typed: `interface ComponentProps { ... }`
- Extract large effects into custom hooks
- Use `React.memo` for expensive components
- Pattern: separate presentation from logic using custom hooks
- All event handlers should have proper TypeScript signatures
- Use `useCallback` to memoize function props
- Components must not call Firebase APIs directly
- Components must not make direct HTTP requests

## Form Handling

- Use Zod schemas for all form validation
- Pattern: Create form schema, create form component, handle validation
- Validation errors must come from Zod schema parsing
- Store form state in Zustand (UI state)
- Submit handlers use TanStack Query mutations (server state)
- Show validation errors inline next to form fields
- Never commit with form validation logic scattered across component

## Firebase & Database Operations

- All Firebase calls must be in `/src/services/`
- Never call Firebase methods from components directly
- Use TanStack Query for all data fetching
- Pattern: Create service method → wrap with TanStack Query hook → use in component
- Dexie for local offline storage and caching
- Firestore for cloud data persistence
- All database operations must be validated with Zod
- Handle offline scenarios gracefully

## Error Handling

- Always log errors: `logger.error('context', error)`
- Provide user-friendly error messages
- Use `try-catch` in service layer, not components
- Return error objects with structure: `{ success: false, error: 'message' }`
- Validate data before processing in services
- Handle Firebase auth errors specifically
- Network errors should trigger offline fallback

## Documentation

- Add JSDoc comments to exported functions
- Add TypeScript comments for complex logic
- Update `README.md` for new features
- Document API changes in commit messages
- Add inline comments for non-obvious logic

## Performance Optimization

- Use `React.memo` for memoization: `export default React.memo(Component)`
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Implement list virtualization for long lists: `useVirtualList` or `@tanstack/react-virtual`
- Lazy load components: `React.lazy()` and `<Suspense>`
- Debounce search inputs and rapid API calls
- Profile bundle size regularly
- Cache computed values in TanStack Query

## Security Best Practices

- Never store sensitive data in `localStorage` (use secure storage)
- Never commit `.env` files or secrets
- Use HTTPS for all API calls
- Validate all user input server-side
- Use encryption for sensitive data in Firestore
- Follow OWASP security guidelines
- Regular security audits of dependencies
- Use Content Security Policy headers

## Common Patterns

### TanStack Query Hook Pattern

Standard pattern for data fetching:

```typescript
// In /src/hooks/api/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await userService.getUsers();
      return UsersSchema.parse(data);
    },
  });
};

// In component
const { data: users, isLoading } = useUsers();
```

### Zustand Store Pattern

UI state management with Zustand:

```typescript
// In /src/stores/ui/modalStore.ts
import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
```

### Service Layer Pattern

Business logic in service layer:

```typescript
// In /src/services/userService.ts
import { UserSchema } from "@/domain/schemas/user";
import logger from "@/utils/common/logger";

export const userService = {
  async getUsers() {
    try {
      const data = await db.users.toArray();
      return UserSchema.array().parse(data);
    } catch (error) {
      logger.error("Failed to fetch users", error);
      throw new Error("Failed to fetch users");
    }
  },
};
```

### Component Pattern

Proper component structure:

```typescript
import React, { useCallback } from 'react';
import { useUsers } from '@/hooks/api/useUsers';
import { useModalStore } from '@/stores/ui/modalStore';
import { useAuth } from '@/contexts/AuthContext'; // Auth from Context, not Zustand

interface UserListProps {
  onSelect: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ onSelect }) => {
  const { data: users, isLoading } = useUsers();
  const { isOpen } = useModalStore();
  const { user, isAuthenticated } = useAuth(); // Auth state from Context

  const handleUserClick = useCallback((userId: string) => {
    onSelect(userId);
  }, [onSelect]);

  if (!isAuthenticated) return <div>Please log in</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id} onClick={() => handleUserClick(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};
```

## Development Workflow

- Create feature branch from develop: `git checkout -b feature/description`
- Make focused commits with clear messages
- Keep PRs under 400 lines of changes when possible
- Request review before merging
- All tests must pass before merging
- Rebase onto develop before merge to keep history clean
- Delete branch after merge
- For urgent fixes: cherry-pick to main, then backport

## Commit Message Format

```
type: brief description

[optional] longer explanation of changes

Fixes #issue-number (if applicable)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Command Patterns

- Fix TypeScript errors: `npm run typecheck`
- Fix linting: `npm run lint:fix`
- Format code: `npm run format`
- Run tests: `npm run test` or `npm run test:run`
- Build: `npm run build`
- Type check watch: `npm run tsc:watch`
- Full audit: `npm run audit:full`

## Prohibited

- 🚫 NO 'any' types - EVER - use proper types or Zod schemas
- 🚫 NO relative imports - ALWAYS use '@' path aliases
- 🚫 NO inline `eslint-disable` comments - ALL disables must be in `configs/linting/config-modules/exclusions-config.js` with approval and explanation
- No `console.log()` - use logger utility
- No business logic in components
- No direct Firebase calls in components
- No API calls from components
- No server data in Zustand stores
- No UI state in Context (use Zustand)
- No unused imports or variables
- No hardcoded values (use constants)
- No mixing concerns (keep separation of concerns)

## ESLint Disable Policy

**CRITICAL**: All ESLint rule disables must be:

1. Added to `configs/linting/config-modules/exclusions-config.js`
2. Include a clear explanation of WHY the disable is needed
3. Marked with "APPROVED:" comment if user-approved
4. NEVER use inline `eslint-disable` comments in source files

**Example format in exclusions-config.js:**

```javascript
{
  // Clear explanation of why this exclusion is needed
  // APPROVED: Brief approval note if user-approved
  files: ["path/to/file.ts"],
  rules: {
    "rule-name": "off", // Specific reason for this disable
  },
}
```
