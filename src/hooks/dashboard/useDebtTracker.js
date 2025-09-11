import { useMemo } from "react";
import { logger } from "../../utils/common/logger";

/**
 * Debt Tracker Hook - Provides debt overview data for dashboard
 *
 * Calculates overall debt progress, individual debt status,
 * and payoff projections for the debt tracker dashboard section.
 */
export const useDebtTracker = () => {
  // TODO: Replace with actual data from debt store/API
  // This is mock data for initial implementation
  const mockDebts = [
    {
      id: "debt-1",
      name: "Credit Card",
      remaining: 2500,
      original: 5000,
      minPayment: 75,
      progressPercentage: 50,
    },
    {
      id: "debt-2",
      name: "Student Loan",
      remaining: 15000,
      original: 20000,
      minPayment: 150,
      progressPercentage: 25,
    },
    {
      id: "debt-3",
      name: "Car Loan",
      remaining: 8000,
      original: 12000,
      minPayment: 200,
      progressPercentage: 33,
    },
  ];

  const calculations = useMemo(() => {
    logger.debug("Calculating debt tracker metrics", {
      component: "useDebtTracker",
      debtCount: mockDebts.length,
    });

    if (!mockDebts || mockDebts.length === 0) {
      return {
        activeDebts: [],
        totalDebtRemaining: 0,
        totalOriginalDebt: 0,
        overallProgress: 0,
        projectedPayoffDate: null,
      };
    }

    const totalRemaining = mockDebts.reduce(
      (sum, debt) => sum + (debt.remaining || 0),
      0,
    );
    const totalOriginal = mockDebts.reduce(
      (sum, debt) => sum + (debt.original || 0),
      0,
    );
    const totalPaid = totalOriginal - totalRemaining;
    const overallProgress =
      totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

    // Simple payoff projection (assuming minimum payments)
    const totalMinPayment = mockDebts.reduce(
      (sum, debt) => sum + (debt.minPayment || 0),
      0,
    );
    const monthsToPayoff =
      totalMinPayment > 0 ? Math.ceil(totalRemaining / totalMinPayment) : null;

    let projectedDate = null;
    if (monthsToPayoff) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + monthsToPayoff);
      projectedDate = futureDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    const result = {
      activeDebts: mockDebts,
      totalDebtRemaining: totalRemaining,
      totalOriginalDebt: totalOriginal,
      overallProgress,
      projectedPayoffDate: projectedDate,
    };

    logger.debug("Debt tracker calculations completed", {
      component: "useDebtTracker",
      totalRemaining,
      totalOriginal,
      overallProgress: Math.round(overallProgress),
      projectedDate,
    });

    return result;
  }, [mockDebts]);

  return calculations;
};
