import { useState, useMemo, useEffect } from "react";
import logger from "@/utils/common/logger";
import {
  calculateBudgetAdherence,
  calculateSavingsRate,
  calculateSpendingEfficiency,
  calculateBalanceStability,
} from "./utils/performanceMetricsUtils";
import { generateAlerts, generateRecommendations } from "./utils/alertsUtils";

/**
 * Hook for calculating financial performance metrics and monitoring
 * Extracts complex performance logic from PerformanceMonitor component
 */
export const usePerformanceMonitor = (analyticsData, balanceData) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Performance metrics calculation
  const performanceMetrics = useMemo(() => {
    if (!analyticsData || !balanceData) {
      return {
        overallScore: 0,
        budgetAdherence: 0,
        savingsRate: 0,
        spendingEfficiency: 0,
        balanceStability: 0,
        alerts: [],
        recommendations: [],
      };
    }

    // Calculate individual metrics
    const budgetAdherence = calculateBudgetAdherence(analyticsData, balanceData);
    const savingsRate = calculateSavingsRate(analyticsData, balanceData);
    const spendingEfficiency = calculateSpendingEfficiency(analyticsData);
    const balanceStability = calculateBalanceStability(balanceData);

    const overallScore = Math.round(
      budgetAdherence * 0.3 +
        savingsRate * 0.25 +
        spendingEfficiency * 0.25 +
        balanceStability * 0.2
    );

    // Generate alerts and recommendations
    const alerts = generateAlerts(analyticsData, balanceData, {
      budgetAdherence,
      savingsRate,
      balanceStability,
    } as never);

    const recommendations = generateRecommendations({
      budgetAdherence,
      savingsRate,
      balanceStability,
      overallScore,
    } as never);

    return {
      overallScore,
      budgetAdherence,
      savingsRate,
      spendingEfficiency,
      balanceStability,
      alerts,
      recommendations,
    };
  }, [analyticsData, balanceData]);

  // Update performance history (simulated real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceHistory((prev) => {
        const newEntry = {
          timestamp: Date.now(),
          score: performanceMetrics.overallScore,
          budgetAdherence: performanceMetrics.budgetAdherence,
          savingsRate: performanceMetrics.savingsRate,
        };

        const updatedHistory = [...prev, newEntry].slice(-50); // Keep last 50 entries
        return updatedHistory;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [performanceMetrics]);

  // Log significant performance changes
  useEffect(() => {
    if (performanceMetrics.overallScore > 0) {
      logger.debug("Performance metrics updated", {
        overallScore: performanceMetrics.overallScore,
        alertCount: performanceMetrics.alerts.length,
        recommendationCount: performanceMetrics.recommendations.length,
      });
    }
  }, [performanceMetrics]);

  return {
    // State
    alertsEnabled,
    selectedMetric,
    performanceHistory,
    performanceMetrics,

    // Actions
    setAlertsEnabled,
    setSelectedMetric,
  };
};
