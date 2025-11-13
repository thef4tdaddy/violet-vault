/**
 * useDebtStrategies hook - Business logic for debt payoff strategies
 * Calculates avalanche vs snowball strategies and payment impact analysis
 */

import { useMemo } from "react";
import type { DebtAccount } from "@/types/debt";

interface DebtWithStrategy extends DebtAccount {
  priority: number;
  monthsToPayoff: number;
  totalInterestCost: number;
  strategy: "avalanche" | "snowball";
}

interface StrategyResult {
  debts: DebtWithStrategy[];
  totalInterest: number;
  payoffTime: number;
  name?: string;
  description?: string;
}

interface Recommendation {
  strategy: "avalanche" | "snowball" | "either";
  reason: string;
  savings: number;
}

interface PaymentImpactScenario {
  extraPayment: number;
  avalanche: {
    monthsToPayoff: number;
    totalInterest: number;
    timeSavings: number;
    interestSavings: number;
  };
  snowball: {
    monthsToPayoff: number;
    totalInterest: number;
    timeSavings: number;
    interestSavings: number;
  };
}

interface DebtInsight {
  type: "warning" | "info" | "tip";
  title: string;
  message: string;
}

export const useDebtStrategies = (debts: DebtAccount[] = []) => {
  // Filter to active debts only
  const activeDebts = useMemo(() => {
    return debts.filter((debt) => debt.status === "active" && (debt.currentBalance ?? 0) > 0);
  }, [debts]);

  // Calculate Avalanche Strategy (highest interest rate first)
  const avalancheStrategy = useMemo((): StrategyResult => {
    if (!activeDebts.length) return { debts: [], totalInterest: 0, payoffTime: 0 };

    const sortedDebts = [...activeDebts].sort(
      (a, b) => (b.interestRate || 0) - (a.interestRate || 0)
    );

    let totalInterest = 0;
    let totalTime = 0;
    const strategyDebts: DebtWithStrategy[] = sortedDebts.map((debt, index) => {
      const monthsToPayoff = calculatePayoffTime(debt);
      const totalInterestCost = calculateTotalInterest(debt);

      totalInterest += totalInterestCost;
      if (index === 0) totalTime = Math.max(totalTime, monthsToPayoff);

      return {
        ...debt,
        priority: index + 1,
        monthsToPayoff,
        totalInterestCost,
        strategy: "avalanche" as const,
      };
    });

    return {
      debts: strategyDebts,
      totalInterest,
      payoffTime: totalTime,
      name: "Debt Avalanche",
      description: "Pay minimum on all debts, put extra toward highest interest rate debt",
    };
  }, [activeDebts]);

  // Calculate Snowball Strategy (lowest balance first)
  const snowballStrategy = useMemo((): StrategyResult => {
    if (!activeDebts.length) return { debts: [], totalInterest: 0, payoffTime: 0 };

    const sortedDebts = [...activeDebts].sort(
      (a, b) => (a.currentBalance || 0) - (b.currentBalance || 0)
    );

    let totalInterest = 0;
    let totalTime = 0;
    const strategyDebts: DebtWithStrategy[] = sortedDebts.map((debt, index) => {
      const monthsToPayoff = calculatePayoffTime(debt);
      const totalInterestCost = calculateTotalInterest(debt);

      totalInterest += totalInterestCost;
      if (index === 0) totalTime = Math.max(totalTime, monthsToPayoff);

      return {
        ...debt,
        priority: index + 1,
        monthsToPayoff,
        totalInterestCost,
        strategy: "snowball" as const,
      };
    });

    return {
      debts: strategyDebts,
      totalInterest,
      payoffTime: totalTime,
      name: "Debt Snowball",
      description: "Pay minimum on all debts, put extra toward lowest balance debt",
    };
  }, [activeDebts]);

  // Determine recommended strategy
  const recommendation = useMemo((): Recommendation | null => {
    if (!activeDebts.length) return null;

    const interestSavings = snowballStrategy.totalInterest - avalancheStrategy.totalInterest;
    const timeDifference = snowballStrategy.payoffTime - avalancheStrategy.payoffTime;

    if (Math.abs(interestSavings) < 100 && Math.abs(timeDifference) <= 2) {
      return {
        strategy: "either",
        reason: "Both strategies are similar in cost and time",
        savings: Math.abs(interestSavings),
      };
    } else if (interestSavings > 500) {
      return {
        strategy: "avalanche",
        reason: "Saves significantly more in interest costs",
        savings: interestSavings,
      };
    } else if (timeDifference > 6) {
      return {
        strategy: "avalanche",
        reason: "Pays off debt much faster",
        savings: interestSavings,
      };
    } else {
      return {
        strategy: "snowball",
        reason: "Provides better psychological motivation with quicker wins",
        savings: Math.abs(interestSavings),
      };
    }
  }, [avalancheStrategy, snowballStrategy, activeDebts]);

  // Calculate payment impact scenarios
  const paymentImpact = useMemo((): PaymentImpactScenario[] => {
    if (!activeDebts.length) return [];

    const scenarios = [50, 100, 200, 500];

    return scenarios.map((extraPayment) => {
      const avalancheWithExtra = calculateStrategyWithExtraPayment(
        avalancheStrategy.debts[0],
        extraPayment
      );
      const snowballWithExtra = calculateStrategyWithExtraPayment(
        snowballStrategy.debts[0],
        extraPayment
      );

      return {
        extraPayment,
        avalanche: avalancheWithExtra,
        snowball: snowballWithExtra,
      };
    });
  }, [avalancheStrategy, snowballStrategy, activeDebts]);

  // Generate insights based on debt portfolio
  const insights = useMemo((): DebtInsight[] => generateDebtInsights(activeDebts), [activeDebts]);

  // Format recommendation text
  const recommendationText = useMemo(
    (): string => formatRecommendationText(recommendation),
    [recommendation]
  );

  return {
    avalancheStrategy,
    snowballStrategy,
    recommendation,
    paymentImpact,
    insights,
    recommendationText,
    hasDebts: activeDebts.length > 0,
  };
};

