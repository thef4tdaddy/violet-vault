# VioletVault Source Code Directory

**Last Updated:** September 15, 2025
**Branch:** develop (v1.10.0 - Code Architecture & Refactoring - 90% Complete)
**Total Files:** 696 files across comprehensive modular architecture

This document provides an overview of the `/src/` directory structure. Given the extensive codebase growth (696 files), this covers the major architectural areas and key components.

## 🎯 **V1.10.0 Milestone Achievements**

The v1.10.0 "Code Architecture & Refactoring" milestone focused on:

- ✅ **Performance Optimization**: Build time improvements and icon system centralization
- ✅ **UI Stabilization**: Fixed major issues across Analytics, Debt, Paycheck, and Envelope pages
- ✅ **Security Enhancements**: Local data encryption warnings and enhanced settings
- ✅ **Navigation**: URL-based routing for better bookmarking and navigation
- ✅ **Code Quality**: Ongoing component refactoring and lint warning reduction

## 📂 Root Files

| File                | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `App.jsx`           | Main React application component - Entry point for the app |
| `main.jsx`          | React application bootstrap and root rendering             |
| `index.css`         | Main CSS styles and global styles                          |
| `styles.css`        | Additional styling (may contain component-specific styles) |
| `styles-backup.css` | Backup of previous styles (cleanup candidate)              |

## 🖼️ Assets Directory (`/assets/`)

**Status:** ✅ **CLEAN** - Assets have been properly organized

| File                    | Purpose                             | Status | Used In      |
| ----------------------- | ----------------------------------- | ------ | ------------ |
| `Shield Text Logo.webp` | ✅ **ACTIVE** - Main logo with text | Active | Header       |
| `favicon.ico`           | ✅ **ACTIVE** - Browser favicon     | Active | HTML         |
| `icon-512x512.png`      | ✅ **ACTIVE** - PWA icon            | Active | PWA manifest |
| `logo-512x512.png`      | ✅ **ACTIVE** - App logo            | Active | Build system |

**Cleanup Status:** ✅ Assets directory is now clean and optimized

## 🧩 Components Directory (`/components/`)

### **Layout Components** (`/layout/`)

_Core application layout and navigation_

| Component            | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `MainLayout.jsx`     | Main application shell and layout orchestration |
| `NavigationTabs.jsx` | Tab-based navigation system                     |
| `SummaryCards.jsx`   | Financial summary cards display                 |
| `ViewRenderer.jsx`   | Route/view content switcher                     |

### **Page Components** (`/pages/`)

_Main application views/pages_

| Component           | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `MainDashboard.jsx` | Primary dashboard view with financial overview |

### **Authentication** (`/auth/`)

_User authentication and profile management_

| Component                   | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `AuthGateway.jsx`           | Authentication routing and access control |
| `ChangePasswordModal.jsx`   | Password change modal interface           |
| `KeyManagementSettings.jsx` | Encryption key management interface       |
| `LocalOnlyModeSettings.jsx` | Local-only mode configuration             |
| `LocalOnlySetup.jsx`        | Setup wizard for local-only operation     |
| `ProfileSettings.jsx`       | User profile settings and preferences     |
| `UserIndicator.jsx`         | Current user display component            |
| `UserSetup.jsx`             | Initial user setup and onboarding         |

### **Accounts** (`/accounts/`)

_Account management and tracking_

| Component                  | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `SupplementalAccounts.jsx` | Additional account management with edit locking |

### **Activity** (`/activity/`) -

_Budget history and activity tracking_

| Component          | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `ActivityFeed.jsx` | Level 1 Budget History - chronological activity list |

### **Automation** (`/automation/`) -

_Auto-funding rules and intelligent budgeting_

| Component                    | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `AutoFundingDashboard.jsx`   | Dashboard for auto-funding rule management |
| `AutoFundingRuleBuilder.jsx` | Interface for creating auto-funding rules  |
| `AutoFundingView.jsx`        | Main view for auto-funding features        |

