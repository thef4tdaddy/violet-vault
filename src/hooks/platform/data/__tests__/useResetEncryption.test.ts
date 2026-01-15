import { renderHook } from "@testing-library/react";
import { useResetEncryption } from "../useResetEncryption";
import { vi, describe, it, expect, beforeEach } from "vitest";
import localStorageService from "@/services/storage/localStorageService";

// Mock the localStorageService
vi.mock("@/services/storage/localStorageService", () => ({
  default: {
    removeItem: vi.fn(),
    removeByPrefix: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("useResetEncryption", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear localStorage and reload the page", () => {
    const reloadSpy = vi.fn();

    Object.defineProperty(window, "location", {
      value: {
        reload: reloadSpy,
      },
      writable: true,
    });

    const { result } = renderHook(() => useResetEncryption());
    result.current.resetEncryptionAndStartFresh();

    expect(localStorageService.removeItem).toHaveBeenCalledWith("envelopeBudgetData");
    expect(localStorageService.removeItem).toHaveBeenCalledWith("userProfile");
    expect(localStorageService.removeItem).toHaveBeenCalledWith("passwordLastChanged");
    expect(localStorageService.removeByPrefix).toHaveBeenCalledWith("envelopeBudgetData_backup_");
    expect(reloadSpy).toHaveBeenCalled();
  });
});
