# VioletVault Source Code Directory

**Last Updated:** July 31, 2025  
**Branch:** refactor/layout-ui-architecture-2025-08-04

This document provides a comprehensive overview of the `/src/` directory structure and the purpose of each file and folder.

## 📂 Root Files

| File | Purpose |
|------|---------|
| `App.jsx` | Main React application component - Entry point for the app |
| `main.jsx` | React application bootstrap and root rendering |
| `index.css` | Main CSS styles and global styles |
| `styles.css` | Additional styling (may contain component-specific styles) |
| `styles-backup.css` | Backup of previous styles (cleanup candidate) |

## 🖼️ Assets Directory (`/assets/`)

**Status:** ⚠️ Contains unused assets that need cleanup

| File | Purpose | Status | Used In |
|------|---------|---------|---------|
| `Logo 1024x1024.webp` | ❌ **UNUSED** - Old logo format | Should be removed | None |
| `Logo Only 1024x1024.png` | ✅ **ACTIVE** - Logo without text | Used in UserSetup | `UserSetup.jsx` |
| `Logo and Text with Black Border.png` | ❌ **UNUSED** - Logo variant | Should be removed | None |
| `Logo with Text Final.png` | ✅ **ACTIVE** - Final logo version | Used in Header | `Header.jsx` |
| `favicon.ico` | ✅ **ACTIVE** - Browser favicon | Used in HTML | `index.html` |
| `logo-512x512.png` | ✅ **ACTIVE** - App logo | Used for PWA/icons | Build system |

**Cleanup Required:** Remove unused logo files (`Logo 1024x1024.webp` and `Logo and Text with Black Border.png`) to reduce bundle size.

## 🧩 Components Directory (`/components/`)

### **Layout Components** (`/layout/`)
*Core application layout and navigation*

| Component | Purpose |
|-----------|---------|
| `MainLayout.jsx` | Main application shell and layout orchestration |
| `NavigationTabs.jsx` | Tab-based navigation system |
| `SummaryCards.jsx` | Financial summary cards display |
| `ViewRenderer.jsx` | Route/view content switcher |

### **Page Components** (`/pages/`)
*Main application views/pages*

| Component | Purpose |
|-----------|---------|
| `MainDashboard.jsx` | Primary dashboard view with financial overview |

### **Authentication** (`/auth/`)
*User authentication and profile management*

| Component | Purpose |
|-----------|---------|
| `ChangePasswordModal.jsx` | Password change modal interface |
| `ProfileSettings.jsx` | User profile settings and preferences |
| `UserIndicator.jsx` | Current user display component |
| `UserSetup.jsx` | Initial user setup and onboarding |

### **Budgeting** (`/budgeting/`)
*Envelope budgeting system components*

| Component | Purpose |
|-----------|---------|
| `CashFlowSummary.jsx` | Cash flow overview and analysis |
| `CreateEnvelopeModal.jsx` | Modal for creating new budget envelopes |
| `EditEnvelopeModal.jsx` | Modal for editing existing envelopes |
| `EnvelopeGrid.jsx` | Grid display of budget envelopes |
| `EnvelopeSystem.jsx` | Core envelope budgeting logic |
| `PaycheckProcessor.jsx` | Paycheck allocation and processing |
| `PaydayPrediction.jsx` | Payday prediction and notifications |
| `SmartEnvelopeSuggestions.jsx` | AI-driven envelope creation suggestions |

### **Bills Management** (`/bills/`)
*Bill tracking and payment management*

| Component | Purpose |
|-----------|---------|
| `AddBillModal.jsx` | Modal for adding new bills |
| `BillManager.jsx` | Main bill management interface |
| `BillTable.jsx` | Tabular display of bills |
| `BillTabs.jsx` | Tab navigation for bill categories |
| `SmartBillMatcher.jsx` | Automatic bill detection and matching |

### **Savings Goals** (`/savings/`)
*Savings goal tracking and management*

| Component | Purpose |
|-----------|---------|
| `SavingsGoals.jsx` | Savings goals management interface |

### **Transactions** (`/transactions/`)
*Transaction management and analysis*

| Component | Purpose |
|-----------|---------|
| `TransactionFilters.jsx` | Transaction filtering interface |
| `TransactionForm.jsx` | Form for adding/editing transactions |
| `TransactionLedger.jsx` | Complete transaction history view |
| `TransactionSplitter.jsx` | Split transaction functionality |
| `TransactionSummary.jsx` | Transaction summary and totals |
| `TransactionTable.jsx` | Tabular transaction display |

#### **Transaction Hooks** (`/transactions/hooks/`)
| Hook | Purpose |
|------|---------|
| `useTransactionFilters.js` | Transaction filtering logic |
| `useTransactionForm.js` | Transaction form state management |
| `useTransactionImport.js` | Transaction import functionality |

#### **Transaction Import** (`/transactions/import/`)
| Component | Purpose |
|-----------|---------|
| `AmazonReceiptParser.jsx.disabled` | ❌ **DISABLED** - Amazon receipt parsing |
| `FieldMapper.jsx` | CSV field mapping interface |
| `FileUploader.jsx` | File upload component |
| `ImportModal.jsx` | Transaction import modal |
| `ImportProgress.jsx` | Import progress indicator |