### **Budgeting** (`/budgeting/`)

_Envelope budgeting system components_

| Component                      | Purpose                                 |
| ------------------------------ | --------------------------------------- |
| `BillEnvelopeFundingInfo.jsx`  | Bill-to-envelope funding information    |
| `CashFlowSummary.jsx`          | Cash flow overview and analysis         |
| `CreateEnvelopeModal.jsx`      | Modal for creating new budget envelopes |
| `EditEnvelopeModal.jsx`        | Modal for editing existing envelopes    |
| `EnvelopeGrid.jsx`             | Grid display of budget envelopes        |
| `EnvelopeSystem.jsx`           | Core envelope budgeting logic           |
| `PaycheckProcessor.jsx`        | Paycheck allocation and processing      |
| `PaydayPrediction.jsx`         | Payday prediction and notifications     |
| `SmartEnvelopeSuggestions.jsx` | AI-driven envelope creation suggestions |

#### **Envelope Subcomponents** (`/budgeting/envelope/`)

| Component                    | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `EnvelopeHeader.jsx`         | Header component for envelope views   |
| `EnvelopeHistoryModal.jsx`   | Modal showing envelope change history |
| `EnvelopeItem.jsx`           | Individual envelope display component |
| `EnvelopeSummary.jsx`        | Summary view of envelope data         |
| `UnassignedCashEnvelope.jsx` | Special envelope for unassigned cash  |

#### **Budgeting Shared Components** (`/budgeting/shared/`)

| Component                    | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `AllocationModeSelector.jsx` | Selector for envelope allocation modes  |
| `BillConnectionSelector.jsx` | Bill-to-envelope connection interface   |
| `EnvelopeTypeSelector.jsx`   | Envelope type selection component       |
| `FrequencySelector.jsx`      | Frequency selection for budgeting items |

### **Bills Management** (`/bills/`)

_Bill tracking and payment management_

| Component                 | Purpose                                          |
| ------------------------- | ------------------------------------------------ |
| `AddBillModal.jsx`        | Modal for adding/editing bills with edit locking |
| `BillDiscoveryModal.jsx`  | Automated bill discovery interface               |
| `BillManager.jsx`         | Main bill management interface                   |
| `BillTable.jsx`           | Tabular display of bills                         |
| `BillTabs.jsx`            | Tab navigation for bill categories               |
| `BulkBillUpdateModal.jsx` | Bulk operations for bills                        |
| `SmartBillMatcher.jsx`    | Automatic bill detection and matching            |

### **Debt Management** (`/debt/`)

_Debt tracking and payoff strategies_

| Component            | Purpose                          |
| -------------------- | -------------------------------- |
| `DebtDashboard.jsx`  | Main dashboard for debt overview |
| `DebtStrategies.jsx` | Debt payoff strategy calculator  |

#### **Debt Modals** (`/debt/modals/`)

| Component             | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `AddDebtModal.jsx`    | Modal for adding new debts with edit locking |
| `DebtDetailModal.jsx` | Detailed debt information and editing        |

#### **Debt UI Components** (`/debt/ui/`)

| Component               | Purpose                        |
| ----------------------- | ------------------------------ |
| `DebtFilters.jsx`       | Filtering controls for debts   |
| `DebtList.jsx`          | List view of debt accounts     |
| `DebtSummaryCards.jsx`  | Summary cards for debt metrics |
| `DebtSummaryWidget.jsx` | Widget for debt overview       |

### **Feedback & Support** (`/feedback/`) -

_User feedback and bug reporting_

| Component             | Purpose                               |
| --------------------- | ------------------------------------- |
| `BugReportButton.jsx` | Bug reporting with screenshot capture |

### **History & Audit** (`/history/`) -

_Budget history and integrity monitoring_

