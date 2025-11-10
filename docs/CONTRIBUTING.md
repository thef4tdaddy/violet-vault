# Contributing to VioletVault

## Development Workflow

This project uses conventional commits, automated testing, and release automation to maintain code quality.

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for automated changelog generation and semantic versioning.

Format: `<type>(<scope>): <description>`

#### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

#### Examples:

```bash
feat: add dark mode toggle to settings
fix: resolve infinite loop in envelope calculations
docs: update API documentation
refactor: extract envelope operations to custom hook
```

### Development Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview

# Check commit message format
npm run check-commit
```

### Git Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Runs linting and build validation
- **commit-msg**: Validates commit message format using commitlint

### Release Process

Releases are automated using Release Please:

1. Make commits following conventional commit format
2. Push to `main` branch
3. Release Please will automatically:
   - Create a release PR with changelog
   - Update version numbers
   - Create GitHub releases when PR is merged

### Code Quality

Before committing:

1. Code must pass ESLint with no warnings
2. Build must complete successfully
3. Commit messages must follow conventional format
4. Use standardized UI components (see [Shared UI Components](docs/Shared-UI-Components.md))

The pre-commit hook will automatically check these requirements.

### UI Component Standards

**Always use shared UI components** instead of creating custom implementations:

- **EditLockIndicator**: For multi-user edit conflict prevention
- **ConfirmModal**: For all confirmation dialogs (via `useConfirm()` hook)
- **UniversalConnectionManager**: For entity connection management
- **Toast System**: For notifications and alerts

See the **[Shared UI Components Guide](docs/Shared-UI-Components.md)** for complete documentation of available components, usage guidelines, and design patterns.

### TypeScript/JSDoc Patterns

VioletVault uses **JavaScript with JSDoc annotations** for type safety. Follow these guidelines:

- **Document public APIs**: Type all exported hooks, components, and service functions
- **Use `@typedef` for complex types**: Share type definitions across files
- **Provide fallback values**: Handle `undefined`/`null` cases gracefully
- **Validate critical inputs**: Add runtime checks for enum/union values

See the **[Documentation Index](docs/DOCUMENTATION_INDEX.md)** for a complete overview of all documentation, including TypeScript patterns and typing guidelines.

### Getting Started

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Make changes following the guidelines above
4. Commit using conventional format: `git commit -m "feat: your feature description"`

### Release Please Integration

- Conventional commits automatically trigger version bumps:
  - `feat`: minor version bump
  - `fix`: patch version bump
  - `feat!` or `fix!` (breaking): major version bump
- Changelog is automatically generated from commit messages
- GitHub releases include build artifacts
