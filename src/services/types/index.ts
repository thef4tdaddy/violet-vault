/**
 * Typed Firebase Services - Main Exports
 * Easy access to all typed Firebase service interfaces
 */

// Main typed service implementations
export { typedFirebaseSyncService } from '../typedFirebaseSyncService';
export { typedChunkedSyncService } from '../typedChunkedSyncService';

// Type definitions and interfaces
export type * from './firebaseServiceTypes';
export type * from './errorHandling';

// Utility instances for standalone use
export {
  firebaseErrorHandler,
  syncOperationWrapper,
  syncDataValidator
} from './firebaseServiceTypes';

export {
  enhancedFirebaseErrorHandler
} from './errorHandling';

// Re-export core Firebase types
export type * from '../../types/firebase';
export type * from '../../types/common';