| Component                      | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `BudgetHistoryViewer.jsx`      | Comprehensive budget history viewer |
| `IntegrityStatusIndicator.jsx` | Security integrity status display   |
| `ObjectHistoryViewer.jsx`      | Object-level change history viewer  |

### **Onboarding** (`/onboarding/`) -

_User onboarding and tutorial system_

| Component                | Purpose                          |
| ------------------------ | -------------------------------- |
| `EmptyStateHints.jsx`    | Helpful hints for empty states   |
| `OnboardingProgress.jsx` | Progress tracking for onboarding |
| `OnboardingTutorial.jsx` | Interactive tutorial system      |

### **Savings Goals** (`/savings/`)

_Savings goal tracking and management_

| Component          | Purpose                            |
| ------------------ | ---------------------------------- |
| `SavingsGoals.jsx` | Savings goals management interface |

### **Security** (`/security/`) -

_Security and access control_

| Component        | Purpose                           |
| ---------------- | --------------------------------- |
| `LockScreen.jsx` | Application lock screen interface |

### **Settings** (`/settings/`)

_Application settings and configuration_

| Component                  | Purpose                          |
| -------------------------- | -------------------------------- |
| `SecuritySettings.jsx`     | Security configuration interface |
| `SettingsDashboard.jsx`    | Main settings dashboard          |
| `TransactionArchiving.jsx` | Transaction archiving settings   |

### **Sync Components** (`/sync/`)

_Multi-device synchronization and real-time collaboration_

| Component                     | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `ActivityBanner.jsx`          | Real-time user activity notifications |
| `ConflictResolutionModal.jsx` | Sync conflict resolution interface    |
| `ManualSyncControls.jsx`      | Manual sync controls                  |
| `SyncHealthIndicator.jsx`     | Sync health monitoring                |
| `SyncIndicator.jsx`           | Sync status indicator                 |
| `SyncStatusIndicators.jsx`    | Multiple sync status displays         |
| `TeamActivitySync.jsx`        | Real-time team activity sync          |

### **Transactions** (`/transactions/`)

_Transaction management and analysis_

| Component                 | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `TransactionFilters.jsx`  | Transaction filtering interface                        |
| `TransactionForm.jsx`     | Form for adding/editing transactions with edit locking |
| `TransactionLedger.jsx`   | Complete transaction history view                      |
| `TransactionSplitter.jsx` | Split transaction functionality                        |
| `TransactionSummary.jsx`  | Transaction summary and totals                         |
| `TransactionTable.jsx`    | Tabular transaction display                            |

#### **Transaction Components** (`/transactions/components/`) -

| Component                | Purpose                              |
| ------------------------ | ------------------------------------ |
| `DeleteConfirmation.jsx` | Confirmation dialog for deletions    |
| `TransactionRow.jsx`     | Individual transaction row component |

#### **Transaction Hooks** (`/transactions/hooks/`)

| Hook                       | Purpose                           |
| -------------------------- | --------------------------------- |
| `useTransactionFilters.js` | Transaction filtering logic       |
| `useTransactionForm.js`    | Transaction form state management |
| `useTransactionImport.js`  | Transaction import functionality  |
| `useTransactionTable.js`   | Table state management            |

#### **Transaction Import** (`/transactions/import/`)

| Component                          | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `AmazonReceiptParser.jsx.disabled` | ❌ **DISABLED** - Amazon receipt parsing |
| `FieldMapper.jsx`                  | CSV field mapping interface              |
| `FileUploader.jsx`                 | File upload component                    |
| `ImportModal.jsx`                  | Transaction import modal                 |
| `ImportProgress.jsx`               | Import progress indicator                |

#### **Transaction Utils** (`/transactions/utils/`)

| Utility               | Purpose                    |
| --------------------- | -------------------------- |
| `envelopeMatching.js` | Auto-categorization logic  |
| `fileParser.js`       | CSV/file parsing utilities |
| `tableHelpers.js`     | Table utility functions    |

### **UI Components** (`/ui/`)

