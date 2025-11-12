/**
 * Tests for Amazon Receipt Parser
 */

import { describe, it, expect } from "vitest";
import { parseAmazonReceipt, parseAmazonReceipts } from "../amazonReceiptParser";

describe("amazonReceiptParser", () => {
  describe("parseAmazonReceipt", () => {
    it("should parse a basic Amazon receipt", () => {
      const emailData = {
        content: `
          Order #123-4567890-1234567
          Order Total: $45.99
          1 of Wireless Mouse $25.99
          Shipping: $5.00
          Tax: $3.50
          Delivery: Monday, November 15
          Tracking: 1Z999AA10123456784
        `,
        subject: "Your Amazon.com order #123-4567890-1234567",
        date: "2024-11-12T10:00:00Z",
        messageId: "msg-123",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.orderId).toBe("123-4567890-1234567");
      expect(result?.total).toBe(45.99);
      expect(result?.shipping).toBe(5.0);
      expect(result?.tax).toBe(3.5);
      expect(result?.items).toHaveLength(1);
      expect(result?.items[0].name).toBe("Wireless Mouse");
      expect(result?.items[0].price).toBe(25.99);
      expect(result?.items[0].quantity).toBe(1);
      expect(result?.primaryCategory).toBe("Electronics & Tech");
      expect(result?.source).toBe("amazon_email");
    });

    it("should parse receipt with multiple items", () => {
      const emailData = {
        content: `
          Order #987-6543210-9876543
          Order Total: $125.50
          2 of USB-C Cable $15.99
          1 of Laptop Stand $45.00
          3 of Sticky Notes Pack $8.99
          Shipping: $0.00
          Tax: $9.52
        `,
        subject: "Your Amazon order confirmation",
        date: "2024-11-12T14:30:00Z",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.items).toHaveLength(3);
      expect(result?.items[0].quantity).toBe(2);
      expect(result?.items[1].quantity).toBe(1);
      expect(result?.items[2].quantity).toBe(3);
      expect(result?.shipping).toBe(0);
    });

    it("should categorize food items correctly", () => {
      const emailData = {
        content: `
          Order #111-2222333-4444555
          Order Total: $35.99
          1 of Organic Whole Milk $5.99
          2 of Fresh Strawberries $8.00
          Shipping: $0.00
          Tax: $2.00
        `,
        subject: "Amazon Fresh order delivered",
        date: "2024-11-12T08:00:00Z",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.primaryCategory).toBe("Groceries & Food");
      expect(result?.categoryIcon).toBe("🛒");
    });

    it("should handle missing optional fields", () => {
      const emailData = {
        content: `
          Order #555-6666777-8888999
          Order Total: $15.00
        `,
        subject: "Your order",
        date: "2024-11-12T12:00:00Z",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.items).toHaveLength(0);
      expect(result?.shipping).toBe(0);
      expect(result?.tax).toBe(0);
      expect(result?.deliveryDate).toBeNull();
      expect(result?.trackingNumber).toBeNull();
    });

    it("should preserve raw email data", () => {
      const emailData = {
        content: "Order #123 Total: $10.00",
        subject: "Test order",
        date: "2024-11-12T10:00:00Z",
        messageId: "test-msg-id",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.rawEmail).toEqual(emailData);
      expect(result?.rawEmail.messageId).toBe("test-msg-id");
    });
  });

  describe("parseAmazonReceipts", () => {
    it("should parse multiple receipts", () => {
      const emailDataArray = [
        {
          content: "Order #123 Total: $25.00",
          subject: "Order 1",
          date: "2024-11-12T10:00:00Z",
        },
        {
          content: "Order #456 Total: $35.00",
          subject: "Order 2",
          date: "2024-11-12T11:00:00Z",
        },
      ];

      const results = parseAmazonReceipts(emailDataArray);

      expect(results).toHaveLength(2);
      expect(results[0].orderId).toBe("123");
      expect(results[1].orderId).toBe("456");
    });

    it("should handle empty array", () => {
      const results = parseAmazonReceipts([]);

      expect(results).toHaveLength(0);
    });
  });

  describe("category detection", () => {
    const testCategories = [
      { item: "Kindle Paperwhite", expected: "Electronics & Tech" },
      { item: "Organic Spinach", expected: "Groceries & Food" },
      { item: "Coffee Maker", expected: "Home & Kitchen" },
      { item: "Running Shoes", expected: "Clothing & Accessories" },
      { item: "Vitamin D Supplements", expected: "Health & Beauty" },
      { item: "Harry Potter Book", expected: "Books & Media" },
      { item: "Yoga Mat", expected: "Sports & Outdoors" },
      { item: "Dog Food", expected: "Pet Supplies" },
      { item: "Printer Paper", expected: "Office & Business" },
      { item: "Prime Membership", expected: "Amazon Services" },
      { item: "Unknown Item XYZ", expected: "General Shopping" },
    ];

    testCategories.forEach(({ item, expected }) => {
      it(`should categorize "${item}" as "${expected}"`, () => {
        const emailData = {
          content: `
            Order #TEST-123
            Order Total: $20.00
            1 of ${item} $20.00
          `,
          subject: "Test order",
          date: "2024-11-12T10:00:00Z",
        };

        const result = parseAmazonReceipt(emailData);

        expect(result).toBeDefined();
        expect(result?.primaryCategory).toBe(expected);
      });
    });
  });

  describe("amount parsing", () => {
    it("should parse amounts with commas", () => {
      const emailData = {
        content: `
          Order #123
          Order Total: $1,234.56
          Shipping: $12.34
          Tax: $100.22
        `,
        subject: "Large order",
        date: "2024-11-12T10:00:00Z",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.total).toBe(1234.56);
      expect(result?.shipping).toBe(12.34);
      expect(result?.tax).toBe(100.22);
    });

    it("should calculate subtotal correctly", () => {
      const emailData = {
        content: `
          Order #123
          Order Total: $50.00
          Shipping: $5.00
          Tax: $3.50
        `,
        subject: "Test order",
        date: "2024-11-12T10:00:00Z",
      };

      const result = parseAmazonReceipt(emailData);

      expect(result).toBeDefined();
      expect(result?.subtotal).toBe(41.5); // 50 - 5 - 3.5
    });
  });
});
