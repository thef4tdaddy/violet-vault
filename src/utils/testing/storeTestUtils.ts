import { renderHook, act } from "@testing-library/react";
import { storeRegistry } from "../stores/storeRegistry.ts";
import { expect } from "vitest";

// Generic type for Zustand store hooks
type StoreHook<T = unknown> = {
  (): T;
  getState: () => T;
};

/**
 * Utility for testing Zustand stores
 */
export class StoreTestHelper<T = unknown> {
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
  reset() {
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
   */
  async executeAction(actionName: string, ...args: unknown[]): Promise<T> {
    const { result } = renderHook(() => this.storeHook());

    await act(async () => {
      await result.current[actionName](...args);
    });

    return result.current;
  }

  /**
   * Assert state matches expected values
   */
  assertState(expected: Record<string, unknown>): void {
    const currentState = this.storeHook.getState();

    Object.entries(expected).forEach(([key, value]) => {
      if (typeof expect !== "undefined") {
        expect(currentState[key]).toEqual(value);
      }
    });
  }

  /**
   * Get current state snapshot
   */
  getState() {
    return this.storeHook.getState();
  }
}

/**
 * Create a test helper for a store
 */
export const createStoreTestHelper = <T = unknown>(
  storeHook: StoreHook<T>,
  storeName: string
): StoreTestHelper<T> => {
  return new StoreTestHelper(storeHook, storeName);
};

/**
 * Reset all registered stores (for test cleanup)
 */
export const resetAllStores = () => {
  storeRegistry.resetAll();
};
