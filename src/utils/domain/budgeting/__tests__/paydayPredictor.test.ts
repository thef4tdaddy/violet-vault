import { describe, it, expect, vi } from "vitest";
import {
  predictNextPayday,
  isPaydayToday,
  checkRecentPayday,
  getDaysUntilPayday,
  getPaydayRecommendations,
  formatPaydayPrediction,
} from "../paydayPredictor";

describe("paydayPredictor", () => {
  describe("predictNextPayday", () => {
    it("should return early if less than 2 paychecks are provided", () => {
      const history = [{ date: new Date("2026-01-01") }];
      const result = predictNextPayday(history);
      expect(result.nextPayday).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.message).toBe("Need at least 2 paychecks to predict payday");
    });

    it("should detect a weekly pattern", () => {
      const history = [
        { date: new Date("2026-01-15") },
        { date: new Date("2026-01-08") },
        { date: new Date("2026-01-01") },
      ];
      const result = predictNextPayday(history);
      expect(result.pattern).toBe("weekly");
      expect(result.intervalDays).toBe(7);
      expect(result.nextPayday).toEqual(new Date("2026-01-22"));
      expect(result.confidence).toBeGreaterThan(90);
    });

    it("should detect a biweekly pattern", () => {
      const history = [{ date: new Date("2026-01-15") }, { date: new Date("2026-01-01") }];
      const result = predictNextPayday(history);
      expect(result.pattern).toBe("biweekly");
      expect(result.intervalDays).toBe(14);
      expect(result.nextPayday).toEqual(new Date("2026-01-29"));
    });

    it("should detect a monthly pattern", () => {
      const history = [{ date: new Date("2026-02-01") }, { date: new Date("2026-01-01") }];
      const result = predictNextPayday(history);
      // Interval is 31 days. Grouping rounds to 28 days.
      expect(result.pattern).toBe("monthly");
      expect(result.nextPayday).toEqual(new Date("2026-03-01"));
    });

    it("should handle custom cycles", () => {
      const history = [{ date: new Date("2026-01-21") }, { date: new Date("2026-01-01") }];
      const result = predictNextPayday(history);
      // 20 days rounded to 21
      expect(result.pattern).toBe("21-day cycle");
      expect(result.intervalDays).toBe(21);
    });

    it("should handle invalid dates in history", () => {
      const history = [{ date: "invalid-date" }, { date: new Date("2026-01-01") }];
      const result = predictNextPayday(history);
      expect(result.nextPayday).toBeNull();
      expect(result.message).toBe("Invalid paycheck date encountered");
    });

    it("should handle moderate confidence with irregular schedules", () => {
      const history = [
        { date: new Date("2026-01-29") }, // 7 days
        { date: new Date("2026-01-22") }, // 7 days
        { date: new Date("2026-01-15") }, // 14 days
        { date: new Date("2026-01-01") },
      ];
      const result = predictNextPayday(history);
      // confidence = (2/3)*100 = 67
      expect(result.confidence).toBe(67);
      expect(result.message).toMatch(/Moderate confidence/);
    });
  });

  describe("isPaydayToday", () => {
    it("should return true if today is predicted payday", () => {
      const prediction = {
        nextPayday: new Date("2026-01-26"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };
      const today = new Date("2026-01-26");
      expect(isPaydayToday(prediction, today)).toBe(true);
    });

    it("should return false if today is not predicted payday", () => {
      const prediction = {
        nextPayday: new Date("2026-01-26"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };
      const today = new Date("2026-01-25");
      expect(isPaydayToday(prediction, today)).toBe(false);
    });

    it("should return false if no nextPayday prediction", () => {
      const prediction = {
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: "",
      };
      expect(isPaydayToday(prediction)).toBe(false);
    });
  });

  describe("checkRecentPayday", () => {
    it("should report if payday was today", () => {
      const prediction = {
        nextPayday: new Date("2026-01-26"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };
      const today = new Date("2026-01-26");
      const result = checkRecentPayday(prediction, today);
      expect(result.occurred).toBe(true);
      expect(result.wasToday).toBe(true);
      expect(result.daysAgo).toBe(0);
    });

    it("should report if payday was yesterday", () => {
      const prediction = {
        nextPayday: new Date("2026-01-25"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };
      const today = new Date("2026-01-26");
      const result = checkRecentPayday(prediction, today);
      expect(result.occurred).toBe(true);
      expect(result.wasYesterday).toBe(true);
      expect(result.daysAgo).toBe(1);
    });

    it("should return false if no nextPayday", () => {
      const prediction = {
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: "",
      };
      expect(checkRecentPayday(prediction).occurred).toBe(false);
    });
  });

  describe("getDaysUntilPayday", () => {
    it("should return correct days until payday", () => {
      const prediction = {
        nextPayday: new Date("2026-01-30"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };
      const today = new Date("2026-01-26");
      expect(getDaysUntilPayday(prediction, today)).toBe(4);
    });

    it("should return null if no nextPayday", () => {
      const prediction = {
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: "",
      };
      expect(getDaysUntilPayday(prediction)).toBeNull();
    });
  });

  describe("getPaydayRecommendations", () => {
    const prediction = {
      nextPayday: new Date("2026-01-30"),
      confidence: 80,
      pattern: "biweekly",
      message: "",
    };

    it("should show process_paycheck action for today", () => {
      const today = new Date("2026-01-30");
      const result = getPaydayRecommendations(prediction, today);
      expect(result.showRecommendations).toBe(true);
      expect(result.actions[0].type).toBe("process_paycheck");
    });

    it("should show prepare_tomorrow action for tomorrow", () => {
      const today = new Date("2026-01-29");
      const result = getPaydayRecommendations(prediction, today);
      expect(result.showRecommendations).toBe(true);
      expect(result.actions[0].type).toBe("prepare_tomorrow");
    });

    it("should show plan_ahead for 2-3 days away", () => {
      const today = new Date("2026-01-27");
      const result = getPaydayRecommendations(prediction, today);
      expect(result.showRecommendations).toBe(true);
      expect(result.actions[0].type).toBe("plan_ahead");
    });

    it("should show early_planning for 4-7 days away", () => {
      const today = new Date("2026-01-24");
      const result = getPaydayRecommendations(prediction, today);
      expect(result.showRecommendations).toBe(true);
      expect(result.actions[0].type).toBe("early_planning");
    });

    it("should not show recommendations if payday is > 7 days away", () => {
      const today = new Date("2026-01-20");
      const result = getPaydayRecommendations(prediction, today);
      expect(result.showRecommendations).toBe(false);
    });
  });

  describe("formatPaydayPrediction", () => {
    it("should handle null nextPayday", () => {
      const prediction = {
        nextPayday: null,
        confidence: 0,
        pattern: null,
        message: "",
      };
      const result = formatPaydayPrediction(prediction);
      expect(result.displayText).toBe("Unable to predict next payday");
      expect(result.shortText).toBe("Unknown");
    });

    it("should format for various days until payday", () => {
      vi.useFakeTimers();
      const mockToday = new Date("2026-01-26T12:00:00Z");
      vi.setSystemTime(mockToday);

      const prediction = {
        nextPayday: new Date("2026-01-26T12:00:00Z"),
        confidence: 100,
        pattern: "weekly",
        message: "",
      };

      // Today
      prediction.nextPayday = new Date("2026-01-26T12:00:00Z");
      let result = formatPaydayPrediction(prediction);
      expect(result.shortText).toBe("Today");

      // Tomorrow
      prediction.nextPayday = new Date("2026-01-27T12:00:00Z");
      result = formatPaydayPrediction(prediction);
      expect(result.shortText).toBe("Tomorrow");

      // 4 days
      prediction.nextPayday = new Date("2026-01-30T12:00:00Z");
      result = formatPaydayPrediction(prediction);
      expect(result.shortText).toBe("4 days");

      // > 7 days
      prediction.nextPayday = new Date("2026-02-10T12:00:00Z");
      result = formatPaydayPrediction(prediction);
      expect(result.displayText).toMatch(/Next payday predicted/);

      // Past due
      prediction.nextPayday = new Date("2026-01-20T12:00:00Z");
      result = formatPaydayPrediction(prediction);
      expect(result.shortText).toBe("6 days ago");

      vi.useRealTimers();
    });
  });
});
