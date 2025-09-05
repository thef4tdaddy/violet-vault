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
          message: "Use toast notifications instead of alert(). Import { globalToast } from '../../stores/ui/toastStore' and use globalToast.showError(), globalToast.showSuccess(), etc."
        },
        {
          name: "confirm", 
          message: "Use ConfirmModal instead of confirm(). Import { useConfirm } from '../../hooks/common/useConfirm' and use the returned confirm function."
        },
        {
          name: "prompt",
          message: "Use PromptModal instead of prompt(). Import { usePrompt } from '../../hooks/common/usePrompt' and use the returned prompt function."
        }
      ],
      
      // Block React Context usage (Issue #491 enforcement)
      "no-restricted-imports": [
        "error", 
        {
          "paths": [
            {
              "name": "react",
              "importNames": ["createContext", "useContext"],
              "message": "Avoid React Context. For data: use TanStack Query + Dexie (see hooks in src/hooks/). For UI/auth state: use Zustand stores in src/stores/."
            }
          ]
        }
      ],
      
      // Graduated file size enforcement (Issue #569)
      // 300+ lines = warning, 400+ lines = error, 500+ lines = must fix
      "max-lines": ["warn", {
        "max": 300,
        "skipBlankLines": true,
        "skipComments": true
      }],
      
      // Phase 1: Relaxed complexity rules - only warn for moderate violations
      "complexity": ["warn", { "max": 15 }], // Warn on high complexity
      "max-depth": ["warn", 5], // Warn on deep nesting
      "max-params": ["warn", 5], // Warn on too many parameters
      "max-statements": ["warn", 25], // Warn on long functions
      "max-lines-per-function": ["warn", {
        "max": 75,
        "skipBlankLines": true,
        "skipComments": true
      }],
      "max-nested-callbacks": ["warn", 4], // Warn on nested callbacks
      
      // Block all console statements - use logger instead
      "no-console": "error",
    },
  },
  {
    // Component architecture enforcement (Issue #515 - prevent direct service imports in components only)
    files: ["src/components/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../services/*", "../../services/*", "../../../services/*"],
              "message": "Components should not directly import services. Use hooks in src/hooks/ to encapsulate service calls. Utils and hooks are allowed."
            },
            {
              "group": ["**/calculations/*", "**/processors/*", "**/validators/*", "**/transformers/*"],
              "message": "Components should not import business logic utilities directly. Extract to custom hooks instead."
            },
            {
              "group": ["**/utils/**/calculate*", "**/utils/**/process*", "**/utils/**/validate*", "**/utils/**/transform*"],
              "message": "Components should not import calculation/processing utilities. Use custom hooks to encapsulate business logic."
            }
          ]
        }
      ],
    },
  },
  {
    // Files over 400 lines need attention (Issue #569)
    files: ["**/*.{js,jsx}"],
    rules: {
      "max-lines": ["error", {
        "max": 400, // 400+ lines = error, needs refactoring soon
        "skipBlankLines": true,
        "skipComments": true
      }],
    },
  },
  {
    // Files over 500 lines must be refactored (Issue #569)
    files: ["**/*.{js,jsx}"],
    rules: {
      "max-lines": ["error", {
        "max": 500, // 500+ lines = critical, must be refactored
        "skipBlankLines": true,
        "skipComments": true
      }],
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
      "complexity": "off", // Complex algorithms and financial calculations
      "max-depth": "off", // Deep conditional logic for business rules
      "max-statements": "off", // Data processing operations
      "max-lines-per-function": "off", // Complex calculations and transformations
      "max-nested-callbacks": "off", // Async data operations
    },
  },
  {
    // Exclusions for core infrastructure and diagnostic files (Issue #514)
    files: [
      "**/budgetDb.js",
      "**/budgetHistoryService.js", 
      "**/chunkedSyncService.js",
      "**/budgetHistoryTracker.js",
      "**/authStore.jsx",
      "**/SyncHealthIndicator.jsx", // System health monitoring utility
      "**/ActivityFeed.jsx", // Only imports constants, not service functions
    ],
    rules: {
      "max-lines": "off", // These files excluded from 500 LOC limit
      "no-restricted-imports": "off", // Allow service imports for system monitoring
    },
  },
  {
    // Allow console statements only in logger.js and error tracking service
    files: ["**/logger.js", "**/errorTrackingService.js"],
    rules: {
      "no-console": "off", // Logger utility and error tracking service can use console
    },
  },
];
