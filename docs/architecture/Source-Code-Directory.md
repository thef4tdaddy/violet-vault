# VioletVault Source Code Directory

**Last Updated:** January 18, 2026
**Branch:** main (v2.0 - Unified Model & TypeScript - Baseline)
**Total Files:** 400+ files across a modular, type-safe architecture

This document provides an overview of the `/src/` directory structure. Following the v2.0 migration, the codebase has been fully converted to TypeScript and reorganized into a service-oriented architecture.

## 🎯 **v2.0 Migration Achievements**

- ✅ **TypeScript Conversion**: 100% conversion of `.js`/`.jsx` to `.ts`/`.tsx`.
- ✅ **Unified Data Model**: Consolidation of complex entities into Envelopes and Transactions.
- ✅ **Service Layer**: Decoupling of domain logic from side effects.
- ✅ **Zod Validation**: Strict schema validation for all data entities and API responses.
- ✅ **Auth Refactor**: Transitioned to React Context for authentication state.

## 📂 Root Files

| File                  | Purpose                                                      |
| :-------------------- | :----------------------------------------------------------- |
| `App.tsx`             | Main React application component with routing and providers. |
| `main.tsx`            | Entry point for React application rendering.                 |
| `index.css`           | Global styles using Tailwind CSS 4.                          |
| `fonts.css`           | Typography and font definitions.                             |
| `vite-env.d.ts`       | Vite environment type definitions.                           |
| `service-worker.d.ts` | Service worker type definitions.                             |

## 🖼️ Assets Directory (`/assets/`)

| File                    | Purpose                   |
| :---------------------- | :------------------------ |
| `Shield Text Logo.webp` | Primary application logo. |
| `favicon.ico`           | Browser favicon.          |
| `icon-512x512.png`      | PWA splash icon.          |
| `logo-512x512.png`      | High-resolution logo.     |

## 🧩 Components Directory (`/components/`)

### **Layout** (`/layout/`)

Core shell and navigation primitives.

| Component        | Purpose                                             |
| :--------------- | :-------------------------------------------------- |
| `MainLayout.tsx` | Primary application shell (Sidebar/Header/Content). |
| `Header.tsx`     | Global header with settings and user context.       |
| `Sidebar.tsx`    | Main navigation sidebar.                            |

### **Budgeting** (`/budgeting/`)

The heart of the envelope system.

| Component                  | Purpose                                        |
| :------------------------- | :--------------------------------------------- |
| `EnvelopeSystem.tsx`       | Root component for the budgeting view.         |
| `EnvelopeGrid.tsx`         | Virtualized grid for managing envelopes.       |
| `PaycheckProcessor.tsx`    | Interface for distributing income.             |
| `EnvelopeSummaryCards.tsx` | Key budgeting metrics (Virtual Balance, etc.). |

### **Transactions** (`/transactions/`)

Granular financial operations.

| Component               | Purpose                                         |
| :---------------------- | :---------------------------------------------- |
| `TransactionLedger.tsx` | Full history view with search and filters.      |
| `TransactionTable.tsx`  | Optimized tabular display of operations.        |
| `TransactionForm.tsx`   | Unified form for creating/editing transactions. |

### **Analytics** (`/analytics/`)

Insights and reporting.

| Component                 | Purpose                             |
| :------------------------ | :---------------------------------- |
| `AnalyticsDashboard.tsx`  | Root analytics view.                |
| `TrendAnalysisCharts.tsx` | Multi-axis spend/savings trends.    |
| `CategoryAnalysisTab.tsx` | Deep dive into spending categories. |

## 🪝 Hooks Directory (`/hooks/`)

Stateful logic and side-effect management.

### **Auth** (`/hooks/auth/`)

| Hook                  | Purpose                                            |
| :-------------------- | :------------------------------------------------- |
| `useAuth.ts`          | Primary hook for authentication state and methods. |
| `useUserSetup.ts`     | Onboarding and initial account configuration.      |
| `useKeyManagement.ts` | Encryption key derivation and storage.             |

### **Budgeting** (`/hooks/budgeting/`)

| Directory        | Purpose                                       |
| :--------------- | :-------------------------------------------- |
| `/envelopes/`    | CRUD and logic for budget envelopes.          |
| `/transactions/` | complex queries and mutation for operations.  |
| `/metadata/`     | Logic for Actual Balance and Unassigned Cash. |
| `/allocations/`  | Paycheck distribution and auto-funding rules. |

## 💾 Database Directory (`/db/`)

Dexie.js (IndexedDB) configuration and migrations.

| File            | Purpose                                             |
| :-------------- | :-------------------------------------------------- |
| `budgetDb.ts`   | Database initialization, schema (v11), and hooks.   |
| `types.ts`      | Shared TypeScript interfaces for database entities. |
| `validation.ts` | Database-level data integrity checks.               |

## 🏗️ Domain Directory (`/domain/`)

Business rules and schema definitions.

| Directory   | Purpose                                                 |
| :---------- | :------------------------------------------------------ |
| `/schemas/` | Zod schemas for `Envelope`, `Transaction`, `Bill`, etc. |

## 🔧 Services Directory (`/services/`)

Side-effect orchestration and business logic.

| Directory     | Purpose                                        |
| :------------ | :--------------------------------------------- |
| `/auth/`      | Low-level authentication service.              |
| `/security/`  | `EncryptionManager` and security protocols.    |
| `/sync/`      | `SyncOrchestrator` and `FirebaseSyncProvider`. |
| `/budgeting/` | `PaycheckService` and calculated domain logic. |
| `/api/`       | `ImportService` and batch processing.          |

## 🧪 Testing Directory

Tests are co-located or found in `__tests__` within their respective directories.

---

## 📈 Architecture Summary

### **Technology Stack**

- **Frontend**: React 19 + TypeScript 5.x
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4
- **State**: TanStack Query (Server State) + React Context (Auth) + Zustand (UI State)
- **Database**: Dexie.js (v4+)
- **Validation**: Zod
- **Security**: SubtleCrypto (AES-GCM encryption)
