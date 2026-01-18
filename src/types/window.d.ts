export {};

declare global {
  interface CloudSyncService {
    triggerSyncForCriticalChange(change: string): void;
    isRunning?: boolean;
    config?: unknown;
    lastSyncTime?: string;
  }

  interface Window {
    cloudSyncService?: CloudSyncService;
  }
}
