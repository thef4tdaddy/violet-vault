/**
 * In-Memory Dexie Database for Demo Mode
 *
 * Uses fake-indexeddb to provide a volatile, in-memory storage backend
 * that does NOT persist data to disk. Perfect for demo/sandbox environments.
 *
 * Key Features:
 * - Zero disk persistence - data wiped on page refresh
 * - Full Dexie.js API compatibility
 * - Fast performance (RAM-based storage)
 * - Privacy-friendly (no data written to browser storage)
 */

import Dexie from "dexie";
import { indexedDB as fakeIndexedDB, IDBKeyRange as FakeIDBKeyRange } from "fake-indexeddb";
import { VioletVaultDB } from "./budgetDb";
import logger from "@/utils/core/common/logger";

/**
 * Create an in-memory Dexie database instance
 * Uses fake-indexeddb to provide volatile storage
 */
export const createInMemoryDB = (): VioletVaultDB => {
  logger.info("🎭 Initializing In-Memory Demo Database");

  // Override Dexie's dependencies to use fake-indexeddb
  // This makes the database use RAM instead of disk storage
  Dexie.dependencies.indexedDB = fakeIndexedDB as IDBFactory;
  Dexie.dependencies.IDBKeyRange = FakeIDBKeyRange as typeof IDBKeyRange;

  // Create a new VioletVaultDB instance
  // It will use the fake-indexeddb backend automatically
  const inMemoryDb = new VioletVaultDB();

  // Mark the database as in-memory for debugging/logging
  (inMemoryDb as unknown as { _isInMemory: boolean })._isInMemory = true;

  logger.info("✅ In-Memory Demo Database initialized", {
    databaseName: inMemoryDb.name,
    isInMemory: true,
    backend: "fake-indexeddb",
  });

  return inMemoryDb;
};

/**
 * Reset Dexie dependencies to use real browser IndexedDB
 * Call this to switch back to persistent storage
 */
export const restoreRealIndexedDB = (): void => {
  if (typeof window !== "undefined" && window.indexedDB) {
    Dexie.dependencies.indexedDB = window.indexedDB;
    Dexie.dependencies.IDBKeyRange = window.IDBKeyRange;
    logger.info("🔄 Restored real browser IndexedDB");
  }
};

/**
 * Check if a database instance is using in-memory storage
 */
export const isInMemoryDatabase = (db: VioletVaultDB): boolean => {
  return (db as unknown as { _isInMemory?: boolean })._isInMemory === true;
};
