/* eslint-disable no-undef, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, max-lines */
/**
 * PWA Service Worker Type Declarations
 * Comprehensive types for service workers, Workbox, and PWA events
 *
 * This file provides TypeScript declarations for:
 * - Service Worker global scope and APIs
 * - Workbox library types
 * - PWA window events (beforeinstallprompt, appinstalled)
 * - Firebase Messaging Service Worker types
 * - Vite PWA plugin virtual modules
 */

/// <reference lib="webworker" />

// ============================================================================
// Service Worker Global Scope
// ============================================================================

declare const self: ServiceWorkerGlobalScope;

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  // Standard Service Worker APIs
  skipWaiting(): Promise<void>;
  clients: Clients;
  registration: ServiceWorkerRegistration;

  // Event handlers
  oninstall: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null;
  onactivate: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null;
  onfetch: ((this: ServiceWorkerGlobalScope, ev: FetchEvent) => any) | null;
  onmessage: ((this: ServiceWorkerGlobalScope, ev: ExtendableMessageEvent) => any) | null;
  onnotificationclick: ((this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any) | null;
  onnotificationclose: ((this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any) | null;
  onpush: ((this: ServiceWorkerGlobalScope, ev: PushEvent) => any) | null;
  onpushsubscriptionchange: ((this: ServiceWorkerGlobalScope, ev: Event) => any) | null;
  onsync: ((this: ServiceWorkerGlobalScope, ev: SyncEvent) => any) | null;

  // Additional methods
  addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface ServiceWorkerGlobalScopeEventMap extends WorkerGlobalScopeEventMap {
  install: ExtendableEvent;
  activate: ExtendableEvent;
  fetch: FetchEvent;
  message: ExtendableMessageEvent;
  notificationclick: NotificationEvent;
  notificationclose: NotificationEvent;
  push: PushEvent;
  pushsubscriptionchange: Event;
  sync: SyncEvent;
}

// ============================================================================
// Workbox Types
// ============================================================================

declare module "workbox-core" {
  export function setCacheNameDetails(details: {
    prefix?: string;
    suffix?: string;
    precache?: string;
    runtime?: string;
  }): void;

  export function clientsClaim(): void;
  export function skipWaiting(): void;

  export class WorkboxPlugin {
    cacheWillUpdate?(options: {
      request: Request;
      response: Response;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<Response | null | undefined> | Response | null | undefined;

    cacheDidUpdate?(options: {
      cacheName: string;
      request: Request;
      oldResponse?: Response;
      newResponse: Response;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<void> | void;

    cacheKeyWillBeUsed?(options: {
      request: Request;
      mode: "read" | "write";
      params?: any;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<Request | string> | Request | string;

    cachedResponseWillBeUsed?(options: {
      cacheName: string;
      request: Request;
      matchOptions?: CacheQueryOptions;
      cachedResponse?: Response;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<Response | null | undefined> | Response | null | undefined;

    requestWillFetch?(options: {
      request: Request;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<Request> | Request;

    fetchDidFail?(options: {
      originalRequest: Request;
      request: Request;
      error: Error;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<void> | void;

    fetchDidSucceed?(options: {
      request: Request;
      response: Response;
      event?: ExtendableEvent;
      state?: any;
    }): Promise<Response> | Response;

    handlerWillStart?(options: {
      request: Request;
      event: ExtendableEvent;
      state?: any;
    }): Promise<void> | void;

    handlerWillRespond?(options: {
      request: Request;
      response: Response;
      event: ExtendableEvent;
      state?: any;
    }): Promise<Response> | Response;

    handlerDidRespond?(options: {
      request: Request;
      response: Response;
      event: ExtendableEvent;
      state?: any;
    }): Promise<void> | void;

    handlerDidComplete?(options: {
      request: Request;
      response?: Response;
      error?: Error;
      event: ExtendableEvent;
      state?: any;
    }): Promise<void> | void;

    handlerDidError?(options: {
      request: Request;
      event: ExtendableEvent;
      error: Error;
      state?: any;
    }): Promise<Response | undefined> | Response | undefined;
  }
}

declare module "workbox-routing" {
  export function registerRoute(
    capture:
      | RegExp
      | string
      | ((options: { request: Request; url: URL; event: FetchEvent }) => boolean),
    handler: any,
    method?: string
  ): void;

  export class Route {
    constructor(
      match: (options: { request: Request; url: URL; event: FetchEvent }) => boolean,
      handler: any,
      method?: string
    );
  }

  export class NavigationRoute extends Route {
    constructor(
      handler: any,
      options?: {
        allowlist?: RegExp[];
        denylist?: RegExp[];
      }
    );
  }
}

declare module "workbox-strategies" {
  import { WorkboxPlugin } from "workbox-core";

  interface StrategyOptions {
    cacheName?: string;
    plugins?: WorkboxPlugin[];
    fetchOptions?: RequestInit;
    matchOptions?: CacheQueryOptions;
  }

  interface NetworkFirstOptions extends StrategyOptions {
    networkTimeoutSeconds?: number;
  }

  export class CacheFirst {
    constructor(options?: StrategyOptions);
    handle(options: { request: Request; event: FetchEvent }): Promise<Response>;
  }

  export class CacheOnly {
    constructor(options?: StrategyOptions);
    handle(options: { request: Request; event: FetchEvent }): Promise<Response>;
  }

  export class NetworkFirst {
    constructor(options?: NetworkFirstOptions);
    handle(options: { request: Request; event: FetchEvent }): Promise<Response>;
  }

  export class NetworkOnly {
    constructor(options?: StrategyOptions);
    handle(options: { request: Request; event: FetchEvent }): Promise<Response>;
  }

  export class StaleWhileRevalidate {
    constructor(options?: StrategyOptions);
    handle(options: { request: Request; event: FetchEvent }): Promise<Response>;
  }
}

declare module "workbox-precaching" {
  export function precacheAndRoute(
    entries: Array<{ url: string; revision: string | null }>,
    options?: {
      directoryIndex?: string;
      cleanUrls?: boolean;
      urlManipulation?: (options: { url: URL }) => URL[];
    }
  ): void;

  export function cleanupOutdatedCaches(): void;

  export function matchPrecache(url: string): Promise<Response | undefined>;

  export function getCacheKeyForURL(url: string): string | undefined;

  export function createHandlerBoundToURL(
    url: string
  ): (options: { request: Request; event: FetchEvent }) => Promise<Response>;
}

declare module "workbox-expiration" {
  import { WorkboxPlugin } from "workbox-core";

  export class ExpirationPlugin implements WorkboxPlugin {
    constructor(options?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
      purgeOnQuotaError?: boolean;
      matchOptions?: CacheQueryOptions;
    });
  }

  export class CacheExpiration {
    constructor(
      cacheName: string,
      options?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
        matchOptions?: CacheQueryOptions;
      }
    );
    expireEntries(): Promise<void>;
    updateTimestamp(url: string): Promise<void>;
    isURLExpired(url: string): Promise<boolean>;
    delete(): Promise<void>;
  }
}

declare module "workbox-cacheable-response" {
  import { WorkboxPlugin } from "workbox-core";

  export class CacheableResponsePlugin implements WorkboxPlugin {
    constructor(options?: { statuses?: number[]; headers?: { [key: string]: string } });
  }
}

declare module "workbox-background-sync" {
  import { WorkboxPlugin } from "workbox-core";

  export class BackgroundSyncPlugin implements WorkboxPlugin {
    constructor(
      name: string,
      options?: {
        maxRetentionTime?: number;
        onSync?: (options: { queue: Queue }) => void | Promise<void>;
      }
    );
  }

  export class Queue {
    constructor(
      name: string,
      options?: {
        maxRetentionTime?: number;
        onSync?: (options: { queue: Queue }) => void | Promise<void>;
        forceSyncFallback?: boolean;
      }
    );
    pushRequest(options: { request: Request }): Promise<void>;
    unshiftRequest(options: { request: Request }): Promise<void>;
    popRequest(): Promise<Request | undefined>;
    shiftRequest(): Promise<Request | undefined>;
    getAll(): Promise<Request[]>;
    size(): Promise<number>;
    registerSync(): Promise<void>;
  }
}

declare module "workbox-broadcast-update" {
  import { WorkboxPlugin } from "workbox-core";

  export class BroadcastUpdatePlugin implements WorkboxPlugin {
    constructor(options?: {
      channelName?: string;
      headersToCheck?: string[];
      generatePayload?: (options: {
        cacheName: string;
        oldResponse: Response;
        newResponse: Response;
        url: string;
      }) => any;
    });
  }

  export const responsesAreSame: (
    oldResponse: Response,
    newResponse: Response,
    headersToCheck?: string[]
  ) => boolean;
}

declare module "workbox-navigation-preload" {
  export function enable(): void;
  export function disable(): void;
  export function isSupported(): boolean;
}

declare module "workbox-range-requests" {
  import { WorkboxPlugin } from "workbox-core";

  export class RangeRequestsPlugin implements WorkboxPlugin {
    constructor();
  }

  export function createPartialResponse(request: Request, response: Response): Promise<Response>;
}

declare module "workbox-window" {
  export class Workbox {
    constructor(
      scriptURL: string,
      options?: {
        scope?: string;
        type?: "classic" | "module";
        updateViaCache?: "all" | "imports" | "none";
      }
    );

    readonly active: Promise<ServiceWorker | undefined>;
    readonly controlling: Promise<ServiceWorker | undefined>;

    register(options?: RegistrationOptions): Promise<ServiceWorkerRegistration | undefined>;
    update(): Promise<void>;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;

    messageSW(data: any): Promise<any>;
    messageSkipWaiting(): void;
  }

  export class WorkboxLifecycleEvent extends Event {
    constructor(
      type: string,
      props: {
        sw?: ServiceWorker;
        originalEvent?: Event;
        isUpdate?: boolean;
        isExternal?: boolean;
      }
    );
    readonly sw?: ServiceWorker;
    readonly originalEvent?: Event;
    readonly isUpdate?: boolean;
    readonly isExternal?: boolean;
  }

  export type WorkboxLifecycleEventType =
    | "installing"
    | "installed"
    | "waiting"
    | "controlling"
    | "activated"
    | "redundant"
    | "externalinstalling"
    | "externalinstalled"
    | "externalwaiting"
    | "externalactivated";

  export class WorkboxMessageEvent extends Event {
    constructor(
      type: string,
      props: {
        data: any;
        originalEvent: ExtendableMessageEvent;
        sw: ServiceWorker;
      }
    );
    readonly data: any;
    readonly originalEvent: ExtendableMessageEvent;
    readonly sw: ServiceWorker;
  }
}

// ============================================================================
// Window PWA Event Types
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }

  interface Window {
    // PWA Install Events
    addEventListener(
      type: "beforeinstallprompt",
      listener: (this: Window, ev: BeforeInstallPromptEvent) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: "appinstalled",
      listener: (this: Window, ev: Event) => any,
      options?: boolean | AddEventListenerOptions
    ): void;

    // Service Worker Registration
    addEventListener(
      type: "message",
      listener: (this: Window, ev: MessageEvent) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
  }

  interface Navigator {
    // Service Worker API
    readonly serviceWorker: ServiceWorkerContainer;
  }
}

// ============================================================================
// Vite PWA Plugin Virtual Modules
// ============================================================================

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module "virtual:pwa-register/react" {
  import { Dispatch, SetStateAction } from "react";

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare module "virtual:pwa-info" {
  export const pwaInfo: {
    pwaInDevEnvironment: boolean;
  };
}

// ============================================================================
// Firebase Messaging Service Worker Types
// ============================================================================

declare namespace firebase {
  function initializeApp(config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }): any;

  namespace messaging {
    function isSupported(): Promise<boolean>;
  }

  function messaging(): Messaging;

  interface Messaging {
    onBackgroundMessage(
      handler: (payload: {
        notification?: {
          title?: string;
          body?: string;
          icon?: string;
          image?: string;
          badge?: string;
          tag?: string;
          requireInteraction?: boolean;
        };
        data?: Record<string, string>;
      }) => void
    ): void;
  }
}

// ============================================================================
// Service Worker Additional Types
// ============================================================================

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}

interface NotificationEvent extends ExtendableEvent {
  readonly notification: Notification;
  readonly action: string;
}

interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: any;
  readonly origin: string;
  readonly lastEventId: string;
  readonly source: Client | ServiceWorker | MessagePort | null;
  readonly ports: ReadonlyArray<MessagePort>;
}

interface Clients {
  get(id: string): Promise<Client | undefined>;
  matchAll(options?: ClientQueryOptions): Promise<ReadonlyArray<Client>>;
  openWindow(url: string): Promise<WindowClient | null>;
  claim(): Promise<void>;
}

interface Client {
  readonly frameType: FrameType;
  readonly id: string;
  readonly type: ClientType;
  readonly url: string;
  postMessage(message: any, transfer?: Transferable[]): void;
}

interface WindowClient extends Client {
  readonly focused: boolean;
  readonly visibilityState: VisibilityState;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient | null>;
}

interface ClientQueryOptions {
  includeUncontrolled?: boolean;
  type?: ClientType;
}

type ClientType = "window" | "worker" | "sharedworker" | "all";
type FrameType = "auxiliary" | "top-level" | "nested" | "none";
type VisibilityState = "hidden" | "visible" | "prerender";

// ============================================================================
// Additional Utility Types
// ============================================================================

// Service Worker global function
declare global {
  function importScripts(...urls: string[]): void;
}

export {};
