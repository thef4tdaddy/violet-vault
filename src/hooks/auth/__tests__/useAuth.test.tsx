import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import * as authHelpers from "@/hooks/auth/authHelpers";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSecurityManager } from "../useSecurityManager";
import localStorageService from "@/services/storage/localStorageService";
import { encryptionUtils } from "@/utils/security/encryption";
import React from "react";

// Mock dependencies
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../useSecurityManager", () => ({
  useSecurityManager: vi.fn(),
}));

vi.mock("@/hooks/auth/authHelpers", () => ({
  handleNewUserSetup: vi.fn(),
  deriveLoginEncryptionKey: vi.fn(),
  startBackgroundSyncAfterLogin: vi.fn(),
  processJoinBudget: vi.fn(),
}));

vi.mock("@/services/storage/localStorageService", () => ({
  default: {
    getBudgetData: vi.fn(),
    getUserProfile: vi.fn(),
    setUserProfile: vi.fn(),
    setBudgetData: vi.fn(),
  },
}));

vi.mock("@/utils/security/encryption", () => ({
  encryptionUtils: {
    decrypt: vi.fn(),
    encrypt: vi.fn(),
    deriveKey: vi.fn(),
    generateKey: vi.fn(),
    generateBudgetId: vi.fn(),
  },
}));

