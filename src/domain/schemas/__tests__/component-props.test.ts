import { describe, it, expect } from "vitest";
import {
  EnvelopeGridPropsSchema,
  TransactionTablePropsSchema,
  BillTablePropsSchema,
  MainDashboardPropsSchema,
  EnvelopeItemPropsSchema,
  TransactionRowPropsSchema,
  BillItemPropsSchema,
  AnalyticsDashboardPropsSchema,
} from "../component-props";

describe("Component Props Schemas", () => {
  describe("EnvelopeGridPropsSchema", () => {
    it("should validate valid EnvelopeGrid props", () => {
      const validProps = {
        envelopes: [
          {
            id: "1",
            name: "Groceries",
            category: "Food",
            archived: false,
            lastModified: Date.now(),
            currentBalance: 100,
            targetAmount: 500,
          },
        ],
        transactions: [
          {
            id: "1",
            date: new Date(),
            amount: -50,
            envelopeId: "1",
            category: "Food",
            type: "expense" as const,
            lastModified: Date.now(),
          },
        ],
        unassignedCash: 100,
        className: "custom-class",
      };

      const result = EnvelopeGridPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.envelopes).toHaveLength(1);
      expect(result.unassignedCash).toBe(100);
    });

    it("should apply defaults for missing optional props", () => {
      const minimalProps = {};

      const result = EnvelopeGridPropsSchema.parse(minimalProps);
      expect(result.envelopes).toEqual([]);
      expect(result.transactions).toEqual([]);
      expect(result.className).toBe("");
      expect(result.unassignedCash).toBeUndefined();
    });

    it("should accept negative unassignedCash (overallocated scenario)", () => {
      const validProps = {
        unassignedCash: -100,
      };

      const result = EnvelopeGridPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.unassignedCash).toBe(-100);
    });

    it("should reject invalid envelope data", () => {
      const invalidProps = {
        envelopes: [{ id: "", name: "" }], // Missing required fields
      };

      expect(() => EnvelopeGridPropsSchema.parse(invalidProps)).toThrow();
    });
  });

  describe("TransactionTablePropsSchema", () => {
    it("should validate valid TransactionTable props with callbacks", () => {
      const validProps = {
        transactions: [
          {
            id: "1",
            date: "2025-01-01",
            amount: 50,
            envelopeId: "1",
            category: "Food",
            type: "expense" as const,
            lastModified: Date.now(),
          },
        ],
        envelopes: [],
        onEdit: () => {},
        onDelete: () => {},
        onSplit: () => {},
      };

      const result = TransactionTablePropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(typeof result.onEdit).toBe("function");
      expect(typeof result.onDelete).toBe("function");
      expect(typeof result.onSplit).toBe("function");
    });

    it("should apply defaults for optional arrays", () => {
      const minimalProps = {
        onEdit: () => {},
        onDelete: () => {},
        onSplit: () => {},
      };

      const result = TransactionTablePropsSchema.parse(minimalProps);
      expect(result.transactions).toEqual([]);
      expect(result.envelopes).toEqual([]);
    });

    it("should reject missing required callbacks", () => {
      const invalidProps = {
        transactions: [],
        envelopes: [],
        // Missing onEdit, onDelete, onSplit
      };

      expect(() => TransactionTablePropsSchema.parse(invalidProps)).toThrow();
    });
  });

  describe("BillTablePropsSchema", () => {
    it("should validate valid BillTable props", () => {
      const validProps = {
        filteredBills: [
          {
            id: "1",
            name: "Electric Bill",
            dueDate: "2025-01-15",
            amount: 100,
            category: "Utilities",
            isPaid: false,
            isRecurring: true,
            lastModified: Date.now(),
          },
        ],
        selectionState: {
          selectedBillIds: ["1"],
          isAllSelected: false,
          hasSelection: true,
          selectedCount: 1,
        },
        clearSelection: () => {},
        selectAllBills: () => {},
        toggleBillSelection: () => {},
        setShowBulkUpdateModal: () => {},
        setShowBillDetail: () => {},
        getBillDisplayData: () => ({}),
        billOperations: {
          handlePayBill: () => {},
        },
        categorizedBills: {},
        viewMode: "list",
      };

      const result = BillTablePropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.filteredBills).toHaveLength(1);
      expect(result.selectionState.selectedBillIds).toContain("1");
    });

    it("should reject invalid bill data", () => {
      const invalidProps = {
        filteredBills: [{ id: "", name: "" }], // Missing required fields
        selectionState: { selectedBillIds: [], isAllSelected: false },
        clearSelection: () => {},
        selectAllBills: () => {},
        toggleBillSelection: () => {},
        setShowBulkUpdateModal: () => {},
        setShowBillDetail: () => {},
        getBillDisplayData: () => ({}),
        billOperations: { handlePayBill: () => {} },
        categorizedBills: {},
        viewMode: "list",
      };

      expect(() => BillTablePropsSchema.parse(invalidProps)).toThrow();
    });

    it("should reject missing required callbacks", () => {
      const invalidProps = {
        filteredBills: [],
        selectionState: { selectedBillIds: [], isAllSelected: false },
        // Missing required callbacks
      };

      expect(() => BillTablePropsSchema.parse(invalidProps)).toThrow();
    });
  });

  describe("MainDashboardPropsSchema", () => {
    it("should validate valid MainDashboard props", () => {
      const validProps = {
        setActiveView: () => {},
      };

      const result = MainDashboardPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(typeof result.setActiveView).toBe("function");
    });

    it("should reject missing setActiveView", () => {
      const invalidProps = {};

      expect(() => MainDashboardPropsSchema.parse(invalidProps)).toThrow();
    });

    it("should reject non-function setActiveView", () => {
      const invalidProps = {
        setActiveView: "not a function",
      };

      expect(() => MainDashboardPropsSchema.parse(invalidProps)).toThrow();
    });
  });

  describe("EnvelopeItemPropsSchema", () => {
    it("should validate valid EnvelopeItem props", () => {
      const validProps = {
        envelope: {
          id: "1",
          name: "Groceries",
          category: "Food",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 100,
          targetAmount: 500,
        },
        onClick: () => {},
        onEdit: () => {},
        onDelete: () => {},
        isSelected: true,
      };

      const result = EnvelopeItemPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.isSelected).toBe(true);
    });

    it("should apply defaults for optional props", () => {
      const minimalProps = {
        envelope: {
          id: "1",
          name: "Groceries",
          category: "Food",
          archived: false,
          lastModified: Date.now(),
        },
      };

      const result = EnvelopeItemPropsSchema.parse(minimalProps);
      expect(result.isSelected).toBe(false);
      expect(result.onClick).toBeUndefined();
    });
  });

  describe("TransactionRowPropsSchema", () => {
    it("should validate valid TransactionRow props", () => {
      const validProps = {
        transaction: {
          id: "1",
          date: "2025-01-01",
          amount: -50,
          envelopeId: "1",
          category: "Food",
          type: "expense" as const,
          lastModified: Date.now(),
        },
        envelopes: [],
        virtualRow: {
          index: 0,
          start: 0,
          size: 50,
        },
        onEdit: () => {},
        onSplit: () => {},
        onDeleteClick: () => {},
        onHistoryClick: () => {},
      };

      const result = TransactionRowPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.virtualRow.index).toBe(0);
    });

    it("should reject missing required callbacks", () => {
      const invalidProps = {
        transaction: {
          id: "1",
          date: "2025-01-01",
          amount: 50,
          envelopeId: "1",
          category: "Food",
          type: "expense" as const,
          lastModified: Date.now(),
        },
        envelopes: [],
        virtualRow: { index: 0, start: 0, size: 50 },
        // Missing required callbacks
      };

      expect(() => TransactionRowPropsSchema.parse(invalidProps)).toThrow();
    });
  });

  describe("BillItemPropsSchema", () => {
    it("should validate valid BillItem props", () => {
      const validProps = {
        bill: {
          id: "1",
          name: "Electric Bill",
          dueDate: "2025-01-15",
          amount: 100,
          category: "Utilities",
          isPaid: false,
          isRecurring: true,
          lastModified: Date.now(),
        },
        onClick: () => {},
        onPay: () => {},
        isSelected: true,
      };

      const result = BillItemPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.isSelected).toBe(true);
    });

    it("should apply defaults for optional props", () => {
      const minimalProps = {
        bill: {
          id: "1",
          name: "Electric Bill",
          dueDate: "2025-01-15",
          amount: 100,
          category: "Utilities",
          isPaid: false,
          isRecurring: true,
          lastModified: Date.now(),
        },
      };

      const result = BillItemPropsSchema.parse(minimalProps);
      expect(result.isSelected).toBe(false);
      expect(result.onClick).toBeUndefined();
      expect(result.onPay).toBeUndefined();
    });
  });

  describe("AnalyticsDashboardPropsSchema", () => {
    it("should validate valid AnalyticsDashboard props", () => {
      const validProps = {
        data: [{ value: 100 }, { value: 200 }],
        dateRange: {
          start: "2025-01-01",
          end: "2025-01-31",
        },
        onDateRangeChange: () => {},
      };

      const result = AnalyticsDashboardPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.dateRange?.start).toBe("2025-01-01");
    });

    it("should apply defaults for optional props", () => {
      const minimalProps = {};

      const result = AnalyticsDashboardPropsSchema.parse(minimalProps);
      expect(result.data).toEqual([]);
      expect(result.dateRange).toBeUndefined();
      expect(result.onDateRangeChange).toBeUndefined();
    });

    it("should validate date range format", () => {
      const validProps = {
        dateRange: {
          start: "2025-01-01",
          end: "2025-01-31",
        },
      };

      const result = AnalyticsDashboardPropsSchema.parse(validProps);
      expect(result.dateRange).toBeDefined();
      expect(result.dateRange?.start).toBe("2025-01-01");
      expect(result.dateRange?.end).toBe("2025-01-31");
    });
  });
});
