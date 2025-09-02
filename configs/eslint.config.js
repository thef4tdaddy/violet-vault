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
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]" }],
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
      
      // File size limit enforcement (Epic #470 - keep components focused)
      "max-lines": ["error", {
        "max": 500,
        "skipBlankLines": true,
        "skipComments": true
      }],
      
      // Block console.log statements (except debug commits)
      "no-console": [
        "error",
        {
          "allow": ["warn", "error"]
        }
      ],
    },
  },
  {
    // Exclusions for core infrastructure files (Issue #514)
    files: [
      "**/budgetDb.js",
      "**/budgetHistoryService.js", 
      "**/chunkedSyncService.js",
      "**/budgetHistoryTracker.js",
      "**/authStore.jsx"
    ],
    rules: {
      "max-lines": "off", // These files excluded from 500 LOC limit
    },
  },
];
