/**
 * Mock implementations for testing TanStack Query hooks
 * Provides mocks for Firebase, Dexie, and other external dependencies
 */
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
    bills: [] as Bill[],
    envelopes: [] as Envelope[],
    accounts: [] as Record<string, unknown>[],
    savingsGoals: [] as Record<string, unknown>[],
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
      add: vi.fn(async (item: Bill) => {
        mockData.bills.push(item);
        return item.id;
      }),
      put: vi.fn(async (item: Bill) => {
        const index = mockData.bills.findIndex((b) => b.id === item.id);
        if (index >= 0) {
          mockData.bills[index] = item;
        } else {
          mockData.bills.push(item);
        }
        return item.id;
      }),
      update: vi.fn(async (id: string, updates: Partial<Bill>) => {
        const index = mockData.bills.findIndex((b) => b.id === id);
        if (index >= 0) {
          mockData.bills[index] = { ...mockData.bills[index], ...updates };
          return 1;
        }
        return 0;
      }),
      delete: vi.fn(async (id: string) => {
        const index = mockData.bills.findIndex((b) => b.id === id);
        if (index >= 0) {
          mockData.bills.splice(index, 1);
        }
      }),
      get: vi.fn(async (id: string) => {
        return mockData.bills.find((b) => b.id === id);
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
      get: vi.fn(async (id: string) => {
        return mockData.envelopes.find((e) => e.id === id);
      }),
    },
    accounts: {
      toArray: vi.fn(async () => mockData.accounts),
    },
    savingsGoals: {
      toArray: vi.fn(async () => mockData.savingsGoals),
    },
    getEnvelopesByCategory: vi.fn(async (category: string) => {
      return mockData.envelopes.filter((e) => e.category === category);
    }),
    _mockData: mockData, // Exposed for test assertions
    _resetMockData: () => {
      mockData.transactions = [];
      mockData.bills = [];
      mockData.envelopes = [];
      mockData.accounts = [];
      mockData.savingsGoals = [];
    },
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
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};