_Reusable UI elements and common components_

| Component               | Purpose                              |
| ----------------------- | ------------------------------------ |
| `EditLockIndicator.jsx` | Edit lock status indicator           |
| `EditableBalance.jsx`   | Inline editable balance display      |
| `Header.jsx`            | Application header component         |
| `HelpTooltip.jsx`       | Help and information tooltips        |
| `LoadingSpinner.jsx`    | Loading state indicator              |
| `Toast.jsx`             | Toast notification system            |
| `VersionFooter.jsx`     | App version display                  |
| `VirtualList.jsx`       | Performance-optimized list rendering |

### **Analytics** (`/analytics/`)

_Financial analysis and reporting_

| Component                  | Purpose                              |
| -------------------------- | ------------------------------------ |
| `ChartsAndAnalytics.jsx`   | Main analytics dashboard with charts |
| `SmartCategoryManager.jsx` | Category management and suggestions  |

### **Accounts** (`/accounts/`)

_Account management_

| Component                  | Purpose                       |
| -------------------------- | ----------------------------- |
| `SupplementalAccounts.jsx` | Additional account management |

### **Sync Components** (`/sync/`)

_Multi-device synchronization_

| Component                     | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `ActivityBanner.jsx`          | User activity notifications        |
| `ConflictResolutionModal.jsx` | Sync conflict resolution interface |
| `SyncIndicator.jsx`           | Sync status indicator              |
| `SyncStatusIndicators.jsx`    | Offline/syncing status displays    |
| `TeamActivitySync.jsx`        | Real-time team activity sync       |

### **UI Components** (`/ui/`)

_Reusable UI elements_

| Component            | Purpose                                 |
| -------------------- | --------------------------------------- |
| `ErrorBoundary.jsx`  | React error boundary for crash handling |
| `Header.jsx`         | Application header component            |
| `LoadingSpinner.jsx` | Loading state indicator                 |
| `Toast.jsx`          | Toast notification system               |
| `VersionFooter.jsx`  | App version display                     |
| `VirtualList.jsx`    | Performance-optimized list rendering    |

### **Modals** (`/modals/`)

_Modal dialog components_

| Component                     | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `CorruptionRecoveryModal.jsx` | Data corruption recovery interface |
| `PasswordRotationModal.jsx`   | Password rotation security modal   |
| `UnassignedCashModal.jsx`     | Cash distribution modal            |

### **Monitoring** (`/monitoring/`)

_Performance and system monitoring components_

| Component             | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `HighlightLoader.jsx` | Error highlighting and debugging component |

## 🪝 Hooks Directory (`/hooks/`)

_Custom React hooks for business logic_

| Hook                               | Purpose                                              |
| ---------------------------------- | ---------------------------------------------------- |
| `useActivityLogger.js`             | Budget activity logging                              |
| `useActualBalance.js`              | Bank account balance management and reconciliation   |
| `useAnalytics.js`                  | Financial analytics and reporting                    |
| `useAuthFlow.js`                   | Authentication flow management                       |
| `useAutoFunding.js`                | Auto-funding rules management                        |
| `useBillOperations.js`             | Bill CRUD operations                                 |
| `useBills.js`                      | Bill management hook                                 |
| `useBudgetData.js`                 | Unified TanStack Query + Zustand + Dexie hook        |
| `useBudgetHistoryQuery.js`         | Budget history querying                              |
| `useBudgetMetadata.js`             | Budget metadata management                           |
| `useBugReport.js`                  | Bug reporting functionality                          |
| `useDataInitialization.js`         | Data initialization and migration                    |
| `useDataManagement.js`             | Import/export operations                             |
| `useDebtManagement.js`             | Debt tracking and payoff strategies                  |
| `useDebts.js`                      | Debt management hook                                 |
| `useEditLock.js`                   | Cross-browser edit locking                           |
| `useEnvelopes.js`                  | Specialized envelope management                      |
| `useFirebaseSync.js`               | Firebase synchronization and activity management     |
| `useKeyManagement.js`              | Encryption key management                            |
| `useLocalOnlyMode.js`              | Local-only operation mode                            |
| `useManualSync.js`                 | Manual sync controls                                 |
| `useNetworkStatus.js`              | Network status management (online/offline detection) |
| `useOnboardingAutoComplete.js`     | Automatic onboarding completion                      |
| `usePasswordRotation.js`           | Password security and rotation                       |
| `usePaydayPrediction.js`           | Payday prediction and notifications                  |
| `useSavingsGoals.js`               | Savings goal management                              |
| `useSecurityManager.js`            | Security settings management                         |
| `useToast.js`                      | Toast notification management                        |
| `useTransactionArchiving.js`       | Transaction archiving functionality                  |
| `useTransactions.js`               | Advanced transaction queries with analytics          |
| `useUnassignedCashDistribution.js` | Unassigned cash distribution                         |

