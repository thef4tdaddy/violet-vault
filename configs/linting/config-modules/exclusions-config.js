/**
 * ESLint Configuration: Exclusions and Special Cases
 * Files that need relaxed rules for legitimate reasons
 */

export default [
  {
    // Exclusions for authStore.tsx - core authentication store with legitimate complexity
    files: ['**/authStore.tsx'],
    rules: {
      'max-lines': 'off', // Authentication logic needs comprehensive coverage
      'max-lines-per-function': 'off', // Auth methods like login need large functions
      'max-statements': 'off', // Authentication flows require many statements
      complexity: 'off', // Authentication logic is inherently complex
      'max-depth': 'off', // Auth validation needs deep conditional logic
      'max-params': 'off', // Auth methods may need many parameters
      'no-restricted-imports': 'off', // Allow service imports for auth operations
    },
  },
  {
    // Exclusions for complex utilities that legitimately need higher complexity
    files: [
      'src/utils/**/calculations/**/*.{js,jsx,ts,tsx}',
      'src/utils/**/validation/**/*.{js,jsx,ts,tsx}',
      'src/utils/**/formatting/**/*.{js,jsx,ts,tsx}',
      'src/services/sync/**/*.{js,jsx,ts,tsx}',
      'src/services/auth/**/*.{js,jsx,ts,tsx}',
      'src/services/storage/**/*.{js,jsx,ts,tsx}',
      'src/services/migration/**/*.{js,jsx,ts,tsx}',
      'src/services/database/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      complexity: 'off', // Complex algorithms and calculations
      'max-depth': 'off', // Deep conditional logic for business rules
      'max-statements': 'off', // Data processing operations
      'max-lines-per-function': 'off', // Complex calculations and transformations
      'max-nested-callbacks': 'off', // Async data operations
      'max-lines': 'off', // Complex services legitimately need many lines
    },
  },
  {
    // Exclusions for core infrastructure files
    files: [
      '**/firebase.{js,ts}',
      '**/dexie-config.{js,ts}',
      '**/budgetDb.{js,ts}', // Core database configuration
      '**/main.{jsx,tsx}', // App entry point
      '**/App.{jsx,tsx}', // Main app component
    ],
    rules: {
      'max-lines': 'off', // Core infrastructure needs comprehensive coverage
      'max-lines-per-function': 'off', // Complex initialization flows
      'max-statements': 'off', // Infrastructure setup requires many statements
      complexity: 'off', // Core logic is inherently complex
      'max-depth': 'off', // Configuration and setup needs deep conditional logic
      'max-params': 'off', // Infrastructure methods may need many parameters
    },
  },
  {
    // Exclusions for auth-related files that can use React Context
    files: [
      '**/AuthContext.{jsx,tsx}', // Core auth context
      '**/contexts/*Auth*.{js,jsx,ts,tsx}', // Any auth-related context files
      'src/contexts/**/*.{js,jsx,ts,tsx}', // All context files
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [], // Allow React Context imports for auth but maintain other restrictions
        },
      ],
    },
  },
  {
    // Allow console statements only in logger.js
    files: ['**/logging.{js,ts}', '**/logger.{js,ts}'],
    rules: {
      'no-console': 'off', // Logger utility can use console
    },
  },
  {
    // Allow direct icon imports only in the icon utility file
    files: ['**/iconImport.{js,ts}', 'src/utils/icons/index.ts'],
    rules: {
      'no-restricted-imports': 'off', // Icon utility can import from react-icons and lucide-react
      'no-direct-icon-imports/no-direct-icon-imports': 'off', // Icon utility needs to import from react-icons
    },
  },
  {
    // Development and configuration files
    files: [
      '**/*.config.{js,ts}',
      '**/vite.config.*',
      '**/tailwind.config.*',
      '**/postcss.config.*',
      'scripts/**/*.{js,ts}',
    ],
    rules: {
      'no-console': 'off', // Allow console in config and build scripts
      'no-undef': 'off', // Config files might need Node.js specific patterns
      'max-lines': 'off', // Configuration files can be longer
      complexity: 'off', // Build configurations can be complex
    },
  },
  {
    // Demo, marketing, and debug files - excluded from production rules
    files: [
      'src/demo/**/*.{js,jsx,ts,tsx}', // All demo app files (Issue #308)
      'src/components/demo/**/*.{js,jsx,ts,tsx}',
      'src/components/**/Demo*.{js,jsx,ts,tsx}',
      'src/components/**/*Demo.{js,jsx,ts,tsx}',
      'src/pages/showcase/**/*.{js,jsx,ts,tsx}',
      'src/pages/**/Demo*.{js,jsx,ts,tsx}',
      'src/pages/**/*Demo.{js,jsx,ts,tsx}',
      'debug_test.js',
      'debug_*.{js,ts}',
      '**/debug*.{js,ts}',
    ],
    rules: {
      // Allow console statements in demo/debug files
      'no-console': 'off',

      // Relax refactoring rules - demos don't need production-level optimization
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      complexity: 'off',
      'max-depth': 'off',
      'max-params': 'off',
      'max-nested-callbacks': 'off',

      // Allow architecture violations in demos (localStorage, direct imports, etc.)
      'no-restricted-syntax': 'off',
      'no-restricted-imports': 'off',
      'no-restricted-globals': 'off',

      // Relax Zustand rules for demos
      'zustand-safe-patterns/zustand-no-getstate-in-useeffect': 'warn',
      'zustand-safe-patterns/zustand-no-server-data': 'warn',
      'zustand-safe-patterns/zustand-store-reference-pattern': 'warn',
      'zustand-safe-patterns/zustand-no-store-actions-in-deps': 'warn',
      'zustand-safe-patterns/zustand-no-auto-executing-store-calls': 'warn',
    },
  },
  {
    // Backend and legacy code - not subject to app linting rules
    files: [
      'cloudflare-worker/**/*.{js,ts}', // Backend/edge computing - console is useful for debugging
      'js-version/**/*.{js,jsx,ts,tsx}', // Legacy codebase
    ],
    rules: {
      'no-console': 'off', // Allow console in backend and legacy code
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      complexity: 'off',
      'max-depth': 'off',
      'max-params': 'off',
    },
  },
  {
    // SettingsPage.tsx temporary exclusion - well-organized sections within file
    files: ['src/pages/SettingsPage.tsx'],
    rules: {
      'max-lines': 'off', // Temporarily disabled - components well-organized within file
    },
  },
  {
    // useSession.ts - composition/facade hook that orchestrates multiple session concerns
    files: ['src/hooks/session/useSession.ts'],
    rules: {
      'max-lines': 'off', // Facade hook coordinating multiple session features
      'max-lines-per-function': 'off', // Main hook orchestrates state, keyholder, analytics, lifecycle
    },
  },
  {
    // Utility and monitoring files that legitimately need console/testing patterns
    files: [
      '**/debtDebugConfig.{js,ts}', // Debt debugging configuration
      '**/masterSyncValidator.{js,ts}', // Sync validation testing utility
      '**/highlight.{js,ts}', // Error monitoring utility
      'src/utils/common/logger.ts', // Logger utility can use console patterns
      'src/utils/debug/**/*.{js,jsx,ts,tsx}', // All debug utilities
    ],
    rules: {
      'no-console': 'off', // These utilities legitimately use console for debugging
      'max-lines': 'off', // Debug utilities can be longer
      'max-lines-per-function': 'off', // Debug functions can be comprehensive
      'max-statements': 'off', // Debug operations can have many statements
      complexity: 'off', // Debug logic can be complex
    },
  },
  {
    // Critical sync services - complex business logic for data synchronization
    // These files handle large-scale data sync with encryption, chunking, and resilience
    // The complexity is inherent to the sync coordination problem, not poor design
    files: [
      'src/services/chunkedSyncService.ts', // Large data chunking and batching
      'src/services/cloudSyncService.ts', // Complex sync state machine and conflict resolution
      'src/services/firebaseSyncService.ts', // Firebase integration with retry logic
    ],
    rules: {
      'max-lines': 'off', // Sync services need comprehensive coverage
      'max-lines-per-function': 'off', // Async sync methods require many lines for proper error handling
      'max-statements': 'off', // Sync operations require many sequential statements
      'max-depth': 'off', // Sync logic needs deep conditional nesting for state management
      complexity: 'off', // Sync coordination is inherently complex
    },
  },
];
