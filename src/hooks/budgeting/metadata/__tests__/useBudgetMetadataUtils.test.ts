import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useBudgetMetadataUtils } from "../useBudgetMetadataUtils";
import { useBudgetMetadataQuery } from "../useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "../useBudgetMetadataMutation";

// Mock the dependencies
vi.mock("../useBudgetMetadataQuery");
vi.mock("../useBudgetMetadataMutation");
vi.mock("@/utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useBudgetMetadataUtils", () => {
  const mockMutateAsync = vi.fn();
  const mockMutation = {
    mutateAsync: mockMutateAsync,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useBudgetMetadataQuery as Mock).mockReturnValue({
      actualBalance: 1000,
      isActualBalanceManual: true,
    });

    (useBudgetMetadataMutation as Mock).mockReturnValue({
      mutation: mockMutation,
    });
  });

  describe("setBiweeklyAllocation", () => {
    it("should successfully set biweekly allocation with valid number", async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(500);

      expect(success).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        biweeklyAllocation: 500,
      });
    });

    it("should return false for invalid number type", async () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation("invalid" as unknown as number);

      expect(success).toBe(false);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should return false for NaN value", async () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(NaN);

      expect(success).toBe(false);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should handle mutation error and return false", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Mutation failed"));
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(500);

      expect(success).toBe(false);
    });

    it("should accept zero as valid allocation", async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(0);

      expect(success).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        biweeklyAllocation: 0,
      });
    });

    it("should accept negative numbers as valid allocation", async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(-100);

      expect(success).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        biweeklyAllocation: -100,
      });
    });

    it("should accept decimal numbers as valid allocation", async () => {
      mockMutateAsync.mockResolvedValue(undefined);
      const { result } = renderHook(() => useBudgetMetadataUtils());

      const success = await result.current.setBiweeklyAllocation(123.45);

      expect(success).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        biweeklyAllocation: 123.45,
      });
    });
  });

  describe("getBalanceDifference", () => {
    it("should return difference when balance is manual", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const difference = result.current.getBalanceDifference(900);

      expect(difference).toBe(100);
    });

    it("should return 0 when balance is not manual", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const difference = result.current.getBalanceDifference(900);

      expect(difference).toBe(0);
    });

    it("should return 0 when calculated balance is 0", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const difference = result.current.getBalanceDifference(0);

      expect(difference).toBe(0);
    });

    it("should return 0 when calculated balance is falsy", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const difference = result.current.getBalanceDifference(null as unknown as number);

      expect(difference).toBe(0);
    });

    it("should handle negative differences", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 500,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const difference = result.current.getBalanceDifference(700);

      expect(difference).toBe(-200);
    });
  });

  describe("shouldConfirmChange", () => {
    it("should return true when change exceeds default threshold (500)", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(1600);

      expect(shouldConfirm).toBe(true);
    });

    it("should return false when change is below default threshold", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(1400);

      expect(shouldConfirm).toBe(false);
    });

    it("should use custom threshold when provided", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(1150, 100);

      expect(shouldConfirm).toBe(true);
    });

    it("should handle negative changes exceeding threshold", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(400);

      expect(shouldConfirm).toBe(true);
    });

    it("should return true when change equals threshold exactly", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(1500);

      expect(shouldConfirm).toBe(true);
    });

    it("should return true when change exceeds threshold by 1", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: true,
      });

      const { result } = renderHook(() => useBudgetMetadataUtils());
      const shouldConfirm = result.current.shouldConfirmChange(1501);

      expect(shouldConfirm).toBe(true);
    });
  });

  describe("formatBalance", () => {
    it("should format balance as currency by default", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(1234.56);

      expect(formatted).toBe("$1,234.56");
    });

    it("should format without currency symbol when showCurrency is false", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(1234.56, { showCurrency: false });

      expect(formatted).toBe("1,234.56");
    });

    it("should show sign when showSign is true for positive numbers", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(100, { showSign: true });

      expect(formatted).toBe("+$100.00");
    });

    it("should show sign when showSign is true for negative numbers", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(-100, { showSign: true });

      expect(formatted).toBe("-$100.00");
    });

    it("should use custom minimumFractionDigits", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(100, { minimumFractionDigits: 0 });

      expect(formatted).toBe("$100");
    });

    it("should use custom maximumFractionDigits", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(100.123456, { maximumFractionDigits: 4 });

      expect(formatted).toBe("$100.1235");
    });

    it("should handle zero balance", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(0);

      expect(formatted).toBe("$0.00");
    });

    it("should handle null/undefined balance as zero", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(null as unknown as number);

      expect(formatted).toBe("$0.00");
    });

    it("should handle large numbers", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(1000000);

      expect(formatted).toBe("$1,000,000.00");
    });

    it("should combine multiple options", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const formatted = result.current.formatBalance(1234.56, {
        showCurrency: false,
        showSign: true,
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });

      expect(formatted).toBe("+1,234.560");
    });
  });

  describe("validateBalanceInput", () => {
    it("should accept valid positive integer", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(123);
    });

    it("should accept valid positive decimal", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123.45");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(123.45);
    });

    it("should accept valid negative integer", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("-123");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(-123);
    });

    it("should accept valid negative decimal", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("-123.45");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(-123.45);
    });

    it("should accept empty string and return 0", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(0);
    });

    it("should accept single minus sign and return 0", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("-");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(0);
    });

    it("should accept single decimal point and return 0", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput(".");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(0);
    });

    it("should accept zero", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("0");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(0);
    });

    it("should accept decimal starting with dot", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput(".5");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(0.5);
    });

    it("should accept negative decimal starting with dot", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("-.5");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(-0.5);
    });

    it("should reject invalid format with letters", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123abc");

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid number format");
    });

    it("should reject invalid format with special characters", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123$");

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid number format");
    });

    it("should reject multiple decimal points", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123.45.67");

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid number format");
    });

    it("should reject multiple minus signs", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("--123");

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid number format");
    });

    it("should reject minus sign not at the start", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("123-45");

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid number format");
    });

    it("should accept large numbers", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("999999999.99");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(999999999.99);
    });

    it("should accept partial input during typing (digits only)", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("12");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(12);
    });

    it("should accept partial input during typing (with decimal)", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("12.");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(12);
    });

    it("should accept partial input during typing (negative with decimal)", () => {
      const { result } = renderHook(() => useBudgetMetadataUtils());
      const validation = result.current.validateBalanceInput("-12.");

      expect(validation.isValid).toBe(true);
      expect(validation.parsedValue).toBe(-12);
    });
  });

  describe("hook stability", () => {
    it("should return stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadataUtils());

      const firstRender = {
        setBiweeklyAllocation: result.current.setBiweeklyAllocation,
        getBalanceDifference: result.current.getBalanceDifference,
        shouldConfirmChange: result.current.shouldConfirmChange,
        formatBalance: result.current.formatBalance,
        validateBalanceInput: result.current.validateBalanceInput,
      };

      rerender();

      expect(result.current.setBiweeklyAllocation).toBe(firstRender.setBiweeklyAllocation);
      expect(result.current.getBalanceDifference).toBe(firstRender.getBalanceDifference);
      expect(result.current.shouldConfirmChange).toBe(firstRender.shouldConfirmChange);
      expect(result.current.formatBalance).toBe(firstRender.formatBalance);
      expect(result.current.validateBalanceInput).toBe(firstRender.validateBalanceInput);
    });

    it("should update getBalanceDifference when dependencies change", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadataUtils());

      const difference1 = result.current.getBalanceDifference(900);
      expect(difference1).toBe(100);

      // Update the mock to return different values
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 2000,
        isActualBalanceManual: true,
      });

      rerender();

      const difference2 = result.current.getBalanceDifference(900);
      expect(difference2).toBe(1100);
    });

    it("should update shouldConfirmChange when dependencies change", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadataUtils());

      const shouldConfirm1 = result.current.shouldConfirmChange(1600);
      expect(shouldConfirm1).toBe(true);

      // Update the mock to return different values
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        actualBalance: 2000,
        isActualBalanceManual: true,
      });

      rerender();

      const shouldConfirm2 = result.current.shouldConfirmChange(1600);
      expect(shouldConfirm2).toBe(false);
    });
  });
});