## 🏪 Stores Directory (`/stores/`)

_Zustand state management stores_

| Store                | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `authStore.jsx`      | Authentication state management (renamed for JSX) |
| `budgetStore.js`     | Main budget data state management (Zustand store) |
| `onboardingStore.js` | Onboarding progress state                         |
| `toastStore.js`      | Toast notification state                          |

## 🔧 Services Directory (`/services/`) -

_Business logic services and utilities_

| Service               | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `activityLogger.js`   | Level 1 Budget History - activity logging service |
| `cloudSyncService.js` | Enhanced cloud synchronization service            |
| `editLockService.js`  | Cross-browser edit locking with Firebase          |

## 🌐 ~~Contexts Directory~~ - **REMOVED**

**Note:** The `/contexts/` directory has been completely removed. All state management has been migrated to Zustand stores in `/stores/` for better performance and simpler architecture.

## 🔧 Utils Directory (`/utils/`)

_Utility functions and services_

| Utility                       | Purpose                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| `autoFundingEngine.js`        | Auto-funding rules processing engine                       |
| `billDiscovery.js`            | Automated bill discovery algorithms                        |
| `billEnvelopeCalculations.js` | Bill-to-envelope calculation utilities                     |
| `billIcons.js`                | Bill categorization icons                                  |
| `budgetHistoryTracker.js`     | Budget history tracking utilities                          |
| `chunkedFirebaseSync.js`      | Chunked Firebase synchronization                           |
| `dataDiagnostic.js`           | Data integrity diagnostic utilities                        |
| `debugTools.js`               | Development debugging utilities                            |
| `debtStrategies.js`           | Debt payoff strategy calculations                          |
| `encryption.js`               | Data encryption/decryption utilities                       |
| `errorViewer.js`              | Error visualization utilities                              |
| `firebaseConfig.js`           | Firebase configuration                                     |
| `firebaseSync.js`             | Firebase synchronization service                           |
| `fixMetadata.js`              | Metadata repair utilities                                  |
| `frequencyCalculations.js`    | Frequency conversion utilities                             |
| `highlight.js`                | Error highlighting and debugging utilities                 |
| `keyExport.js`                | Encryption key export utilities                            |
| `lazyImport.js`               | Dynamic import utilities                                   |
| `logger.js`                   | Application logging utilities                              |
| `masterSyncValidator.js`      | Master sync validation utilities                           |
| `paydayPredictor.js`          | Payday prediction algorithms with enhanced recommendations |
| `performance.js`              | Performance monitoring utilities                           |
| `performanceUtils.js`         | Additional performance optimization utilities              |
| `queryClient.js`              | TanStack Query + Dexie integration with offline support    |
| `syncDiagnostic.js`           | Sync diagnostic utilities                                  |
| `syncEdgeCaseTester.js`       | Sync edge case testing utilities                           |
| `syncFlowValidator.js`        | Sync flow validation utilities                             |
| `syncHealthChecker.js`        | Sync health monitoring utilities                           |
| `testBudgetHistory.js`        | Budget history testing utilities                           |
| `toastHelpers.js`             | Toast notification helper functions                        |
| `transactionArchiving.js`     | Transaction archiving utilities                            |
| `version.js`                  | Application version management                             |

