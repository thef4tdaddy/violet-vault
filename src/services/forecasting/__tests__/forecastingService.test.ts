/**
 * Tests for Forecasting Service (JavaScript fallback)
 */

import {
  calculateBillCoverageJS,
  type CoverageRequest,
} from "../forecastingService";

describe("forecastingService", () => {
  describe("calculateBillCoverageJS", () => {
    it("calculates coverage for fully funded bills", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 80000,
            dueDateDays: 5,
            envelopeId: "env1",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 40000,
            monthlyTargetCents: 80000,
            isDiscretionary: false,
          },
        ],
        allocations: [
          {
            envelopeId: "env1",
            amountCents: 40000,
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills).toHaveLength(1);
      expect(result.bills[0]).toMatchObject({
        billId: "bill1",
        envelopeId: "env1",
        currentBalance: 40000,
        allocationAmount: 40000,
        projectedBalance: 80000,
        billAmount: 80000,
        shortage: 0,
        coveragePercent: 100.0,
        status: "covered",
        daysUntilDue: 5,
      });

      expect(result.totalShortage).toBe(0);
      expect(result.criticalCount).toBe(0);
    });

    it("calculates coverage for partially funded bills", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 80000,
            dueDateDays: 3,
            envelopeId: "env1",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 20000,
            monthlyTargetCents: 80000,
            isDiscretionary: false,
          },
        ],
        allocations: [
          {
            envelopeId: "env1",
            amountCents: 30000,
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills[0]).toMatchObject({
        projectedBalance: 50000,
        billAmount: 80000,
        shortage: 30000,
        coveragePercent: 62.5,
        status: "partial",
      });

      expect(result.totalShortage).toBe(30000);
      expect(result.criticalCount).toBe(0); // 62.5% > 50%, not critical
    });

    it("identifies uncovered bills as critical", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 80000,
            dueDateDays: 2,
            envelopeId: "env1",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 10000,
            monthlyTargetCents: 80000,
            isDiscretionary: false,
          },
        ],
        allocations: [
          {
            envelopeId: "env1",
            amountCents: 20000,
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills[0]).toMatchObject({
        projectedBalance: 30000,
        shortage: 50000,
        coveragePercent: 37.5,
        status: "uncovered",
      });

      expect(result.totalShortage).toBe(50000);
      expect(result.criticalCount).toBe(1); // <50% is critical
    });

    it("handles bills with no envelope", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 50000,
            dueDateDays: 5,
            envelopeId: "nonexistent",
          },
        ],
        envelopes: [],
        allocations: [
          {
            envelopeId: "nonexistent",
            amountCents: 10000,
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills[0]).toMatchObject({
        envelopeId: "nonexistent",
        currentBalance: 0,
        allocationAmount: 10000,
        projectedBalance: 10000,
        shortage: 40000,
        coveragePercent: 0,
        status: "uncovered",
      });

      expect(result.totalShortage).toBe(40000);
      expect(result.criticalCount).toBe(1);
    });

    it("handles multiple bills with different statuses", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 80000,
            dueDateDays: 5,
            envelopeId: "env1",
          },
          {
            id: "bill2",
            amountCents: 12000,
            dueDateDays: 7,
            envelopeId: "env2",
          },
          {
            id: "bill3",
            amountCents: 30000,
            dueDateDays: 10,
            envelopeId: "env3",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 80000,
            monthlyTargetCents: 80000,
            isDiscretionary: false,
          },
          {
            id: "env2",
            currentBalanceCents: 5000,
            monthlyTargetCents: 12000,
            isDiscretionary: false,
          },
          {
            id: "env3",
            currentBalanceCents: 0,
            monthlyTargetCents: 30000,
            isDiscretionary: false,
          },
        ],
        allocations: [
          {
            envelopeId: "env1",
            amountCents: 0, // Already fully funded
          },
          {
            envelopeId: "env2",
            amountCents: 7000, // Will be 12000 total
          },
          {
            envelopeId: "env3",
            amountCents: 10000, // Only 10000 of 30000 needed
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills).toHaveLength(3);

      // Bill 1: Fully covered
      expect(result.bills[0].status).toBe("covered");
      expect(result.bills[0].shortage).toBe(0);

      // Bill 2: Fully covered
      expect(result.bills[1].status).toBe("covered");
      expect(result.bills[1].shortage).toBe(0);

      // Bill 3: Partially covered (33.3%)
      expect(result.bills[2].status).toBe("uncovered");
      expect(result.bills[2].shortage).toBe(20000);

      expect(result.totalShortage).toBe(20000);
      expect(result.criticalCount).toBe(1); // Only bill3 is critical
    });

    it("handles zero allocation amounts", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 50000,
            dueDateDays: 5,
            envelopeId: "env1",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 30000,
            monthlyTargetCents: 50000,
            isDiscretionary: false,
          },
        ],
        allocations: [],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills[0]).toMatchObject({
        allocationAmount: 0,
        projectedBalance: 30000,
        shortage: 20000,
        coveragePercent: 60.0,
        status: "partial",
      });
    });

    it("handles over-allocation (>100% coverage)", () => {
      const request: CoverageRequest = {
        bills: [
          {
            id: "bill1",
            amountCents: 50000,
            dueDateDays: 5,
            envelopeId: "env1",
          },
        ],
        envelopes: [
          {
            id: "env1",
            currentBalanceCents: 40000,
            monthlyTargetCents: 50000,
            isDiscretionary: false,
          },
        ],
        allocations: [
          {
            envelopeId: "env1",
            amountCents: 30000, // Total: 70000, bill: 50000
          },
        ],
        paycheckAmountCents: 250000,
        daysUntilNextPayday: 14,
      };

      const result = calculateBillCoverageJS(request);

      expect(result.bills[0]).toMatchObject({
        projectedBalance: 70000,
        shortage: 0,
        coveragePercent: 140.0,
        status: "covered",
      });

      expect(result.totalShortage).toBe(0);
    });
  });
});
