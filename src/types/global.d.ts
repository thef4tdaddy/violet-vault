/**
 * Global type declarations
 */

declare global {
  interface Window {
    cloudSyncService?: {
      triggerSyncForCriticalChange: (changeType: string) => void;
    };
  }
}

export {};