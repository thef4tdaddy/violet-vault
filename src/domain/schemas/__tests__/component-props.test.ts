import { describe, it, expect } from "vitest";
import {
  EnvelopeGridPropsSchema,
  TransactionTablePropsSchema,
  BillTablePropsSchema,
  MainDashboardPropsSchema,
  EnvelopeItemPropsSchema,
  TransactionRowPropsSchema,
} from "../component-props";

describe("Component Props Schemas", () => {
  const now = Date.now();

  describe("EnvelopeGridPropsSchema", () => {
    it("should validate valid EnvelopeGrid props", () => {
      const validProps = {
        envelopes: [
          {
            id: "1",
            name: "Groceries",
            category: "Food",
            type: "standard",
            archived: false,
            lastModified: now,
          },
        ],
        transactions: [
          {
            id: "1",
            date: new Date().toISOString(),
            amount: -50,
            envelopeId: "1",
            category: "Food",
            type: "expense",
            lastModified: now,
            description: "Test",
          },
        ],
        unassignedCash: 100,
        className: "custom-class",
      };

      const result = EnvelopeGridPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.envelopes).toHaveLength(1);
    });
  });

  describe("TransactionTablePropsSchema", () => {
    it("should validate valid TransactionTable props with callbacks", () => {
      const validProps = {
        transactions: [],
        envelopes: [],
        onEdit: () => {},
        onDelete: () => {},
        onSplit: () => {},
      };

      const result = TransactionTablePropsSchema.parse(validProps);
      expect(result).toBeDefined();
    });
  });

  describe("MainDashboardPropsSchema", () => {
    it("should validate valid MainDashboard props", () => {
      const validProps = {
        setActiveView: () => {},
      };

      const result = MainDashboardPropsSchema.parse(validProps);
      expect(result).toBeDefined();
    });
  });

  describe("EnvelopeItemPropsSchema", () => {
    it("should validate valid EnvelopeItem props", () => {
      const validProps = {
        envelope: {
          id: "1",
          name: "Groceries",
          category: "Food",
          type: "standard",
          archived: false,
          lastModified: now,
        },
        isSelected: true,
      };

      const result = EnvelopeItemPropsSchema.parse(validProps);
      expect(result).toBeDefined();
      expect(result.isSelected).toBe(true);
    });
  });

  describe("TransactionRowPropsSchema", () => {
    it("should validate valid TransactionRow props", () => {
      const validProps = {
        transaction: {
          id: "1",
          date: new Date().toISOString(),
          amount: -50,
          envelopeId: "1",
          category: "Food",
          type: "expense",
          lastModified: now,
          description: "Test",
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
    });
  });
});