// Helper function to calculate payoff time in months
function calculatePayoffTime(debt: DebtAccount): number {
  const { currentBalance, minimumPayment, interestRate } = debt;

  if (!currentBalance || !minimumPayment || minimumPayment <= 0) return 0;
  if (interestRate === 0) return Math.ceil(currentBalance / minimumPayment);

  const monthlyRate = (interestRate || 0) / 100 / 12;
  const monthlyInterest = currentBalance * monthlyRate;

  if (minimumPayment <= monthlyInterest) return 999; // Impossible to pay off

  const months =
    Math.log(1 + (currentBalance * monthlyRate) / (minimumPayment - monthlyInterest)) /
    Math.log(1 + monthlyRate);
  return Math.ceil(months);
}

// Helper function to calculate total interest cost
function calculateTotalInterest(debt: DebtAccount): number {
  const months = calculatePayoffTime(debt);
  if (months >= 999) return debt.currentBalance! * 2; // Estimate for impossible payoffs

  const totalPaid = (debt.minimumPayment || 0) * months;
  return Math.max(0, totalPaid - (debt.currentBalance || 0));
}

// Helper function to calculate strategy with extra payment
function calculateStrategyWithExtraPayment(
  debt: DebtWithStrategy | undefined,
  extraPayment: number
): {
  monthsToPayoff: number;
  totalInterest: number;
  timeSavings: number;
  interestSavings: number;
} {
  if (!debt) return { monthsToPayoff: 0, totalInterest: 0, timeSavings: 0, interestSavings: 0 };

  const originalMonths = calculatePayoffTime(debt);
  const originalInterest = calculateTotalInterest(debt);

  // Create modified debt with extra payment
  const modifiedDebt: DebtAccount = {
    ...debt,
    minimumPayment: (debt.minimumPayment || 0) + extraPayment,
  };

  const newMonths = calculatePayoffTime(modifiedDebt);
  const newInterest = calculateTotalInterest(modifiedDebt);

  return {
    monthsToPayoff: newMonths,
    totalInterest: newInterest,
    timeSavings: originalMonths - newMonths,
    interestSavings: originalInterest - newInterest,
  };
}

// Helper function to generate insights from active debts
function generateDebtInsights(activeDebts: DebtAccount[]): DebtInsight[] {
  if (!activeDebts.length) return [];

  const insights: DebtInsight[] = [];
  const highInterestDebts = activeDebts.filter((debt) => (debt.interestRate || 0) > 15);
  const totalBalance = activeDebts.reduce((sum, debt) => sum + (debt.currentBalance || 0), 0);
  const totalMinimumPayments = activeDebts.reduce(
    (sum, debt) => sum + (debt.minimumPayment || 0),
    0
  );

  if (highInterestDebts.length > 0) {
    insights.push({
      type: "warning",
      title: "High Interest Debt Alert",
      message: `You have ${highInterestDebts.length} debt(s) with interest rates above 15%. Consider prioritizing these for faster payoff.`,
    });
  }

  if (totalMinimumPayments / totalBalance > 0.05) {
    insights.push({
      type: "info",
      title: "High Payment Ratio",
      message:
        "Your minimum payments are high relative to balances. This is actually good for faster payoff!",
    });
  }

  const creditCardDebts = activeDebts.filter((debt) => debt.type === "credit_card");
  if (creditCardDebts.length > 2) {
    insights.push({
      type: "tip",
      title: "Credit Card Consolidation",
      message: `Consider consolidating ${creditCardDebts.length} credit cards to simplify payments and potentially lower rates.`,
    });
  }

  return insights;
}

// Helper function to format recommendation text
function formatRecommendationText(recommendation: Recommendation | null): string {
  if (!recommendation) return "";

  switch (recommendation.strategy) {
    case "avalanche":
      return `We recommend the Debt Avalanche strategy. ${recommendation.reason}. You could save $${recommendation.savings.toFixed(2)} in interest.`;
    case "snowball":
      return `We recommend the Debt Snowball strategy. ${recommendation.reason}. The interest cost difference is only $${recommendation.savings.toFixed(2)}.`;
    case "either":
      return `Both strategies work well for your situation. ${recommendation.reason}. Choose based on your preference for motivation vs. optimization.`;
    default:
      return "Add some debts to see personalized strategy recommendations.";
  }
}
