import { renderHook, act } from "@testing-library/react";
import { storeRegistry } from "../stores/storeRegistry.js";

/**
 * Utility for testing Zustand stores
 */
export class StoreTestHelper {
  constructor(storeHook, storeName) {
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
    if (this.storeHook.getState().reset) {
      act(() => {
        this.storeHook.getState().reset();
      });
    }
  }

  /**
   * Execute action and return new state
   */
  async executeAction(actionName, ...args) {
    const { result } = renderHook(() => this.storeHook());

    await act(async () => {
      await result.current[actionName](...args);
    });

    return result.current;
  }

  /**
   * Assert state matches expected values
   */
  assertState(expected) {
    const currentState = this.storeHook.getState();

    Object.entries(expected).forEach(([key, value]) => {
      expect(currentState[key]).toEqual(value);
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
export const createStoreTestHelper = (storeHook, storeName) => {
  return new StoreTestHelper(storeHook, storeName);
};

/**
 * Reset all registered stores (for test cleanup)
 */
export const resetAllStores = () => {
  storeRegistry.resetAll();
};
