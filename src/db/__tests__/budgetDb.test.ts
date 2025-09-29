/**
 * Tests for typed Dexie database implementation
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { VioletVaultDB } from "../budgetDb"
import type { Envelope, Transaction, Bill } from "../../types/database"

// Use in-memory database for testing
let testDb: VioletVaultDB

describe("VioletVaultDB TypeScript Implementation", () => {
  beforeEach(() => {
    testDb = new VioletVaultDB()
  })

  afterEach(async () => {
    if (testDb) {
      await testDb.delete()
    }
  })

  describe("Database Initialization", () => {
    it("should create database with typed tables", async () => {
      expect(testDb).toBeInstanceOf(VioletVaultDB)
      expect(testDb.envelopes).toBeDefined()
      expect(testDb.transactions).toBeDefined()
      expect(testDb.bills).toBeDefined()
      expect(testDb.savingsGoals).toBeDefined()
    })
  })
})
