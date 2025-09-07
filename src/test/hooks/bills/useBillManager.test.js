/**
 * useBillManager Hook Tests
 * Tests for the main bill management business logic hook
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBillManager } from "../../../hooks/bills/useBillManager";

// Mock all the dependencies
vi.mock("../../../hooks/common/useTransactions", () => ({
  useTransactions: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

vi.mock("../../../hooks/budgeting/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [],
    isLoading: false,
  })),
}));

vi.mock("../../../hooks/bills/useBills", () => ({
  default: vi.fn(() => ({
    bills: [],
    addBill: vi.fn(),
    updateBill: vi.fn(),
    deleteBill: vi.fn(),
    markBillPaid: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("../../../hooks/bills/useBillOperations", () => ({
  useBillOperations: vi.fn(() => ({
    handleBulkUpdate: vi.fn(() => ({ success: true })),
    markAsPaid: vi.fn(),
  })),
}));

vi.mock("../../../stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    allTransactions: [],
    envelopes: [],
    bills: [],
  })),
}));

vi.mock("../../../utils/bills/recurringBillUtils", () => ({
  processRecurringBill: vi.fn((bill) => bill),
}));

vi.mock("../../../utils/common/billDiscovery", () => ({
  generateBillSuggestions: vi.fn(() => [
    { id: "discovered-1", name: "Discovered Bill 1", amount: 50 },
    { id: "discovered-2", name: "Discovered Bill 2", amount: 75 },
  ]),
}));

vi.mock("../../../utils/bills/billCalculations", () => ({
  processBillCalculations: vi.fn((bill) => ({
    ...bill,
    daysUntilDue: 5,
    urgency: "soon",
  })),
  categorizeBills: vi.fn((bills) => ({
    upcoming: bills.filter((b) => !b.isPaid && b.daysUntilDue >= 0),
    overdue: bills.filter((b) => !b.isPaid && b.daysUntilDue < 0),
    paid: bills.filter((b) => b.isPaid),
    all: bills,
  })),
  calculateBillTotals: vi.fn((categorized) => ({
    upcoming: 300,
    overdue: 100,
    paid: 200,
    total: 600,
  })),
  filterBills: vi.fn((bills) => bills),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useBillManager Hook", () => {
  const mockProps = {
    propTransactions: [],
    propEnvelopes: [],
    onUpdateBill: vi.fn(),
    onCreateRecurringBill: vi.fn(),
    onSearchNewBills: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default state values", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.selectedBills).toEqual(new Set());
      expect(result.current.viewMode).toBe("upcoming");
      expect(result.current.isSearching).toBe(false);
      expect(result.current.showAddBillModal).toBe(false);
      expect(result.current.editingBill).toBe(null);
      expect(result.current.showBulkUpdateModal).toBe(false);
      expect(result.current.showDiscoveryModal).toBe(false);
      expect(result.current.discoveredBills).toEqual([]);
      expect(result.current.historyBill).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it("should initialize filter options correctly", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.filterOptions).toEqual({
        search: "",
        urgency: "all",
        envelope: "",
        amountMin: "",
        amountMax: "",
      });
    });
  });

  describe("Data Resolution", () => {
    it("should prioritize prop data over hook data", () => {
      const useTransactions = vi.mocked(
        require("../../../hooks/common/useTransactions").useTransactions,
      );
      const useEnvelopes = vi.mocked(
        require("../../../hooks/budgeting/useEnvelopes").useEnvelopes,
      );

      useTransactions.mockReturnValue({
        data: [{ id: "hook-transaction" }],
        isLoading: false,
      });

      useEnvelopes.mockReturnValue({
        envelopes: [{ id: "hook-envelope" }],
        isLoading: false,
      });

      const propsWithData = {
        ...mockProps,
        propTransactions: [{ id: "prop-transaction" }],
        propEnvelopes: [{ id: "prop-envelope" }],
      };

      const { result } = renderHook(() => useBillManager(propsWithData));

      expect(result.current.transactions).toEqual([{ id: "prop-transaction" }]);
      expect(result.current.envelopes).toEqual([{ id: "prop-envelope" }]);
    });

    it("should fall back to hook data when props are empty", () => {
      const useTransactions = vi.mocked(
        require("../../../hooks/common/useTransactions").useTransactions,
      );
      const useEnvelopes = vi.mocked(
        require("../../../hooks/budgeting/useEnvelopes").useEnvelopes,
      );

      useTransactions.mockReturnValue({
        data: [{ id: "hook-transaction" }],
        isLoading: false,
      });

      useEnvelopes.mockReturnValue({
        envelopes: [{ id: "hook-envelope" }],
        isLoading: false,
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.transactions).toEqual([{ id: "hook-transaction" }]);
      expect(result.current.envelopes).toEqual([{ id: "hook-envelope" }]);
    });
  });

  describe("Bill Processing", () => {
    it("should process bills with calculations", () => {
      const useBills = vi.mocked(
        require("../../../hooks/bills/useBills").default,
      );
      const processBillCalculations = vi.mocked(
        require("../../../utils/bills/billCalculations")
          .processBillCalculations,
      );

      useBills.mockReturnValue({
        bills: [{ id: "bill-1", name: "Test Bill", amount: 100 }],
        addBill: vi.fn(),
        updateBill: vi.fn(),
        deleteBill: vi.fn(),
        markBillPaid: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      expect(processBillCalculations).toHaveBeenCalledWith(
        expect.objectContaining({ id: "bill-1", name: "Test Bill" }),
      );
      expect(result.current.bills).toEqual([
        expect.objectContaining({
          id: "bill-1",
          name: "Test Bill",
          daysUntilDue: 5,
          urgency: "soon",
        }),
      ]);
    });

    it("should categorize and calculate totals", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.totals).toEqual({
        upcoming: 300,
        overdue: 100,
        paid: 200,
        total: 600,
      });
    });
  });

  describe("Bill Search and Discovery", () => {
    it("should search for new bills", async () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      await act(async () => {
        await result.current.searchNewBills();
      });

      expect(result.current.discoveredBills).toEqual([
        { id: "discovered-1", name: "Discovered Bill 1", amount: 50 },
        { id: "discovered-2", name: "Discovered Bill 2", amount: 75 },
      ]);
      expect(result.current.showDiscoveryModal).toBe(true);
      expect(mockProps.onSearchNewBills).toHaveBeenCalled();
    });

    it("should handle search errors", async () => {
      const generateBillSuggestions = vi.mocked(
        require("../../../utils/common/billDiscovery").generateBillSuggestions,
      );
      generateBillSuggestions.mockImplementation(() => {
        throw new Error("Search failed");
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      await act(async () => {
        await result.current.searchNewBills();
      });

      expect(mockProps.onError).toHaveBeenCalledWith("Search failed");
      expect(result.current.isSearching).toBe(false);
    });

    it("should add discovered bills", async () => {
      const useBills = vi.mocked(
        require("../../../hooks/bills/useBills").default,
      );
      const mockAddBill = vi.fn();

      useBills.mockReturnValue({
        bills: [],
        addBill: mockAddBill,
        updateBill: vi.fn(),
        deleteBill: vi.fn(),
        markBillPaid: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      const billsToAdd = [
        { id: "new-1", name: "New Bill 1" },
        { id: "new-2", name: "New Bill 2" },
      ];

      await act(async () => {
        await result.current.handleAddDiscoveredBills(billsToAdd);
      });

      expect(mockAddBill).toHaveBeenCalledTimes(2);
      expect(mockAddBill).toHaveBeenCalledWith({
        id: "new-1",
        name: "New Bill 1",
      });
      expect(mockAddBill).toHaveBeenCalledWith({
        id: "new-2",
        name: "New Bill 2",
      });
      expect(result.current.showDiscoveryModal).toBe(false);
      expect(result.current.discoveredBills).toEqual([]);
    });
  });

  describe("Bulk Operations", () => {
    it("should handle bulk update", async () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      // Set some selected bills
      act(() => {
        result.current.setSelectedBills(new Set(["bill-1", "bill-2"]));
      });

      const updatedBills = [
        { id: "bill-1", name: "Updated Bill 1" },
        { id: "bill-2", name: "Updated Bill 2" },
      ];

      await act(async () => {
        await result.current.handleBulkUpdate(updatedBills);
      });

      expect(result.current.selectedBills.size).toBe(0);
    });
  });

  describe("UI State Management", () => {
    it("should update view mode", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      act(() => {
        result.current.setViewMode("overdue");
      });

      expect(result.current.viewMode).toBe("overdue");
    });

    it("should manage selected bills", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      act(() => {
        result.current.setSelectedBills(new Set(["bill-1", "bill-2"]));
      });

      expect(result.current.selectedBills).toEqual(
        new Set(["bill-1", "bill-2"]),
      );
    });

    it("should manage modal states", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      act(() => {
        result.current.setShowAddBillModal(true);
        result.current.setEditingBill({ id: "edit-bill" });
        result.current.setShowBulkUpdateModal(true);
      });

      expect(result.current.showAddBillModal).toBe(true);
      expect(result.current.editingBill).toEqual({ id: "edit-bill" });
      expect(result.current.showBulkUpdateModal).toBe(true);
    });

    it("should update filter options", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      act(() => {
        result.current.setFilterOptions({
          search: "electric",
          urgency: "overdue",
        });
      });

      expect(result.current.filterOptions).toEqual({
        search: "electric",
        urgency: "overdue",
      });
    });
  });

  describe("Loading States", () => {
    it("should aggregate loading states from hooks", () => {
      const useTransactions = vi.mocked(
        require("../../../hooks/common/useTransactions").useTransactions,
      );
      const useEnvelopes = vi.mocked(
        require("../../../hooks/budgeting/useEnvelopes").useEnvelopes,
      );
      const useBills = vi.mocked(
        require("../../../hooks/bills/useBills").default,
      );

      useTransactions.mockReturnValue({
        data: [],
        isLoading: true,
      });

      useEnvelopes.mockReturnValue({
        envelopes: [],
        isLoading: false,
      });

      useBills.mockReturnValue({
        bills: [],
        addBill: vi.fn(),
        updateBill: vi.fn(),
        deleteBill: vi.fn(),
        markBillPaid: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors in bill discovery", async () => {
      const generateBillSuggestions = vi.mocked(
        require("../../../utils/common/billDiscovery").generateBillSuggestions,
      );

      generateBillSuggestions.mockImplementation(() => {
        throw new Error("Discovery failed");
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      await act(async () => {
        await result.current.searchNewBills();
      });

      expect(mockProps.onError).toHaveBeenCalledWith("Discovery failed");
    });

    it("should handle errors when adding discovered bills", async () => {
      const useBills = vi.mocked(
        require("../../../hooks/bills/useBills").default,
      );
      const mockAddBill = vi.fn().mockRejectedValue(new Error("Add failed"));

      useBills.mockReturnValue({
        bills: [],
        addBill: mockAddBill,
        updateBill: vi.fn(),
        deleteBill: vi.fn(),
        markBillPaid: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useBillManager(mockProps));

      await act(async () => {
        await result.current.handleAddDiscoveredBills([{ id: "fail-bill" }]);
      });

      expect(mockProps.onError).toHaveBeenCalledWith("Add failed");
    });
  });

  describe("Integration with useBillOperations", () => {
    it("should provide bill operations", () => {
      const { result } = renderHook(() => useBillManager(mockProps));

      expect(result.current.billOperations).toBeDefined();
      expect(typeof result.current.billOperations.handleBulkUpdate).toBe(
        "function",
      );
      expect(typeof result.current.billOperations.markAsPaid).toBe("function");
    });
  });
});
