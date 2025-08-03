# VioletVault Source Code Directory

**Last Updated:** July 31, 2025  
**Branch:** refactor/layout-ui-architecture-2025-08-04

This document provides a comprehensive overview of the `/src/` directory structure and the purpose of each file and folder.

## 📂 Root Files

| File                | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `App.jsx`           | Main React application component - Entry point for the app |
| `main.jsx`          | React application bootstrap and root rendering             |
| `index.css`         | Main CSS styles and global styles                          |
| `styles.css`        | Additional styling (may contain component-specific styles) |
| `styles-backup.css` | Backup of previous styles (cleanup candidate)              |

## 🖼️ Assets Directory (`/assets/`)

**Status:** ⚠️ Contains unused assets that need cleanup

| File                                  | Purpose                            | Status             | Used In         |
| ------------------------------------- | ---------------------------------- | ------------------ | --------------- |
| `Logo 1024x1024.webp`                 | ❌ **UNUSED** - Old logo format    | Should be removed  | None            |
| `Logo Only 1024x1024.png`             | ✅ **ACTIVE** - Logo without text  | Used in UserSetup  | `UserSetup.jsx` |
| `Logo and Text with Black Border.png` | ❌ **UNUSED** - Logo variant       | Should be removed  | None            |
| `Logo with Text Final.png`            | ✅ **ACTIVE** - Final logo version | Used in Header     | `Header.jsx`    |
| `favicon.ico`                         | ✅ **ACTIVE** - Browser favicon    | Used in HTML       | `index.html`    |
| `logo-512x512.png`                    | ✅ **ACTIVE** - App logo           | Used for PWA/icons | Build system    |

**Cleanup Required:** Remove unused logo files (`Logo 1024x1024.webp` and `Logo and Text with Black Border.png`) to reduce bundle size.

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

| Component                 | Purpose                               |
| ------------------------- | ------------------------------------- |
| `ChangePasswordModal.jsx` | Password change modal interface       |
| `ProfileSettings.jsx`     | User profile settings and preferences |
| `UserIndicator.jsx`       | Current user display component        |
| `UserSetup.jsx`           | Initial user setup and onboarding     |

### **Budgeting** (`/budgeting/`)

_Envelope budgeting system components_

| Component                      | Purpose                                 |
| ------------------------------ | --------------------------------------- |
| `CashFlowSummary.jsx`          | Cash flow overview and analysis         |
| `CreateEnvelopeModal.jsx`      | Modal for creating new budget envelopes |
| `EditEnvelopeModal.jsx`        | Modal for editing existing envelopes    |
| `EnvelopeGrid.jsx`             | Grid display of budget envelopes        |
| `EnvelopeSystem.jsx`           | Core envelope budgeting logic           |
| `PaycheckProcessor.jsx`        | Paycheck allocation and processing      |
| `PaydayPrediction.jsx`         | Payday prediction and notifications     |
| `SmartEnvelopeSuggestions.jsx` | AI-driven envelope creation suggestions |

### **Bills Management** (`/bills/`)

_Bill tracking and payment management_

| Component              | Purpose                               |
| ---------------------- | ------------------------------------- |
| `AddBillModal.jsx`     | Modal for adding new bills            |
| `BillManager.jsx`      | Main bill management interface        |
| `BillTable.jsx`        | Tabular display of bills              |
| `BillTabs.jsx`         | Tab navigation for bill categories    |
| `SmartBillMatcher.jsx` | Automatic bill detection and matching |

### **Savings Goals** (`/savings/`)

_Savings goal tracking and management_

| Component          | Purpose                            |
| ------------------ | ---------------------------------- |
| `SavingsGoals.jsx` | Savings goals management interface |

### **Transactions** (`/transactions/`)

_Transaction management and analysis_

