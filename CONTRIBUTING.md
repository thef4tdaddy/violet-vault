# Contributing to VioletVault

## 🚀 Development Workflow

This project uses native **TypeScript**, automated testing, and release automation.

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for automated changelog generation and semantic versioning.

Format: `<type>(<scope>): <description>`

#### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, glassmorphism)
- `refactor`: Refactoring code
- `perf`: Performance
- `test`: Adding or updating tests
- `ci`: CI/CD changes

#### Examples:

```bash
feat: add glassmorphic card for envelopes
fix: resolve dexie sync race condition
docs: update V2 architecture overview
test: add 80%+ coverage for TransactionService
```

### 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Run full audit (Lint + Typecheck + Coverage)
npm run audit:full

# Fix linting issues
npm run lint:fix

# Run tests
npm run test:run

# Build for production
npm run build
```

### 🧬 TypeScript Standards

VioletVault v2.0 is **100% strict TypeScript**. Follow these guidelines:

- **No `any`**: Use proper interfaces or `unknown` with type guards.
- **Strict Interfaces**: Define all component props and hook return types.
- **Zod Validation**: All external data (API/Dexie) must be validated with Zod schemas.
- **Path Aliases**: Always use `@/` for imports (e.g., `@/components/Button`).

### 📦 Code Quality Gates

Before submitting a Pull Request:

1. **Linting**: Must pass `npm run lint` with zero errors.
2. **Typecheck**: Must pass `npm run typecheck` with no errors.
3. **Coverage**: New code **MUST** have 80%+ test coverage.
4. **Build**: Build must complete successfully (`npm run build`).

### 🎨 UI & Aesthetics

- **Glassmorphism**: Follow the v2 design system using backdrop-filters and subtle borders.
- **Shared Components**: Never reinvent the wheel. Use components from `src/components/shared`.
- **Responsive**: Ensure all UI elements work on mobile (375px+) and desktop.

---

## 🏗️ Release Process

1. Merge approved PRs into `milestone-X.Y` or `develop`.
2. Releases are tagged and artifacts generated automatically via GitHub Actions.
3. Changelogs are derived from conventional commits.

---

_Last Updated: January 18, 2026_
