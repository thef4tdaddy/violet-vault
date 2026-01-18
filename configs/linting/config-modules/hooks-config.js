/**
 * ESLint Configuration: Hooks Directory
 * Enforces React patterns and architecture rules for hooks
 */

export default {
  // Hooks directory rules - enforce React patterns (excluding utility files)
  files: ["src/hooks/**/*.{js,jsx,ts,tsx}"],
  ignores: [
    "src/hooks/api/queryClient.ts", // QueryClient setup utility
    "src/hooks/**/types.{ts,tsx}", // Type definition files
    "src/hooks/**/constants.{ts,tsx}", // Constants files
    "src/hooks/**/*-utils.{ts,tsx}", // Utility files (e.g., auth-utils.ts, events-utils.ts)
  ],
  rules: {
    // Architecture note: Removed overly-complex no-restricted-syntax rule that tried to enforce
    // "hooks only" exports. The selector relied on :not() which doesn't work reliably in ESLint.
    // Hook files legitimately export helper functions (operations, mutations, queries) alongside hooks.
    // File naming conventions (above ignores) are more maintainable: -operations.ts, -mutations.ts,
    // queryFunctions.ts, *Operations.ts, etc. are excluded from strict hook-only rules.
  },
};
