# Documentation Index

**Last Updated:** January 18, 2026  
**Version:** v2.0.0

Complete index of all documentation in the VioletVault repository, organized by category and location.

---

## 📁 Root Documentation

- **[README.md](../README.md)** - Project overview, features, and quick start
- **[CHANGELOG.md](../CHANGELOG.md)** - Complete version history and release notes
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines and development workflow
- **[SECURITY.md](../SECURITY.md)** - Security policy and vulnerability reporting
- **[CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)** - Community guidelines
- **[Agent.md](../Agent.md)** - AI agent instructions for development
- **[GEMINI.md](../GEMINI.md)** - Antigravity AI agent configuration

---

## 🏗️ Architecture Documentation

**Location:** `docs/architecture/`

### Core Architecture

- **[Source Code Directory](architecture/Source-Code-Directory.md)** - Complete codebase structure and organization
- **[Data Model Simplification](architecture/DATA_MODEL_SIMPLIFICATION.md)** - Unified Envelope/Transaction model (v2.0)
- **[Domain Logic Decoupling](architecture/DOMAIN_LOGIC_DECOUPLING.md)** - Execution Plan pattern and pure functions

### State Management

- **[Client State Management](architecture/Client-State-Management.md)** - Zustand & React Context patterns (v2.0)
- **[Client State Patterns](architecture/Client-State-Patterns.md)** - Safe state management patterns
- **[Client State Templates](architecture/Client-State-Templates.md)** - TypeScript store templates
- **[Client State Audit](architecture/Client-State-Audit.md)** - State management audit report

### Services & Infrastructure

- **[TypedFirebaseServices](architecture/TypedFirebaseServices.md)** - Type-safe Firebase sync architecture

---

## 🎨 Shared UI Documentation

**Location:** `docs/shared-ui/`

- **[Component Catalog](shared-ui/index.md)** - Shared UI components index
- **[Components](shared-ui/components.md)** - Detailed component documentation
- **[Design Standards](shared-ui/design-standards.md)** - Glassmorphism, typography, and visual standards
- **[Patterns](shared-ui/patterns.md)** - UI interaction patterns and best practices

---

## 🚀 Features Documentation

**Location:** `docs/features/`

- **[Offline Queue](features/offline-queue.md)** - Complete offline request queuing system
- **[Offline Queue Quickstart](features/offline-queue-quickstart.md)** - Quick setup guide
- **[Progressive Enhancement](features/progressive-enhancement.md)** - Fallback strategies and service availability
- **[WebSocket Signaling](features/websocket-signaling.md)** - Privacy-preserving real-time sync
- **[Sync Orchestration](features/sync-orchestration.md)** - Sync service consolidation summary

---

## 🔌 API Documentation

**Location:** `docs/api/`

- **[API Development Guide](api/API-Development-Guide.md)** - Complete API documentation with OpenAPI spec
- **[API Response Validation](api/API-Response-Validation-Guide.md)** - Zod validation for API responses
- **[OpenAPI Implementation](api/OpenAPI-Implementation-Summary.md)** - OpenAPI 3.0 implementation details
- **[Sync Manager API](api/sync-manager-api.md)** - Sync manager service interface

---

## 📖 Guides

**Location:** `docs/guides/`

- **[Milestones](guides/MILESTONES.md)** - Release planning and 2026 roadmap
- **[Production Deployment](guides/Production-Deployment-Guide.md)** - Branch strategy and deployment process
- **[Troubleshooting FAQ](guides/Troubleshooting-FAQ.md)** - Common issues and solutions

---

## 🔄 Migration Documentation

**Location:** `docs/migration/`

- **[v2.0 Migration Guide](migration/v2.0-migration-guide.md)** - Complete guide for migrating to v2.0

---

## 💻 Development Documentation

**Location:** `docs/development/`

### Core Standards

- **[Development Standards](development/STANDARDS.md)** - Coding standards and best practices

### Guidelines

**Location:** `docs/development/guidelines/`

