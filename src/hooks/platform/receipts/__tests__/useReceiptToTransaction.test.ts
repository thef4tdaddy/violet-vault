import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReceiptToTransaction } from "../useReceiptToTransaction";

// Mocks
const mockAddReceiptAsync = vi.fn();
const mockAddTransactionAsync = vi.fn();

vi.mock("@/hooks/platform/data/useReceipts", () => ({
  useReceipts: () => ({
    addReceiptAsync: mockAddReceiptAsync,
  }),
}));

vi.mock("@/hooks/budgeting/transactions/useTransactionOperations", () => ({
  useTransactionOperations: () => ({
    addTransaction: mockAddTransactionAsync,
  }),
}));

const mockEnvelopes = [
  { id: "e1", name: "Groceries", category: "groceries" },
  { id: "e2", name: "Gas", category: "transportation" },
];

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: () => ({
    envelopes: mockEnvelopes,
  }),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useReceiptToTransaction", () => {
  const mockReceiptData = {
    merchant: "Walmart",
    total: 50.0,
    date: "2024-03-15",
    imageData: "base64:image",
    rawText: "WALMART",
    confidence: 0.95,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddReceiptAsync.mockResolvedValue({ id: "r1" });
    mockAddTransactionAsync.mockResolvedValue({ id: "t1" });
  });

  it("should initialize form with receipt data", () => {
    const { result } = renderHook(() => useReceiptToTransaction(mockReceiptData));

    expect(result.current.transactionForm).toMatchObject({
      description: "Walmart",
      amount: "50",
      date: "2024-03-15",
    });
  });

  it("should suggest envelope based on merchant keyword", () => {
    const { result } = renderHook(() => useReceiptToTransaction(mockReceiptData));

    // Walmart -> Groceries envelope (e1) due to keyword match
    expect(result.current.transactionForm.envelopeId).toBe("e1");
  });

  it("should handle form field updates", () => {
    const { result } = renderHook(() => useReceiptToTransaction(mockReceiptData));

    act(() => {
      result.current.handleFormChange("notes", "Weekly groceries");
    });

    expect(result.current.transactionForm.notes).toBe("Weekly groceries");
  });

  it("should handle step navigation", () => {
    const { result } = renderHook(() => useReceiptToTransaction(mockReceiptData));

    expect(result.current.step).toBe(1);

    act(() => {
      result.current.handleNext();
    });
    expect(result.current.step).toBe(2);

    act(() => {
      result.current.handleBack();
    });
    expect(result.current.step).toBe(1);
  });

  it("should submit transaction and receipt successfully", async () => {
    const { result } = renderHook(() => useReceiptToTransaction(mockReceiptData));

    // Ensure form is valid
    act(() => {
      result.current.handleFormChange("envelopeId", "e1");
    });

    const submitResult = await act(async () => {
      return await result.current.handleSubmit();
    });

    expect(mockAddTransactionAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Walmart",
        amount: 50,
      })
    );

    expect(mockAddReceiptAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        merchant: "Walmart",
        transactionId: "t1",
      })
    );

    expect(submitResult.success).toBe(true);
    expect(submitResult.transaction).toBe("r1"); // Returns receipt ID
  });

  it("should validate required fields before submission", async () => {
    const { result } = renderHook(() => useReceiptToTransaction({} as any));

    const submitResult = await act(async () => {
      return await result.current.handleSubmit();
    });

    expect(submitResult.success).toBe(false);
    expect(submitResult.error).toContain("required");
    expect(mockAddTransactionAsync).not.toHaveBeenCalled();
  });
});
