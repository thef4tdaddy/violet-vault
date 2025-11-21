/**
 * Utility functions for performance monitoring calculations
 * Extracted from usePerformanceMonitor hook to reduce complexity
 */

import { AnalyticsData, BalanceData } from "@/types/analytics";

/**
 * Calculate budget adherence score
 */
export const calculateBudgetAdherence = (
  _analytics: AnalyticsData,
  balance: BalanceData
): number => {
  if (!balance.envelopeAnalysis || balance.envelopeAnalysis.length === 0) return 0;

  const adherenceScores = balance.envelopeAnalysis.map((envelope) => {
    const budget = envelope.monthlyBudget || 0;
    const spent = envelope.spent || 0;

    if (budget === 0) return 100; // No budget set

    const utilization = spent / budget;
    if (utilization <= 0.9) return 100; // Under budget
    if (utilization <= 1.0) return 90; // Slightly over
    if (utilization <= 1.2) return 60; // Moderately over
    return 20; // Severely over budget
  });

  return Math.round(
    adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length
  );
};

/**
 * Calculate savings rate score
 */
export const calculateSavingsRate = (analytics: AnalyticsData, balance: BalanceData): number => {
  if (!analytics.totalIncome || analytics.totalIncome === 0) return 0;

  const savingsAmount =
    balance.savingsGoals?.reduce((total, goal) => total + (goal.currentAmount || 0), 0) || 0;

  const savingsRate = (savingsAmount / analytics.totalIncome) * 100;

  if (savingsRate >= 20) return 100;
  if (savingsRate >= 15) return 90;
  if (savingsRate >= 10) return 75;
  if (savingsRate >= 5) return 50;
  return 25;
};

/**
 * Calculate spending efficiency score
 */
export const calculateSpendingEfficiency = (analytics: AnalyticsData): number => {
  const breakdown = analytics.categoryBreakdown as Array<{ amount: number }>;
  if (!breakdown || !Array.isArray(breakdown) || breakdown.length === 0) return 0;

  const amounts = breakdown.map((cat) => Math.abs(cat.amount));
  const totalSpending = amounts.reduce((sum, amount) => sum + amount, 0);

  if (totalSpending === 0) return 100;

  const sortedAmounts = amounts.sort((a, b) => a - b);
  let giniNumerator = 0;

  for (let i = 0; i < sortedAmounts.length; i++) {
    for (let j = 0; j < sortedAmounts.length; j++) {
      giniNumerator += Math.abs(sortedAmounts[i] - sortedAmounts[j]);
    }
  }

  const gini = giniNumerator / (2 * sortedAmounts.length * totalSpending);

  // Convert Gini to efficiency score (lower Gini = more balanced = higher efficiency)
  return Math.round(Math.max(0, 100 - gini * 100));
};

/**
 * Calculate balance stability score
 */
export const calculateBalanceStability = (balance: BalanceData): number => {
  const actualBalance = balance.actualBalance || 0;
  const virtualBalance = balance.virtualBalance || 0;
  const discrepancy = Math.abs(actualBalance - virtualBalance);

  if (actualBalance === 0) return 50; // No data

  const discrepancyPercentage = (discrepancy / Math.abs(actualBalance)) * 100;

  if (discrepancyPercentage <= 1) return 100;
  if (discrepancyPercentage <= 3) return 90;
  if (discrepancyPercentage <= 5) return 75;
  if (discrepancyPercentage <= 10) return 50;
  return 25;
};
