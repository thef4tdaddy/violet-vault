/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Declarations
 * Provides type safety for import.meta.env variables
 */

interface ImportMetaEnv {
  // Build-time Git information
  readonly VITE_GIT_BRANCH: string;
  readonly VITE_GIT_COMMIT_DATE: string;
  readonly VITE_GIT_AUTHOR_DATE: string;
  readonly VITE_GIT_COMMIT_HASH: string;
  readonly VITE_GIT_COMMIT_MESSAGE: string;
  readonly VITE_BUILD_TIME: string;

  // Firebase configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;

  // Optional configurations
  readonly VITE_BUG_REPORT_ENDPOINT?: string;
  readonly VITE_HIGHLIGHT_PROJECT_ID?: string;
  readonly VITE_HIGHLIGHT_ENABLED?: string;
  readonly VITE_LOCAL_ONLY_MODE?: string;
  readonly VITE_ENABLE_CLOUDFLARE_SYNC?: string;
  readonly VITE_CLOUDFLARE_WORKER_URL?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_NODE_ENV?: string;
  readonly VITE_GO_API_URL?: string;
  readonly VITE_PY_API_URL?: string;

  // Standard Vite variables
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

// Global type declarations for browser APIs
interface CloudSyncService {
  triggerSyncForCriticalChange(change: string): void;
  isRunning?: boolean;
  config?: unknown;
  lastSyncTime?: string;
}

declare global {
  interface Window {
    cloudSyncService?: CloudSyncService;
  }

  // Service Worker types
  interface ServiceWorkerGlobalScope {
    skipWaiting(): Promise<void>;
    clients: Clients;
    registration: ServiceWorkerRegistration;
  }

  // Clients interface for Service Workers
  interface Clients {
    get(id: string): Promise<Client | undefined>;
    matchAll(options?: ClientQueryOptions): Promise<Client[]>;
    openWindow(url: string): Promise<Client | null>;
    claim(): Promise<void>;
  }

  interface Client {
    readonly id: string;
    readonly url: string;
    readonly type: ClientType;
    postMessage(message: unknown, transfer?: Transferable[]): void;
  }

  interface ClientQueryOptions {
    includeUncontrolled?: boolean;
    type?: ClientType;
  }

  type ClientType = "window" | "worker" | "sharedworker";

  // Additional browser APIs
  // Note: Notification constructor is already defined by the browser

  interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
    data?: unknown;
  }

  // Highlight.io global interface
  var H: {
    start: () => void;
    isRecording: () => boolean;
    getSessionURL: () => string;
    getSessionMetadata: () => { sessionId?: string } | null;
  };

  // Global type declarations
  type NotificationPermission = "default" | "denied" | "granted";
  type BufferSource = ArrayBufferView | ArrayBuffer;
  type Transferable = ArrayBuffer | MessagePort | ImageBitmap;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
