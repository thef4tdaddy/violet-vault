import Dexie from "dexie";

export class OptimizedVioletVaultDB extends Dexie {
  constructor() {
    super("VioletVaultOptimized");

    // Optimized schema with indexes
    this.version(1).stores({
      // Main budget data with timestamps for versioning
      budget: "id, lastModified, version",

      // Separate tables for better query performance
      envelopes: "id, name, category, lastModified",
      transactions: "id, date, amount, envelopeId, category, lastModified",
      bills: "id, name, dueDate, amount, category, lastModified",

      // Audit log for changes
      auditLog: "++id, timestamp, action, entityType, entityId",

      // Cache for computed values
      cache: "key, value, expiresAt",
    });

    // Add hooks for automatic timestamping
    this.envelopes.hook("creating", (_primKey, obj, _trans) => {
      obj.lastModified = Date.now();
    });

    this.envelopes.hook("updating", (modifications, _primKey, _obj, _trans) => {
      modifications.lastModified = Date.now();
    });

    this.transactions.hook("creating", (_primKey, obj, _trans) => {
      obj.lastModified = Date.now();
    });

    this.transactions.hook(
      "updating",
      (modifications, _primKey, _obj, _trans) => {
        modifications.lastModified = Date.now();
      },
    );
  }

  // Optimized bulk operations
  async bulkUpsertEnvelopes(envelopes) {
    return this.transaction("rw", this.envelopes, async () => {
      for (const envelope of envelopes) {
        await this.envelopes.put(envelope);
      }
    });
  }

  // Cache management
  async getCachedValue(key, maxAge = 300000) {
    // 5 minutes default
    const cached = await this.cache.get(key);
    const now = Date.now();
    if (
      cached &&
      cached.expiresAt > now &&
      now - (cached.expiresAt - maxAge) < maxAge
    ) {
      return cached.value;
    }
    return null;
  }

  async setCachedValue(key, value, ttl = 300000) {
    await this.cache.put({
      key,
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  // Query optimizations
  async getEnvelopesByCategory(category) {
    const cacheKey = `envelopes_by_category_${category}`;
    let result = await this.getCachedValue(cacheKey);

    if (!result) {
      result = await this.envelopes
        .where("category")
        .equals(category)
        .toArray();
      await this.setCachedValue(cacheKey, result, 60000); // 1 minute cache
    }

    return result;
  }

  async getTransactionsByDateRange(startDate, endDate) {
    return this.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();
  }

  // Batch operations for better performance
  async batchUpdate(updates) {
    return this.transaction(
      "rw",
      [this.envelopes, this.transactions, this.bills],
      async () => {
        const promises = updates.map((update) => {
          switch (update.type) {
            case "envelope":
              return this.envelopes.put(update.data);
            case "transaction":
              return this.transactions.put(update.data);
            case "bill":
              return this.bills.put(update.data);
            default:
              return Promise.resolve();
          }
        });
        return Promise.all(promises);
      },
    );
  }

  // Cleanup old cache entries
  async cleanupCache() {
    const now = Date.now();
    await this.cache.where("expiresAt").below(now).delete();
  }
}

export const optimizedDb = new OptimizedVioletVaultDB();

// Utility functions
export const getOptimizedEncryptedData = async () => {
  try {
    return await optimizedDb.budget.get("budgetData");
  } catch {
    return null;
  }
};

export const setOptimizedEncryptedData = async (data) => {
  try {
    await optimizedDb.budget.put({
      id: "budgetData",
      lastModified: Date.now(),
      version: data.version || 1,
      ...data,
    });
  } catch (err) {
    console.error("Optimized Dexie save error", err);
  }
};

export const clearOptimizedData = async () => {
  await Promise.all([
    optimizedDb.budget.clear(),
    optimizedDb.envelopes.clear(),
    optimizedDb.transactions.clear(),
    optimizedDb.bills.clear(),
    optimizedDb.cache.clear(),
  ]);
};
