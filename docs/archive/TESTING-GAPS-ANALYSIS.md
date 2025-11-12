# Testing Gaps Analysis - Violet Vault

**Generated**: 2025-10-22
**Current Coverage**: ~60% (Global Threshold)
**Status**: Comprehensive gap analysis complete

## Executive Summary

The Violet Vault codebase has **good testing coverage in hooks (70%) and utilities (62%)**, but critical gaps exist in:

- **Components**: 11% coverage (25+ untested component modules)
- **State Management**: 0% coverage (all Zustand stores and React contexts)
- **Services**: 50% coverage (3/8 directories untested)

**Total Test Files**: 79 existing tests
**Priority Fix**: Component and state management testing (can add ~40% coverage)

---

## Testing Landscape by Category

### ✅ Well-Tested Areas (70%+ Coverage)

#### Hooks (33 test files - 70% of directories)

- **Fully Tested Directories**:
  - transactions (9 test files)
  - analytics (5 test files)
  - auth (4 test files)
  - budgeting (2 test files + autofunding 2 files)
  - sync (2 test files)

- **Notable Tests**:
  - useTransactionFilters, useTransactions, useTransactionLedger
  - useAnalytics, useAnalyticsV2, useAnalyticsExport
  - useAuthFlow, useAuthValidation, useKeyManagement, useSession
  - useAutoFunding, useAutoFundingExecution, useUndoOperations
  - useSyncHealthIndicator, useSyncIntegration

#### Utilities (33 test files - 62% of directories)

- **Fully Tested**:
  - analytics (3 test files)
  - transactions (4 test files)
  - data (5 test files: backup, import/export, validation, formatting)
  - sync (6 test files: conflicts, validation, health, state)
  - auth (1 test file: validation)
  - budgeting (6 test files: envelope, autofunding, balance, paycheck)

### ⚠️ Partially Tested Areas (30-50% Coverage)

#### Services (50% of directories - 9 test files)

- **Tested**:
  - budgetDatabaseService (test file exists)
  - firebaseAuthService (test file exists)
  - syncService (test file exists)
  - wellnessDataService (test file exists)

- **NOT Tested** (3/8 directories):
  - storageService
  - transactionService
  - exampleDataService
  - notificationService

### 🔴 Critical Gaps (0-11% Coverage)

#### Components (11% of directories - 3 test files)

**Only 3 out of 28 component directories have tests:**

- ✅ **Tested**:
  1. auth (2 test files: KeyManagementSettings, LocalOnlyModeSettings)
  2. receipts (1 test file)
  3. settings (1 test file)

- ❌ **NOT Tested** (25+ directories):
  1. **Pages/Layouts** (Critical for UX):
     - pages (DashboardPage, BudgetPage, etc.)
     - layouts (MainLayout, AuthLayout, etc.)

  2. **Feature Components**:
     - bills
     - budgeting (EnvelopeGrid, EnvelopeSystem, EnvelopeIntegrityChecker, etc.)
     - transactions
     - analytics
     - accounts
     - savings
     - sharing
     - notifications
     - receipts (most of it)

  3. **Modal Components** (8+ modals):
     - modals (AddBillModal, CorruptionRecoveryModal, etc.)

  4. **UI Components** (Reusable components):
     - ui (forms, buttons, standard components, etc.)

  5. **Specialized Components**:
     - pwa (PWA features)
     - sync (sync status indicators)
     - onboarding (welcome flow)
     - security (lock screen, etc.)
     - mobile (mobile-specific)
     - receipts (most components)

#### State Management (0% coverage)

- **Zustand Stores** (NOT TESTED):
  - authStore (auth state, session management)
  - uiStore (global UI state)
  - toastStore (toast notifications)
  - fabStore (floating action button state)
  - onboardingStore (onboarding state)
  - preferenceStore (user preferences)
  - analyticsStore (analytics state)

- **React Contexts** (NOT TESTED):
  - AuthContext (auth provider context)
  - Related context utilities and providers

#### Hooks (6 directories with 0 tests):

