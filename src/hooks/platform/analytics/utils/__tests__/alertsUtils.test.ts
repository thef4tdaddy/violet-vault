import { describe, it, expect } from "vitest";
import { generateAlerts, generateRecommendations } from "../alertsUtils";

describe("alertsUtils", () => {
  const mockMetrics = {
    budgetAdherence: 100,
    savingsRate: 100,
    balanceStability: 100,
    overallScore: 100,
  };

  const mockBalance = {
    envelopeAnalysis: [],
  };

  describe("generateAlerts", () => {
    it("should generate critical budget alert when adherence < 30", () => {
      const alerts = generateAlerts({}, mockBalance, { ...mockMetrics, budgetAdherence: 20 });
      const criticalAlert = alerts.find((a) => a.id.includes("alert-budget-critical"));
      expect(criticalAlert).toBeDefined();
      expect(criticalAlert?.severity).toBe("critical");
    });

    it("should generate warning budget alert when adherence < 60", () => {
      const alerts = generateAlerts({}, mockBalance, { ...mockMetrics, budgetAdherence: 50 });
      const warningAlert = alerts.find((a) => a.id.includes("alert-budget-warning"));
      expect(warningAlert).toBeDefined();
      expect(warningAlert?.severity).toBe("warning");
    });

    it("should generate savings warning when rate < 25", () => {
      const alerts = generateAlerts({}, mockBalance, { ...mockMetrics, savingsRate: 10 });
      const savingsAlert = alerts.find((a) => a.id.includes("alert-savings-warning"));
      expect(savingsAlert).toBeDefined();
      expect(savingsAlert?.severity).toBe("warning");
    });

    it("should generate balance critical alert when stability < 50", () => {
      const alerts = generateAlerts({}, mockBalance, { ...mockMetrics, balanceStability: 40 });
      const balanceAlert = alerts.find((a) => a.id.includes("alert-balance-critical"));
      expect(balanceAlert).toBeDefined();
      expect(balanceAlert?.severity).toBe("critical");
    });

    it("should generate envelope overspending alert when utilization > 1.2", () => {
      const balanceWithOverspending = {
        envelopeAnalysis: [{ name: "Food", spent: 150, monthlyBudget: 100 }],
      };
      const alerts = generateAlerts({}, balanceWithOverspending, mockMetrics);
      const envAlert = alerts.find((a) => a.id.includes("alert-envelopes-warning"));
      expect(envAlert).toBeDefined();
      expect(envAlert?.details).toContain("Food");
    });

    it("should sort alerts by severity", () => {
      const metrics = {
        budgetAdherence: 20, // critical
        savingsRate: 10, // warning
        balanceStability: 100,
      };
      const alerts = generateAlerts({}, mockBalance, metrics);
      expect(alerts[0].severity).toBe("critical");
      expect(alerts[1].severity).toBe("warning");
    });
  });

  describe("generateRecommendations", () => {
    it("should recommend investment for high scores", () => {
      const recs = generateRecommendations({ ...mockMetrics, overallScore: 95 });
      expect(recs.some((r) => r.type === "investment")).toBe(true);
    });

    it("should recommend optimization for medium scores", () => {
      const recs = generateRecommendations({ ...mockMetrics, overallScore: 75 });
      expect(recs.some((r) => r.type === "spending" && r.title.includes("Good"))).toBe(true);
    });

    it("should recommend improvement for low scores", () => {
      const recs = generateRecommendations({ ...mockMetrics, overallScore: 50 });
      expect(recs.some((r) => r.type === "spending" && r.title.includes("Attention"))).toBe(true);
    });

    it("should recommend budget adjustment when adherence < 70", () => {
      const recs = generateRecommendations({ ...mockMetrics, budgetAdherence: 60 });
      const budgetRec = recs.find((r) => r.id.includes("rec-budget"));
      expect(budgetRec).toBeDefined();
    });

    it("should recommend boosting savings when rate < 50", () => {
      const recs = generateRecommendations({ ...mockMetrics, savingsRate: 40 });
      const savingsRec = recs.find((r) => r.id.includes("rec-savings"));
      expect(savingsRec).toBeDefined();
    });
  });
});
