import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLoginOperation,
  createJoinBudgetOperation,
  createLogoutOperation,
  createChangePasswordOperation,
  createUpdateProfileOperation,
  createLockSessionOperation,
  createUpdateActivityOperation,
} from "../authOperations";

/**
 * Test suite for authOperations
 * Operation creators for useAuthManager
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

describe("authOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLoginOperation", () => {
    it("should return login operation function", () => {
      const mockMutation = { mutateAsync: vi.fn() };
      const loginOp = createLoginOperation(mockMutation);
      expect(typeof loginOp).toBe("function");
    });

    it("should handle successful login with password only", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          user: { userName: "testuser", budgetId: "budget123" },
        }),
      };
      const loginOp = createLoginOperation(mockMutation);

      const result = await loginOp("password123");

      expect(result.success).toBe(true);
      expect(result.data.user.userName).toBe("testuser");
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        password: "password123",
        userData: null,
      });
    });

    it("should handle successful login with new user data", async () => {
      const userData = {
        userName: "newuser",
        userColor: "#FF5733",
        shareCode: "ABC123",
      };
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          user: { ...userData, budgetId: "newbudget456" },
          isNewUser: true,
        }),
      };
      const loginOp = createLoginOperation(mockMutation);

      const result = await loginOp("password123", userData);

      expect(result.success).toBe(true);
      expect(result.data.isNewUser).toBe(true);
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        password: "password123",
        userData,
      });
    });

    it("should handle failed login", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: false,
          error: "Invalid password",
          code: "INVALID_PASSWORD",
        }),
      };
      const loginOp = createLoginOperation(mockMutation);

      const result = await loginOp("wrongpassword");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid password");
      expect(result.code).toBe("INVALID_PASSWORD");
    });

    it("should handle login mutation errors", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error("Network error")),
      };
      const loginOp = createLoginOperation(mockMutation);

      const result = await loginOp("password123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("createJoinBudgetOperation", () => {
    it("should return join budget operation function", () => {
      const mockMutation = { mutateAsync: vi.fn() };
      const joinOp = createJoinBudgetOperation(mockMutation);
      expect(typeof joinOp).toBe("function");
    });

    it("should handle successful budget join", async () => {
      const joinData = {
        budgetId: "shared-budget-123",
        shareCode: "SHARE-ABC-123",
        sharedBy: "friend@example.com",
      };
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          budget: { id: "shared-budget-123", name: "Shared Budget" },
        }),
      };
      const joinOp = createJoinBudgetOperation(mockMutation);

      const result = await joinOp(joinData);

      expect(result.success).toBe(true);
      expect(result.data.budget.id).toBe("shared-budget-123");
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(joinData);
    });

    it("should handle failed budget join", async () => {
      const joinData = {
        budgetId: "invalid-budget",
        shareCode: "INVALID-CODE",
      };
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: false,
          error: "Invalid share code",
        }),
      };
      const joinOp = createJoinBudgetOperation(mockMutation);

      const result = await joinOp(joinData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid share code");
    });

    it("should handle join budget mutation errors", async () => {
      const joinData = {
        budgetId: "budget-123",
        shareCode: "SHARE-123",
      };
      const mockMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error("Server error")),
      };
      const joinOp = createJoinBudgetOperation(mockMutation);

      const result = await joinOp(joinData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Server error");
    });
  });

  describe("createLogoutOperation", () => {
    it("should return logout operation function", () => {
      const mockMutation = { mutateAsync: vi.fn() };
      const logoutOp = createLogoutOperation(mockMutation);
      expect(typeof logoutOp).toBe("function");
    });

    it("should handle successful logout", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue(undefined),
      };
      const logoutOp = createLogoutOperation(mockMutation);

      const result = await logoutOp();

      expect(result.success).toBe(true);
      expect(mockMutation.mutateAsync).toHaveBeenCalled();
    });

    it("should return success even if logout mutation fails", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error("Logout error")),
      };
      const logoutOp = createLogoutOperation(mockMutation);

      const result = await logoutOp();

      expect(result.success).toBe(true);
    });
  });

  describe("createChangePasswordOperation", () => {
    it("should return change password operation function", () => {
      const mockMutation = { mutateAsync: vi.fn() };
      const mockContext = { setAuthenticated: vi.fn(), user: null };
      const changeOp = createChangePasswordOperation(mockMutation, mockContext);
      expect(typeof changeOp).toBe("function");
    });

    it("should handle successful password change", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          newKey: new Uint8Array([1, 2, 3, 4]),
          newSalt: new Uint8Array([5, 6, 7, 8]),
        }),
      };
      const mockContext = {
        setAuthenticated: vi.fn(),
        user: { userName: "testuser" },
      };
      const changeOp = createChangePasswordOperation(mockMutation, mockContext);

      const result = await changeOp("oldpass123", "newpass123");

      expect(result.success).toBe(true);
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        oldPassword: "oldpass123",
        newPassword: "newpass123",
      });
      expect(mockContext.setAuthenticated).toHaveBeenCalled();
    });

    it("should handle failed password change", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: false,
          error: "Invalid current password",
        }),
      };
      const mockContext = { setAuthenticated: vi.fn(), user: null };
      const changeOp = createChangePasswordOperation(mockMutation, mockContext);

      const result = await changeOp("wrongpass", "newpass123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid current password");
    });

    it("should handle password change mutation errors", async () => {
      const mockMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error("Encryption error")),
      };
      const mockContext = { setAuthenticated: vi.fn(), user: null };
      const changeOp = createChangePasswordOperation(mockMutation, mockContext);

      const result = await changeOp("oldpass", "newpass");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Encryption error");
    });
  });

  describe("createUpdateProfileOperation", () => {
    it("should return update profile operation function", () => {
      const mockMutation = { mutateAsync: vi.fn() };
      const updateOp = createUpdateProfileOperation(mockMutation);
      expect(typeof updateOp).toBe("function");
    });

    it("should handle successful profile update", async () => {
      const updatedProfile = {
        userName: "newtestuser",
        userColor: "#FF5733",
      };
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          user: updatedProfile,
        }),
      };
      const updateOp = createUpdateProfileOperation(mockMutation);

      const result = await updateOp(updatedProfile);

      expect(result.success).toBe(true);
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith(updatedProfile);
    });

    it("should handle failed profile update", async () => {
      const updatedProfile = { userName: "newtestuser" };
      const mockMutation = {
        mutateAsync: vi.fn().mockResolvedValue({
          success: false,
          error: "Username already taken",
        }),
      };
      const updateOp = createUpdateProfileOperation(mockMutation);

      const result = await updateOp(updatedProfile);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Username already taken");
    });

    it("should handle profile update mutation errors", async () => {
      const updatedProfile = { userName: "newtestuser" };
      const mockMutation = {
        mutateAsync: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      const updateOp = createUpdateProfileOperation(mockMutation);

      const result = await updateOp(updatedProfile);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("createLockSessionOperation", () => {
    it("should return lock session operation function", () => {
      const mockContext = { lockSession: vi.fn() };
      const lockOp = createLockSessionOperation(mockContext);
      expect(typeof lockOp).toBe("function");
    });

    it("should call context lockSession", () => {
      const mockContext = { lockSession: vi.fn() };
      const lockOp = createLockSessionOperation(mockContext);

      lockOp();

      expect(mockContext.lockSession).toHaveBeenCalled();
    });
  });

  describe("createUpdateActivityOperation", () => {
    it("should return update activity operation function", () => {
      const mockContext = { updateActivity: vi.fn() };
      const updateOp = createUpdateActivityOperation(mockContext);
      expect(typeof updateOp).toBe("function");
    });

    it("should call context updateActivity", () => {
      const mockContext = { updateActivity: vi.fn() };
      const updateOp = createUpdateActivityOperation(mockContext);

      updateOp();

      expect(mockContext.updateActivity).toHaveBeenCalled();
    });
  });
});