- accounts
- mobile
- notifications
- savings
- sharing
- ui

#### Services (3 directories with 0 tests):

- storageService
- transactionService
- exampleDataService
- notificationService

---

## Testing Gap Matrix

```
Category          | Total Dirs | Tested | % Coverage | Priority
-----------------|-----------|--------|----------|----------
Hooks             | 11        | 8      | 73%      | ✅ Good
Utils             | 15        | 9      | 60%      | ✅ Good
Services          | 8         | 4      | 50%      | ⚠️ Medium
Components        | 28        | 3      | 11%      | 🔴 CRITICAL
State Management  | 6+        | 0      | 0%       | 🔴 CRITICAL
Contexts          | 3         | 0      | 0%       | 🔴 CRITICAL
```

---

## Detailed Gap Breakdown by Module

### 1. Component Testing Gaps (Most Critical)

#### Pages & Layouts (4 directories)

- [ ] DashboardPage
- [ ] BudgetPage
- [ ] AccountsPage
- [ ] SavingsPage
- [ ] TransactionsPage
- [ ] ReceiptsPage
- [ ] SettingsPage
- [ ] MainLayout
- [ ] AuthLayout
- [ ] ResponsiveLayout

**Impact**: Pages are entry points for user workflows. Missing tests here means untested user flows.

#### Feature Components (8 directories, 50+ components)

- [ ] Bills module (6+ components)
  - AddBillModal
  - BillDiscoveryModal
  - BillFilters
  - BillGrid
  - BillItem
  - BillsPage integration

- [ ] Budgeting module (8+ components)
  - EnvelopeGrid
  - EnvelopeSystem
  - EnvelopeIntegrityChecker
  - EnvelopeItem
  - BudgetForm
  - AutoFundingConfig
  - PaycheckForm

- [ ] Transactions (7+ components)
  - TransactionForm
  - TransactionFilters
  - TransactionGrid
  - TransactionItem
  - TransactionModal

- [ ] Analytics (6+ components)
  - AnalyticsDashboard
  - Analytics charts and reports
  - ExportModal

- [ ] Sharing (4+ components)
  - JoinBudgetModal
  - ShareCodeModal
  - SharingSettings

- [ ] Accounts (3+ components)
  - AccountList
  - AccountForm
  - AccountSelector

- [ ] Savings (3+ components)
  - SavingsGoals
  - SavingsTracker
  - SavingsForm

- [ ] Notifications (2+ components)
  - NotificationCenter
  - NotificationItem

#### UI Components (20+ components)

- [ ] Form inputs (Text, Checkbox, Select, Radio, etc.)
- [ ] Buttons (Button, IconButton, etc.)
- [ ] Cards and Containers
- [ ] Modals and Dialogs
- [ ] Tables
- [ ] Navigation components

#### Modal Components (8+ modals)

- [ ] AddBillModal
- [ ] CorruptionRecoveryModal
- [ ] UnassignedCashModal
- [ ] PatchNotesModal
- [ ] BugReportModal
- [ ] ReceiptModal
- [ ] etc.

#### Other Components (15+ components)

- [ ] PWA components (InstallPromptModal, OfflineStatusIndicator)
- [ ] Sync status components
- [ ] Onboarding components
- [ ] Security components (LockScreen, KeyManagementSettings)
- [ ] Mobile-specific components

### 2. State Management Testing Gaps (Critical)

#### Zustand Stores (6 stores)

- [ ] authStore
  - setAuthState
  - setSession
  - setUser
  - Actions and selectors

- [ ] uiStore
  - Modal state management
  - UI preferences
  - Theme state

- [ ] toastStore
  - Toast notifications
  - Toast state lifecycle

- [ ] fabStore
  - Floating action button visibility
  - Default action handler
  - Screen state

- [ ] onboardingStore
  - Step management
  - Completion tracking

- [ ] preferenceStore
  - User preferences
  - Settings storage

#### React Contexts (3+ contexts)

- [ ] AuthContext
  - Provider implementation
  - Context value updates
  - Hook consumers (useAuth)

