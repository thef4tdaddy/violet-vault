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
