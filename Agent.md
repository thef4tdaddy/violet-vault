# 🤖 VioletVault v2.0 Agent Instructions

## 🎯 Current Mission

**v2.0 Baseline Complete** - Full TypeScript conversion, Unified Data Model (Envelopes + Transactions), React 19, and modern glassmorphic UI.

**Next Target**: v2.1 Sentinel Share, Dashboard & Marketing - Cross-app transaction matching and enhanced analytics.

## 🏗️ Architecture Stack (v2.0)

- **Frontend**: React 19 + TypeScript (strict mode) + Vite 7
- **Local DB**: Dexie.js (Offline-first, E2EE via IndexedDB)
- **Cloud DB/Auth**: Firebase Firestore + Auth
- **State Management**:
  - TanStack Query v5 → Server state (Firebase, API)
  - React Context → Auth state (user, session)
  - Zustand → UI state only (modals, forms)
- **Backend (Go)**: `/api/bug-report.go` (GitHub API proxy, secrets handling)
- **Backend (Python)**: `/api/analytics.py` (Financial intelligence, predictions)

## 📋 Coding Standards

### General

- **No placeholders** - All features must be fully functional
- **High aesthetics** - Glassmorphism, dark mode, premium UI
- **TypeScript strict** - Zero `any` types allowed
- **@ imports only** - Always use `@/` path aliases, never relative imports

### Testing

- **Mandatory 80%+ coverage** for all new/modified code (Frontend & Backend)
- **Vitest** (Frontend), **pytest** (Python), **go test** (Go)
- Run `npm run test:run` before PRs

### Linting & Formatting

- **React**: ESLint + Prettier + TSC
- **Go**: `golangci-lint` + `gofmt`
- **Python**: `Ruff` (linter/formatter) + `Mypy` (typing)
- **Full audit**: `./scripts/full_salvo.sh` before all PRs

## 🔄 Active Roadmap

Refer to GitHub Epic [#1463](https://github.com/thef4tdaddy/violet-vault/issues/1463) for detailed sub-tasks.

- **v2.0** ✅ - TypeScript Baseline, Unified Model
- **v2.1** (Mar 2026) - Intelligent Automation & Discovery
- **v2.2** (Jun 2026) - Performance & Visualization
- **v3.0** (2027) - Collaborative Budgeting

## ⚠️ Critical Rules

- **E2EE**: Core budgeting data MUST stay client-side encrypted
- **No server data in Zustand**: Use TanStack Query for all Firebase/API data
- **Auth in Context**: Auth state lives in React Context, not Zustand (v2.0+)
- **Test coverage**: All PRs MUST include tests (80%+ for new files)
- **Commit frequently**: Small, focused commits with conventional commit messages

## 📚 Key Documentation

- [GEMINI.md](./GEMINI.md) - Antigravity AI agent config
- [.github/agents/violet-vault.yml](./.github/agents/violet-vault.yml) - GitHub Copilot agent config
- [docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md) - Complete docs index
- [docs/guides/MILESTONES.md](./docs/guides/MILESTONES.md) - 2026 roadmap

---

_Last Updated: January 18, 2026_
