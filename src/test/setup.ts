import "@testing-library/jest-dom";
import { vi } from "vitest";
import {
  indexedDB,
  IDBKeyRange,
  IDBFactory,
  IDBDatabase,
  IDBObjectStore,
  IDBIndex,
  IDBTransaction,
  IDBOpenDBRequest,
  IDBRequest,
  IDBCursor,
  IDBCursorWithValue,
} from "fake-indexeddb";
/// <reference types="../vite-env.d.ts" />

// Type declarations for browser APIs
type BufferSource = ArrayBufferView | ArrayBuffer;

// Mock IndexedDB using fake-indexeddb for full API support
Object.defineProperty(global, "indexedDB", {
  value: indexedDB,
  writable: true,
});

Object.assign(global, {
  IDBKeyRange,
  IDBFactory,
  IDBDatabase,
  IDBObjectStore,
  IDBIndex,
  IDBTransaction,
  IDBOpenDBRequest,
  IDBRequest,
  IDBCursor,
  IDBCursorWithValue,
});

// Mock crypto.getRandomValues
const mockGetRandomValues = vi.fn((array: Uint8Array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
});

// Mock crypto.subtle.digest with proper implementation
const mockDigest = vi.fn(async (_algorithm: string, data: BufferSource) => {
  // Create a simple deterministic hash for testing
  let hash = 0;
  const uint8Array = new Uint8Array(data as ArrayBuffer);
  for (let i = 0; i < uint8Array.length; i++) {
    hash = (hash * 31 + uint8Array[i]) % 0xffffffff;
  }

  // Convert to a 32-byte array (256 bits for SHA-256)
  const result = new ArrayBuffer(32);
  const view = new DataView(result);

  // Fill with deterministic pattern based on hash
  for (let i = 0; i < 8; i++) {
    view.setUint32(i * 4, hash + i, false);
  }

  return result;
});

Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 9)),
    getRandomValues: mockGetRandomValues,
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      exportKey: vi.fn(),
      importKey: vi.fn(),
      digest: mockDigest,
    },
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    hostname: "localhost",
    port: "3000",
    protocol: "http:",
    reload: vi.fn(),
    assign: vi.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Element.prototype.scrollTo for components like StandardTabs
Element.prototype.scrollTo = vi.fn();

/**
 * Mock implementation of Storage interface (localStorage/sessionStorage)
 */
class LocalStorageMock {
  store: Record<string, string>;
  length: number;

  key = vi.fn((n: number): string | null => {
    return Object.keys(this.store)[n] || null;
  });

  getItem = vi.fn((key: string): string | null => {
    return key in this.store ? this.store[key] : null;
  });

  setItem = vi.fn((key: string, value: string): void => {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  });

  removeItem = vi.fn((key: string): void => {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  });

  clear = vi.fn((): void => {
    this.store = {};
    this.length = 0;
  });

  constructor() {
    this.store = {};
    this.length = 0;
  }
}

Object.defineProperty(window, "localStorage", {
  value: new LocalStorageMock(),
});

Object.defineProperty(window, "sessionStorage", {
  value: new LocalStorageMock(),
});

// Global Firebase Mock
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(null);
      return () => {};
    }),
    signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: "test-uid" } })),
    signOut: vi.fn(() => Promise.resolve()),
  })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return () => {};
  }),
  signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: "test-uid" } })),
}));

vi.mock("firebase/firestore", () => {
  const store = new Map<string, Record<string, unknown>>();
  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn((_, ...pathSegments) => pathSegments.join("/")),
    collection: vi.fn((_, ...pathSegments) => pathSegments.join("/")),
    setDoc: vi.fn((ref, data) => {
      store.set(ref, data);
      return Promise.resolve();
    }),
    getDoc: vi.fn((ref) => {
      const data = store.get(ref);
      return Promise.resolve({
        exists: () => !!data,
        data: () => data || null,
        id: ref.split("/").pop(),
      });
    }),
    onSnapshot: vi.fn((ref, callback) => {
      const data = store.get(ref);
      callback({
        exists: () => !!data,
        data: () => data || null,
        id: ref.split("/").pop(),
      });
      return () => {};
    }),
    serverTimestamp: vi.fn(() => "mock-timestamp"),
    addDoc: vi.fn((ref, data) => {
      const id = "mock-doc-id-" + Date.now();
      const path = `${ref}/${id}`;
      store.set(path, data);
      return Promise.resolve({ id, path });
    }),
    query: vi.fn((col) => col),
    where: vi.fn(),
    getDocs: vi.fn((query) => {
      const docs: { id: string | undefined; data: () => Record<string, unknown> | undefined }[] =
        [];
      const prefix = query + "/";
      for (const [key, value] of store.entries()) {
        if (key.startsWith(prefix) && key.split("/").length === prefix.split("/").length) {
          docs.push({
            id: key.split("/").pop(),
            data: () => value,
          });
        }
      }
      return Promise.resolve({ empty: docs.length === 0, docs });
    }),
    writeBatch: vi.fn(() => ({
      set: vi.fn((ref, data) => store.set(ref, data)),
      update: vi.fn((ref, data) => {
        const existing = store.get(ref) || {};
        store.set(ref, { ...existing, ...data });
      }),
      delete: vi.fn((ref) => store.delete(ref)),
      commit: vi.fn(() => Promise.resolve()),
    })),
  };
});
