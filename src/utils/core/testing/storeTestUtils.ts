import { renderHook, act } from "@testing-library/react";
import { storeRegistry } from "@/utils/data/stores/storeRegistry";
import { expect } from "vitest";

// Generic type for Zustand store hooks
type StoreHook<T> = {
  (): T;
  getState: () => T;
};

/**
 * Utility for testing Zustand stores
 */
export class StoreTestHelper<T extends Record<string, unknown>> {
  storeHook: StoreHook<T>;
  storeName: string;
  initialState: T | null;

  constructor(storeHook: StoreHook<T>, storeName: string) {
    this.storeHook = storeHook;
    this.storeName = storeName;
    this.initialState = null;
  }

  /**
   * Setup test environment
   */
  setup() {
    const { result } = renderHook(() => this.storeHook());
    this.initialState = { ...result.current };
    return result;
  }

  /**
   * Reset store to initial state
   */
  reset(): void {
    const state = this.storeHook.getState();
    if (
      state &&
      typeof state === "object" &&
      "reset" in state &&
      typeof state.reset === "function"
    ) {
      act(() => {
        (state.reset as () => void)();
      });
    }
  }

  /**
   * Execute action and return new state
   * Note: Action must be a function that optionally returns a Promise
   */
  async executeAction(actionName: keyof T, ...args: unknown[]): Promise<T> {
    const { result } = renderHook(() => this.storeHook());

    await act(async () => {
      const action = result.current[actionName];
      if (typeof action === "function") {
        const actionFn = action as (...a: unknown[]) => unknown | Promise<unknown>;
        await actionFn(...args);
      }
    });

    return result.current;
  }

  /**
   * Assert state matches expected values
   */
  assertState(expected: Partial<T>): void {
    const currentState = this.storeHook.getState();

    Object.entries(expected).forEach(([key, value]) => {
      if (typeof expect !== "undefined") {
        expect(currentState[key as keyof T]).toEqual(value);
      }
    });
  }

  /**
   * Get current state snapshot
   */
  getState(): T {
    return this.storeHook.getState();
  }
}

/**
 * Create a test helper for a store
 */
export const createStoreTestHelper = <T extends Record<string, unknown>>(
  storeHook: StoreHook<T>,
  storeName: string
): StoreTestHelper<T> => {
  return new StoreTestHelper(storeHook, storeName);
};

/**
 * Reset all registered stores (for test cleanup)
 */
export const resetAllStores = (): void => {
  storeRegistry.resetAll();
};
