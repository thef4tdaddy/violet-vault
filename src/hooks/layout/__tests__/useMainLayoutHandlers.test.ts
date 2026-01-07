import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMainLayoutHandlers } from "../useMainLayoutHandlers";

describe("useMainLayoutHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockAuth = (overrides = {}) => ({
    logout: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    changePassword: vi.fn().mockResolvedValue(undefined),
    securityManager: { rotate: vi.fn(), validate: vi.fn() },
    user: null,
    loading: false,
    error: null,
    ...overrides,
  });

  it("should return default values when auth is null", () => {
    const { result } = renderHook(() => useMainLayoutHandlers(null as any));

    expect(result.current.isLocalOnlyMode).toBe(false);
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");
    expect(result.current.securityManager).toBeUndefined();
  });

  it("should return default values when auth is undefined", () => {
    const { result } = renderHook(() => useMainLayoutHandlers(undefined as any));

    expect(result.current.isLocalOnlyMode).toBe(false);
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");
    expect(result.current.securityManager).toBeUndefined();
  });

  it("should extract isLocalOnlyMode from auth.user.isLocalOnly", () => {
    const auth = createMockAuth({
      user: {
        isLocalOnly: true,
      },
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    expect(result.current.isLocalOnlyMode).toBe(true);
  });

  it("should use auth.logout for handleLogout", () => {
    const mockLogout = vi.fn();
    const auth = createMockAuth({
      logout: mockLogout,
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    expect(result.current.handleLogout).toBe(mockLogout);

    result.current.handleLogout();
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("should wrap auth.login for handleSetup", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const auth = createMockAuth({
      login: mockLogin,
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    await result.current.handleSetup("password123", { name: "Test User" } as any);
    expect(mockLogin).toHaveBeenCalledWith({
      password: "password123",
      userData: { name: "Test User" },
    });
  });

  it("should wrap auth.changePassword for handleChangePassword", async () => {
    const mockChangePassword = vi.fn().mockResolvedValue(undefined);
    const auth = createMockAuth({
      changePassword: mockChangePassword,
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    await result.current.handleChangePassword("oldPass", "newPass");
    expect(mockChangePassword).toHaveBeenCalledWith({
      oldPassword: "oldPass",
      newPassword: "newPass",
    });
  });

  it("should extract securityManager directly", () => {
    const mockSecurityManager = {
      rotate: vi.fn(),
      validate: vi.fn(),
    };

    const auth = createMockAuth({
      securityManager: mockSecurityManager,
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    expect(result.current.securityManager).toBe(mockSecurityManager);
  });

  it("should handle non-boolean isLocalOnlyMode values gracefully", () => {
    const auth = createMockAuth({
      user: {
        isLocalOnly: "true", // string instead of boolean
      },
    });

    const { result } = renderHook(() => useMainLayoutHandlers(auth as any));

    // Should default to false for non-boolean values strictly, or truthy if just !! check
    // Implementation uses !!auth?.user?.isLocalOnly, so "true" string becomes true.
    expect(result.current.isLocalOnlyMode).toBe(true);
  });
});