describe("useAuth", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Default mock implementation for context
    (useAuthContext as any).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isUnlocked: false,
      isLoading: false,
      setLoading: vi.fn(),
      setAuthenticated: vi.fn(),
      setError: vi.fn(),
      updateUser: vi.fn(),
      clearAuth: vi.fn(),
    });

    // Default mock implementation for security manager
    (useSecurityManager as any).mockReturnValue({
      isLocked: false,
      unlockSession: vi.fn(),
      securityEvents: {},
    });
  });

  it("should return unified auth state", () => {
    const mockUser = { userName: "Test User", userColor: "#000000" };
    (useAuthContext as any).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isUnlocked: true,
      isLoading: false,
      securityContext: { budgetId: "b1" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  describe("login", () => {
    it("should handle new user setup", async () => {
      const userData = { userName: "New User", userColor: "#abc", shareCode: "123" };
      const password = "password123";
      const loginResult = { success: true, user: { ...userData, budgetId: "b1" }, sessionData: {} };
      (authHelpers.handleNewUserSetup as any).mockResolvedValue(loginResult);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.login({ password, userData });
      });

      expect(authHelpers.handleNewUserSetup).toHaveBeenCalledWith(userData, password);
      expect(actualResult).toEqual(loginResult);
    });

    it("should handle successful login for existing user", async () => {
      const password = "password123";
      const mockKey = { type: "secret" };
      const mockSalt = new Uint8Array([1, 2, 3]);
      const mockEncryptedData = "encrypted";
      const mockIv = new Uint8Array([4, 5, 6]);
      const mockUser = { userName: "User", budgetId: "b1" };

      (localStorageService.getBudgetData as any).mockReturnValue({
        salt: [1, 2, 3],
        encryptedData: mockEncryptedData,
        iv: mockIv,
      });
      (localStorageService.getUserProfile as any).mockReturnValue({ shareCode: "sc1" });
      (authHelpers.deriveLoginEncryptionKey as any).mockResolvedValue({
        key: mockKey,
        salt: mockSalt,
      });
      (encryptionUtils.decrypt as any).mockResolvedValue({ currentUser: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.login({ password });
      });

      expect(actualResult.success).toBe(true);
      expect(actualResult.user).toEqual(mockUser);
      expect(useAuthContext().setAuthenticated).toHaveBeenCalledWith(mockUser, expect.any(Object));
    });

    it("should handle failed login (invalid password)", async () => {
      const password = "wrongpassword";
      (localStorageService.getBudgetData as any).mockReturnValue({
        salt: [1, 2, 3],
        encryptedData: "data",
        iv: "iv",
      });
      (authHelpers.deriveLoginEncryptionKey as any).mockResolvedValue({
        key: {},
        salt: new Uint8Array(),
      });
      (encryptionUtils.decrypt as any).mockRejectedValue(new Error("Decryption failed"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.login({ password });
      });

      expect(actualResult.success).toBe(false);
      expect(actualResult.error).toBe("Invalid password.");
      expect(useAuthContext().setError).toHaveBeenCalledWith("Invalid password.");
    });

    it("should handle no budget data error", async () => {
      (localStorageService.getBudgetData as any).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.login({ password: "p" });
      });

      expect(actualResult.success).toBe(false);
      expect(actualResult.error).toBe("No budget data found.");
    });
  });

  describe("logout", () => {
    it("should call context clearAuth and queryClient clear", async () => {
      const context = useAuthContext();
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(context.clearAuth).toHaveBeenCalled();
    });
  });

  describe("joinBudget", () => {
    it("should handle successful budget join", async () => {
      const joinData = {
        budgetId: "b1",
        password: "p1",
        userInfo: { userName: "U", userColor: "c" },
        sharedBy: "S",
      };
      const joinResult = {
        success: true,
        user: { ...joinData.userInfo, budgetId: "b1" },
        sessionData: { encryptionKey: {}, salt: new Uint8Array() },
      };
      (authHelpers.processJoinBudget as any).mockResolvedValue(joinResult);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.joinBudget(joinData);
      });

      expect(authHelpers.processJoinBudget).toHaveBeenCalledWith(joinData);
      expect(actualResult).toEqual(joinResult);
      expect(useAuthContext().setAuthenticated).toHaveBeenCalled();
    });

    it("should handle join failure", async () => {
      (authHelpers.processJoinBudget as any).mockResolvedValue({
        success: false,
        error: "Join failed",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.joinBudget({
          budgetId: "b",
          password: "p",
          userInfo: {} as any,
          sharedBy: "S",
        });
      });

      expect(actualResult.success).toBe(false);
      expect(useAuthContext().setError).toHaveBeenCalledWith("Join failed");
    });
  });

  describe("updateProfile", () => {
    it("should handle successful profile update", async () => {
      const updatedProfile = { userName: "New Name", userColor: "#000" };
      const mockKey = { type: "secret" };
      const mockSalt = new Uint8Array([1]);
      const mockIv = new Uint8Array([2]);

      (useAuthContext as any).mockReturnValue({
        encryptionKey: mockKey,
        salt: mockSalt,
        updateUser: vi.fn(),
      });
      (localStorageService.getBudgetData as any).mockReturnValue({
        encryptedData: "old",
        iv: mockIv,
      });
      (encryptionUtils.decrypt as any).mockResolvedValue({ oldData: true });
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: "new", iv: "newIv" });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.updateProfile(updatedProfile);
      });

      expect(actualResult.success).toBe(true);
      expect(localStorageService.setUserProfile).toHaveBeenCalled();
      expect(localStorageService.setBudgetData).toHaveBeenCalled();
      expect(useAuthContext().updateUser).toHaveBeenCalledWith(updatedProfile);
    });

    it("should fail profile update if not authenticated", async () => {
      (useAuthContext as any).mockReturnValue({ encryptionKey: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.updateProfile({ userName: "N" });
      });

      expect(actualResult.success).toBe(false);
      expect(actualResult.error).toBe("Not authenticated.");
    });
  });

  describe("changePassword", () => {
    it("should handle successful password change", async () => {
      const oldPassword = "old";
      const newPassword = "new";
      const mockIv = new Uint8Array([1]);
      const mockOldKey = { type: "old" };
      const mockNewKey = { type: "new" };
      const mockNewSalt = new Uint8Array([2]);

      (localStorageService.getBudgetData as any).mockReturnValue({
        encryptedData: "oldData",
        iv: mockIv,
      });
      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockOldKey });
      (encryptionUtils.decrypt as any).mockResolvedValue({ userData: {} });
      (encryptionUtils.generateKey as any).mockResolvedValue({
        key: mockNewKey,
        salt: mockNewSalt,
      });
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: "newData", iv: "newIv" });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.changePassword({ oldPassword, newPassword });
      });

      expect(actualResult.success).toBe(true);
      expect(localStorageService.setBudgetData).toHaveBeenCalled();
      expect(useAuthContext().setAuthenticated).toHaveBeenCalled();
    });

    it("should handle password change error", async () => {
      (encryptionUtils.deriveKey as any).mockRejectedValue(new Error("Invalid password"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      let actualResult;
      await act(async () => {
        actualResult = await result.current.changePassword({ oldPassword: "o", newPassword: "n" });
      });

      expect(actualResult.success).toBe(false);
      expect(actualResult.error).toBe("Invalid password");
    });
  });

  describe("Security Manager Integration", () => {
    it("should proxy security manager properties", () => {
      const mockManager = {
        isLocked: true,
        unlockSession: vi.fn(),
        securityEvents: { on: vi.fn() },
      };
      (useSecurityManager as any).mockReturnValue(mockManager);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLocked).toBe(true);
      expect(result.current.unlockSession).toBe(mockManager.unlockSession);
    });
  });

  describe("Loading States", () => {
    it("should expose loading states for various mutations", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoggingIn).toBeDefined();
      expect(result.current.isJoining).toBeDefined();
      expect(result.current.isUpdatingProfile).toBeDefined();
      expect(result.current.isChangingPassword).toBeDefined();
    });
  });
});
