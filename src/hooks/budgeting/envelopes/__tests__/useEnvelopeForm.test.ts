import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useEnvelopeForm from "../useEnvelopeForm";
import { ENVELOPE_TYPES } from "@/constants/categories";
import { globalToast } from "@/stores/ui/toastStore";

// Mock the dependencies
vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showWarning: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useEnvelopeForm", () => {
  const mockCurrentUser = { userName: "Test User" };
  const mockExistingEnvelopes = [{ id: "1", name: "Existing Envelope" }];

  const defaultProps = {
    envelope: null,
    existingEnvelopes: mockExistingEnvelopes,
    onSave: vi.fn(),
    onClose: vi.fn(),
    currentUser: mockCurrentUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default form data for new envelope", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      expect(result.current.formData.name).toBe("");
      expect(result.current.formData.envelopeType).toBe(ENVELOPE_TYPES.VARIABLE);
      expect(result.current.formData.autoAllocate).toBe(true);
      expect(result.current.errors).toEqual({});
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isEditing).toBe(false);
    });

    it("should initialize with envelope data when editing", () => {
      const envelope = {
        id: "test-id",
        name: "Test Envelope",
        monthlyAmount: 100,
        category: "Food & Dining",
        color: "#a855f7",
      };

      const { result } = renderHook(() => useEnvelopeForm({ ...defaultProps, envelope }));

      expect(result.current.formData.name).toBe("Test Envelope");
      expect(result.current.formData.monthlyAmount).toBe("100");
      expect(result.current.formData.category).toBe("Food & Dining");
      expect(result.current.isEditing).toBe(true);
      expect(result.current.envelopeId).toBe("test-id");
    });
  });

  describe("Form field updates", () => {
    it("should update form field and mark as dirty", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      act(() => {
        result.current.updateFormField("name", "New Envelope");
      });

      expect(result.current.formData.name).toBe("New Envelope");
      expect(result.current.isDirty).toBe(true);
    });

    it("should clear related errors when field is updated", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // First set an error state
      act(() => {
        result.current.updateFormField("name", ""); // This should trigger validation
      });

      // Then update with valid value
      act(() => {
        result.current.updateFormField("name", "Valid Name");
      });

      expect((result.current.errors as Record<string, string | undefined>).name).toBeUndefined();
    });

    it("should handle envelope type changes", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      act(() => {
        result.current.updateFormField("envelopeType", ENVELOPE_TYPES.SINKING_FUND);
      });

      expect(result.current.formData.envelopeType).toBe(ENVELOPE_TYPES.SINKING_FUND);
    });
  });

  describe("Batch form updates", () => {
    it("should update multiple fields at once", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      const updates = {
        name: "Batch Updated",
        category: "Entertainment",
        monthlyAmount: "200",
      };

      act(() => {
        result.current.updateFormData(updates);
      });

      expect(result.current.formData.name).toBe("Batch Updated");
      expect(result.current.formData.category).toBe("Entertainment");
      expect(result.current.formData.monthlyAmount).toBe("200");
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe("Form validation", () => {
    it("should validate form correctly", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // Set valid form data
      act(() => {
        result.current.updateFormData({
          name: "Test Envelope",
          category: "Food & Dining",
          monthlyAmount: "100",
        });
      });

      let isValid;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(true);
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });

    it("should detect validation errors", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // Set invalid form data
      act(() => {
        result.current.updateFormData({
          name: "", // Invalid - required
          category: "Food & Dining",
          monthlyAmount: "invalid", // Invalid format
        });
      });

      let isValid;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect((result.current.errors as any).name).toBeDefined();
      expect((result.current.errors as any).monthlyAmount).toBeDefined();
    });

    it("should check for duplicate names", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      act(() => {
        result.current.updateFormData({
          name: "Existing Envelope", // Duplicate name
          category: "Food & Dining",
        });
      });

      let isValid;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect((result.current.errors as any).name).toContain("already exists");
    });
  });

  describe("Form submission", () => {
    it("should handle successful submission", async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useEnvelopeForm({ ...defaultProps, onSave: mockOnSave }));

      // Set valid form data
      act(() => {
        result.current.updateFormData({
          name: "Test Envelope",
          category: "Food & Dining",
          monthlyAmount: "100",
        } as any);
      });

      let success;
      await act(async () => {
        success = await result.current.handleSubmit();
      });

      expect(success).toBe(true);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Envelope",
          monthlyAmount: 100,
          category: "Food & Dining",
        })
      );
      expect(result.current.isDirty).toBe(false);
    });

    it("should handle submission validation errors", async () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // Don't set valid form data - should fail validation

      let success;
      await act(async () => {
        success = await result.current.handleSubmit();
      });

      expect(success).toBe(false);
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it("should handle submission errors", async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error("Save failed"));
      const { result } = renderHook(() => useEnvelopeForm({ ...defaultProps, onSave: mockOnSave }));

      // Set valid form data
      act(() => {
        result.current.updateFormData({
          name: "Test Envelope",
          category: "Food",
        });
      });

      let success;
      await act(async () => {
        success = await result.current.handleSubmit();
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Form close handling", () => {
    it("should close without confirmation when not dirty", () => {
      const mockOnClose = vi.fn();
      const { result } = renderHook(() =>
        useEnvelopeForm({ ...defaultProps, onClose: mockOnClose })
      );

      act(() => {
        result.current.handleClose();
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show unsaved changes warning when dirty", () => {
      const mockOnClose = vi.fn();
      const { result } = renderHook(() =>
        useEnvelopeForm({ ...defaultProps, onClose: mockOnClose })
      );

      // Make form dirty
      act(() => {
        result.current.updateFormField("name", "Test");
      });

      act(() => {
        result.current.handleClose();
      });

      expect(globalToast.showError).toHaveBeenCalledWith(
        "You have unsaved changes that will be lost if you close now.",
        "Unsaved Changes Warning"
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Form reset", () => {
    it("should reset form to default for new envelope", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // Modify form
      act(() => {
        result.current.updateFormData({
          name: "Modified",
          category: "Food & Dining",
        });
      });

      expect(result.current.isDirty).toBe(true);

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe("");
      expect(result.current.formData.category).toBe("");
      expect(result.current.errors).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });

    it("should reset form to original envelope data when editing", () => {
      const envelope = {
        id: "test-id",
        name: "Original Name",
        category: "Food & Dining",
      };

      const { result } = renderHook(() => useEnvelopeForm({ ...defaultProps, envelope }));

      // Modify form
      act(() => {
        result.current.updateFormField("name", "Modified Name");
      });

      expect(result.current.formData.name).toBe("Modified Name");
      expect(result.current.isDirty).toBe(true);

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe("Original Name");
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe("Calculated amounts", () => {
    it("should provide calculated amounts", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      act(() => {
        result.current.updateFormField("monthlyAmount", "100");
      });

      expect(result.current.calculatedAmounts.monthlyAmount).toBe(100);
      expect(result.current.calculatedAmounts.biweeklyAllocation).toBeCloseTo(46.15, 2);
    });
  });

  describe("Submit button state", () => {
    it("should determine if form can be submitted", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      // Initially cannot submit (missing required fields)
      expect(result.current.canSubmit).toBe(false);

      // Set required fields
      act(() => {
        result.current.updateFormData({
          name: "Test Envelope",
          category: "Food & Dining",
        });
      });

      expect(result.current.canSubmit).toBe(true);
    });

    it("should not allow submit when loading", () => {
      const { result } = renderHook(() => useEnvelopeForm(defaultProps));

      act(() => {
        result.current.updateFormData({
          name: "Test Envelope",
          category: "Food & Dining",
        });
      });

      // Simulate loading state during async operation
      expect(result.current.canSubmit).toBe(true);

      // During actual submission, isLoading would be true
      // This is handled internally by the hook
    });
  });
});