- **[ESLint Rules](development/guidelines/ESLint-Rules.md)** - ESLint configuration and rules (v2.0)
- **[Lint Warnings](development/guidelines/LINT_WARNINGS.md)** - Historical lint tracking (v2.0 baseline)
- **[Component Refactoring Standards](development/guidelines/Component-Refactoring-Standards.md)** - Proven refactoring methodology
- **[Component Props Validation](development/guidelines/Component-Props-Validation-Guide.md)** - Zod schema validation for props
- **[ESLint Warning Resolution](development/guidelines/ESLint-Warning-Resolution-Rules.md)** - Systematic warning resolution

### Tools

**Location:** `docs/development/tools/`

- **[Claude AI Guide](development/tools/CLAUDE.md)** - Claude AI integration and usage

---

## 🧪 Testing Documentation

**Location:** `docs/testing/`

- **[Coverage Gap Analysis](testing/COVERAGE_GAP_ANALYSIS.md)** - Test coverage priorities
- **[Polyglot Backend Testing](testing/polyglot-backend-testing.md)** - Go/Python testing strategies
- **[Workflow Testing](testing/workflow-testing.md)** - GitHub Actions workflow testing

---

## ⚙️ Setup Documentation

**Location:** `docs/setup/`

### Firebase

- **[Firebase Setup Guide](setup/Firebase-Setup-Guide.md)** - Complete Firebase configuration
- **[Firebase Auth Domain](setup/Firebase-Auth-Domain-Setup.md)** - Auth domain configuration
- **[Firebase Cloud Messaging](setup/Firebase-Cloud-Messaging-Setup.md)** - FCM setup
- **[Firebase Rules Update](setup/FIREBASE_RULES_UPDATE.md)** - Security rules

### GitHub

- **[Branch Protection Rules](setup/Branch-Protection-Rules.md)** - Branch protection configuration

### Services

- **[Bug Report System](setup/Bug-Report-System-Setup.md)** - Bug reporting setup
- **[Sentry Setup](setup/SENTRY_SETUP_CHECKLIST.md)** - Sentry error tracking
- **[Sentry Network Debugging](setup/SENTRY_NETWORK_DEBUGGING.md)** - Network debugging
- **[Sentry Vercel Troubleshooting](setup/SENTRY_VERCEL_TROUBLESHOOTING.md)** - Vercel integration
- **[Sentry Rules](setup/Sentry Rules.md)** - Sentry configuration rules

### Other

- **[Setup README](setup/README.md)** - Setup documentation index

---

## 📦 Archive

**Location:** `docs/archive/`

Historical documentation from v1.x and previous development phases. Preserved for reference but not actively maintained.

**Notable Archived Docs:**

- TypeScript conversion guides
- v1.x Zustand patterns
- Historical audits and reports
- Legacy refactoring guides

---

## 🗂️ Other Documentation

### Components

**Location:** `docs/components/`

- **[Header Primitives](components/header-primitives.md)** - Header component primitives

### Examples

**Location:** `docs/examples/`

- Example implementations and usage patterns

### Roadmap

**Location:** `docs/roadmap/`

- Future planning and feature roadmap documents

---

## 📝 Quick Reference

### For New Contributors

1. Start with [README.md](../README.md)
2. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
3. Review [Development Standards](development/STANDARDS.md)
4. Check [Architecture Documentation](#-architecture-documentation)

### For Development

- **State Management**: [Client State Management](architecture/Client-State-Management.md)
- **API Development**: [API Development Guide](api/API-Development-Guide.md)
- **Testing**: [Testing Documentation](#-testing-documentation)
- **Deployment**: [Production Deployment](guides/Production-Deployment-Guide.md)

### For Troubleshooting

- **FAQ**: [Troubleshooting FAQ](guides/Troubleshooting-FAQ.md)
- **Migration**: [v2.0 Migration Guide](migration/v2.0-migration-guide.md)

---

**Note:** All documentation reflects v2.0 architecture with TypeScript, Unified Data Model, and modern React 19 patterns.
