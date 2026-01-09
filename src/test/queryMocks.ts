/**
 * Mock implementations for testing TanStack Query hooks
 * Provides mocks for Firebase, Dexie, and other external dependencies
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { vi } from "vitest";
import type { Transaction, Envelope } from "../types/finance";
import type { Bill } from "../types/bills";

/**
 * Type helper for window event listeners
 * Using generic object type since EventListener/EventListenerObject are DOM builtins
 */
type EventListenerOrEventListenerObject =
  | ((evt: Event) => void)
  | { handleEvent(object: Event): void };

/**
 * Mock Dexie database for testing
 */
export const createMockDexie = () => {
  const mockData = {
    transactions: [] as Transaction[],
    envelopes: [] as (Envelope & { type?: string })[],
    accounts: [] as Record<string, unknown>[],
    // Legacy maps for test convenience
    get bills() {
      return this.envelopes.filter((e) => e.type === "bill");
    },
    set bills(vals: any[]) {
      this.envelopes = this.envelopes.filter((e) => e.type !== "bill").concat(vals);
    },
    get savingsGoals() {
      return this.envelopes.filter((e) => e.type === "goal" || e.type === "savings");
    },
    set savingsGoals(vals: any[]) {
      this.envelopes = this.envelopes
        .filter((e) => e.type !== "goal" && e.type !== "savings")
        .concat(vals);
    },
    get debts() {
      return this.envelopes.filter((e) => e.type === "liability" || e.type === "bill");
    },
    set debts(vals: any[]) {
      this.envelopes = this.envelopes
        .filter((e) => e.type !== "liability" && e.type !== "bill")
        .concat(vals);
    },
  };

  return {
    transactions: {
      toArray: vi.fn(async () => mockData.transactions),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(async () => mockData.transactions),
        })),
      })),
      add: vi.fn(async (item: Transaction) => {
        mockData.transactions.push(item);
        return item.id;
      }),
      put: vi.fn(async (item: Transaction) => {
        const index = mockData.transactions.findIndex((t) => t.id === item.id);
        if (index >= 0) {
          mockData.transactions[index] = item;
        } else {
          mockData.transactions.push(item);
        }
        return item.id;
      }),
      update: vi.fn(async (id: string, updates: Partial<Transaction>) => {
        const index = mockData.transactions.findIndex((t) => t.id === id);
        if (index >= 0) {
          mockData.transactions[index] = { ...mockData.transactions[index], ...updates };
          return 1;
        }
        return 0;
      }),
      delete: vi.fn(async (id: string) => {
        const index = mockData.transactions.findIndex((t) => t.id === id);
        if (index >= 0) {
          mockData.transactions.splice(index, 1);
        }
      }),
      get: vi.fn(async (id: string) => {
        return mockData.transactions.find((t) => t.id === id);
      }),
    },
    bills: {
      toArray: vi.fn(async () => mockData.bills),
      add: vi.fn(async (item: any) => {
        const newItem = { ...item, type: "bill" };
        mockData.envelopes.push(newItem);
        return item.id;
      }),
      put: vi.fn(async (item: any) => {
        const index = mockData.envelopes.findIndex((e) => e.id === item.id);
        const newItem = { ...item, type: "bill" };
        if (index >= 0) {
          mockData.envelopes[index] = newItem;
        } else {
          mockData.envelopes.push(newItem);
        }
        return item.id;
      }),
      update: vi.fn(async (id: string, updates: any) => {
        const index = mockData.envelopes.findIndex((e) => e.id === id);
        if (index >= 0) {
          mockData.envelopes[index] = { ...mockData.envelopes[index], ...updates };
          return 1;
        }
        return 0;
      }),
      delete: vi.fn(async (id: string) => {
        const index = mockData.envelopes.findIndex((e) => e.id === id);
        if (index >= 0) {
          mockData.envelopes.splice(index, 1);
        }
      }),
      get: vi.fn(async (id: string) => {
        return mockData.envelopes.find((e) => e.id === id && e.type === "bill");
      }),
      clear: vi.fn(async () => {
        mockData.envelopes = mockData.envelopes.filter((e) => e.type !== "bill");
      }),
    },
    envelopes: {
      toArray: vi.fn(async () => mockData.envelopes),
      add: vi.fn(async (item: Envelope) => {
        mockData.envelopes.push(item);
        return item.id;
      }),
      put: vi.fn(async (item: Envelope) => {
        const index = mockData.envelopes.findIndex((e) => e.id === item.id);
        if (index >= 0) {
          mockData.envelopes[index] = item;
        } else {
          mockData.envelopes.push(item);
        }
        return item.id;
      }),
      update: vi.fn(async (id: string, updates: Partial<Envelope>) => {
        const index = mockData.envelopes.findIndex((e) => e.id === id);
        if (index >= 0) {
          mockData.envelopes[index] = { ...mockData.envelopes[index], ...updates };
          return 1;
        }
        return 0;
      }),
      delete: vi.fn(async (id: string) => {
        const index = mockData.envelopes.findIndex((e) => e.id === id);
        if (index >= 0) {
          mockData.envelopes.splice(index, 1);
        }
      }),
      where: vi.fn().mockImplementation((key: string) => ({
        equals: vi.fn().mockImplementation((val: any) => ({
          toArray: vi.fn(async () => {
            if (key === "type") {
              return mockData.envelopes.filter((e: any) => {
                if (val === "liability") return e.type === "liability" || e.type === "bill";
                if (val === "goal") return e.type === "goal" || e.type === "savings";
                return e.type === val;
              });
            }
            if (key === "archived") {
              const numericVal = val === true ? 1 : val === false ? 0 : val;
              return mockData.envelopes.filter((e: any) => {
                const eArchived = e.archived === true || e.archived === 1 ? 1 : 0;
                return eArchived === numericVal;
              });
            }
            return mockData.envelopes;
          }),
        })),
        toArray: vi.fn(async () => mockData.envelopes),
      })),
      get: vi.fn(async (id: string) => {
        return mockData.envelopes.find((e) => e.id === id);
      }),
    },
    accounts: {
      toArray: vi.fn(async () => mockData.accounts),
    },
    savingsGoals: {
      toArray: vi.fn(async () => mockData.savingsGoals),
      add: vi.fn(async (item: any) => {
        const newItem = { ...item, type: "goal" };
        mockData.envelopes.push(newItem);
        return item.id;
      }),
      put: vi.fn(async (item: any) => {
        const index = mockData.envelopes.findIndex((e) => e.id === item.id);
        const newItem = { ...item, type: "goal" };
        if (index >= 0) {
          mockData.envelopes[index] = newItem;
        } else {
          mockData.envelopes.push(newItem);
        }
        return item.id;
      }),
      clear: vi.fn(async () => {
        mockData.envelopes = mockData.envelopes.filter((e) => e.type !== "goal");
      }),
    },
    debts: {
      toArray: vi.fn(async () => mockData.debts),
      add: vi.fn(async (item: any) => {
        const newItem = { ...item, type: "liability" };
        mockData.envelopes.push(newItem);
        return item.id;
      }),
      put: vi.fn(async (item: any) => {
        const index = mockData.envelopes.findIndex((e) => e.id === item.id);
        const newItem = { ...item, type: "liability" };
        if (index >= 0) {
          mockData.envelopes[index] = newItem;
        } else {
          mockData.envelopes.push(newItem);
        }
        return item.id;
      }),
      clear: vi.fn(async () => {
        mockData.envelopes = mockData.envelopes.filter(
          (e) => e.type !== "liability" && e.type !== "bill"
        );
      }),
    },
    getEnvelopesByCategory: vi.fn(async (category: string) => {
      return mockData.envelopes.filter((e) => e.category === category);
    }),
    _mockData: mockData, // Exposed for test assertions
    _resetMockData: () => {
      mockData.transactions = [];
      mockData.envelopes = [];
      mockData.accounts = [];
    },
    bulkUpsertEnvelopes: vi.fn(async (envelopes: any[]) => {
      envelopes.forEach((env) => {
        const index = mockData.envelopes.findIndex((e) => e.id === env.id);
        if (index >= 0) {
          mockData.envelopes[index] = env;
        } else {
          mockData.envelopes.push(env);
        }
      });
    }),
    bulkUpsertTransactions: vi.fn(async (transactions: any[]) => {
      transactions.forEach((tx) => {
        const index = mockData.transactions.findIndex((t) => t.id === tx.id);
        if (index >= 0) {
          mockData.transactions[index] = tx;
        } else {
          mockData.transactions.push(tx);
        }
      });
    }),
    bulkUpsertBills: vi.fn(async (bills: any[]) => {
      bills.forEach((bill) => {
        const index = mockData.envelopes.findIndex((e) => e.id === bill.id);
        const newItem = { ...bill, type: "bill" };
        if (index >= 0) {
          mockData.envelopes[index] = newItem;
        } else {
          mockData.envelopes.push(newItem);
        }
      });
    }),
    bulkUpsertSavingsGoals: vi.fn(async (goals: any[]) => {
      goals.forEach((goal) => {
        const index = mockData.envelopes.findIndex((e) => e.id === goal.id);
        const newItem = { ...goal, type: "goal" };
        if (index >= 0) {
          mockData.envelopes[index] = newItem;
        } else {
          mockData.envelopes.push(newItem);
        }
      });
    }),
    clearData: vi.fn(async () => {
      mockData.transactions = [];
      mockData.envelopes = [];
      mockData.accounts = [];
    }),
  };
};

