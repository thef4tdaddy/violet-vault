import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist/**",
      ".markdownlintignore",
      "node_modules/**",
      ".git/**",
      "coverage/**",
      "*.min.js",
      "*.bundle.js",
      ".vscode/**",
      ".idea/**",
      "*.log",
      ".env*",
      "build/**",
      "public/**/*.js",
      "**/*.test.js",
      "**/*.spec.js",
      "**/__tests__/**", // Exclude test directories
      "scripts/**", // Allow console in build scripts
      "cloudflare-worker/**", // Allow console in worker
      "vite.config.js", // Allow console in build config
      "**/logger.js", // Allow console in logger utility
      "**/debug/**", // Debug utilities that output to browser console
      "**/debtDebugConfig.js", // Debt debugging configuration
      "**/masterSyncValidator.js", // Sync validation testing
      "**/highlight.js", // Error monitoring utility
      "src/stores/authStore.jsx", // Main Zustand store for UI/State, low priority for refactoring
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals (when globals: true in vitest.config.js)
        vi: "readonly",
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        suite: "readonly",
        // Node.js globals
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^(_|[A-Z_]+)" }],
      "no-undef": "warn",
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Block browser dialogs (Issues #502, #503, #504 enforcement)
      "no-restricted-globals": [
        "error",
        {
          name: "alert",
          message:
            "Use toast notifications instead of alert(). Import { globalToast } from '../../stores/ui/toastStore' and use globalToast.showError(), globalToast.showSuccess(), etc.",
        },
        {
          name: "confirm",
          message:
            "Use ConfirmModal instead of confirm(). Import { useConfirm } from '../../hooks/common/useConfirm' and use the returned confirm function.",
        },
        {
          name: "prompt",
          message:
            "Use PromptModal instead of prompt(). Import { usePrompt } from '../../hooks/common/usePrompt' and use the returned prompt function.",
        },
      ],

      // Block React Context usage (Issue #491 enforcement)
      // Block direct lucide-react imports (Issue #575 enforcement)
      "no-restricted-imports": [
        "error", // CHANGED FROM "warn"
        {
          paths: [
            {
              name: "react",
              importNames: ["createContext", "useContext"],
              message:
                "Avoid React Context. For data: use TanStack Query + Dexie (see hooks in src/hooks/). For UI/auth state: use Zustand stores in src/stores/.",
            },
            {
              name: "lucide-react",
              message:
                "Use centralized icon system instead of direct lucide-react imports. Import icons from '@/utils/icons' or use { getIcon, renderIcon } from '@/utils'. See docs/ICON_MIGRATION_PLAN.md for details.",
            },
          ],
        },
      ],

      // Graduated file size enforcement (Issue #569)
      // 300+ lines = warning, 400+ lines = error, 500+ lines = must fix
      "max-lines": [
        "warn",
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Phase 1: Relaxed complexity rules - only warn for moderate violations
      complexity: ["warn", { max: 15 }], // Warn on high complexity
      "max-depth": ["warn", 5], // Warn on deep nesting
      "max-params": ["warn", 5], // Warn on too many parameters
      "max-statements": ["warn", 25], // Warn on long functions
      "max-lines-per-function": [
        "warn",
        {
          max: 75,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-nested-callbacks": ["warn", 4], // Warn on nested callbacks

      // Block all console statements - use logger instead
      "no-console": "error",

      // Block window.confirm patterns that no-restricted-globals doesn't catch
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='confirm']",
          message:
            "Use ConfirmModal instead of window.confirm(). Import { useConfirm } from '../../hooks/common/useConfirm' and use the returned confirm function.",
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='alert']",
          message:
            "Use toast notifications instead of window.alert(). Import { globalToast } from '../../stores/ui/toastStore' and use globalToast.showError(), globalToast.showSuccess(), etc.",
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='prompt']",
          message:
            "Use PromptModal instead of window.prompt(). Import { usePrompt } from '../../hooks/common/usePrompt' and use the returned prompt function.",
        },
        {
          selector: "CallExpression[callee.name='getIcon'] > Literal:nth-child(2)",
          message:
            "Invalid getIcon usage. Use React.createElement(getIcon('IconName'), { className: 'classes' }) instead of getIcon('icon-name', 'classes'). See docs/ICON_MIGRATION_PLAN.md for proper usage.",
        },
        {
          selector: "JSXElement[openingElement.name.name=/^[A-Z][a-zA-Z]*$/][openingElement.attributes.0.name.name='className']",
          message:
            "Direct icon usage detected. Use React.createElement(getIcon('IconName'), { className: 'classes' }) instead of <IconName className='classes' />. Import getIcon from utils and follow the centralized icon system.",
        },
      ],
    },
  },
  {
    // Component architecture enforcement (Issue #515 - prevent direct service imports in components only)
    // Icon system enforcement (Issue #575 - prevent direct lucide-react imports in components)
    files: ["src/components/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error", // CHANGED FROM "warn"
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "Use centralized icon system instead of direct lucide-react imports. Import icons from '@/utils/icons' or use { getIcon, renderIcon } from '@/utils'. See docs/ICON_MIGRATION_PLAN.md for details.",
            },
          ],
          patterns: [
            {
              group: ["../services/*", "../../services/*", "../../../services/*"],
              message:
                "Components should not directly import services. Use hooks in src/hooks/ to encapsulate service calls. Utils and hooks are allowed.",
            },
            {
              group: [
                "**/calculations/*",
                "**/processors/*",
                "**/validators/*",
                "**/transformers/*",
              ],
              message:
                "Components should not import business logic utilities directly. Extract to custom hooks instead.",
            },
            {
              group: [
                "**/utils/**/calculate*",
                "**/utils/**/process*",
                "**/utils/**/validate*",
                "**/utils/**/transform*",
              ],
              message:
                "Components should not import calculation/processing utilities. Use custom hooks to encapsulate business logic.",
            },
          ],
        },
      ],
    },
  },
  {
    // Files over 400 lines need attention (Issue #569)
    files: ["**/*.{js,jsx}"],
    rules: {
      "max-lines": [
        "error",
        {
          max: 400, // 400+ lines = error, needs refactoring soon
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    // Files over 500 lines must be refactored (Issue #569)
    files: ["**/*.{js,jsx}"],
    rules: {
      "max-lines": [
        "error",
        {
          max: 500, // 500+ lines = critical, must be refactored
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    // Exclusions for complex utilities that legitimately need higher complexity (Issue #569 prevention)
    files: [
      "src/utils/**/calculations/**/*.js",
      "src/utils/**/strategies/**/*.js",
      "src/utils/**/operations/**/*.js",
      "src/utils/sync/**/*.js",
      "src/utils/security/**/*.js",
      "src/utils/query/**/*.js",
      "src/utils/debts/**/*.js",
      "src/utils/transactions/**/*.js",
      "src/utils/budgeting/autofunding/**/*.js",
    ],
    rules: {
      complexity: "off", // Complex algorithms and financial calculations
      "max-depth": "off", // Deep conditional logic for business rules
      "max-statements": "off", // Data processing operations
      "max-lines-per-function": "off", // Complex calculations and transformations
      "max-nested-callbacks": "off", // Async data operations
    },
  },
  {
    // Exclusions for data management utilities that require higher complexity for logging
    files: ["src/utils/dataManagement/validationUtils.js"],
    rules: {
      complexity: "off",
    },
  },
  {
    // Exclusions for core infrastructure and diagnostic files (Issue #514)
    files: [
      "**/budgetHistoryService.js",
      "**/budgetHistoryTracker.js",
      "**/SyncHealthIndicator.jsx", // System health monitoring utility
      "**/ActivityFeed.jsx", // Only imports constants, not service functions
    ],
    rules: {
      "max-lines": "off", // These files excluded from 500 LOC limit
      "no-restricted-imports": "off", // Allow service imports for system monitoring
    },
  },
  {
    // Exclusions for budgetDb.js - core database layer with legitimate complexity
    files: ["**/budgetDb.js"],
    rules: {
      "max-lines": "off", // Database layer needs many lines for comprehensive operations
      "max-lines-per-function": "off", // Database constructors and methods need large functions
      "max-statements": "off", // Database operations require many statements
      complexity: "off", // Database query logic is inherently complex
      "max-depth": "off", // Database operations need deep conditional logic
      "max-params": "off", // Database methods may need many parameters
      "no-restricted-imports": "off", // Allow service imports for database operations
    },
  },
  {
    // Exclusions for authStore.jsx - core authentication store with legitimate complexity
    files: ["**/authStore.jsx"],
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
    // Exclusions for critical sync files with legitimate complexity (Issue #576)
    files: ["**/chunkedSyncService.js", "**/cloudSyncService.js"],
    rules: {
      "max-lines": "off", // Critical sync operations may need many lines
      "max-lines-per-function": "off", // Complex sync operations need large functions
      "max-statements": "off", // Sync logic requires many statements
      complexity: "off", // Firebase sync operations are inherently complex
      "max-depth": "off", // Error handling and retry logic needs deep nesting
      "max-params": "off", // Sync operations may need many parameters
      "max-nested-callbacks": "off", // Async Firebase operations need nested callbacks
      "no-restricted-imports": "off", // Allow service imports for sync operations
      // Keep unused-vars warning to catch import cleanup opportunities
    },
  },
  {
    // Allow console statements only in logger.js and error tracking service
    files: ["**/logger.js", "**/errorTrackingService.js"],
    rules: {
      "no-console": "off", // Logger utility and error tracking service can use console
    },
  },
  {
    // Allow direct lucide-react imports only in centralized icon utilities (Issue #575)
    files: [
      "src/utils/icons/index.js", // Centralized icon system
      "src/utils/billIcons/**/*.js", // Legacy bill icon utilities (compatibility layer)
      "src/utils/receipts/receiptHelpers.jsx", // Receipt utilities using icons
    ],
    rules: {
      "no-restricted-imports": "off", // These files can import lucide-react directly
    },
  },
];
