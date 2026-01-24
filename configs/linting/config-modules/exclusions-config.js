/**
 * ESLint Configuration: Exclusions and Special Cases
 * Files that need relaxed rules for legitimate reasons
 */

export default [
  {
    // Exclusions for authStore.tsx - core authentication store with legitimate complexity
    files: ["**/authStore.tsx"],
    rules: {
      "max-lines": "off", // Authentication logic needs comprehensive coverage
      "max-lines-per-function": "off", // Auth methods like login need large functions
      "max-statements": "off", // Authentication flows require many statements
      complexity: "off", // Authentication logic is inherently complex
      "max-depth": "off", // Auth validation needs deep conditional logic
      "max-params": "off", // Auth methods may need many parameters
      "no-restricted-imports": "off", // Allow service imports for auth operations
    },
  },
  {
    // Exclusions for complex utilities that legitimately need higher complexity
    files: [
      "src/utils/**/calculations/**/*.{js,jsx,ts,tsx}",
      "src/utils/**/validation/**/*.{js,jsx,ts,tsx}",
      "src/utils/**/formatting/**/*.{js,jsx,ts,tsx}",
      "src/utils/domain/accounts/accountValidation.ts", // Account validation - complex form validation logic
      "src/utils/features/sync/**/*.{js,jsx,ts,tsx}", // Sync utilities - complex data coordination
      "src/services/sync/**/*.{js,jsx,ts,tsx}",
      "src/services/auth/**/*.{js,jsx,ts,tsx}",
      "src/services/authService.ts", // Core authentication service - security-critical
      "src/services/storage/**/*.{js,jsx,ts,tsx}",
      "src/services/migration/**/*.{js,jsx,ts,tsx}",
      "src/services/database/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      complexity: "off", // Complex algorithms and calculations
      "max-depth": "off", // Deep conditional logic for business rules
      "max-statements": "off", // Data processing operations
      "max-lines-per-function": "off", // Complex calculations and transformations
      "max-nested-callbacks": "off", // Async data operations
      "max-lines": "off", // Complex services legitimately need many lines
    },
  },
  {
    // Exclusions for core infrastructure files
    files: [
      "**/firebase.{js,ts}",
      "**/dexie-config.{js,ts}",
      "**/budgetDb.{js,ts}", // Core database configuration
      "**/main.{jsx,tsx}", // App entry point
      "**/App.{jsx,tsx}", // Main app component
    ],
    rules: {
      "max-lines": "off", // Core infrastructure needs comprehensive coverage
      "max-lines-per-function": "off", // Complex initialization flows
      "max-statements": "off", // Infrastructure setup requires many statements
      complexity: "off", // Core logic is inherently complex
      "max-depth": "off", // Configuration and setup needs deep conditional logic
      "max-params": "off", // Infrastructure methods may need many parameters
    },
  },
  {
    // Exclusions for auth-related files that can use React Context
    files: [
      "**/AuthContext.{jsx,tsx}", // Core auth context
      "**/contexts/*Auth*.{js,jsx,ts,tsx}", // Any auth-related context files
      "src/contexts/**/*.{js,jsx,ts,tsx}", // All context files
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [], // Allow React Context imports for auth but maintain other restrictions
        },
      ],
    },
  },
  {
    // Allow console statements only in logger.js
    files: ["**/logging.{js,ts}", "**/logger.{js,ts}"],
    rules: {
      "no-console": "off", // Logger utility can use console
    },
  },
  {
    // Allow direct icon imports only in the icon utility file
    files: ["**/iconImport.{js,ts}", "src/utils/ui/icons/index.ts"],
    rules: {
      "no-restricted-imports": "off", // Icon utility can import from react-icons and lucide-react
      "no-direct-icon-imports/no-direct-icon-imports": "off", // Icon utility needs to import from react-icons
      "max-lines": "off", // Icon utility legitimately grows as more icons are added
    },
  },
  {
    // Development and configuration files
    files: [
      "**/*.config.{js,ts}",
      "**/vite.config.*",
      "**/tailwind.config.*",
      "**/postcss.config.*",
      "scripts/**/*.{js,ts}",
    ],
    rules: {
      "no-console": "off", // Allow console in config and build scripts
      "no-undef": "off", // Config files might need Node.js specific patterns
      "max-lines": "off", // Configuration files can be longer
      complexity: "off", // Build configurations can be complex
    },
  },
  {
    // OpenAPI specification generator - third-party library type incompatibilities
    // The @asteasolutions/zod-to-openapi library has type incompatibilities with strict TypeScript
    // Specifically: Zod schema 'nullable' property is a function but OpenAPI expects boolean
    // This is optional documentation tooling, so suppressing type checking is acceptable
    // APPROVED: Type checking suppression for third-party library compatibility
    // This file legitimately needs many lines to register all schemas and API paths
    files: ["src/utils/openapi/generateOpenAPISpec.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off", // Allow @ts-nocheck for library compatibility
      "max-lines": "off", // Code generator needs many lines to register all schemas and paths
    },
  },
  {
    // Demo, marketing, and debug files - excluded from production rules
    files: [
      "src/demo/**/*.{js,jsx,ts,tsx}", // All demo app files (Issue #308)
      "src/components/demo/**/*.{js,jsx,ts,tsx}",
      "src/components/**/Demo*.{js,jsx,ts,tsx}",
      "src/components/**/*Demo.{js,jsx,ts,tsx}",
      "src/pages/showcase/**/*.{js,jsx,ts,tsx}",
      "src/pages/**/Demo*.{js,jsx,ts,tsx}",
      "src/pages/**/*Demo.{js,jsx,ts,tsx}",
      "debug_test.js",
      "debug_*.{js,ts}",
      "**/debug*.{js,ts}",
    ],
    rules: {
      // Allow console statements in demo/debug files
      "no-console": "off",

      // Relax refactoring rules - demos don't need production-level optimization
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      complexity: "off",
      "max-depth": "off",
      "max-params": "off",
      "max-nested-callbacks": "off",

      // Allow architecture violations in demos (localStorage, direct imports, etc.)
      "no-restricted-syntax": "off",
      "no-restricted-imports": "off",
      "no-restricted-globals": "off",

      // Relax Zustand rules for demos
      "zustand-safe-patterns/zustand-no-getstate-in-useeffect": "warn",
      "zustand-safe-patterns/zustand-no-server-data": "warn",
      "zustand-safe-patterns/zustand-store-reference-pattern": "warn",
      "zustand-safe-patterns/zustand-no-store-actions-in-deps": "warn",
      "zustand-safe-patterns/zustand-no-auto-executing-store-calls": "warn",
    },
  },
  {
    // Backend and legacy code - not subject to app linting rules
    files: [
      "cloudflare-worker/**/*.{js,ts}", // Backend/edge computing - console is useful for debugging
      "js-version/**/*.{js,jsx,ts,tsx}", // Legacy codebase
    ],
    rules: {
      "no-console": "off", // Allow console in backend and legacy code
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      complexity: "off",
      "max-depth": "off",
      "max-params": "off",
    },
  },
  {
    // SettingsPage.tsx temporary exclusion - well-organized sections within file
    files: ["src/pages/SettingsPage.tsx"],
    rules: {
      "max-lines": "off", // Temporarily disabled - components well-organized within file
    },
  },
  {
    // Auth-related hooks - security-critical operations
    files: [
      "src/hooks/session/useSession.ts", // Facade hook coordinating multiple session features
      "src/hooks/auth/useKeyManagement.ts", // Key management - encryption and key rotation
      "src/hooks/auth/useUserSetup.ts", // User setup with security initialization
    ],
    rules: {
      "max-lines": "off", // Security operations need comprehensive coverage
      "max-lines-per-function": "off", // Auth hooks need large functions for proper security handling
      "max-statements": "off", // Security operations require many statements
      complexity: "off", // Security logic can be complex
    },
  },
  {
    // Utility and monitoring files that legitimately need console/testing patterns
    files: [
      "**/debtDebugConfig.{js,ts}", // Debt debugging configuration
      "**/masterSyncValidator.{js,ts}", // Sync validation testing utility
      "**/highlight.{js,ts}", // Error monitoring utility
      "src/utils/core/common/logger.ts", // Logger utility can use console patterns
      "src/utils/dev/debug/**/*.{js,jsx,ts,tsx}", // All debug utilities
    ],
    rules: {
      "no-console": "off", // These utilities legitimately use console for debugging
      "max-lines": "off", // Debug utilities can be longer
      "max-lines-per-function": "off", // Debug functions can be comprehensive
      "max-statements": "off", // Debug operations can have many statements
      complexity: "off", // Debug logic can be complex
    },
  },
  {
    // Critical sync infrastructure - services, utilities, and UI components
    // These files handle large-scale data sync with encryption, chunking, and resilience
    // The complexity is inherent to the sync coordination problem, not poor design
    files: [
      "src/services/chunkedSyncService.ts", // Large data chunking and batching
      "src/services/cloudSyncService.ts", // Complex sync state machine and conflict resolution
      "src/services/firebaseSyncService.ts", // Firebase integration with retry logic
      "src/services/types/firebaseServiceTypes.ts", // Firebase error categorization - many error types to handle
      "src/components/sync/**/*.{js,jsx,ts,tsx}", // Sync UI components - activity, controls, health dashboards
      "src/components/sharing/**/*.{js,jsx,ts,tsx}", // Sharing/collaboration components - sync-related
      "src/components/settings/sections/SyncDebugToolsSection.tsx", // Debug tools for sync diagnostics
    ],
    rules: {
      "max-lines": "off", // Sync infrastructure needs comprehensive coverage
      "max-lines-per-function": "off", // Async sync methods require many lines for proper error handling
      "max-statements": "off", // Sync operations require many sequential statements
      "max-depth": "off", // Sync logic needs deep conditional nesting for state management
      complexity: "off", // Sync coordination is inherently complex
    },
  },
  {
    // Infrastructure files with legitimate complexity - browser APIs, data processing, charting
    // These have complexity inherent to their problem domain, not design issues
    files: [
      // PWA/Service Worker - Browser API complexity
      "src/utils/platform/pwa/patchNotesManager.ts", // Version content parsing logic
      "src/utils/platform/pwa/serviceWorkerDiagnostics.ts", // Cache health check diagnostics
      "src/components/pwa/OfflineStatusIndicator.tsx", // Network status detection
      "src/components/pwa/PatchNotesModal.tsx", // Version content rendering
      "src/components/pwa/ShareTargetHandler.tsx", // PWA Share Target API handling

      // Bug Report Services - System introspection and API formatting
      "src/services/bugReport/apiService.ts", // Report data validation (complexity 19)
      "src/services/bugReport/browserInfoService.ts", // Browser feature detection (complexity 19)
      "src/services/bugReport/githubApiService.ts", // GitHub API issue formatting (complexity 17)
      "src/services/bugReport/performanceInfoService.ts", // Performance metrics collection (complexity 22)

      // Chart Components - Recharts wrapper complexity
      "src/components/charts/CategoryBarChart.tsx", // Bar chart with multi-axis (complexity 22)
      "src/components/charts/ComposedFinancialChart.tsx", // Composed chart with transforms (complexity 18)
      "src/components/charts/DistributionPieChart.tsx", // Pie/donut with segments (complexity 21)
      "src/components/charts/TrendLineChart.tsx", // Line chart with trends (complexity 17)

      // Security & Data Integrity
      "src/components/security/LockScreen.tsx", // Multi-mode security state machine (260 lines)
      "src/utils/domain/budgeting/envelopeIntegrityChecker.ts", // Comprehensive data validation
      "src/hooks/bills/useBillManager.ts", // Bill orchestration hook coordinating queries and bulk operations
    ],
    rules: {
      "max-lines": "off", // Infrastructure needs comprehensive logic
      "max-lines-per-function": "off", // Complex operations need sufficient space
      "max-statements": "off", // Data processing requires many steps
      "max-depth": "off", // Conditional logic naturally deep
      complexity: "off", // Problem domain is inherently complex
    },
  },
  {
    // Analytics orchestration components - coordinate multiple data sources and charts
    files: ["src/components/analytics/AnalyticsDashboard.tsx"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
      "max-statements": "off",
      complexity: "off",
    },
  },
  {
    // Modal and state synchronization components - legitimate setState in effect
    // These components legitimately need to synchronize state when props/dependencies change
    files: [
      "src/components/**/*Modal.tsx",
      "src/components/**/modals/**/*.tsx",
      "src/components/mobile/SlideUpModal.tsx",
      "src/components/savings/AddEditGoalModal.tsx",
      "src/components/modals/QuickFundModal.tsx",
      "src/components/automation/AutoFundingRuleBuilder.tsx",
      "src/components/sync/ActivityBanner.tsx",
      "src/components/ui/EditableBalance.tsx",
      "src/components/ui/VersionFooter.tsx",
      "src/components/transactions/TransactionForm.tsx",
      "src/hooks/common/useEditLock.ts",
      "src/hooks/debts/useDebtDetailModal.ts",
      "src/hooks/security/useSecurityAcknowledgment.ts", // Security state initialization
      "src/hooks/sync/useSyncHealthMonitor.ts", // Sync monitor state initialization
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off", // State sync requires setState in effects for prop/dependency changes
    },
  },
  {
    // Time-dependent calculations - inherently require Date.now() calls
    // These hooks compute values based on current time (e.g., days until due, lock expiration)
    // Time calculations are fundamental to their purpose and cannot be made pure
    files: [
      "src/hooks/bills/useBillDetail.ts", // Calculates days until due - requires current time
      "src/components/transactions/TransactionForm.tsx", // Lock expiration calculation in useMemo
    ],
    rules: {
      "react-hooks/purity": "off", // Time-dependent calculations must call Date.now()
    },
  },
  {
    // Hooks with selective property dependencies
    // These hooks intentionally depend on specific properties rather than whole objects
    // to avoid unnecessary re-computations when other properties change
    files: [
      "src/hooks/debts/useDebtDetailModal.ts", // Selective deps for payoff and payment formatting
      "src/hooks/debts/useDebtModalLogic.ts", // Selective deps for computed debt values
    ],
    rules: {
      "react-hooks/preserve-manual-memoization": "off", // Intentional property-level dependencies
    },
  },
  {
    // TanStack Virtual incompatibility - useVirtualizer API limitation
    // TanStack Virtual's useVirtualizer returns functions that cannot be memoized
    // This is a known limitation of the library, not a design issue
    files: [
      "src/hooks/transactions/useTransactionTable.ts", // Uses TanStack Virtual
      "src/components/primitives/tables/DataTable.tsx", // Uses TanStack Virtual
    ],
    rules: {
      "react-hooks/incompatible-library": "off", // TanStack Virtual API limitation
    },
  },
  {
    // Function overload declarations - legitimate TypeScript pattern
    // These files use function overloads for proper TypeScript type checking
    files: [
      "src/utils/budgeting/envelopeFormUtils.ts", // Helper function overloads for type safety
    ],
    rules: {
      "no-redeclare": "off", // Function overloads require multiple declarations
    },
  },
  {
    // Financial orchestration components/hooks coordinating multiple subsystems
    files: [
      "src/components/bills/BillManager.tsx",
      "src/components/transactions/TransactionLedger.tsx",
      "src/hooks/transactions/useTransactionLedger.ts",
    ],
    rules: {
      "max-lines-per-function": "off", // Coordinator components must orchestrate many UI states
      "max-statements": "off", // Numerous sequential operations for data orchestration
      complexity: "off", // Cross-domain coordination inherently complex (TanStack Query + Dexie + services)
    },
  },
  {
    // Bill envelope funding widget orchestrates multiple display states in a single render path
    files: ["src/components/budgeting/BillEnvelopeFundingInfo.tsx"],
    rules: {
      complexity: "off",
    },
  },
  {
    // Distribution hook coordinates several strategies in one cohesive state machine
    files: ["src/hooks/budgeting/useUnassignedCashDistribution.ts"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
  {
    // Main dashboard hook composes multiple domain hooks; complexity warning is expected
    files: ["src/hooks/dashboard/useMainDashboard.ts"],
    rules: {
      complexity: "off",
    },
  },
  {
    // Deep archival utilities handle multi-step workflows that are inherently complex
    files: [
      "src/utils/core/common/transactionArchiving.ts",
      "src/utils/platform/security/keyExport.ts",
    ],
    rules: {
      complexity: "off",
    },
  },
  {
    // Budget history service coordinates persistence and analytics snapshots in one module
    files: ["src/services/budgetHistoryService.ts"],
    rules: {
      "max-lines": "off",
    },
  },
  {
    // Sentry error filtering - multiple filtering conditions needed for noise reduction
    // APPROVED: Complexity exclusion for event filtering logic
    // The filterSentryEvent function needs to check multiple conditions (level, message, exception, request)
    // to properly filter out non-error messages, CORS errors, and sensitive data
    files: ["src/utils/core/common/sentry.ts"],
    rules: {
      complexity: "off", // Multiple filtering conditions needed for noise reduction
    },
  },
  {
    // EnvelopeSystem.tsx - updateBiweeklyAllocations is a useCallback hook, not a Zustand action
    // The zustand-safe-patterns rule incorrectly flags it because it's used in a useEffect dependency array
    // This is a legitimate React hook pattern where a useCallback depends on bills and envelopes,
    // and the useEffect correctly includes it in dependencies to re-run when the callback changes
    files: ["src/components/budgeting/EnvelopeSystem.tsx"],
    rules: {
      "zustand-safe-patterns/zustand-no-store-actions-in-deps": "off", // updateBiweeklyAllocations is a useCallback, not a Zustand action
    },
  },
  {
    // useBillManager.ts - False positive for selective subscriptions on local state hook
    files: ["src/hooks/budgeting/transactions/scheduled/expenses/useBillManager.ts"],
    rules: {
      "zustand-safe-patterns/zustand-selective-subscriptions": "off",
    },
  },
  {
    // MainDashboard.tsx - False positive for selective subscriptions on local state hook
    files: ["src/components/pages/MainDashboard.tsx"],
    rules: {
      "zustand-safe-patterns/zustand-selective-subscriptions": "off",
    },
  },
  {
    // ServiceStatusBadge.tsx - Custom status badge using native buttons for specific styling
    files: ["src/components/common/ServiceStatusBadge.tsx"],
    rules: {
      "enforce-ui-library/enforce-ui-library": "off",
    },
  },
  {
    // Test files - relax rules to allow for common testing patterns and legacy code
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/__tests__/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-console": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      complexity: "off",
      "@typescript-eslint/no-explicit-any": "off", // Mocks often need any
      "react/display-name": "off", // Mock components don't need display names
    },
  },
];
