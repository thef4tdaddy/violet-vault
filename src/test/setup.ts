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

  constructor() {
    this.store = {};
    this.length = 0;
  }

  key(n: number): string | null {
    return Object.keys(this.store)[n] || null;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }

  clear(): void {
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