/**
 * Mock optimistic helpers
 */
export const createMockOptimisticHelpers = () => {
  return {
    addTransaction: vi.fn(async (transaction: Transaction) => transaction),
    updateTransaction: vi.fn(async (id: string, updates: Partial<Transaction>) => ({
      id,
      ...updates,
    })),
    deleteTransaction: vi.fn(async (id: string) => id),
    addBill: vi.fn(async (bill: Bill) => bill),
    updateBill: vi.fn(async (id: string, updates: Partial<Bill>) => ({ id, ...updates })),
    deleteBill: vi.fn(async (id: string) => id),
    updateEnvelope: vi.fn(async (id: string, updates: Partial<Envelope>) => ({ id, ...updates })),
  };
};

/**
 * Mock cloud sync service
 */
export const createMockCloudSyncService = () => {
  return {
    triggerSyncForCriticalChange: vi.fn(),
    syncNow: vi.fn(async () => ({ success: true })),
    getStatus: vi.fn(() => ({
      isOnline: true,
      lastSync: new Date().toISOString(),
      pendingChanges: 0,
    })),
  };
};

/**
 * Setup global mocks for window objects
 */
export const setupGlobalMocks = () => {
  const mockCloudSync = createMockCloudSyncService();

  // Mock window.cloudSyncService
  Object.defineProperty(window, "cloudSyncService", {
    value: mockCloudSync,
    writable: true,
    configurable: true,
  });

  // Mock window events
  const eventListeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalDispatchEvent = window.dispatchEvent;

  window.addEventListener = vi.fn(
    (event: string, listener: EventListenerOrEventListenerObject | null) => {
      if (listener && !eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      if (listener) {
        eventListeners.get(event)!.add(listener);
      }
      return originalAddEventListener.call(
        window,
        event,
        listener as EventListenerOrEventListenerObject
      );
    }
  );

  window.removeEventListener = vi.fn(
    (event: string, listener: EventListenerOrEventListenerObject | null) => {
      if (listener) {
        eventListeners.get(event)?.delete(listener);
      }
      return originalRemoveEventListener.call(
        window,
        event,
        listener as EventListenerOrEventListenerObject
      );
    }
  );

  window.dispatchEvent = vi.fn((event: Event) => {
    return originalDispatchEvent.call(window, event);
  });

  return {
    mockCloudSync,
    eventListeners,
    cleanup: () => {
      eventListeners.clear();
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
      window.dispatchEvent = originalDispatchEvent;
    },
  };
};

/**
 * Mock logger to prevent console spam in tests
 */
export const createMockLogger = () => {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  };
};

/**
 * Create mock data generators
 */
export const mockDataGenerators = {
  transaction: (overrides = {}) => ({
    id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString().split("T")[0],
    description: "Test Transaction",
    amount: 100,
    envelopeId: "envelope_1",
    category: "Test Category",
    type: "expense",
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  bill: (overrides = {}) => ({
    id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: "Test Bill",
    provider: "Test Provider",
    amount: 50,
    dueDate: new Date().toISOString().split("T")[0],
    category: "Bills & Utilities",
    isPaid: false,
    type: "bill",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  envelope: (overrides = {}) => ({
    id: `envelope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: "Test Envelope",
    category: "Test Category",
    currentBalance: 1000,
    targetAmount: 1500,
    archived: false,
    type: "standard",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  savingsGoal: (overrides = {}) => ({
    id: `savings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: "Test Savings Goal",
    targetAmount: 5000,
    currentAmount: 1000,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    type: "goal",
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};