#### **Budgeting Utilities** (`/utils/budgeting/`) -

| Utility                   | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `envelopeCalculations.js` | Envelope calculation and validation logic |
| `envelopeMatching.js`     | Envelope matching and categorization      |
| `envelopeStyles.js`       | Envelope styling and theming utilities    |
| `index.js`                | Budgeting utilities barrel export         |

#### **Icon System Utilities** (`/utils/icons/`) - **NEW in v1.10.0**

| Utility    | Purpose                                   |
| ---------- | ----------------------------------------- |
| `index.js` | Centralized icon management system export |

## 💾 Database Directory (`/db/`)

_Local database management_

| File          | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `budgetDb.js` | Dexie database setup with budget tables and operations |

## 📚 Constants Directory (`/constants/`)

_Application constants and configurations_

| File            | Purpose                         |
| --------------- | ------------------------------- |
| `categories.js` | Transaction and bill categories |
| `debts.js`      | Debt-related constants          |
| `frequency.js`  | Frequency calculation constants |

## 🧪 Test Directory (`/test/`) -

_Testing utilities and test files_

| File       | Purpose                         |
| ---------- | ------------------------------- |
| `setup.js` | Vitest test setup configuration |

#### **Test Utils** (`/test/utils/`)

| File                     | Purpose                         |
| ------------------------ | ------------------------------- |
| `debtStrategies.test.js` | Debt strategy calculation tests |

---

## 🚨 Cleanup Tasks

### **Assets Directory**

- [✅] Remove unused logo files (completed)
- [ ] Consider organizing assets into subdirectories (logos/, icons/, etc.)

### **General Cleanup**

- [✅] Remove duplicate/dead files (`budgetStore.js`, `db/index.js`) - **COMPLETED**
- [✅] Remove "optimized" naming from main system files - **COMPLETED**
- [✅] Consolidate duplicate query clients - **COMPLETED**
- [ ] Remove `styles-backup.css` if no longer needed
- [ ] Enable or remove `AmazonReceiptParser.jsx.disabled`
- [ ] Consolidate `styles.css` and `index.css` if possible

### **Completed File Reorganization**

- [✅] `optimizedBudgetStore.js` → `budgetStore.js`
- [✅] `useOptimizedBudget.js` → `useBudgetQuery.js`
- [✅] `optimizedDb.js` → `budgetDb.js`
- [✅] `optimizedQueryClient.js` → `budgetQueryClient.js`
- [✅] Removed dead files: `stores/budgetStore.js` (old), `db/index.js`

---

## 📈 Architecture Improvements (In Progress)

### **Completed Refactoring**

✅ **Phase 1:** Custom hooks extraction (`useAuthFlow`, `useDataManagement`, `usePasswordRotation`)  
✅ **Phase 2:** UI component extraction (NavigationTabs, SummaryCards, ViewRenderer, etc.)  
✅ **Phase 2.1:** File system cleanup and optimization  
✅ **Phase 2.2:** MainLayout.jsx business logic extraction - **COMPLETED!**  
✅ **v1.8.0:** Cash management enhancements and state cleanup - **COMPLETED!**

#### **v1.8.0 Milestone Achievements:**

