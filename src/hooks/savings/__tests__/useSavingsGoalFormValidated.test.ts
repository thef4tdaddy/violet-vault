/**
 * Tests for useSavingsGoalFormValidated Hook
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSavingsGoalFormValidated } from "../useSavingsGoalFormValidated";
import type { SavingsGoal } from "@/types/savings";

describe("useSavingsGoalFormValidated", () => {
  const mockGoal: SavingsGoal = {
    id: "goal-1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 5000,
    targetDate: "2025-12-31",
    category: "emergency",
    color: "#FF5733",
    description: "6 month emergency fund",
    priority: "high",
    isPaused: false,
    isCompleted: false,
    lastModified: Date.now(),
    createdAt: Date.now(),
  };

  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty form for new goal", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    expect(result.current.data.name).toBe("");
    expect(result.current.data.targetAmount).toBe("");
    expect(result.current.data.currentAmount).toBe("0");
    expect(result.current.data.priority).toBe("medium");
    expect(result.current.isEditMode).toBe(false);
  });

  it("should initialize with goal data for editing", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: mockGoal,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    expect(result.current.data.name).toBe("Emergency Fund");
    expect(result.current.data.targetAmount).toBe("10000");
    expect(result.current.data.currentAmount).toBe("5000");
    expect(result.current.data.category).toBe("emergency");
    expect(result.current.isEditMode).toBe(true);
  });

  it("should update field value", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.updateField("name", "Vacation Fund");
    });

    expect(result.current.data.name).toBe("Vacation Fund");
    expect(result.current.isDirty).toBe(true);
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.validate();
    });

    // Should have errors for required fields
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.targetAmount).toBeDefined();
    expect(result.current.errors.category).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it("should validate target amount is positive", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.updateFormData({
        name: "Test Goal",
        targetAmount: "0",
        category: "test",
        color: "#FF5733",
      });
      result.current.validate();
    });

    expect(result.current.errors.targetAmount).toBeDefined();
  });

  it("should handle form submission with valid data", async () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Fill in required fields
    act(() => {
      result.current.updateFormData({
        name: "Emergency Fund",
        targetAmount: "10000",
        currentAmount: "0",
        category: "emergency",
        color: "#FF5733",
        priority: "high",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        name: "Emergency Fund",
        targetAmount: 10000,
        category: "emergency",
      })
    );
  });

  it("should not submit with invalid data", async () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Try to submit empty form
    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should not call onSubmit
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(result.current.isValid).toBe(false);
  });

  it("should reset form to initial state", () => {
    const { result } = renderHook(() =>
      useSavingsGoalFormValidated({
        goal: null,
        isOpen: true,
        onSubmit: mockSubmit,
      })
    );

    // Update some fields
    act(() => {
      result.current.updateFormData({
        name: "Test Goal",
        targetAmount: "5000",
      });
    });

    expect(result.current.isDirty).toBe(true);

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.data.name).toBe("");
    expect(result.current.data.targetAmount).toBe("");
    expect(result.current.isDirty).toBe(false);
  });

  it("should update form when goal prop changes", () => {
    const { result, rerender } = renderHook(
      ({ goal }) =>
        useSavingsGoalFormValidated({
          goal,
          isOpen: true,
          onSubmit: mockSubmit,
        }),
      {
        initialProps: { goal: null },
      }
    );

    expect(result.current.data.name).toBe("");

    // Change goal prop
    rerender({ goal: mockGoal });

    expect(result.current.data.name).toBe("Emergency Fund");
    expect(result.current.isEditMode).toBe(true);
  });
});
