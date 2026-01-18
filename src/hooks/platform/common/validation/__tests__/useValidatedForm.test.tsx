/**
 * Tests for useValidatedForm Hook
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useValidatedForm } from "../useValidatedForm";

describe("useValidatedForm", () => {
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    age: z.number().min(0, "Age must be positive"),
  });

  const initialData = {
    name: "John",
    email: "john@example.com",
    age: 25,
  };

  it("should initialize with provided data", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("should update field value", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    act(() => {
      result.current.updateField("name", "Jane");
    });

    expect(result.current.data.name).toBe("Jane");
    expect(result.current.isDirty).toBe(true);
  });

  it("should update multiple fields", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    act(() => {
      result.current.updateFormData({
        name: "Jane",
        email: "jane@example.com",
      });
    });

    expect(result.current.data.name).toBe("Jane");
    expect(result.current.data.email).toBe("jane@example.com");
    expect(result.current.isDirty).toBe(true);
  });

  it("should validate form and set errors", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData: {
          name: "",
          email: "invalid",
          age: -5,
        },
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBe("Name is required");
    expect(result.current.errors.email).toBe("Invalid email");
    expect(result.current.errors.age).toBe("Age must be positive");
    expect(result.current.isValid).toBe(false);
  });

  it("should clear errors for updated fields", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData: {
          name: "",
          email: "invalid",
          age: 25,
        },
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBe("Name is required");
    expect(result.current.errors.email).toBe("Invalid email");

    act(() => {
      result.current.updateField("name", "John");
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBe("Invalid email");
  });

  it("should clear all errors", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData: {
          name: "",
          email: "invalid",
          age: 25,
        },
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should set and clear specific field errors", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    act(() => {
      result.current.setFieldError("name", "Custom error");
    });

    expect(result.current.getFieldError("name")).toBe("Custom error");
    expect(result.current.hasError("name")).toBe(true);

    act(() => {
      result.current.clearError("name");
    });

    expect(result.current.getFieldError("name")).toBeUndefined();
    expect(result.current.hasError("name")).toBe(false);
  });

  it("should reset form to initial state", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    act(() => {
      result.current.updateField("name", "Jane");
      result.current.setFieldError("email", "Test error");
    });

    expect(result.current.data.name).toBe("Jane");
    expect(result.current.errors.email).toBe("Test error");
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it("should handle form submission with valid data", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith(initialData);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should not submit with invalid data", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData: {
          name: "",
          email: "invalid",
          age: 25,
        },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe("Name is required");
    expect(result.current.errors.email).toBe("Invalid email");
  });

  it("should handle submission errors", async () => {
    const error = new Error("Submission failed");
    const onSubmit = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
        onSubmit,
      })
    );

    await expect(async () => {
      await act(async () => {
        await result.current.handleSubmit();
      });
    }).rejects.toThrow("Submission failed");

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should validate on change when enabled", async () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
        validateOnChange: true,
      })
    );

    act(() => {
      result.current.updateField("email", "invalid");
    });

    // Wait for async validation
    await waitFor(() => {
      expect(result.current.errors.email).toBe("Invalid email");
    });
  });

  it("should not validate on change when disabled", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
        validateOnChange: false,
      })
    );

    act(() => {
      result.current.updateField("email", "invalid");
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it("should track isDirty state correctly", () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        schema: testSchema,
        initialData,
      })
    );

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.updateField("name", "Jane");
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.isDirty).toBe(false);
  });
});