- [ ] Related context utilities
  - Context consumers
  - Provider wrappers

### 3. Service Layer Gaps

#### Untested Services (4 services)

- [ ] storageService
  - Local storage operations
  - Session storage operations

- [ ] transactionService
  - Transaction processing
  - Transaction validation

- [ ] exampleDataService
  - Example data seeding
  - Demo data generation

- [ ] notificationService
  - Notification creation
  - Notification handling

### 4. Hook Testing Gaps (6 directories)

- [ ] accounts hooks
- [ ] mobile hooks
- [ ] notifications hooks
- [ ] savings hooks
- [ ] sharing hooks
- [ ] ui hooks

---

## Testing Gap Priority Levels

### 🔴 CRITICAL (Start Here - 40% coverage gain possible)

1. **State Management Stores** (5-6 hours)
   - authStore tests
   - uiStore tests
   - Other store tests
   - Can unlock component testing

2. **Page Components** (8-10 hours)
   - DashboardPage
   - BudgetPage
   - AccountsPage
   - Main user entry points

3. **Core Feature Components** (15-20 hours)
   - Bills module
   - Budgeting module
   - Transactions module
   - Heavy user interaction areas

### ⚠️ HIGH PRIORITY (10% coverage gain)

4. **Modal Components** (6-8 hours)
   - AddBillModal
   - JoinBudgetModal
   - Other critical modals

5. **Service Layer** (4-6 hours)
   - storageService
   - transactionService
   - Other untested services

6. **Hook Gaps** (6-8 hours)
   - 6 untested hook directories
   - accounts, mobile, notifications, savings, sharing, ui

### 📈 MEDIUM PRIORITY (5-8% coverage gain)

7. **UI Components** (8-10 hours)
   - Form inputs
   - Buttons
   - Other reusable components

8. **Remaining Components** (10+ hours)
   - Analytics components
   - Sync components
   - Onboarding components

---

## Recommended Approach

### Phase 1: Foundation (Week 1)

1. Create tests for all Zustand stores
2. Create tests for AuthContext
3. Basic component test setup for 3-5 page components

**Expected Impact**: +15% coverage, unlocks component testing strategy

### Phase 2: Core Features (Weeks 2-3)

1. Add tests for Bills, Budgeting, Transactions components
2. Add tests for Modal components
3. Complete service layer tests

**Expected Impact**: +25% coverage, achieves 75% overall

### Phase 3: Polish (Week 4)

1. Add tests for UI components
2. Add tests for remaining hooks
3. Improve component coverage to 40%+

**Expected Impact**: +10% coverage, achieves 80%+ overall

---

## Statistics

- **Total Component Directories**: 28
- **Component Directories with Tests**: 3 (11%)
- **Component Directories Missing Tests**: 25 (89%)
- **Total Components Estimated**: 80+
- **Untested Components Estimated**: 70+

- **Total Zustand Stores**: 6
- **Tested Stores**: 0 (0%)
- **Untested Stores**: 6 (100%)

- **Total React Contexts**: 3+
- **Tested Contexts**: 0 (0%)
- **Untested Contexts**: 3+ (100%)

- **Total Services**: 8
- **Tested Services**: 4 (50%)
- **Untested Services**: 4 (50%)

- **Total Hook Directories**: 11
- **Hook Directories with Tests**: 5 (45%)
- **Hook Directories Missing Tests**: 6 (55%)

---

## Current Test Command Overview

```bash
npm test              # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Generate coverage report
npm run test:run      # Single run (CI mode)
npm run test:ci       # CI mode with coverage
```

---

## Files Needing Tests

See separate `TESTING-GAPS-DETAILED.md` for complete file-by-file breakdown of what needs tests.

---

## Related Documentation

- Vitest Config: `configs/testing/vitest.config.js`
- Test Setup: `src/test/setup.ts`
- Root Config: `vitest.config.js`
- Existing Test Patterns: Review `.test.ts` and `.test.tsx` files in hook and util directories for patterns to follow
