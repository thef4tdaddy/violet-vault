import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect, afterEach } from "vitest";
import useEnvelopeEdit from "../useEnvelopeEdit";

// Mock dependencies
vi.mock("@/hooks/auth/useAuth");
vi.mock("@/hooks/common/useEditLock");
vi.mock("@/services/sync/editLockService");
vi.mock("../useEnvelopeForm");
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Import mocked modules
import { useAuth } from "@/hooks/auth/useAuth";
import useEditLock from "@/hooks/common/useEditLock";
import { initializeEditLocks } from "@/services/sync/editLockService";
import useEnvelopeForm from "../useEnvelopeForm";

describe("useEnvelopeEdit", () => {
  // Mock functions
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let mockReleaseLock: ReturnType<typeof vi.fn>;
  let mockBreakLock: ReturnType<typeof vi.fn>;
  let mockFormHandleClose: ReturnType<typeof vi.fn>;
  let mockFormHandleSubmit: ReturnType<typeof vi.fn>;

  // Mock data
  const mockEnvelope = {
    id: "env-123",
    name: "Groceries",
    currentBalance: 500,
  };

  const mockExistingEnvelopes = [
    { id: "env-1", name: "Rent" },
    { id: "env-2", name: "Utilities" },
  ];

  const mockCurrentUser = { userName: "TestUser" };

  const mockAuthUser = {
    uid: "user-123",
    displayName: "Test User",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock functions
    mockOnSave = vi.fn().mockResolvedValue(undefined);
    mockOnClose = vi.fn();
    mockOnDelete = vi.fn().mockResolvedValue(undefined);
    mockReleaseLock = vi.fn().mockResolvedValue({ success: true });
    mockBreakLock = vi.fn().mockResolvedValue({ success: true });
    mockFormHandleClose = vi.fn();
    mockFormHandleSubmit = vi.fn().mockResolvedValue(true);

    // Mock useAuth
    vi.mocked(useAuth).mockReturnValue({
      securityContext: {
        budgetId: "budget-123",
      },
      user: mockAuthUser,
    } as ReturnType<typeof useAuth>);

    // Mock useEditLock
    vi.mocked(useEditLock).mockReturnValue({
      lock: null,
      isLocked: false,
      isOwnLock: false,
      canEdit: true,
      lockedBy: undefined,
      expiresAt: null,
      timeRemaining: 0,
      isExpired: false,
      releaseLock: mockReleaseLock,
      breakLock: mockBreakLock,
      isLoading: false,
      acquireLock: vi.fn(),
    });

    // Mock useEnvelopeForm
    vi.mocked(useEnvelopeForm).mockReturnValue({
      formData: {
        name: "Test Envelope",
        category: "Expenses",
      },
      errors: {},
      isLoading: false,
      isDirty: false,
      canSubmit: true,
      hasRequiredFields: true,
      calculatedAmounts: {},
      updateFormField: vi.fn(),
      updateFormData: vi.fn(),
      validateForm: vi.fn(),
      resetForm: vi.fn(),
      handleSubmit: mockFormHandleSubmit,
      handleClose: mockFormHandleClose,
      isEditing: true,
      envelopeId: "env-123",
    } as ReturnType<typeof useEnvelopeForm>);

    // Mock initializeEditLocks
    vi.mocked(initializeEditLocks).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default values when modal is closed", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: false,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current).toBeDefined();
      expect(result.current.canEdit).toBe(true);
      expect(result.current.isLocked).toBe(false);
    });

    it("should call initializeEditLocks when modal opens with valid data", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(initializeEditLocks).toHaveBeenCalledWith("budget-123", mockAuthUser);
    });

    it("should not call initializeEditLocks when modal is closed", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: false,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(initializeEditLocks).not.toHaveBeenCalled();
    });

    it("should not call initializeEditLocks when budgetId is missing", () => {
      vi.mocked(useAuth).mockReturnValue({
        securityContext: {
          budgetId: "",
        },
        user: mockAuthUser,
      } as ReturnType<typeof useAuth>);

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(initializeEditLocks).not.toHaveBeenCalled();
    });

    it("should not call initializeEditLocks when user is missing", () => {
      vi.mocked(useAuth).mockReturnValue({
        securityContext: {
          budgetId: "budget-123",
        },
        user: null,
      } as ReturnType<typeof useAuth>);

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(initializeEditLocks).not.toHaveBeenCalled();
    });
  });

  describe("Edit Lock Integration", () => {
    it("should pass correct parameters to useEditLock", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(useEditLock).toHaveBeenCalledWith("envelope", "env-123", {
        autoAcquire: true,
        autoRelease: true,
        showToasts: true,
      });
    });

    it("should pass autoAcquire false when modal is closed", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: false,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(useEditLock).toHaveBeenCalledWith("envelope", "env-123", {
        autoAcquire: false,
        autoRelease: true,
        showToasts: true,
      });
    });

    it("should pass autoAcquire false when envelope is null", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: null,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(useEditLock).toHaveBeenCalledWith("envelope", "", {
        autoAcquire: false,
        autoRelease: true,
        showToasts: true,
      });
    });

    it("should handle envelope with numeric id", () => {
      const numericEnvelope = { ...mockEnvelope, id: 123 };
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: numericEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(useEditLock).toHaveBeenCalledWith("envelope", "123", {
        autoAcquire: true,
        autoRelease: true,
        showToasts: true,
      });
    });
  });

  describe("handleClose", () => {
    it("should release lock and call onClose when user owns the lock", () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: null,
        isLocked: true,
        isOwnLock: true,
        canEdit: true,
        lockedBy: "TestUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      act(() => {
        result.current.handleClose();
      });

      expect(mockReleaseLock).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should only call onClose when user does not own the lock", () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: null,
        isLocked: false,
        isOwnLock: false,
        canEdit: true,
        lockedBy: undefined,
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      act(() => {
        result.current.handleClose();
      });

      expect(mockReleaseLock).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("handleSave (via handleSubmit)", () => {
    it("should call onSave and release lock on successful save with existing envelope", async () => {
      // Mock the form hook to actually call the onSave handler
      const actualHandleSave = vi.fn(async (envelopeData: unknown) => {
        // Simulate calling onSave which should be the enhanced handleSave
        await mockOnSave(envelopeData);
        return true;
      });

      vi.mocked(useEnvelopeForm).mockReturnValue({
        formData: { name: "Test" },
        errors: {},
        isLoading: false,
        isDirty: false,
        canSubmit: true,
        hasRequiredFields: true,
        calculatedAmounts: {},
        updateFormField: vi.fn(),
        updateFormData: vi.fn(),
        validateForm: vi.fn(),
        resetForm: vi.fn(),
        handleSubmit: actualHandleSave,
        handleClose: mockFormHandleClose,
        isEditing: true,
        envelopeId: "env-123",
      } as ReturnType<typeof useEnvelopeForm>);

      vi.mocked(useEditLock).mockReturnValue({
        lock: null,
        isLocked: true,
        isOwnLock: true,
        canEdit: true,
        lockedBy: "TestUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      // Now handleSubmit is exposed from the spread formHook
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(actualHandleSave).toHaveBeenCalled();
    });

    it("should pass enhanced handleSave to useEnvelopeForm that validates lock", async () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: { userId: "other-user", userName: "OtherUser" } as never,
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lockedBy: "OtherUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      let capturedOnSave: ((data: unknown) => Promise<void>) | undefined;

      vi.mocked(useEnvelopeForm).mockImplementation((props) => {
        capturedOnSave = props.onSave;
        return {
          formData: { name: "Test" },
          errors: {},
          isLoading: false,
          isDirty: false,
          canSubmit: true,
          hasRequiredFields: true,
          calculatedAmounts: {},
          updateFormField: vi.fn(),
          updateFormData: vi.fn(),
          validateForm: vi.fn(),
          resetForm: vi.fn(),
          handleSubmit: mockFormHandleSubmit,
          handleClose: mockFormHandleClose,
          isEditing: true,
          envelopeId: "env-123",
        } as ReturnType<typeof useEnvelopeForm>;
      });

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      // Test that the enhanced handleSave throws error when locked
      expect(capturedOnSave).toBeDefined();
      if (capturedOnSave) {
        await expect(capturedOnSave({ name: "Updated" })).rejects.toThrow(
          "Cannot save changes - envelope is locked by another user"
        );
      }

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should pass enhanced handleSave that does not release lock when creating new envelope", async () => {
      let capturedOnSave: ((data: unknown) => Promise<void>) | undefined;

      vi.mocked(useEnvelopeForm).mockImplementation((props) => {
        capturedOnSave = props.onSave;
        return {
          formData: { name: "Test" },
          errors: {},
          isLoading: false,
          isDirty: false,
          canSubmit: true,
          hasRequiredFields: true,
          calculatedAmounts: {},
          updateFormField: vi.fn(),
          updateFormData: vi.fn(),
          validateForm: vi.fn(),
          resetForm: vi.fn(),
          handleSubmit: mockFormHandleSubmit,
          handleClose: mockFormHandleClose,
          isEditing: false,
          envelopeId: null,
        } as ReturnType<typeof useEnvelopeForm>;
      });

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: null,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      // Test that the enhanced handleSave works without releasing lock for new envelope
      expect(capturedOnSave).toBeDefined();
      if (capturedOnSave) {
        await capturedOnSave({ name: "New Envelope" });
      }

      expect(mockOnSave).toHaveBeenCalledWith({ name: "New Envelope" });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });

    it("should pass enhanced handleSave that releases lock on successful save with existing envelope", async () => {
      let capturedOnSave: ((data: unknown) => Promise<void>) | undefined;

      vi.mocked(useEditLock).mockReturnValue({
        lock: null,
        isLocked: true,
        isOwnLock: true,
        canEdit: true,
        lockedBy: "TestUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      vi.mocked(useEnvelopeForm).mockImplementation((props) => {
        capturedOnSave = props.onSave;
        return {
          formData: { name: "Test" },
          errors: {},
          isLoading: false,
          isDirty: false,
          canSubmit: true,
          hasRequiredFields: true,
          calculatedAmounts: {},
          updateFormField: vi.fn(),
          updateFormData: vi.fn(),
          validateForm: vi.fn(),
          resetForm: vi.fn(),
          handleSubmit: mockFormHandleSubmit,
          handleClose: mockFormHandleClose,
          isEditing: true,
          envelopeId: "env-123",
        } as ReturnType<typeof useEnvelopeForm>;
      });

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      // Test that the enhanced handleSave releases lock after save
      expect(capturedOnSave).toBeDefined();
      if (capturedOnSave) {
        await capturedOnSave({ name: "Updated Envelope" });
      }

      expect(mockOnSave).toHaveBeenCalledWith({ name: "Updated Envelope" });
      expect(mockReleaseLock).toHaveBeenCalled();
    });

    it("should pass enhanced handleSave that does not release lock if user doesn't own it", async () => {
      let capturedOnSave: ((data: unknown) => Promise<void>) | undefined;

      vi.mocked(useEditLock).mockReturnValue({
        lock: null,
        isLocked: false,
        isOwnLock: false,
        canEdit: true,
        lockedBy: undefined,
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      vi.mocked(useEnvelopeForm).mockImplementation((props) => {
        capturedOnSave = props.onSave;
        return {
          formData: { name: "Test" },
          errors: {},
          isLoading: false,
          isDirty: false,
          canSubmit: true,
          hasRequiredFields: true,
          calculatedAmounts: {},
          updateFormField: vi.fn(),
          updateFormData: vi.fn(),
          validateForm: vi.fn(),
          resetForm: vi.fn(),
          handleSubmit: mockFormHandleSubmit,
          handleClose: mockFormHandleClose,
          isEditing: true,
          envelopeId: "env-123",
        } as ReturnType<typeof useEnvelopeForm>;
      });

      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      // Test that the enhanced handleSave does not release lock if not owned
      expect(capturedOnSave).toBeDefined();
      if (capturedOnSave) {
        await capturedOnSave({ name: "Updated Envelope" });
      }

      expect(mockOnSave).toHaveBeenCalledWith({ name: "Updated Envelope" });
      expect(mockReleaseLock).not.toHaveBeenCalled();
    });
  });

  describe("handleDelete", () => {
    it("should delete envelope when user can edit", async () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      await act(async () => {
        const success = await result.current.handleDelete();
        expect(success).toBe(true);
      });

      expect(mockOnDelete).toHaveBeenCalledWith("env-123");
    });

    it("should throw error when deleting locked envelope", async () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: { userId: "other-user", userName: "OtherUser" } as never,
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lockedBy: "OtherUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      await expect(
        act(async () => {
          await result.current.handleDelete();
        })
      ).rejects.toThrow("Cannot delete envelope - it is locked by another user");

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it("should throw error when no envelope to delete", async () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: null,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      await expect(
        act(async () => {
          await result.current.handleDelete();
        })
      ).rejects.toThrow("No envelope to delete");

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it("should handle numeric envelope id", async () => {
      const numericEnvelope = { ...mockEnvelope, id: 456 };
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: numericEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockOnDelete).toHaveBeenCalledWith(456);
    });
  });

  describe("Computed Properties", () => {
    it("should compute canDelete correctly when user can edit and envelope exists", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canDelete).toBe(true);
    });

    it("should compute canDelete as false when user cannot edit", () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: { userId: "other-user", userName: "OtherUser" } as never,
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lockedBy: "OtherUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canDelete).toBe(false);
    });

    it("should compute canDelete as false when envelope is null", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: null,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canDelete).toBe(false);
    });

    it("should compute canSave correctly when form is submittable and user can edit", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canSave).toBe(true);
    });

    it("should compute canSave as false when form cannot be submitted", () => {
      vi.mocked(useEnvelopeForm).mockReturnValue({
        formData: {},
        errors: { name: "Required" },
        isLoading: false,
        isDirty: false,
        canSubmit: false,
        hasRequiredFields: false,
        calculatedAmounts: {},
        updateFormField: vi.fn(),
        updateFormData: vi.fn(),
        validateForm: vi.fn(),
        resetForm: vi.fn(),
        handleSubmit: mockFormHandleSubmit,
        handleClose: mockFormHandleClose,
        isEditing: true,
        envelopeId: "env-123",
      } as ReturnType<typeof useEnvelopeForm>);

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canSave).toBe(false);
    });

    it("should compute canSave as false when user cannot edit", () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: { userId: "other-user", userName: "OtherUser" } as never,
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lockedBy: "OtherUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.canSave).toBe(false);
    });

    it("should compute isReadOnly as true when envelope exists but user cannot edit", () => {
      vi.mocked(useEditLock).mockReturnValue({
        lock: { userId: "other-user", userName: "OtherUser" } as never,
        isLocked: true,
        isOwnLock: false,
        canEdit: false,
        lockedBy: "OtherUser",
        expiresAt: null,
        timeRemaining: 0,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.isReadOnly).toBe(true);
    });

    it("should compute isReadOnly as false when user can edit", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.isReadOnly).toBe(false);
    });

    it("should compute isReadOnly as false when creating new envelope", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: null,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.isReadOnly).toBe(false);
    });
  });

  describe("Lock State Exposure", () => {
    it("should expose all lock state properties", () => {
      const mockLock = {
        userId: "user-123",
        userName: "TestUser",
        expiresAt: Date.now() + 60000,
      };

      vi.mocked(useEditLock).mockReturnValue({
        lock: mockLock as never,
        isLocked: true,
        isOwnLock: true,
        canEdit: true,
        lockedBy: "TestUser",
        expiresAt: new Date(mockLock.expiresAt),
        timeRemaining: 60,
        isExpired: false,
        releaseLock: mockReleaseLock,
        breakLock: mockBreakLock,
        isLoading: false,
        acquireLock: vi.fn(),
      });

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.lock).toEqual(mockLock);
      expect(result.current.isLocked).toBe(true);
      expect(result.current.isOwnLock).toBe(true);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.lockedBy).toBe("TestUser");
      expect(result.current.expiresAt).toEqual(new Date(mockLock.expiresAt));
      expect(result.current.timeRemaining).toBe(60);
      expect(result.current.isExpired).toBe(false);
      expect(result.current.lockLoading).toBe(false);
    });

    it("should expose lock action functions", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.releaseLock).toBe(mockReleaseLock);
      expect(result.current.breakLock).toBe(mockBreakLock);
    });
  });

  describe("Form State Integration", () => {
    it("should pass all form state properties through from useEnvelopeForm", () => {
      const mockFormData = {
        name: "Test Envelope",
        category: "Expenses",
        envelopeType: "standard",
      };

      vi.mocked(useEnvelopeForm).mockReturnValue({
        formData: mockFormData,
        errors: { name: "Error" },
        isLoading: true,
        isDirty: true,
        canSubmit: false,
        hasRequiredFields: true,
        calculatedAmounts: { total: 100 },
        updateFormField: vi.fn(),
        updateFormData: vi.fn(),
        validateForm: vi.fn(),
        resetForm: vi.fn(),
        handleSubmit: mockFormHandleSubmit,
        handleClose: mockFormHandleClose,
        isEditing: true,
        envelopeId: "env-123",
      } as ReturnType<typeof useEnvelopeForm>);

      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current.formData).toEqual(mockFormData);
      expect(result.current.errors).toEqual({ name: "Error" });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isDirty).toBe(true);
      expect(result.current.hasRequiredFields).toBe(true);
      expect(result.current.calculatedAmounts).toEqual({ total: 100 });
      expect(result.current.isEditing).toBe(true);
      expect(result.current.envelopeId).toBe("env-123");
    });

    it("should pass correct props to useEnvelopeForm hook", () => {
      renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: mockEnvelope,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(useEnvelopeForm).toHaveBeenCalledWith({
        envelope: mockEnvelope,
        existingEnvelopes: mockExistingEnvelopes,
        onSave: expect.any(Function),
        onClose: expect.any(Function),
        currentUser: mockCurrentUser,
      });
    });
  });

  describe("Default Props", () => {
    it("should use default values when optional props are not provided", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current).toBeDefined();
      expect(useEnvelopeForm).toHaveBeenCalledWith(
        expect.objectContaining({
          envelope: null,
          existingEnvelopes: [],
          currentUser: { userName: "User" },
        })
      );
    });

    it("should handle undefined envelope prop", () => {
      const { result } = renderHook(() =>
        useEnvelopeEdit({
          isOpen: true,
          envelope: undefined,
          existingEnvelopes: mockExistingEnvelopes,
          onSave: mockOnSave,
          onClose: mockOnClose,
          onDelete: mockOnDelete,
          currentUser: mockCurrentUser,
        })
      );

      expect(result.current).toBeDefined();
      expect(useEditLock).toHaveBeenCalledWith("envelope", "", {
        autoAcquire: false,
        autoRelease: true,
        showToasts: true,
      });
    });
  });

  describe("Effect Triggers", () => {
    it("should call initializeEditLocks when isOpen changes to true", () => {
      const { rerender } = renderHook(
        ({ isOpen }) =>
          useEnvelopeEdit({
            isOpen,
            envelope: mockEnvelope,
            existingEnvelopes: mockExistingEnvelopes,
            onSave: mockOnSave,
            onClose: mockOnClose,
            onDelete: mockOnDelete,
            currentUser: mockCurrentUser,
          }),
        { initialProps: { isOpen: false } }
      );

      expect(initializeEditLocks).not.toHaveBeenCalled();

      rerender({ isOpen: true });

      expect(initializeEditLocks).toHaveBeenCalledWith("budget-123", mockAuthUser);
    });

    it("should not call initializeEditLocks again when other props change", () => {
      const { rerender } = renderHook(
        ({ envelope }) =>
          useEnvelopeEdit({
            isOpen: true,
            envelope,
            existingEnvelopes: mockExistingEnvelopes,
            onSave: mockOnSave,
            onClose: mockOnClose,
            onDelete: mockOnDelete,
            currentUser: mockCurrentUser,
          }),
        { initialProps: { envelope: mockEnvelope } }
      );

      expect(initializeEditLocks).toHaveBeenCalledTimes(1);

      const newEnvelope = { ...mockEnvelope, name: "Updated" };
      rerender({ envelope: newEnvelope });

      // Should still be called only once
      expect(initializeEditLocks).toHaveBeenCalledTimes(1);
    });
  });
});
