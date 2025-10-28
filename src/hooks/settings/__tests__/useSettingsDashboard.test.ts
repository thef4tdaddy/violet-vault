import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import {
  useSettingsDashboardUI,
  useCloudSyncManager,
  useSettingsSections,
  useSettingsActions,
} from "../useSettingsDashboard";

// Mock dependencies
vi.mock("../../../stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    cloudSyncEnabled: false,
    setCloudSyncEnabled: vi.fn(),
  })),
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../../services/cloudSyncService", () => ({
  cloudSyncService: {
    start: vi.fn(),
    stop: vi.fn(),
    forceSync: vi.fn(),
    isRunning: true,
  },
}));

vi.mock("../../../stores/auth/authStore", () => ({
  useAuth: {
    getState: vi.fn(() => ({
      encryptionKey: "test-key",
      currentUser: "test-user",
      budgetId: "test-budget",
    })),
  },
}));

vi.mock("../../../utils/common/testBudgetHistory", () => ({
  createTestBudgetHistory: vi.fn(),
}));

describe("useSettingsDashboardUI", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSettingsDashboardUI());

    expect(result.current.activeSection).toBe("general");
    expect(result.current.showPasswordModal).toBe(false);
    expect(result.current.showActivityFeed).toBe(false);
    expect(result.current.showLocalOnlySettings).toBe(false);
    expect(result.current.showSecuritySettings).toBe(false);
    expect(result.current.showResetConfirm).toBe(false);
    expect(result.current.showEnvelopeChecker).toBe(false);
  });

  it("should handle section changes", () => {
    const { result } = renderHook(() => useSettingsDashboardUI());

    act(() => {
      result.current.handleSectionChange("account");
    });

    expect(result.current.activeSection).toBe("account");
  });

  it("should handle modal state changes", () => {
    const { result } = renderHook(() => useSettingsDashboardUI());

    // Test password modal
    act(() => {
      result.current.openPasswordModal();
    });
    expect(result.current.showPasswordModal).toBe(true);

    act(() => {
      result.current.closePasswordModal();
    });
    expect(result.current.showPasswordModal).toBe(false);

    // Test activity feed
    act(() => {
      result.current.openActivityFeed();
    });
    expect(result.current.showActivityFeed).toBe(true);

    act(() => {
      result.current.closeActivityFeed();
    });
    expect(result.current.showActivityFeed).toBe(false);

    // Test security settings
    act(() => {
      result.current.openSecuritySettings();
    });
    expect(result.current.showSecuritySettings).toBe(true);

    act(() => {
      result.current.closeSecuritySettings();
    });
    expect(result.current.showSecuritySettings).toBe(false);
  });
});

describe("useCloudSyncManager", () => {
  const mockUseBudgetStore = {
    cloudSyncEnabled: false,
    setCloudSyncEnabled: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(require("../../../stores/ui/uiStore").useBudgetStore).mockReturnValue(
      mockUseBudgetStore
    );
  });

  it("should initialize with store values", () => {
    const { result } = renderHook(() => useCloudSyncManager());

    expect(result.current.cloudSyncEnabled).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });

  it("should handle cloud sync toggle", async () => {
    const { result } = renderHook(() => useCloudSyncManager());

    await act(async () => {
      await result.current.handleToggleCloudSync();
    });

    expect(mockUseBudgetStore.setCloudSyncEnabled).toHaveBeenCalledWith(true);
  });

  it("should handle manual sync", async () => {
    // Set up sync enabled state
    mockUseBudgetStore.cloudSyncEnabled = true;
    const { cloudSyncService } = await import("../../../services/cloudSyncService");
    vi.mocked(cloudSyncService.forceSync).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCloudSyncManager());

    await act(async () => {
      await result.current.handleManualSync();
    });

    expect(cloudSyncService.forceSync).toHaveBeenCalled();
  });

  it("should not sync when cloud sync is disabled", async () => {
    mockUseBudgetStore.cloudSyncEnabled = false;
    const { result } = renderHook(() => useCloudSyncManager());

    await act(async () => {
      await result.current.handleManualSync();
    });

    const { cloudSyncService } = await import("../../../services/cloudSyncService");
    expect(cloudSyncService.forceSync).not.toHaveBeenCalled();
  });
});

describe("useSettingsSections", () => {
  it("should return correct sections with icons", () => {
    const { result } = renderHook(() => useSettingsSections());

    expect(result.current.sections).toHaveLength(4);
    expect(result.current.sections[0]).toMatchObject({
      id: "general",
      label: "General",
    });
    expect(result.current.sections[1]).toMatchObject({
      id: "account",
      label: "Account",
    });
    expect(result.current.sections[2]).toMatchObject({
      id: "security",
      label: "Security",
    });
    expect(result.current.sections[3]).toMatchObject({
      id: "data",
      label: "Data",
    });
  });
});

describe("useSettingsActions", () => {
  it("should handle test history creation success", async () => {
    const { createTestBudgetHistory } = await import("../../../utils/common/testBudgetHistory");
    const { globalToast } = await import("../../../stores/ui/toastStore");

    vi.mocked(createTestBudgetHistory).mockResolvedValue();

    const { result } = renderHook(() => useSettingsActions());

    await act(async () => {
      await result.current.handleCreateTestHistory();
    });

    expect(createTestBudgetHistory).toHaveBeenCalled();
    expect(globalToast.showSuccess).toHaveBeenCalledWith(
      "✅ Test budget history created! Check console for details.",
      "Test History Created"
    );
  });

  it("should handle test history creation failure", async () => {
    const { createTestBudgetHistory } = await import("../../../utils/common/testBudgetHistory");
    const { globalToast } = await import("../../../stores/ui/toastStore");

    const error = new Error("Test error");
    vi.mocked(createTestBudgetHistory).mockRejectedValue(error);

    const { result } = renderHook(() => useSettingsActions());

    await act(async () => {
      await result.current.handleCreateTestHistory();
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "❌ Failed to create test history: Test error",
      "Test Failed"
    );
  });

  it("should handle reset confirm action", () => {
    const { result } = renderHook(() => useSettingsActions());
    const mockOnClose = vi.fn();
    const mockOnResetEncryption = vi.fn();

    const resetAction = result.current.handleResetConfirmAction(mockOnClose, mockOnResetEncryption);

    act(() => {
      resetAction();
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnResetEncryption).toHaveBeenCalled();
  });
});
