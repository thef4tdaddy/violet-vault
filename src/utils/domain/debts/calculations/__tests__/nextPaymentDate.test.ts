import { describe, it, expect } from "vitest";
import { calculateNextPaymentDate } from "../nextPaymentDate";
import { PAYMENT_FREQUENCIES } from "@/constants/debts";

describe("nextPaymentDate", () => {
  describe("calculateNextPaymentDate", () => {
    describe("Priority 1: Related bill due date", () => {
      it("should return related bill due date when available", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
          nextPaymentDate: "2024-02-20",
        };
        const relatedBill = {
          dueDate: "2024-03-01",
        };

        const result = calculateNextPaymentDate(debt, relatedBill);
        expect(result).toBe("2024-03-01");
      });

      it("should prefer related bill due date over debt payment dates", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
          nextPaymentDate: "2024-02-20",
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };
        const relatedBill = {
          dueDate: "2024-03-10",
        };

        const result = calculateNextPaymentDate(debt, relatedBill);
        expect(result).toBe("2024-03-10");
      });

      it("should handle null related bill", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
        };

        const result = calculateNextPaymentDate(debt, null);
        expect(result).toBe("2024-02-15");
      });

      it("should handle undefined related bill", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe("2024-02-15");
      });

      it("should handle related bill without due date", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
        };
        const relatedBill = {};

        const result = calculateNextPaymentDate(debt, relatedBill);
        expect(result).toBe("2024-02-15");
      });
    });

    describe("Priority 2: Debt payment due date", () => {
      it("should return debt payment due date when no related bill", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
          nextPaymentDate: "2024-02-20",
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe("2024-02-15");
      });

      it("should prefer paymentDueDate over nextPaymentDate", () => {
        const debt = {
          paymentDueDate: "2024-02-15",
          nextPaymentDate: "2024-02-20",
          paymentHistory: [{ date: "2024-01-15" }],
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe("2024-02-15");
      });
    });

    describe("Priority 3: Debt next payment date", () => {
      it("should return string next payment date when available", () => {
        const debt = {
          nextPaymentDate: "2024-02-20",
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe("2024-02-20");
      });

      it("should convert Date object to ISO string", () => {
        const paymentDate = new Date("2024-02-20T10:30:00Z");
        const debt = {
          nextPaymentDate: paymentDate,
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe(paymentDate.toISOString());
      });

      it("should handle Date object with different time zones", () => {
        const paymentDate = new Date("2024-02-20T23:59:59.999Z");
        const debt = {
          nextPaymentDate: paymentDate,
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBe(paymentDate.toISOString());
        expect(result).toContain("2024-02-20");
      });
    });

    describe("Priority 4: Calculate from payment history - WEEKLY", () => {
      it("should add 7 days for weekly frequency", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.WEEKLY,
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setDate(expected.getDate() + 7);

        expect(result).toBe(expected.toISOString());
      });

      it("should use last payment when multiple payments exist", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.WEEKLY,
          paymentHistory: [
            { date: "2024-01-01", amount: 100 },
            { date: "2024-01-08", amount: 100 },
            { date: "2024-01-15", amount: 100 },
          ],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setDate(expected.getDate() + 7);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle weekly payment with Date object in history", () => {
        const lastPaymentDate = new Date("2024-01-15T12:00:00Z");
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.WEEKLY,
          paymentHistory: [{ date: lastPaymentDate, amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date(lastPaymentDate);
        expected.setDate(expected.getDate() + 7);

        expect(result).toBe(expected.toISOString());
      });
    });

    describe("Priority 4: Calculate from payment history - BIWEEKLY", () => {
      it("should add 14 days for biweekly frequency", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.BIWEEKLY,
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setDate(expected.getDate() + 14);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle biweekly payment with multiple history entries", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.BIWEEKLY,
          paymentHistory: [
            { date: "2024-01-01", amount: 100 },
            { date: "2024-01-15", amount: 100 },
          ],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setDate(expected.getDate() + 14);

        expect(result).toBe(expected.toISOString());
      });
    });

    describe("Priority 4: Calculate from payment history - MONTHLY", () => {
      it("should add 1 month for monthly frequency", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle month boundaries correctly", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [{ date: "2024-01-31", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-31");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle year boundary for monthly payments", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [{ date: "2024-12-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-12-15");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
        expect(result).toContain("2025-01");
      });

      it("should use monthly as default when frequency is not specified", () => {
        const debt = {
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });

      it("should use monthly for unknown frequency", () => {
        const debt = {
          paymentFrequency: "unknown-frequency",
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });
    });

    describe("Priority 4: Calculate from payment history - QUARTERLY", () => {
      it("should add 3 months for quarterly frequency", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.QUARTERLY,
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setMonth(expected.getMonth() + 3);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle quarterly payment across year boundary", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.QUARTERLY,
          paymentHistory: [{ date: "2024-11-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-11-15");
        expected.setMonth(expected.getMonth() + 3);

        expect(result).toBe(expected.toISOString());
        expect(result).toContain("2025-02");
      });
    });

    describe("Priority 4: Calculate from payment history - ANNUALLY", () => {
      it("should add 1 year for annual frequency", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.ANNUALLY,
          paymentHistory: [{ date: "2024-01-15", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setFullYear(expected.getFullYear() + 1);

        expect(result).toBe(expected.toISOString());
        expect(result).toContain("2025-01-15");
      });

      it("should handle leap year for annual payments", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.ANNUALLY,
          paymentHistory: [{ date: "2024-02-29", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-02-29");
        expected.setFullYear(expected.getFullYear() + 1);

        expect(result).toBe(expected.toISOString());
      });
    });

    describe("Edge cases and error handling", () => {
      it("should return null when no payment history exists", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBeNull();
      });

      it("should return null when payment history is empty array", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [],
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBeNull();
      });

      it("should return null when debt has no relevant fields", () => {
        const debt = {};

        const result = calculateNextPaymentDate(debt);
        expect(result).toBeNull();
      });

      it("should handle payment history entry without amount", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [{ date: "2024-01-15" }],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-01-15");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });

      it("should handle ISO date strings in payment history", () => {
        const debt = {
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [{ date: "2024-01-15T00:00:00.000Z", amount: 100 }],
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it("should handle complex debt object with all fields", () => {
        const debt = {
          id: "debt-123",
          name: "Test Debt",
          paymentDueDate: "2024-02-15",
          nextPaymentDate: "2024-02-20",
          paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
          paymentHistory: [
            { date: "2024-01-15", amount: 100 },
            { date: "2024-01-30", amount: 100 },
          ],
        };

        // Should prioritize paymentDueDate
        const result = calculateNextPaymentDate(debt);
        expect(result).toBe("2024-02-15");
      });

      it("should handle debt with only payment history for calculation", () => {
        const debt = {
          paymentHistory: [
            { date: "2023-12-01", amount: 50 },
            { date: "2024-01-01", amount: 50 },
            { date: "2024-02-01", amount: 50 },
          ],
        };

        const result = calculateNextPaymentDate(debt);
        const expected = new Date("2024-02-01");
        expected.setMonth(expected.getMonth() + 1);

        expect(result).toBe(expected.toISOString());
      });
    });

    describe("Date consistency and format", () => {
      it("should return ISO 8601 format string", () => {
        const debt = {
          nextPaymentDate: "2024-02-20",
        };

        const result = calculateNextPaymentDate(debt);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}/);
      });

      it("should maintain consistency across different frequency calculations", () => {
        const baseDate = "2024-01-15";

        const frequencies = [
          PAYMENT_FREQUENCIES.WEEKLY,
          PAYMENT_FREQUENCIES.BIWEEKLY,
          PAYMENT_FREQUENCIES.MONTHLY,
          PAYMENT_FREQUENCIES.QUARTERLY,
          PAYMENT_FREQUENCIES.ANNUALLY,
        ];

        frequencies.forEach((frequency) => {
          const debt = {
            paymentFrequency: frequency,
            paymentHistory: [{ date: baseDate, amount: 100 }],
          };

          const result = calculateNextPaymentDate(debt);
          expect(result).toBeTruthy();
          expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
      });
    });
  });
});
