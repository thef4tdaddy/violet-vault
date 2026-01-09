import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBillPayment } from "../useBillPayment";
import useBills from "../useBills";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useBudgetMetadata } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { globalToast } from "@/stores/ui/toastStore";

// Mock dependencies
vi.mock("../useBills", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(),
}));

vi.mock("@/hooks/budgeting/metadata/useBudgetMetadata", () => ({
  useBudgetMetadata: vi.fn(),
}));

vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

vi.mock("@/utils/bills/billUpdateHelpers", () => ({
  executeBillUpdate: vi.fn(async (_, { updateBill }) => {
    if (updateBill) await updateBill({ id: "1", updates: {} });
  }),
}));

describe("useBillPayment", () => {
  const mockUpdateBillAsync = vi.fn();
  const mockMarkBillPaidAsync = vi.fn();
  const mockEnvelopes = [
    { id: "env1", name: "Utilities", currentBalance: 500 },
    { id: "env2", name: "Rent", currentBalance: 100 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useBills as ReturnType<typeof vi.fn>).mockReturnValue({
      bills: [{ id: "1", name: "Electric Bill", amount: 150, envelopeId: "env1" }],
      updateBillAsync: mockUpdateBillAsync,
      markBillPaidAsync: mockMarkBillPaidAsync,
    });
    (useEnvelopes as ReturnType<typeof vi.fn>).mockReturnValue({
      envelopes: mockEnvelopes,
    });
    (useBudgetMetadata as ReturnType<typeof vi.fn>).mockReturnValue({
      unassignedCash: 1000,
    });
  });

  describe("validatePaymentFunds", () => {
    it("should allow payment if envelope has sufficient funds", () => {
      const { result } = renderHook(() => useBillPayment());
      const bill = { id: "1", name: "Electric", amount: 150, envelopeId: "env1" };

      const context = result.current.validatePaymentFunds(bill as any);
      expect(context.availableBalance).toBe(500);
      expect(context.paymentSource).toBe("envelope");
    });

    it("should throw error if envelope has insufficient funds", () => {
      const { result } = renderHook(() => useBillPayment());
      const bill = { id: "2", name: "Rent", amount: 1200, envelopeId: "env2" }; // Balance 100

      expect(() => result.current.validatePaymentFunds(bill as any)).toThrow(/Insufficient funds/);
      expect(globalToast.showError).toHaveBeenCalled();
    });

    it("should use unassigned cash if no envelope assigned", () => {
      const { result } = renderHook(() => useBillPayment());
      const bill = { id: "3", name: "Misc", amount: 100 }; // No envelopeId

      const context = result.current.validatePaymentFunds(bill as any);
      expect(context.paymentSource).toBe("unassigned");
      expect(context.availableBalance).toBe(1000);
    });
  });

  describe("handlePayBill", () => {
    it("should successfully pay a bill", async () => {
      const { result } = renderHook(() => useBillPayment());

      await act(async () => {
        await result.current.handlePayBill("1");
      });

      expect(mockMarkBillPaidAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          billId: "1",
          paidAmount: 150,
        })
      );
      expect(globalToast.showSuccess).toHaveBeenCalled();
    });

    it("should fail if bill validation fails", async () => {
      const { result } = renderHook(() => useBillPayment());
      // Try to pay bill that exists but has too high amount for envelope (env2 has 100)
      // We need to valid mock data for this scenario.
      // The hook uses logic: selectBillForPayment from `tanStackBills`.
      // We mocked `tanStackBills` with ID "1".
      // Let's add another bill to `useBills` mock.
      (useBills as ReturnType<typeof vi.fn>).mockReturnValue({
        bills: [
          { id: "1", name: "Electric Bill", amount: 150, envelopeId: "env1" },
          { id: "over", name: "Expensive", amount: 200, envelopeId: "env2" }, // env2 has 100
        ],
        updateBillAsync: mockUpdateBillAsync,
        markBillPaidAsync: mockMarkBillPaidAsync,
      });

      await expect(result.current.handlePayBill("over")).rejects.toThrow();
      expect(mockMarkBillPaidAsync).not.toHaveBeenCalled();
    });
  });
});
