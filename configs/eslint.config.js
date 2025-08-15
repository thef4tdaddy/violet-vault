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
    },
  },
];
