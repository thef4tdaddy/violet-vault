# 🤖 VioletVault v2.0 Agent instructions

## 🏁 Current Mission

We are performing a **Full Rewrite** of VioletVault into a **Hybrid Polyglot Architecture** (React + Go + Python + Firebase) hosted on **Vercel**.

## 🏗️ Architecture Stack

- **Frontend**: React (Vite)
- **Local DB**: Dexie.js (Offline-first, E2EE)
- **Cloud DB/Auth**: Firebase Firestore
- **Backend (Go)**: `/api/bug-report.go` (Proxying, Secrets)
- **Backend (Python)**: `/api/analytics.py` (Intelligence, Analytics)

## 📋 Coding Standards

- **General**: No placeholders. High aesthetics (Glassmorphism, Dark Mode).
- **React**: ESLint, Prettier, strict TypeScript.
- **Go**: `golangci-lint`, `gofmt`.
- **Python**: `Ruff` (Linter & Formatter), `Mypy` (Typing).

## 🚀 Active Roadmap

Refer to GitHub Epic [#1463](https://github.com/thef4tdaddy/violet-vault/issues/1463) for sub-tasks.

- **Phase 1**: Sync Service Consolidation (Merge `typed*` services).
- **Phase 2**: Backend migrations (Bug reporting to Go, Analytics to Python).
- **Phase 3**: CI/CD Consolidation (Lighthouse + Quality + Salvo).

## ⚠️ Important Rules

- Core budgeting data MUST stay client-side encrypted (E2EE).
- Only non-sensitive or already-decrypted logic should be offloaded to `/api`.
- Always run `full_salvo.sh` before PRs.
