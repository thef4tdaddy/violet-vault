/**
 * useBillForm Hook Tests
 * Tests for the extracted bill form logic hook
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBillForm } from "../../../hooks/bills/useBillForm";

// Mock UUID generation for consistent testing
vi.mock("uuid", () => ({
  v4: () => "test-uuid-123",
}));

// Mock logger to avoid console output in tests
vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock bill icons
vi.mock("../../../utils/common/billIcons", () => ({
  getBillIcon: vi.fn(() => "FileText"),
  getBillIconOptions: vi.fn(() => [
    { name: "FileText", Icon: () => null },
    { name: "Zap", Icon: () => null },
  ]),
  getIconNameForStorage: vi.fn((icon) => icon || "FileText"),
}));

// Mock frequency calculations
vi.mock("../../../utils/common/frequencyCalculations", () => ({
  toMonthly: vi.fn((amount, frequency) => {
    switch (frequency) {
      case "weekly":
        return amount * 4.33;
      case "biweekly":
        return amount * 2.17;
      case "monthly":
        return amount;
      case "quarterly":
        return amount / 3;
      case "yearly":
        return amount / 12;
      default:
        return amount;
    }
  }),
}));

// Mock constants
vi.mock("../../../constants/frequency", () => ({
  BIWEEKLY_MULTIPLIER: 26,
  convertToBiweekly: vi.fn((monthlyAmount) => monthlyAmount / 2.17),
}));

// Mock categories
vi.mock("../../../constants/categories", () => ({
  getBillCategories: vi.fn(() => ["Bills", "Utilities", "Insurance"]),
}));

describe("useBillForm Hook", () => {
  const mockProps = {
    editingBill: null,
    availableEnvelopes: [
      { id: "env1", name: "Utilities", currentBalance: 100 },
      { id: "env2", name: "Bills", currentBalance: 200 },
    ],
    onAddBill: vi.fn(),
    onUpdateBill: vi.fn(),
    onDeleteBill: vi.fn(),
    onClose: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default form data for new bill", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      expect(result.current.formData).toEqual({
        name: "",
        amount: "",
        frequency: "monthly",
        dueDate: "",
        category: "Bills",
        color: "#3B82F6",
        notes: "",
        createEnvelope: false,
        selectedEnvelope: "",
        customFrequency: "",
        iconName: "FileText",
      });

      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.deleteEnvelopeToo).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should initialize with existing bill data when editing", () => {
      const editingBill = {
        id: "bill-123",
        name: "Electric Bill",
        amount: 120.5,
        frequency: "monthly",
        dueDate: "2024-01-15",
        category: "Utilities",
        color: "#FF5733",
        notes: "Electric utility bill",
        envelopeId: "env1",
        iconName: "Zap",
      };

      const { result } = renderHook(() => useBillForm({ ...mockProps, editingBill }));

      expect(result.current.formData.name).toBe("Electric Bill");
      expect(result.current.formData.amount).toBe(120.5);
      expect(result.current.formData.frequency).toBe("monthly");
      expect(result.current.formData.dueDate).toBe("2024-01-15");
      expect(result.current.formData.category).toBe("Utilities");
      expect(result.current.formData.selectedEnvelope).toBe("env1");
      expect(result.current.formData.iconName).toBe("Zap");
    });
  });

  describe("Form Validation", () => {
    it("should return validation errors for empty required fields", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      expect(result.current.validationErrors).toEqual([
        "Bill name is required",
        "Valid amount is required",
        "Due date is required",
      ]);
    });

    it("should return no validation errors for complete form", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      act(() => {
        result.current.updateField("name", "Test Bill");
        result.current.updateField("amount", "100");
        result.current.updateField("dueDate", "2024-01-15");
      });

      expect(result.current.validationErrors).toEqual([]);
    });

    it("should validate amount is positive", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      act(() => {
        result.current.updateField("name", "Test Bill");
        result.current.updateField("amount", "0");
        result.current.updateField("dueDate", "2024-01-15");
      });

      expect(result.current.validationErrors).toContain("Valid amount is required");
    });
  });

  describe("Form Field Updates", () => {
    it("should update individual form fields", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      act(() => {
        result.current.updateField("name", "New Bill Name");
      });

      expect(result.current.formData.name).toBe("New Bill Name");
    });

    it("should update multiple form fields at once", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      act(() => {
        result.current.updateFormData({
          name: "Updated Bill",
          amount: "150.00",
          category: "Utilities",
        });
      });

      expect(result.current.formData.name).toBe("Updated Bill");
      expect(result.current.formData.amount).toBe("150.00");
      expect(result.current.formData.category).toBe("Utilities");
    });
  });

  describe("Form Submission", () => {
    it("should call onAddBill for new bills", async () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      // Fill out valid form
      act(() => {
        result.current.updateFormData({
          name: "Test Bill",
          amount: "100.50",
          dueDate: "2024-01-15",
          frequency: "monthly",
        });
      });

      // Submit form
      const mockEvent = { preventDefault: vi.fn() };
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockProps.onAddBill).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-uuid-123",
          name: "Test Bill",
          amount: 100.5,
          frequency: "monthly",
          dueDate: "2024-01-15",
        })
      );
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should call onUpdateBill for existing bills", async () => {
      const editingBill = {
        id: "existing-bill-123",
        name: "Existing Bill",
        amount: 75,
        frequency: "monthly",
        dueDate: "2024-01-10",
        category: "Bills",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const { result } = renderHook(() => useBillForm({ ...mockProps, editingBill }));

      // Update form
      act(() => {
        result.current.updateField("amount", "85.00");
      });

      // Submit form
      const mockEvent = { preventDefault: vi.fn() };
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockProps.onUpdateBill).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "existing-bill-123",
          amount: 85,
          updatedAt: expect.any(String),
        })
      );
    });

    it("should handle validation errors during submission", async () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      const mockEvent = { preventDefault: vi.fn() };
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockProps.onError).toHaveBeenCalledWith(
        "Bill name is required, Valid amount is required, Due date is required"
      );
      expect(mockProps.onAddBill).not.toHaveBeenCalled();
    });

    it("should set and clear submitting state", async () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      // Fill valid form
      act(() => {
        result.current.updateFormData({
          name: "Test Bill",
          amount: "100",
          dueDate: "2024-01-15",
        });
      });

      expect(result.current.isSubmitting).toBe(false);

      const mockEvent = { preventDefault: vi.fn() };
      const submitPromise = act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await submitPromise;
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("Bill Deletion", () => {
    it("should handle bill deletion", async () => {
      const editingBill = { id: "bill-to-delete", name: "Delete Me" };
      const { result } = renderHook(() => useBillForm({ ...mockProps, editingBill }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockProps.onDeleteBill).toHaveBeenCalledWith("bill-to-delete", false);
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should handle deletion with envelope removal", async () => {
      const editingBill = { id: "bill-to-delete", name: "Delete Me" };
      const { result } = renderHook(() => useBillForm({ ...mockProps, editingBill }));

      act(() => {
        result.current.setDeleteEnvelopeToo(true);
      });

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockProps.onDeleteBill).toHaveBeenCalledWith("bill-to-delete", true);
    });

    it("should not delete if no editing bill", async () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockProps.onDeleteBill).not.toHaveBeenCalled();
    });
  });

  describe("Calculation Functions", () => {
    it("should calculate monthly amount correctly", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      const monthlyAmount = result.current.calculateMonthlyAmount("100", "weekly", 1);
      expect(monthlyAmount).toBe(433); // 100 * 4.33
    });

    it("should calculate biweekly amount correctly", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      const biweeklyAmount = result.current.calculateBiweeklyAmount("217", "monthly", 1);
      expect(biweeklyAmount).toBe(100); // 217 / 2.17
    });

    it("should get next due date correctly", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      const nextDue = result.current.getNextDueDate("monthly", "2024-01-15");
      expect(nextDue).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO date format
    });
  });

  describe("Form Reset", () => {
    it("should reset form to initial state", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      // Modify form
      act(() => {
        result.current.updateFormData({
          name: "Modified Bill",
          amount: "200",
        });
        result.current.setShowDeleteConfirm(true);
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe("");
      expect(result.current.formData.amount).toBe("");
      expect(result.current.showDeleteConfirm).toBe(false);
    });

    it("should reset to editing bill state when editing", () => {
      const editingBill = {
        name: "Original Bill",
        amount: 100,
        frequency: "monthly",
        dueDate: "2024-01-15",
        category: "Bills",
      };

      const { result } = renderHook(() => useBillForm({ ...mockProps, editingBill }));

      // Modify form
      act(() => {
        result.current.updateField("name", "Modified Name");
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe("Original Bill");
    });
  });

  describe("Computed Values", () => {
    it("should provide suggested icon name", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      expect(result.current.suggestedIconName).toBe("FileText");
    });

    it("should provide icon suggestions", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      expect(result.current.iconSuggestions).toEqual([
        { name: "FileText", Icon: expect.any(Function) },
        { name: "Zap", Icon: expect.any(Function) },
      ]);
    });

    it("should provide categories", () => {
      const { result } = renderHook(() => useBillForm(mockProps));

      expect(result.current.categories).toEqual(["Bills", "Utilities", "Insurance"]);
    });
  });
});
