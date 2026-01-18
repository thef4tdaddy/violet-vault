/**
 * Tests for CSV Parser utility
 */

import { describe, it, expect } from "vitest";
import { parseCSV, autoDetectFieldMapping } from "../csvParser";

describe("csvParser", () => {
  describe("parseCSV", () => {
    it("should parse simple CSV with headers", () => {
      const csvContent = `date,amount,description
2024-01-01,100.00,Grocery Store
2024-01-02,50.00,Gas Station`;

      const result = parseCSV(csvContent);

      expect(result.headers).toEqual(["date", "amount", "description"]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({
        date: "2024-01-01",
        amount: "100.00",
        description: "Grocery Store",
      });
      expect(result.errors).toHaveLength(0);
    });

    it("should handle quoted fields with commas", () => {
      const csvContent = `date,amount,description
2024-01-01,100.00,"Store, Inc"
2024-01-02,50.00,"Gas, Station"`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].description).toBe("Store, Inc");
      expect(result.rows[1].description).toBe("Gas, Station");
    });

    it("should handle escaped quotes in fields", () => {
      const csvContent = `date,amount,description
2024-01-01,100.00,"Store ""Best"" Mart"`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].description).toBe('Store "Best" Mart');
    });

    it("should skip empty lines", () => {
      const csvContent = `date,amount,description
2024-01-01,100.00,Store

2024-01-02,50.00,Gas`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(2);
    });

    it("should report errors for rows with wrong column count", () => {
      const csvContent = `date,amount,description
2024-01-01,100.00,Store
2024-01-02,50.00
2024-01-03,75.00,Gas`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(3);
    });

    it("should handle empty CSV", () => {
      const csvContent = "";

      const result = parseCSV(csvContent);

      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([]);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle CSV with only headers", () => {
      const csvContent = "date,amount,description";

      const result = parseCSV(csvContent);

      expect(result.headers).toEqual(["date", "amount", "description"]);
      expect(result.rows).toEqual([]);
      expect(result.errors).toHaveLength(0);
    });

    it("should trim whitespace from fields", () => {
      const csvContent = `date,amount,description
  2024-01-01  ,  100.00  ,  Store  `;

      const result = parseCSV(csvContent);

      expect(result.rows[0]).toEqual({
        date: "2024-01-01",
        amount: "100.00",
        description: "Store",
      });
    });
  });

  describe("autoDetectFieldMapping", () => {
    it("should detect standard field names", () => {
      const headers = ["date", "amount", "description", "category"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("date");
      expect(mapping.amount).toBe("amount");
      expect(mapping.description).toBe("description");
      expect(mapping.category).toBe("category");
    });

    it("should detect transaction_date as date field", () => {
      const headers = ["transaction_date", "amount", "memo"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("transaction_date");
    });

    it("should detect memo as description field", () => {
      const headers = ["date", "amount", "memo"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.description).toBe("memo");
    });

    it("should detect merchant field", () => {
      const headers = ["date", "amount", "merchant"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.merchant).toBe("merchant");
    });

    it("should detect notes field", () => {
      const headers = ["date", "amount", "notes"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.notes).toBe("notes");
    });

    it("should handle case-insensitive headers", () => {
      const headers = ["DATE", "AMOUNT", "DESCRIPTION"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("DATE");
      expect(mapping.amount).toBe("AMOUNT");
      expect(mapping.description).toBe("DESCRIPTION");
    });

    it("should handle headers with underscores", () => {
      const headers = ["posting_date", "total_amount", "transaction_desc"];

      const mapping = autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("posting_date");
      expect(mapping.amount).toBe("total_amount");
      expect(mapping.description).toBe("transaction_desc");
    });

    it("should return empty mapping for unrecognized headers", () => {
      const headers = ["col1", "col2", "col3"];

      const mapping = autoDetectFieldMapping(headers);

      expect(Object.keys(mapping)).toHaveLength(0);
    });
  });
});