- ✅ Enhanced payday prediction with proactive funding suggestions (#28)
- ✅ Comprehensive state management cleanup (#211) - Zustand consolidation
- ✅ Logo styling fixes for glassmorphic design (#222)
- ✅ AuthContext renamed to authStore.jsx for consistency (#221)
- ✅ Password rotation security system fully connected to Zustand (#88)
- ✅ Debt tracking Phase 1 foundation (#115)

#### **Enhanced Data Layer:**

- ✅ **Phase 1 Complete:** TanStack Query + Dexie integration foundation
  - Consolidated duplicate query clients into unified enhanced version
  - Created `useBudgetData` - unified data access hook
  - Built specialized hooks: `useEnvelopes`, `useTransactions`
  - Implemented automatic cache persistence with Dexie
  - Added network-aware sync with offline support
  - Smart query invalidation and optimistic updates

#### **Business Logic Extraction:**

- Extracted all business logic into custom hooks:
  - `useAuthFlow.js` - Authentication operations
  - `useDataManagement.js` - Import/export operations
  - `usePasswordRotation.js` - Password rotation logic
  - `useNetworkStatus.js` - Network status detection
  - `useFirebaseSync.js` - Sync operations and activity management
  - `usePaydayPrediction.js` - Payday notifications
  - `useBudgetData.js` - **NEW** Unified data layer
  - `useEnvelopes.js` - **NEW** Specialized envelope management
  - `useTransactions.js` - **NEW** Advanced transaction queries
- MainLayout.jsx is now a **pure UI component** as intended
- Reduced MainLayout from ~1,100+ lines to ~390 lines (65% reduction)
- Business logic properly separated and reusable

### **Next Steps**

- **Phase 3:** Provider hierarchy (AuthProvider, DataProvider, NotificationProvider)
- **Phase 4:** Route-based architecture (optional)
- **Service Layer:** Extract business logic from large components like `ChartsAndAnalytics.jsx`

---

## 📊 Architecture Summary

### **File Statistics (v1.10.0)**

- **Total Files:** 696 files (comprehensive modular architecture)
- **Lines of Code:** ~40,000+ lines (extensive feature coverage)
- **React Components:** 150+ components across 27 major functional areas
- **Custom Hooks:** 25+ specialized business logic hooks
- **Utility Functions:** 30+ helper utilities and services
- **Major Directories:** 27 component categories, hooks, stores, services, utils, constants, test

### **Technology Stack**

- **Frontend:** React 19 + Vite
- **State Management:** Zustand (exclusively)
- **Data Layer:** TanStack Query + Dexie (IndexedDB) + Firebase Firestore
- **Security:** Client-side AES encryption for all sensitive data
- **Real-time:** Firebase real-time listeners + cross-browser edit locking
- **Testing:** Vitest + Testing Library
- **Build:** Vite with optimized chunking and lazy loading

### **Recent Architecture Enhancements**

- **🔐 Security & Compliance:** Edit locking, activity logging, integrity monitoring
- **📊 Enhanced Data Layer:** TanStack Query integration with offline support
- **🤖 Intelligent Automation:** Auto-funding rules with machine learning patterns
- **📱 User Experience:** Comprehensive onboarding, feedback systems, help tooltips
- **🔄 Sync Infrastructure:** Chunked sync, health monitoring, edge case handling
- **💳 Debt Management:** Complete debt tracking and payoff strategy system

### **Security Features**

- Client-side AES-256 encryption for all budget data
- Cross-browser edit locking with Firebase Firestore
- Comprehensive activity logging with tamper detection
- Hash chain verification for budget history integrity
- Real-time security status monitoring

---

## 📚 Related Documentation

For contributors working with this codebase:

- **[📘 TypeScript Patterns Guide](./TypeScript-Patterns-Guide.md)** - JSDoc typing patterns for props, hooks, and Dexie queries
- **[🎨 Shared UI Components](./Shared-UI-Components.md)** - Standardized components and design patterns
- **[🧪 Testing Strategy](./Testing-Strategy.md)** - Comprehensive testing approach
- **[🏗️ Component Refactoring Standards](./Component-Refactoring-Standards.md)** - Systematic refactoring methodology
- **[🔄 Zustand Safe Patterns](./Zustand-Safe-Patterns.md)** - State management best practices
- **[⚠️ ESLint Rules](./ESLint-Rules.md)** - Code quality and linting standards
