import { Page } from '@playwright/test';

/**
 * Budget Seeding Fixture for Playwright E2E Tests
 *
 * Provides utilities to programmatically create test envelopes and transactions
 * by directly accessing window.budgetDb (Dexie.js IndexedDB).
 *
 * This eliminates the need for UI-based test data creation and makes tests
 * faster and more reliable.
 *
 * Usage:
 * const envelopes = await seedEnvelopes(page, [
 *   { name: 'Groceries', goal: 500 },
 *   { name: 'Gas', goal: 200 }
 * ]);
 *
 * const transactions = await seedTransactions(page, envelopes[0].id, [
 *   { description: 'Whole Foods', amount: 85.50 },
 *   { description: 'Target', amount: 42.99 }
 * ]);
 */

/**
 * Create test envelopes programmatically via IndexedDB
 *
 * @param page - Playwright page object
 * @param envelopes - Array of envelope definitions to create
 * @returns Promise resolving to array of created envelope objects with IDs
 */
export async function seedEnvelopes(
  page: Page,
  envelopes: Array<{
    name: string;
    goal: number;
    autoFundAmount?: number;
  }>
) {
  const created = await page.evaluate((envData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = (window as any).budgetDb;

        if (!db) {
          reject(new Error('window.budgetDb not found - demo mode may not be enabled'));
          return;
        }

        const created = [];

        for (const env of envData) {
          // Create envelope object
          const envelope = {
            id: crypto.randomUUID(),
            name: env.name,
            goal: env.goal,
            balance: env.goal, // Start with full goal amount
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoFundAmount: env.autoFundAmount || null,
          };

          // Add to Dexie database
          await db.envelopes.add(envelope);
          created.push(envelope);

          console.log(`✓ Seeded envelope: ${env.name} (goal: $${env.goal})`);
        }

        resolve(created);
      } catch (error) {
        reject(error);
      }
    });
  }, envelopes);

  return created as any[];
}

/**
 * Create test transactions programmatically via IndexedDB
 *
 * @param page - Playwright page object
 * @param envelopeId - ID of the envelope to add transactions to
 * @param transactions - Array of transaction definitions
 * @returns Promise resolving to array of created transaction objects
 */
export async function seedTransactions(
  page: Page,
  envelopeId: string,
  transactions: Array<{
    description: string;
    amount: number;
    date?: string;
    category?: string;
  }>
) {
  const created = await page.evaluate(
    ({ envId, transData }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const db = (window as any).budgetDb;

          if (!db) {
            reject(new Error('window.budgetDb not found'));
            return;
          }

          const created = [];

          for (const trans of transData) {
            // Create transaction object
            const transaction = {
              id: crypto.randomUUID(),
              envelopeId: envId,
              description: trans.description,
              amount: trans.amount,
              date: trans.date || new Date().toISOString().split('T')[0],
              category: trans.category || 'other',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              syncStatus: 'synced', // Mark as already synced
            };

            // Add to Dexie database
            await db.transactions.add(transaction);

            // Update envelope balance
            const envelope = await db.envelopes.get(envId);
            if (envelope) {
              const newBalance = envelope.balance - trans.amount;
              await db.envelopes.update(envId, {
                balance: Math.max(0, newBalance),
                updatedAt: new Date().toISOString(),
              });
            }

            created.push(transaction);
            console.log(`✓ Seeded transaction: ${trans.description} ($${trans.amount})`);
          }

          resolve(created);
        } catch (error) {
          reject(error);
        }
      });
    },
    { envId: envelopeId, transData: transactions }
  );

  return created as any[];
}

/**
 * Create test bills programmatically via IndexedDB
 *
 * @param page - Playwright page object
 * @param bills - Array of bill definitions
 * @returns Promise resolving to array of created bill objects
 */
export async function seedBills(
  page: Page,
  bills: Array<{
    name: string;
    amount: number;
    dueDate: string;
    frequency?: 'once' | 'monthly' | 'quarterly' | 'annual';
    envelope?: string;
  }>
) {
  const created = await page.evaluate((billData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = (window as any).budgetDb;

        if (!db) {
          reject(new Error('window.budgetDb not found'));
          return;
        }

        const created = [];

        for (const bill of billData) {
          const billObject = {
            id: crypto.randomUUID(),
            name: bill.name,
            amount: bill.amount,
            dueDate: bill.dueDate,
            frequency: bill.frequency || 'monthly',
            envelopeId: bill.envelope || null,
            status: 'unpaid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await db.bills.add(billObject);
          created.push(billObject);

          console.log(`✓ Seeded bill: ${bill.name} (due: ${bill.dueDate})`);
        }

        resolve(created);
      } catch (error) {
        reject(error);
      }
    });
  }, bills);

  return created as any[];
}

/**
 * Clear all test data from IndexedDB
 * Useful for test isolation or cleanup
 *
 * @param page - Playwright page object
 */
export async function clearAllTestData(page: Page) {
  await page.evaluate(async () => {
    const db = (window as any).budgetDb;

    if (!db) {
      console.warn('window.budgetDb not found');
      return;
    }

    // Clear all stores
    await db.envelopes.clear();
    await db.transactions.clear();
    await db.bills.clear();

    console.log('✓ All test data cleared');
  });
}

/**
 * Get current budget state from IndexedDB
 * Useful for assertions and validation
 *
 * @param page - Playwright page object
 * @returns Promise resolving to budget state object
 */
export async function getBudgetState(page: Page) {
  const state = await page.evaluate(async () => {
    const db = (window as any).budgetDb;

    if (!db) {
      return null;
    }

    const envelopes = await db.envelopes.toArray();
    const transactions = await db.transactions.toArray();
    const bills = await db.bills.toArray();
    const budgetId = db.budgetId;

    return {
      budgetId,
      envelopeCount: envelopes.length,
      transactionCount: transactions.length,
      billCount: bills.length,
      totalBalance: envelopes.reduce((sum: number, e: any) => sum + e.balance, 0),
      envelopes,
      transactions,
      bills,
    };
  });

  return state;
}
