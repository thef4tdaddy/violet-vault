import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthenticationManager } from "../useAuthenticationManager";

// Mock all dependencies
vi.mock("../useAuthFlow", () => ({
  useAuthFlow: vi.fn(),
}));

vi.mock("../useSecurityManager", () => ({
  useSecurityManager: vi.fn(),
}));

vi.mock("../../common/useLocalOnlyMode", () => ({
  useLocalOnlyMode: vi.fn(),
}));

// Import mocked dependencies
import { useAuthFlow } from "../useAuthFlow";
import { useSecurityManager } from "../useSecurityManager";
import { useLocalOnlyMode } from "../../common/useLocalOnlyMode";

describe("useAuthenticationManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default mocks
    (useAuthFlow as ReturnType<typeof vi.fn>).mockReturnValue({
      isUnlocked: true,
      currentUser: { id: 1, userName: "testuser" },
      encryptionKey: "test-key",
      budgetId: "test-budget-id",
      salt: "test-salt",
      handleSetup: vi.fn(),
      handleLogout: vi.fn(),
      handleChangePassword: vi.fn(),
      handleUpdateProfile: vi.fn(),
    });

    (useSecurityManager as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocked: false,
      canUnlock: true,
      lockApp: vi.fn(),
      unlockSession: vi.fn(),
      checkSecurityStatus: vi.fn(),
    });

    (useLocalOnlyMode as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocalOnlyMode: false,
      localOnlyUser: null,
    });
  });

  it("should provide comprehensive authentication state", () => {
    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser).toEqual({ id: 1, userName: "testuser" });
    expect(result.current.isLocked).toBe(false);
    expect(result.current.canUnlock).toBe(true);
    expect(result.current.isReady).toBe(true);
  });

  it("should provide security context", () => {
    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.securityContext).toEqual({
      encryptionKey: "test-key",
      budgetId: "test-budget-id",
      salt: "test-salt",
      hasValidKeys: true,
    });
  });

  it("should provide all auth operations", () => {
    const { result } = renderHook(() => useAuthenticationManager());

    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");
    expect(typeof result.current.handleUpdateProfile).toBe("function");
    expect(typeof result.current.lockApp).toBe("function");
    expect(typeof result.current.unlockApp).toBe("function");
  });

  it("should handle local-only mode correctly", () => {
    const localUser = {
      id: 2,
      userName: "localuser",
      budgetId: "local-budget",
    };

    (useLocalOnlyMode as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocalOnlyMode: true,
      localOnlyUser: localUser,
    });

    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.isLocalOnlyMode).toBe(true);
    expect(result.current.currentUser).toBe(localUser);
    expect(result.current.securityContext.budgetId).toBe("local-budget");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle unauthenticated state", () => {
    (useAuthFlow as ReturnType<typeof vi.fn>).mockReturnValue({
      isUnlocked: false,
      currentUser: null,
      encryptionKey: null,
      budgetId: null,
      salt: null,
      handleSetup: vi.fn(),
      handleLogout: vi.fn(),
      handleChangePassword: vi.fn(),
      handleUpdateProfile: vi.fn(),
    });

    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.securityContext.hasValidKeys).toBe(false);
  });

  it("should determine when to show auth gateway", () => {
    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.shouldShowAuthGateway()).toBe(false);

    // Test unauthenticated state
    (useAuthFlow as ReturnType<typeof vi.fn>).mockReturnValue({
      isUnlocked: false,
      currentUser: null,
      encryptionKey: null,
      budgetId: null,
      salt: null,
      handleSetup: vi.fn(),
      handleLogout: vi.fn(),
      handleChangePassword: vi.fn(),
      handleUpdateProfile: vi.fn(),
    });

    const { result: unauthResult } = renderHook(() => useAuthenticationManager());
    expect(unauthResult.current.shouldShowAuthGateway()).toBe(true);
  });

  it("should handle local-only mode auth gateway logic", () => {
    (useLocalOnlyMode as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocalOnlyMode: true,
      localOnlyUser: null, // No local user yet
    });

    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.shouldShowAuthGateway()).toBe(true);

    // With local user
    (useLocalOnlyMode as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocalOnlyMode: true,
      localOnlyUser: { id: 1, userName: "localuser" },
    });

    const { result: withUserResult } = renderHook(() => useAuthenticationManager());
    expect(withUserResult.current.shouldShowAuthGateway()).toBe(false);
  });

  it("should handle security locked state", () => {
    (useSecurityManager as ReturnType<typeof vi.fn>).mockReturnValue({
      isLocked: true,
      canUnlock: false,
      lockApp: vi.fn(),
      unlockSession: vi.fn(),
      checkSecurityStatus: vi.fn(),
    });

    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current.isLocked).toBe(true);
    expect(result.current.canUnlock).toBe(false);
  });

  it("should provide access to internal hooks for advanced usage", () => {
    const { result } = renderHook(() => useAuthenticationManager());

    expect(result.current._internal).toBeDefined();
    expect(result.current._internal.authFlow).toBeDefined();
    expect(result.current._internal.securityManager).toBeDefined();
    expect(result.current._internal.localOnlyMode).toBeDefined();
  });

  it("should call all required hooks", () => {
    renderHook(() => useAuthenticationManager());

    expect(useAuthFlow).toHaveBeenCalled();
    expect(useSecurityManager).toHaveBeenCalled();
    expect(useLocalOnlyMode).toHaveBeenCalled();
  });

  it("should memoize derived values properly", () => {
    const { result, rerender } = renderHook(() => useAuthenticationManager());

    const firstSecurityContext = result.current.securityContext;
    const firstAuthOperations = result.current.handleSetup;

    // Rerender with same data
    rerender();

    // Should be the same references due to memoization
    expect(result.current.securityContext).toBe(firstSecurityContext);
    expect(result.current.handleSetup).toBe(firstAuthOperations);
  });
});
