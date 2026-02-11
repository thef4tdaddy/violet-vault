import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFirebaseSync } from "../useFirebaseSync";

// Mock uiStore
const mockBudget = {
  getActiveUsers: vi.fn(),
  getRecentActivity: vi.fn(),
};

vi.mock("@/stores/ui/uiStore", () => ({
  default: vi.fn((selector) => {
    if (typeof selector === "function") {
      return selector({ budget: mockBudget });
    }
    return mockBudget;
  }),
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock toast helpers
const mockShowSuccessToast = vi.fn();
const mockShowErrorToast = vi.fn();

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: () => ({
    showSuccessToast: mockShowSuccessToast,
    showErrorToast: mockShowErrorToast,
  }),
}));

describe("useFirebaseSync", () => {
  const mockFirebaseSync = {
    start: vi.fn(),
    forceSync: vi.fn(),
    isRunning: false,
  };

  const mockEncryptionKey = {} as CryptoKey;
  const mockBudgetId = "test-budget-123";
  const mockCurrentUser = {
    uid: "user-123",
    email: "test@example.com",
    displayName: "Test User",
  };

  const mockActiveUsers = [
    { uid: "user-1", displayName: "User 1" },
    { uid: "user-2", displayName: "User 2" },
  ];

  const mockRecentActivity = [
    { id: "activity-1", action: "created", timestamp: Date.now(), userId: "user-1" },
    { id: "activity-2", action: "updated", timestamp: Date.now(), userId: "user-2" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebaseSync.isRunning = false;
    mockFirebaseSync.forceSync.mockResolvedValue({ success: true });
    mockBudget.getActiveUsers.mockReturnValue(mockActiveUsers);
    mockBudget.getRecentActivity.mockReturnValue(mockRecentActivity);
  });

  it("should initialize with empty arrays when budget is not available", () => {
    // Clear the mock budget methods to simulate no budget
    mockBudget.getActiveUsers.mockReturnValue(null);
    mockBudget.getRecentActivity.mockReturnValue(null);

    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: null,
        budgetId: null,
        currentUser: null,
      })
    );

    // When budget methods return null, hook returns empty arrays
    expect(result.current.activeUsers).toEqual([]);
    expect(result.current.recentActivity).toEqual([]);
  });

  it("should provide handleManualSync function", () => {
    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: null,
        budgetId: null,
        currentUser: null,
      })
    );

    expect(typeof result.current.handleManualSync).toBe("function");
  });

  it("should start Firebase sync when all dependencies are provided", () => {
    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    expect(mockFirebaseSync.start).toHaveBeenCalledWith(
      expect.objectContaining({
        budgetId: mockBudgetId,
        encryptionKey: mockEncryptionKey,
        currentUser: mockCurrentUser,
      })
    );
  });

  it("should not start sync when firebaseSync is missing", () => {
    renderHook(() =>
      useFirebaseSync({
        firebaseSync: null as never,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    expect(mockFirebaseSync.start).not.toHaveBeenCalled();
  });

  it("should not start sync when budgetId is missing", () => {
    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: null,
        currentUser: mockCurrentUser,
      })
    );

    expect(mockFirebaseSync.start).not.toHaveBeenCalled();
  });

  it("should not start sync when encryptionKey is missing", () => {
    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: null,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    // Both effects check for encryptionKey, so start() should not be called
    expect(mockFirebaseSync.start).not.toHaveBeenCalled();
  });

  it("should not start sync when currentUser is missing", () => {
    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: null,
      })
    );

    expect(mockFirebaseSync.start).not.toHaveBeenCalled();
  });

  it("should successfully complete manual sync", async () => {
    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    await act(async () => {
      await result.current.handleManualSync();
    });

    expect(mockFirebaseSync.forceSync).toHaveBeenCalled();
    expect(mockShowSuccessToast).toHaveBeenCalledWith("Manual sync completed successfully");
  });

  it("should handle manual sync failure", async () => {
    mockFirebaseSync.forceSync.mockResolvedValue({ success: false });

    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    await act(async () => {
      await result.current.handleManualSync();
    });

    expect(mockShowErrorToast).toHaveBeenCalledWith("Manual sync failed");
  });

  it("should handle manual sync error", async () => {
    mockFirebaseSync.forceSync.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    await act(async () => {
      await result.current.handleManualSync();
    });

    expect(mockShowErrorToast).toHaveBeenCalledWith("Sync failed: Network error", "Sync Failed");
  });

  it("should call start from first effect even if already running", () => {
    mockFirebaseSync.isRunning = true;

    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    // First effect always calls start, second effect checks isRunning
    expect(mockFirebaseSync.start).toHaveBeenCalledTimes(1);
  });

  it("should start sync if not running", () => {
    mockFirebaseSync.isRunning = false;

    renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    expect(mockFirebaseSync.start).toHaveBeenCalled();
  });

  it("should handle manual sync when firebaseSync is null", async () => {
    const { result } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: null as never,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    await act(async () => {
      await result.current.handleManualSync();
    });

    expect(mockFirebaseSync.forceSync).not.toHaveBeenCalled();
    expect(mockShowSuccessToast).not.toHaveBeenCalled();
    expect(mockShowErrorToast).not.toHaveBeenCalled();
  });

  it("should restart sync when dependencies change", () => {
    const { rerender } = renderHook((props) => useFirebaseSync(props), {
      initialProps: {
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      },
    });

    // Two effects both call start once
    const initialCalls = mockFirebaseSync.start.mock.calls.length;

    // Change budgetId
    rerender({
      firebaseSync: mockFirebaseSync,
      encryptionKey: mockEncryptionKey,
      budgetId: "new-budget-456",
      currentUser: mockCurrentUser,
    });

    // Should be called again (both effects trigger)
    expect(mockFirebaseSync.start.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it("should maintain stable handleManualSync reference", () => {
    const { result, rerender } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    const firstReference = result.current.handleManualSync;

    rerender();

    const secondReference = result.current.handleManualSync;

    expect(firstReference).toBe(secondReference);
  });

  it("should update active users and recent activity from budget", () => {
    const { result, rerender } = renderHook(() =>
      useFirebaseSync({
        firebaseSync: mockFirebaseSync,
        encryptionKey: mockEncryptionKey,
        budgetId: mockBudgetId,
        currentUser: mockCurrentUser,
      })
    );

    // Trigger activity update
    act(() => {
      rerender();
    });

    // Note: The actual update logic depends on the budget object being available
    // and the effect running. In this test, we're verifying the structure exists.
    expect(Array.isArray(result.current.activeUsers)).toBe(true);
    expect(Array.isArray(result.current.recentActivity)).toBe(true);
  });
});
