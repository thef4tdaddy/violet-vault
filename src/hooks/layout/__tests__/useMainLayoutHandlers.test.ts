import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMainLayoutHandlers } from "../useMainLayoutHandlers";

describe("useMainLayoutHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default values when auth is null", () => {
    const { result } = renderHook(() => useMainLayoutHandlers(null));

    expect(result.current.isLocalOnlyMode).toBe(false);
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");
    expect(result.current.securityManager).toEqual({});
  });

  it("should return default values when auth is undefined", () => {
    const { result } = renderHook(() => useMainLayoutHandlers(undefined));

    expect(result.current.isLocalOnlyMode).toBe(false);
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");
    expect(result.current.securityManager).toEqual({});
  });

  it("should extract isLocalOnlyMode from auth._legacy", () => {
    const auth = {
      _legacy: {
        isLocalOnlyMode: true,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.isLocalOnlyMode).toBe(true);
  });

  it("should extract handleLogout from auth._legacy", () => {
    const mockHandleLogout = vi.fn();
    const auth = {
      _legacy: {
        handleLogout: mockHandleLogout,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.handleLogout).toBe(mockHandleLogout);

    result.current.handleLogout();
    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });

  it("should extract handleSetup from auth._legacy", () => {
    const mockHandleSetup = vi.fn();
    const auth = {
      _legacy: {
        handleSetup: mockHandleSetup,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.handleSetup).toBe(mockHandleSetup);

    result.current.handleSetup();
    expect(mockHandleSetup).toHaveBeenCalledTimes(1);
  });

  it("should extract handleChangePassword from auth._legacy", async () => {
    const mockHandleChangePassword = vi.fn().mockResolvedValue(undefined);
    const auth = {
      _legacy: {
        handleChangePassword: mockHandleChangePassword,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.handleChangePassword).toBe(mockHandleChangePassword);

    await result.current.handleChangePassword("oldPass", "newPass");
    expect(mockHandleChangePassword).toHaveBeenCalledWith("oldPass", "newPass");
  });

  it("should extract securityManager from auth._legacy._internal", () => {
    const mockSecurityManager = {
      rotate: vi.fn(),
      validate: vi.fn(),
    };

    const auth = {
      _legacy: {
        _internal: {
          securityManager: mockSecurityManager,
        },
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.securityManager).toBe(mockSecurityManager);
  });

  it("should handle all properties together", () => {
    const mockHandleLogout = vi.fn();
    const mockHandleSetup = vi.fn();
    const mockHandleChangePassword = vi.fn().mockResolvedValue(undefined);
    const mockSecurityManager = { rotate: vi.fn() };

    const auth = {
      _legacy: {
        isLocalOnlyMode: true,
        handleLogout: mockHandleLogout,
        handleSetup: mockHandleSetup,
        handleChangePassword: mockHandleChangePassword,
        _internal: {
          securityManager: mockSecurityManager,
        },
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.isLocalOnlyMode).toBe(true);
    expect(result.current.handleLogout).toBe(mockHandleLogout);
    expect(result.current.handleSetup).toBe(mockHandleSetup);
    expect(result.current.handleChangePassword).toBe(mockHandleChangePassword);
    expect(result.current.securityManager).toBe(mockSecurityManager);
  });

  it("should provide no-op functions when handlers are not provided", () => {
    const auth = {
      _legacy: {
        isLocalOnlyMode: true,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    // Should not throw when calling default functions
    expect(() => result.current.handleLogout()).not.toThrow();
    expect(() => result.current.handleSetup()).not.toThrow();
    expect(async () => await result.current.handleChangePassword("old", "new")).not.toThrow();
  });

  it("should handle non-boolean isLocalOnlyMode values gracefully", () => {
    const auth = {
      _legacy: {
        isLocalOnlyMode: "true", // string instead of boolean
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    // Should default to false for non-boolean values
    expect(result.current.isLocalOnlyMode).toBe(false);
  });

  it("should handle non-function handler values gracefully", () => {
    const auth = {
      _legacy: {
        handleLogout: "not a function",
        handleSetup: null,
        handleChangePassword: undefined,
      },
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    // Should provide default no-op functions
    expect(typeof result.current.handleLogout).toBe("function");
    expect(typeof result.current.handleSetup).toBe("function");
    expect(typeof result.current.handleChangePassword).toBe("function");

    // Should not throw when calling these defaults
    expect(() => result.current.handleLogout()).not.toThrow();
    expect(() => result.current.handleSetup()).not.toThrow();
  });

  it("should return empty object for securityManager when not provided", () => {
    const auth = {
      _legacy: {},
    };

    const { result } = renderHook(() => useMainLayoutHandlers(auth));

    expect(result.current.securityManager).toEqual({});
  });
});
