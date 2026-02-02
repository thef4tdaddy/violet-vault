import { describe, it, expect } from "vitest";
import {
  AUTO_CLASSIFY_DEBT_TYPE,
  calculateDebtStats,
  DEBT_TYPES,
  DEBT_STATUS,
  type DebtAccount,
} from "../debts";

describe("debts constants", () => {
  describe("AUTO_CLASSIFY_DEBT_TYPE", () => {
    it("should classify mortgage correctly", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Chase Home", "Mortgage")).toBe(DEBT_TYPES.MORTGAGE);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Quicken", "Loan")).toBe(DEBT_TYPES.MORTGAGE);
    });

    it("should classify auto loans correctly", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Ford Credit", "Auto Loan")).toBe(DEBT_TYPES.AUTO);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Toyota Financial", "Car Payment")).toBe(DEBT_TYPES.AUTO);
    });

    it("should classify credit cards correctly", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Chase", "Freedom")).toBe(DEBT_TYPES.CREDIT_CARD);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Amex", "Platinum")).toBe(DEBT_TYPES.CREDIT_CARD);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Citi", "Card")).toBe(DEBT_TYPES.CREDIT_CARD);
    });

    it("should classify student loans correctly", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Navient", "Student Loan")).toBe(DEBT_TYPES.STUDENT);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Mohela", "Education")).toBe(DEBT_TYPES.STUDENT);
    });

    it("should classify bankruptcy correctly", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Court", "Chapter 13")).toBe(DEBT_TYPES.CHAPTER13);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Trustee", "Payment")).toBe(DEBT_TYPES.CHAPTER13);
    });

    it("should default to personal loan for unknown types", () => {
      expect(AUTO_CLASSIFY_DEBT_TYPE("Unknown", "Loan")).toBe(DEBT_TYPES.PERSONAL);
      expect(AUTO_CLASSIFY_DEBT_TYPE("Friend", "IOU")).toBe(DEBT_TYPES.PERSONAL);
    });
  });

  describe("calculateDebtStats", () => {
    it("should return zero stats for empty debts", () => {
      const stats = calculateDebtStats([]);
      expect(stats.totalDebt).toBe(0);
      expect(stats.totalMonthlyPayments).toBe(0);
      expect(stats.averageInterestRate).toBe(0);
      expect(stats.activeDebtCount).toBe(0);
    });

    it("should calculate correct stats for active debts", () => {
      const debts = [
        {
          id: "1",
          name: "Car Loan",
          type: DEBT_TYPES.AUTO,
          status: DEBT_STATUS.ACTIVE,
          currentBalance: 10000,
          minimumPayment: 300,
          interestRate: 0.05, // 5%
        },
        {
          id: "2",
          name: "Credit Card",
          type: DEBT_TYPES.CREDIT_CARD,
          status: DEBT_STATUS.ACTIVE,
          currentBalance: 5000,
          minimumPayment: 150,
          interestRate: 0.2, // 20%
        },
        {
          id: "3",
          name: "Paid Loan",
          type: DEBT_TYPES.PERSONAL,
          status: DEBT_STATUS.PAID_OFF,
          currentBalance: 0,
          minimumPayment: 0,
          interestRate: 0.1,
        },
      ] as DebtAccount[];

      const stats = calculateDebtStats(debts);

      // Total Debt: 10000 + 5000 = 15000
      expect(stats.totalDebt).toBe(15000);

      // Total Monthly: 300 + 150 = 450
      expect(stats.totalMonthlyPayments).toBe(450);

      // Average Interest (Weighted):
      // (0.05 * 10000 + 0.20 * 5000) / 15000
      // (500 + 1000) / 15000 = 1500 / 15000 = 0.10 (10%)
      expect(stats.averageInterestRate).toBeCloseTo(0.1);

      // Counts
      expect(stats.activeDebtCount).toBe(2);
      expect(stats.totalDebtCount).toBe(3);
    });

    it("should correctly identify debts due soon", () => {
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);

      const debts = [
        {
          id: "1",
          status: DEBT_STATUS.ACTIVE,
          nextPaymentDate: threeDaysLater.toISOString(),
          minimumPayment: 100,
          type: DEBT_TYPES.CREDIT_CARD,
          currentBalance: 1000,
        },
        {
          id: "2",
          status: DEBT_STATUS.ACTIVE,
          nextPaymentDate: nextMonth.toISOString(),
          minimumPayment: 200,
          type: DEBT_TYPES.AUTO,
          currentBalance: 5000,
        },
      ] as DebtAccount[];

      const stats = calculateDebtStats(debts);

      expect(stats.dueSoonCount).toBe(1);
      expect(stats.dueSoonAmount).toBe(100);
    });
  });
});
