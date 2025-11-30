# VioletVault Documentation Index

This document serves as a central navigation hub for all documentation in the VioletVault repository.

## Table of Contents

- [Essential Documentation](#essential-documentation)
- [Module-specific Documentation](#module-specific-documentation)
- [API Documentation](#api-documentation)
- [Architecture Documentation](#architecture-documentation)
- [Development Guidelines](#development-guidelines)
- [Development Tools](#development-tools)
- [Guides](#guides)
- [Setup Documentation](#setup-documentation)
- [Archived Documentation](#archived-documentation)

---

## Essential Documentation

These are core project documentation files that should be referenced frequently:

| File            | Location | Description                                                     |
| --------------- | -------- | --------------------------------------------------------------- |
| README.md       | Root     | Main project documentation, features, and getting started guide |
| CHANGELOG.md    | docs/    | Version history and release notes                               |
| CONTRIBUTING.md | docs/    | Contribution guidelines and development workflow                |
| ROADMAP.md      | docs/    | Project roadmap and future development plans                    |

---

## Module-specific Documentation

Documentation for specific modules and components within the codebase:

| File                | Location                     | Description                                      |
| ------------------- | ---------------------------- | ------------------------------------------------ |
| README.md           | src/utils/testing/factories/ | Test schema factories and fixtures documentation |
| README.md           | src/hooks/common/validation/ | Validation hooks documentation                   |
| README.md           | src/domain/schemas/          | Schema documentation                             |
| README.md           | src/utils/debug/             | Debug utilities documentation                    |
| README.md           | src/utils/dataManagement/    | Data management documentation                    |
| README.md           | src/components/receipts/     | Receipt components documentation                 |
| PWA-TYPES-README.md | src/                         | PWA types documentation                          |
| README.md           | scripts/                     | Scripts documentation                            |
| README.md           | public/test-data/            | Test data documentation                          |
| README.md           | cloudflare-worker/           | Cloudflare worker documentation                  |
| CHANGELOG.md        | public/                      | Public changelog                                 |

---

## API Documentation

Documentation for APIs and integration:

| File                              | Location  | Description                                           |
| --------------------------------- | --------- | ----------------------------------------------------- |
| API-Development-Guide.md          | docs/api/ | Complete API documentation with OpenAPI specification |
| API-Response-Validation-Guide.md  | docs/api/ | API response validation patterns                      |
| OpenAPI-Implementation-Summary.md | docs/api/ | OpenAPI implementation details                        |

**Note:** Interactive Swagger UI is available at `/api-docs` when running the application.

---

## Architecture Documentation

Documentation about system architecture and design:

| File                          | Location           | Description                                        |
| ----------------------------- | ------------------ | -------------------------------------------------- |
| Source-Code-Directory.md      | docs/architecture/ | Complete directory structure and file descriptions |
| TypedFirebaseServices.md      | docs/architecture/ | Firebase services with TypeScript types            |
| Zustand-Architecture-Guide.md | docs/architecture/ | Zustand state management architecture              |
| Zustand-Store-Templates.md    | docs/architecture/ | Zustand store templates and patterns               |
| Zustand-Store-Audit-Report.md | docs/architecture/ | Zustand store implementation audit                 |
| Zustand-Safe-Patterns.md      | docs/architecture/ | Safe patterns for Zustand usage                    |

---

## Development Guidelines

Coding standards, patterns, and best practices:

| File                                | Location                     | Description                                      |
| ----------------------------------- | ---------------------------- | ------------------------------------------------ |
| Component-Props-Validation-Guide.md | docs/development/guidelines/ | Runtime prop validation with Zod schemas         |
| Component-Refactoring-Standards.md  | docs/development/guidelines/ | Component refactoring methodology and standards  |
| ESLint-Rules.md                     | docs/development/guidelines/ | ESLint rules and configuration                   |
| ESLint-Zustand-Rules.md             | docs/development/guidelines/ | ESLint rules specific to Zustand                 |
| ESLint-Warning-Resolution-Rules.md  | docs/development/guidelines/ | Systematic approach to resolving ESLint warnings |
| LINT_WARNINGS.md                    | docs/development/guidelines/ | ESLint warning tracking and resolution           |
| React-Error-185-Prevention.md       | docs/development/guidelines/ | Prevention of React Error #185                   |
| Refactoring-Opportunities-Guide.md  | docs/development/guidelines/ | Guide to refactoring opportunities               |

---

## Development Tools

Documentation for development tools and configurations:

| File      | Location                | Description                                    |
| --------- | ----------------------- | ---------------------------------------------- |
| CLAUDE.md | docs/development/tools/ | Development guidelines for Claude AI assistant |

---

## Guides

User guides and tutorials:

| File                           | Location     | Description                      |
| ------------------------------ | ------------ | -------------------------------- |
| Troubleshooting-FAQ.md         | docs/guides/ | Common issues and solutions      |
| Production-Deployment-Guide.md | docs/guides/ | Production deployment procedures |
| MILESTONES.md                  | docs/guides/ | Project milestone tracking       |

---

## Setup Documentation

Setup and configuration guides:

| File                              | Location    | Description                                  |
| --------------------------------- | ----------- | -------------------------------------------- |
| Firebase-Setup-Guide.md           | docs/setup/ | Firebase configuration and setup             |
| Firebase-Cloud-Messaging-Setup.md | docs/setup/ | Firebase Cloud Messaging setup               |
| Firebase-Auth-Domain-Setup.md     | docs/setup/ | Firebase authentication domain configuration |
| FIREBASE_RULES_UPDATE.md          | docs/setup/ | Firebase security rules update               |
| Bug-Report-System-Setup.md        | docs/setup/ | Bug report system configuration              |
| Branch-Protection-Rules.md        | docs/setup/ | Branch protection and workflow rules         |
| Sentry Rules.md                   | docs/setup/ | Sentry error tracking configuration          |

## Migration Documentation

Version migration guides:

| File                    | Location        | Description                          |
| ----------------------- | --------------- | ------------------------------------ |
| v2.0-migration-guide.md | docs/migration/ | Complete guide for migrating to v2.0 |

---

## Shared UI Documentation

UI components and design patterns:

| File                    | Location        | Description                          |
| ----------------------- | --------------- | ------------------------------------ |
| Shared-UI-Components.md | docs/shared-ui/ | Standardized UI components and usage |
| design-standards.md     | docs/shared-ui/ | UI design standards and patterns     |
| components.md           | docs/shared-ui/ | Component library documentation      |
| patterns.md             | docs/shared-ui/ | UI design patterns                   |

---

## Archived Documentation

Historical documentation, completed plans, and one-time reports:

| File                                 | Location      | Description                                 |
| ------------------------------------ | ------------- | ------------------------------------------- |
| README-PHASE-1.md                    | docs/archive/ | Outdated Phase 1 conversion guide           |
| Refactoring-Opportunities-Guide 2.md | docs/archive/ | Duplicate of refactoring guide              |
| 2.0-RELEASE-README.md                | docs/archive/ | Version 2.0 release documentation           |
| 2.0-RELEASE-CHECKLIST.md             | docs/archive/ | Version 2.0 release checklist               |
| 2.0-RELEASE-AUDIT-REPORT.md          | docs/archive/ | Version 2.0 release audit report            |
| 2.0-AUDIT-SUMMARY.md                 | docs/archive/ | Version 2.0 audit summary                   |
| BugsNotes11022025.md                 | docs/archive/ | Bug notes from November 2, 2025             |
| MARKDOWN-CLEANUP-PLAN.md             | docs/archive/ | Previous markdown cleanup plan              |
| TYPECHECK-ERROR-REMEDIATION-PLAN.md  | docs/archive/ | Historical typecheck error remediation plan |
| COMPREHENSIVE-REFACTORING-PLAN.md    | docs/archive/ | Old comprehensive refactoring plan          |
| CONFIG-MIGRATION-ANALYSIS.md         | docs/archive/ | Configuration migration analysis            |
| CONFIG-MIGRATION-INDEX.md            | docs/archive/ | Configuration migration index               |
| TYPESCRIPT-CONVERSION-ROADMAP.md     | docs/archive/ | TypeScript conversion roadmap               |
| PHASE-3-SUMMARY.md                   | docs/archive/ | Phase 3 implementation summary              |
| REFACTORING-ROADMAP.md               | docs/archive/ | Refactoring roadmap                         |
| ICON_MIGRATION_PLAN.md               | docs/archive/ | Icon migration implementation plan          |
| SMART-SUGGESTIONS-DATA.md            | docs/archive/ | Smart suggestions data documentation        |
| ANALYTICS_OPTIMIZATION.md            | docs/archive/ | Analytics optimization summary              |
| GITHUB-WORKFLOWS-AUDIT.md            | docs/archive/ | GitHub workflows audit report               |
| VSCode-Tasks-Guide.md                | docs/archive/ | VSCode tasks configuration guide            |
| Scripts-Guide.md                     | docs/archive/ | Scripts usage guide                         |
| CONFIG-REVIEW.md                     | docs/archive/ | Configuration review                        |
| visual-standardization-audit.md      | docs/archive/ | Visual standardization audit report         |
| pr-1072-audit.md                     | docs/archive/ | PR #1072 audit report                       |
| branch-protection-audit.md           | docs/archive/ | Branch protection audit report              |
| audit-report.md                      | docs/archive/ | Combined audit report                       |
| PWA-TYPES-IMPLEMENTATION.md          | docs/archive/ | PWA types implementation summary            |
| validation-corruption.md             | docs/archive/ | Validation corruption issue documentation   |
| TESTING_DOCUMENTATION.md             | docs/archive/ | Testing documentation                       |
| TESTING_EPIC_GUIDE.md                | docs/archive/ | Testing epic guide                          |
| TESTING-GAPS-ANALYSIS.md             | docs/archive/ | Testing gaps analysis                       |
| TEST-DATA-GUIDE.md                   | docs/archive/ | Test data usage guide                       |
| Testing-Strategy.md                  | docs/archive/ | Testing strategy document                   |
| Testing-Checklist.md                 | docs/archive/ | Testing checklist                           |
| TypeScript-Patterns-Guide.md         | docs/archive/ | TypeScript patterns guide                   |
| TYPE_CHECKING.md                     | docs/archive/ | Type checking documentation                 |
| ZOD-INTEGRATION-GUIDE.md             | docs/archive/ | Zod integration guide                       |
| ZOD-INTEGRATION-COMPLETION.md        | docs/archive/ | Zod integration completion report           |
| ZOD-IMPLENTATION.md                  | docs/archive/ | Zod implementation audit                    |

---

## Other Documentation

Additional documentation directories:

| Directory       | Location | Description                  |
| --------------- | -------- | ---------------------------- |
| audits/         | docs/    | Audit reports and analyses   |
| examples/       | docs/    | Code examples and samples    |
| implementation/ | docs/    | Implementation details       |
| issues/         | docs/    | Issue-specific documentation |
| roadmap/        | docs/    | Roadmap files and planning   |
