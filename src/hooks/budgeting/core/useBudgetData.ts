/**
 * useBudgetData - Refactored into modular components
 *
 * This file now serves as a simple re-export of the modular useBudgetData hook.
 * The original 806-line monolithic hook has been broken down into focused modules:
 *
 * - queryFunctions.js - Data fetching functions for Dexie queries
 * - queries.js - TanStack Query hooks for caching and state management
 * - mutations.js - Envelope and transaction mutation operations
 * - paycheckMutations.js - Complex paycheck processing logic
 * - utilities.js - Sync, cache, and utility functions
 * - index.js - Main hook that combines all modules
 *
 * This maintains the exact same API as before while improving maintainability.
 */

export { default } from "./useBudgetData/index.ts";
