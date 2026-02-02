/**
 * Demo Data Service
 *
 * Loads and seeds demo data into the in-memory database
 * for Demo Mode / Sandbox functionality.
 *
 * Data Sources:
 * - /public/test-data/data/violet-vault-budget.json (comprehensive test data)
 */

import { VioletVaultDB } from "@/db/budgetDb";
import { Envelope, Transaction } from "@/db/types";
import logger from "@/utils/core/common/logger";

interface DemoDataset {
  envelopes?: Envelope[];
  transactions?: Transaction[];
  unassignedCash?: number;
  actualBalance?: number;
  [key: string]: unknown;
}

/**
 * Load demo dataset from public test data files
 */
export const loadDemoDataset = async (): Promise<DemoDataset> => {
  try {
    logger.info("📦 Loading demo dataset...");

    // Fetch the comprehensive test dataset
    const response = await fetch("/test-data/data/violet-vault-budget.json");

    if (!response.ok) {
      throw new Error(`Failed to fetch demo data: ${response.statusText}`);
    }

    const data = (await response.json()) as DemoDataset;

    logger.info("✅ Demo dataset loaded successfully", {
      envelopes: data.envelopes?.length ?? 0,
      transactions: data.transactions?.length ?? 0,
    });

    return data;
  } catch (error) {
    logger.error("❌ Failed to load demo dataset", error);

    // Return minimal fallback data
    return {
      envelopes: [],
      transactions: [],
      unassignedCash: 0,
      actualBalance: 0,
    };
  }
};

/**
 * Seed the in-memory database with demo data
 */
export const seedDemoData = async (db: VioletVaultDB): Promise<void> => {
  try {
    logger.info("🌱 Seeding demo data into in-memory database...");

    // Load demo dataset
    const dataset = await loadDemoDataset();

    // Clear existing data (should be empty for in-memory db)
    await db.transaction("rw", [db.envelopes, db.transactions, db.budget], async () => {
      await db.envelopes.clear();
      await db.transactions.clear();
      await db.budget.clear();
    });

    // Seed envelopes
    if (dataset.envelopes && dataset.envelopes.length > 0) {
      await db.bulkUpsertEnvelopesValidated(dataset.envelopes);
      logger.info(`  ✓ Seeded ${dataset.envelopes.length} envelopes`);
    }

    // Seed transactions
    if (dataset.transactions && dataset.transactions.length > 0) {
      await db.bulkUpsertTransactionsValidated(dataset.transactions);
      logger.info(`  ✓ Seeded ${dataset.transactions.length} transactions`);
    }

    // Seed budget metadata
    if (typeof dataset.unassignedCash === "number" || typeof dataset.actualBalance === "number") {
      await db.budget.put({
        id: "metadata",
        unassignedCash: dataset.unassignedCash ?? 0,
        actualBalance: dataset.actualBalance ?? 0,
        lastModified: Date.now(),
      });
      logger.info(`  ✓ Seeded budget metadata`);
    }

    logger.info("✅ Demo data seeded successfully");
  } catch (error) {
    logger.error("❌ Failed to seed demo data", error);
    throw error;
  }
};

/**
 * Initialize demo database with data
 * Combines creation and seeding in one step
 */
export const initializeDemoDatabase = async (db: VioletVaultDB): Promise<void> => {
  logger.info("🎭 Initializing Demo Database");

  try {
    // Ensure database is open
    if (!db.isOpen()) {
      await db.open();
    }

    // Seed with demo data
    await seedDemoData(db);

    logger.info("✅ Demo Database initialized and ready");
  } catch (error) {
    logger.error("❌ Demo Database initialization failed", error);
    throw error;
  }
};