| Component                 | Purpose                              |
| ------------------------- | ------------------------------------ |
| `TransactionFilters.jsx`  | Transaction filtering interface      |
| `TransactionForm.jsx`     | Form for adding/editing transactions |
| `TransactionLedger.jsx`   | Complete transaction history view    |
| `TransactionSplitter.jsx` | Split transaction functionality      |
| `TransactionSummary.jsx`  | Transaction summary and totals       |
| `TransactionTable.jsx`    | Tabular transaction display          |

#### **Transaction Hooks** (`/transactions/hooks/`)

| Hook                       | Purpose                           |
| -------------------------- | --------------------------------- |
| `useTransactionFilters.js` | Transaction filtering logic       |
| `useTransactionForm.js`    | Transaction form state management |
| `useTransactionImport.js`  | Transaction import functionality  |

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

| Component                   | Purpose                          |
| --------------------------- | -------------------------------- |
| `PasswordRotationModal.jsx` | Password rotation security modal |

## 🪝 Hooks Directory (`/hooks/`)

_Custom React hooks for business logic_

| Hook                     | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `useAuthFlow.js`         | Authentication flow management                         |
| `useBudget.js`           | Simple budget data access (wrapper around budgetStore) |
| `useBudgetQuery.js`      | Advanced budget operations with React Query + Dexie    |
| `useDataManagement.js`   | Import/export operations                               |
| `useFirebaseSync.js`     | Firebase synchronization and activity management       |
| `useNetworkStatus.js`    | Network status management (online/offline detection)   |
| `usePasswordRotation.js` | Password security and rotation                         |
| `usePaydayPrediction.js` | Payday prediction and notifications                    |
| `useToast.js`            | Toast notification management                          |

## 🏪 Stores Directory (`/stores/`)

_Zustand state management stores_

| Store            | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `authStore.js`   | Authentication state management                   |
| `budgetStore.js` | Main budget data state management (Zustand store) |

## 🌐 Contexts Directory (`/contexts/`)

_React context providers_

| Context             | Purpose                         |
| ------------------- | ------------------------------- |
| `AuthContext.jsx`   | Authentication context provider |
| `BudgetContext.jsx` | Budget data context provider    |

## 🔧 Utils Directory (`/utils/`)

_Utility functions and services_

| Utility                | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `billIcons.js`         | Bill categorization icons                                  |
| `budgetQueryClient.js` | Budget-specific React Query client with optimistic updates |
| `encryption.js`        | Data encryption/decryption utilities                       |
| `firebaseConfig.js`    | Firebase configuration                                     |
| `firebaseSync.js`      | Firebase synchronization service                           |
| `logger.js`            | Application logging utilities                              |
| `paydayPredictor.js`   | Payday prediction algorithms                               |
| `performance.js`       | Performance monitoring utilities                           |
| `queryClient.js`       | Global React Query client (used in main.jsx)               |
| `sentry.js`            | Error monitoring and reporting                             |
| `version.js`           | Application version management                             |

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

- Extracted all business logic into custom hooks:
  - `useAuthFlow.js` - Authentication operations
  - `useDataManagement.js` - Import/export operations
  - `usePasswordRotation.js` - Password rotation logic
  - `useNetworkStatus.js` - Network status detection
  - `useFirebaseSync.js` - Sync operations and activity management
  - `usePaydayPrediction.js` - Payday notifications
- MainLayout.jsx is now a **pure UI component** as intended
- Reduced MainLayout from ~1,100+ lines to ~390 lines (65% reduction)
- Business logic properly separated and reusable

### **Next Steps**

- **Phase 3:** Provider hierarchy (AuthProvider, DataProvider, NotificationProvider)
- **Phase 4:** Route-based architecture (optional)
- **Service Layer:** Extract business logic from large components like `ChartsAndAnalytics.jsx`

---

**Total Files:** ~120+ files  
**Lines of Code:** ~15,000+ lines  
**Architecture:** React + Zustand + IndexedDB + Firebase  
**Security:** Client-side encryption for all sensitive data