#### **Transaction Utils** (`/transactions/utils/`)
| Utility | Purpose |
|---------|---------|
| `envelopeMatching.js` | Auto-categorization logic |
| `fileParser.js` | CSV/file parsing utilities |

### **Analytics** (`/analytics/`)
*Financial analysis and reporting*

| Component | Purpose |
|-----------|---------|
| `ChartsAndAnalytics.jsx` | Main analytics dashboard with charts |
| `SmartCategoryManager.jsx` | Category management and suggestions |

### **Accounts** (`/accounts/`)
*Account management*

| Component | Purpose |
|-----------|---------|
| `SupplementalAccounts.jsx` | Additional account management |

### **Sync Components** (`/sync/`)
*Multi-device synchronization*

| Component | Purpose |
|-----------|---------|
| `ActivityBanner.jsx` | User activity notifications |
| `ConflictResolutionModal.jsx` | Sync conflict resolution interface |
| `SyncIndicator.jsx` | Sync status indicator |
| `SyncStatusIndicators.jsx` | Offline/syncing status displays |
| `TeamActivitySync.jsx` | Real-time team activity sync |

### **UI Components** (`/ui/`)
*Reusable UI elements*

| Component | Purpose |
|-----------|---------|
| `ErrorBoundary.jsx` | React error boundary for crash handling |
| `Header.jsx` | Application header component |
| `LoadingSpinner.jsx` | Loading state indicator |
| `Toast.jsx` | Toast notification system |
| `VersionFooter.jsx` | App version display |
| `VirtualList.jsx` | Performance-optimized list rendering |

### **Modals** (`/modals/`)
*Modal dialog components*

| Component | Purpose |
|-----------|---------|
| `PasswordRotationModal.jsx` | Password rotation security modal |

## 🪝 Hooks Directory (`/hooks/`)

*Custom React hooks for business logic*

| Hook | Purpose |
|------|---------|
| `useAuthFlow.js` | Authentication flow management |
| `useBudget.js` | Budget data management |
| `useDataManagement.js` | Import/export operations |
| `useOptimizedBudget.js` | Performance-optimized budget operations |
| `usePasswordRotation.js` | Password security and rotation |
| `useToast.js` | Toast notification management |

## 🏪 Stores Directory (`/stores/`)

*Zustand state management stores*

| Store | Purpose |
|-------|---------|
| `authStore.js` | Authentication state management |
| `budgetStore.js` | Budget data state management |
| `optimizedBudgetStore.js` | Performance-optimized budget state |

## 🌐 Contexts Directory (`/contexts/`)

*React context providers*

| Context | Purpose |
|---------|---------|
| `AuthContext.jsx` | Authentication context provider |
| `BudgetContext.jsx` | Budget data context provider |

## 🔧 Utils Directory (`/utils/`)

*Utility functions and services*

| Utility | Purpose |
|---------|---------|
| `billIcons.js` | Bill categorization icons |
| `encryption.js` | Data encryption/decryption utilities |
| `firebaseConfig.js` | Firebase configuration |
| `firebaseSync.js` | Firebase synchronization service |
| `logger.js` | Application logging utilities |
| `optimizedQueryClient.js` | Optimized data fetching client |
| `paydayPredictor.js` | Payday prediction algorithms |
| `performance.js` | Performance monitoring utilities |
| `queryClient.js` | Data fetching client |
| `sentry.js` | Error monitoring and reporting |
| `version.js` | Application version management |

## 💾 Database Directory (`/db/`)

*Local database management*

| File | Purpose |
|------|---------|
| `index.js` | Database initialization and setup |
| `optimizedDb.js` | Performance-optimized database operations |

## 📚 Constants Directory (`/constants/`)

*Application constants and configurations*

| File | Purpose |
|------|---------|
| `categories.js` | Transaction and bill categories |

---

## 🚨 Cleanup Tasks

### **Assets Directory**
- [ ] Remove deleted logo files from git history
- [ ] Update all references to old logo files
- [ ] Verify new assets (`Shield Text Logo.png`, `icon-512x512.png`) are properly used
- [ ] Consider organizing assets into subdirectories (logos/, icons/, etc.)

### **General Cleanup**
- [ ] Remove `styles-backup.css` if no longer needed
- [ ] Enable or remove `AmazonReceiptParser.jsx.disabled`
- [ ] Consolidate `styles.css` and `index.css` if possible

---

## 📈 Architecture Improvements (In Progress)

### **Completed Refactoring**
✅ **Phase 1:** Custom hooks extraction (`useAuthFlow`, `useDataManagement`, `usePasswordRotation`)  
✅ **Phase 2:** UI component extraction (NavigationTabs, SummaryCards, ViewRenderer, etc.)  
✅ **Folder Reorganization:** Better structure with `pages/`, `sync/`, and clearer naming

### **Next Steps**
- **Phase 3:** Provider hierarchy (AuthProvider, DataProvider, NotificationProvider)
- **Phase 4:** Route-based architecture (optional)
- **Service Layer:** Extract business logic from large components like `ChartsAndAnalytics.jsx`

---

**Total Files:** ~120+ files  
**Lines of Code:** ~15,000+ lines  
**Architecture:** React + Zustand + IndexedDB + Firebase  
**Security:** Client-side encryption for all sensitive data