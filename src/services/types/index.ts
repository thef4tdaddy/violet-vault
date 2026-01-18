/**
 * Typed Firebase Services - Main Exports
 * Easy access to all typed Firebase service interfaces
 */

// Main typed service implementations
// Consolidated into core services

// Type definitions and interfaces
export type * from "./firebaseServiceTypes";

// Utility instances for standalone use
export {
  firebaseErrorHandler,
  syncOperationWrapper,
  syncDataValidator,
} from "./firebaseServiceTypes";

// Re-export core Firebase types
export type * from "@/types/firebase";
export type * from "@/types/common";
