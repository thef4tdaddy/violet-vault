/**
 * Demo Data Service
 *
 * Loads and seeds demo data into the in-memory database
 * for Demo Mode / Sandbox functionality.
 *
 * Data Sources:
 * - /api/demo-factory (Go-based high-performance data generator)
 */

import { VioletVaultDB } from "@/db/budgetDb";
import { Envelope, Transaction } from "@/db/types";
import logger from "@/utils/core/common/logger";
import { isDemoMode } from "@/utils/platform/demo/demoModeDetection";

interface DemoDataResponse {
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Envelope[]; // Liability-type envelopes
  generatedAt: string;
  recordCount: number;
  generationTimeMs: number;
}

interface DemoDataset {
  envelopes?: Envelope[];
  transactions?: Transaction[];
  unassignedCash?: number;
  actualBalance?: number;
}

/**
 * Load demo dataset from Go Mock Data Factory
 * Generates 10,000+ records in <10ms using the Go backend
 */
export const loadDemoDataset = async (): Promise<DemoDataset> => {
  try {
    logger.info("📦 Loading demo dataset from Go Mock Factory...");

    // Fetch from Go-based demo factory (10k records)
    const response = await fetch("/api/demo-factory?count=10000");

    if (!response.ok) {
      throw new Error(`Failed to fetch demo data: ${response.statusText}`);
    }

    const data = (await response.json()) as DemoDataResponse;

    // Merge bills (liability envelopes) with regular envelopes
    const allEnvelopes = [...data.envelopes, ...data.bills];

    // Calculate initial balances from transaction data
    const totalIncome = data.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = data.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const actualBalance = totalIncome - totalExpenses;

    logger.info("✅ Demo dataset loaded successfully", {
      envelopes: allEnvelopes.length,
      transactions: data.transactions.length,
      generationTime: `${data.generationTimeMs}ms`,
    });

    return {
      envelopes: allEnvelopes,
      transactions: data.transactions,
      unassignedCash: 0,
      actualBalance,
    };
  } catch (error) {
    logger.error("❌ Failed to load demo dataset from Go API", error);

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
    // 🛡️ Walled Garden: Guard against accidental execution
    // Only allow if explicitly in demo mode or running tests
    const isTest = process.env.NODE_ENV === "test";
    if (!isDemoMode() && !isTest) {
      logger.error(
        "🛑 GUARD: Attempted to seed demo data outside of Demo Mode. Operation blocked."
      );
      return;
    }

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
