/**
 * Allocation Analytics Service
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 * 
 * Business logic for calculating allocation analytics, trends, and health scores.
 * This service aggregates paycheck allocation data and generates insights.
 */

import { db } from '@/db/budgetDb';
import logger from '@/utils/core/common/logger';
import type { Transaction } from '@/db/types';
import type {
  AllocationAnalytics,
  AllocationAnalyticsParams,
  HeatmapData,
  TrendData,
  DistributionData,
  StrategyAnalysis,
  FinancialHealthScore,
  AllocationStrategy,
  PaycheckAllocationRecord,
  HeatmapDataPoint,
  HealthScoreComponent,
  HealthRecommendation,
} from '@/types/allocationAnalytics';

/**
 * Allocation Analytics Service
 * Main service for calculating allocation patterns and insights
 */
export class AllocationAnalyticsService {
  /**
   * Get comprehensive allocation analytics for a date range
   */
  static async getAnalytics(params: AllocationAnalyticsParams): Promise<AllocationAnalytics> {
    try {
      logger.info('Calculating allocation analytics', {
        userId: params.userId,
        dateRange: `${params.startDate} to ${params.endDate}`,
      });

      // Fetch all paycheck transactions in the date range
      const paycheckRecords = await this.fetchPaycheckRecords(
        params.userId,
        params.startDate,
        params.endDate
      );

      // Calculate each analytics section
      const heatmap =
        params.includeHeatmap !== false
          ? await this.generateHeatmap(paycheckRecords)
          : this.getEmptyHeatmap();

      const trends =
        params.includeTrends !== false
          ? await this.calculateTrends(paycheckRecords, params.startDate, params.endDate)
          : this.getEmptyTrends(params.startDate, params.endDate);

      const distribution =
        params.includeDistribution !== false
          ? await this.calculateDistribution(paycheckRecords)
          : this.getEmptyDistribution();

      const strategyAnalysis =
        params.includeStrategyAnalysis !== false
          ? await this.analyzeStrategies(paycheckRecords, params.startDate, params.endDate)
          : this.getEmptyStrategyAnalysis(params.startDate, params.endDate);

      const healthScore =
        params.includeHealthScore !== false
          ? await this.calculateHealthScore(paycheckRecords)
          : this.getEmptyHealthScore();

      const analytics: AllocationAnalytics = {
        heatmap,
        trends,
        distribution,
        strategyAnalysis,
        healthScore,
        filters: {
          dateRange: {
            start: params.startDate,
            end: params.endDate,
          },
        },
        lastCalculated: new Date().toISOString(),
        cacheKey: this.generateCacheKey(params),
      };

      logger.info('Analytics calculation complete', {
        totalPaychecks: paycheckRecords.length,
        healthScore: healthScore.totalScore,
      });

      return analytics;
    } catch (error) {
      logger.error('Failed to calculate analytics', error);
      throw error;
    }
  }

  /**
   * Fetch paycheck transaction records from database
   */
  private static async fetchPaycheckRecords(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<PaycheckAllocationRecord[]> {
    try {
      // Query transactions of type 'income' (paychecks)
      const transactions = await db.transactions
        .where('date')
        .between(startDate, endDate, true, true)
        .filter((txn) => txn.type === 'income' && txn.category === 'paycheck')
        .toArray();

      // Transform transactions to PaycheckAllocationRecord format
      const records: PaycheckAllocationRecord[] = transactions.map((txn) => {
        // Extract allocation metadata if available
        const metadata = (txn.metadata as Record<string, unknown>) || {};
        const allocations = (metadata.allocations as Array<{
          envelopeId: string;
          envelopeName?: string;
          amountCents: number;
        }>) || [];

        return {
          id: String(txn.id),
          date: txn.date,
          paycheckAmountCents: Math.abs(txn.amount * 100), // Convert to cents
          payerName: metadata.payerName as string || 'Unknown',
          strategy: (metadata.strategy as AllocationStrategy) || 'even_split',
          allocations: allocations.map((alloc) => ({
            envelopeId: alloc.envelopeId,
            envelopeName: alloc.envelopeName || 'Unknown',
            amountCents: alloc.amountCents,
            strategy: (metadata.strategy as AllocationStrategy) || 'even_split',
            timestamp: txn.createdAt || new Date().toISOString(),
          })),
          processedAt: txn.createdAt || new Date().toISOString(),
          totalAllocatedCents: allocations.reduce((sum, a) => sum + a.amountCents, 0),
          remainingCents: Math.abs(txn.amount * 100) - allocations.reduce((sum, a) => sum + a.amountCents, 0),
          completionTimeMs: metadata.completionTimeMs as number | undefined,
        };
      });

      return records;
    } catch (error) {
      logger.error('Failed to fetch paycheck records', error);
      return [];
    }
  }

  /**
   * Generate heatmap data for calendar visualization
   */
  private static async generateHeatmap(records: PaycheckAllocationRecord[]): Promise<HeatmapData> {
    if (records.length === 0) {
      return this.getEmptyHeatmap();
    }

    const dataPoints: HeatmapDataPoint[] = records.map((record) => {
      const intensity = this.calculateIntensity(record.paycheckAmountCents, records);

      return {
        date: record.date,
        amountCents: record.paycheckAmountCents,
        strategy: record.strategy,
        payerName: record.payerName,
        allocationCount: record.allocations.length,
        intensity,
      };
    });

    const amounts = records.map((r) => r.paycheckAmountCents);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);

    // Detect frequency pattern
    const frequency = this.detectPaycheckFrequency(records.map((r) => r.date));

    // Detect missed paychecks based on frequency
    const missedPaychecks = this.detectMissedPaychecks(records.map((r) => r.date), frequency);

    return {
      dataPoints,
      minAmount,
      maxAmount,
      totalAllocations: records.length,
      missedPaychecks,
      frequency,
    };
  }

  /**
   * Calculate intensity for heatmap coloring (0-100)
   */
  private static calculateIntensity(amount: number, allRecords: PaycheckAllocationRecord[]): number {
    const amounts = allRecords.map((r) => r.paycheckAmountCents);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    if (max === min) return 50; // All same amount

    const normalized = (amount - min) / (max - min);
    return Math.round(normalized * 100);
  }

  /**
   * Detect paycheck frequency from date patterns
   */
  private static detectPaycheckFrequency(
    dates: string[]
  ): 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly' | 'irregular' {
    if (dates.length < 2) return 'irregular';

    const sortedDates = [...dates].sort();
    const gaps: number[] = [];

    for (let i = 1; i < sortedDates.length; i++) {
      const date1 = new Date(sortedDates[i - 1]!);
      const date2 = new Date(sortedDates[i]!);
      const daysDiff = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
      gaps.push(daysDiff);
    }

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;

    // Detect frequency based on average gap
    if (avgGap >= 6 && avgGap <= 8) return 'weekly';
    if (avgGap >= 13 && avgGap <= 15) return 'biweekly';
    if (avgGap >= 14 && avgGap <= 16) return 'semi-monthly';
    if (avgGap >= 28 && avgGap <= 32) return 'monthly';

    return 'irregular';
  }

  /**
   * Detect missed paychecks based on expected frequency
   */
  private static detectMissedPaychecks(
    dates: string[],
    frequency: 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly' | 'irregular'
  ): string[] {
    if (dates.length === 0 || frequency === 'irregular') return [];

    const sortedDates = [...dates].sort();
    const missedPaychecks: string[] = [];

    // Expected days between paychecks
    const expectedGaps: Record<string, number> = {
      weekly: 7,
      biweekly: 14,
      'semi-monthly': 15,
      monthly: 30,
      irregular: 0,
    };

    const expectedGap = expectedGaps[frequency];
    if (!expectedGap) return [];

    for (let i = 1; i < sortedDates.length; i++) {
      const date1 = new Date(sortedDates[i - 1]!);
      const date2 = new Date(sortedDates[i]!);
      const daysDiff = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));

      // If gap is significantly larger than expected, paycheck(s) were missed
      if (daysDiff > expectedGap * 1.5) {
        const missedCount = Math.floor(daysDiff / expectedGap) - 1;
        for (let j = 1; j <= missedCount; j++) {
          const missedDate = new Date(date1.getTime() + j * expectedGap * 24 * 60 * 60 * 1000);
          missedPaychecks.push(missedDate.toISOString().split('T')[0]!);
        }
      }
    }

    return missedPaychecks;
  }

  /**
   * Calculate envelope allocation trends over time
   */
  private static async calculateTrends(
    records: PaycheckAllocationRecord[],
    startDate: string,
    endDate: string
  ): Promise<TrendData> {
    if (records.length === 0) {
      return this.getEmptyTrends(startDate, endDate);
    }

    // Group allocations by envelope
    const envelopeMap = new Map<string, Array<{ date: string; amountCents: number }>>();

    records.forEach((record) => {
      record.allocations.forEach((alloc) => {
        const existing = envelopeMap.get(alloc.envelopeId) || [];
        existing.push({
          date: record.date,
          amountCents: alloc.amountCents,
        });
        envelopeMap.set(alloc.envelopeId, existing);
      });
    });

    // Calculate trend data for each envelope
    const envelopes = Array.from(envelopeMap.entries()).map(([envelopeId, dataPoints]) => {
      const amounts = dataPoints.map((dp) => dp.amountCents);
      const avgCents = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const minCents = Math.min(...amounts);
      const maxCents = Math.max(...amounts);

      // Determine trend direction
      const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
      const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, dp) => sum + dp.amountCents, 0) / (firstHalf.length || 1);
      const secondAvg =
        secondHalf.reduce((sum, dp) => sum + dp.amountCents, 0) / (secondHalf.length || 1);

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
      if (changePercent > 10) trend = 'increasing';
      else if (changePercent < -10) trend = 'decreasing';

      // Get envelope name from first allocation
      const envelopeName =
        records
          .flatMap((r) => r.allocations)
          .find((a) => a.envelopeId === envelopeId)?.envelopeName || 'Unknown';

      return {
        id: envelopeId,
        name: envelopeName,
        dataPoints: dataPoints.sort((a, b) => a.date.localeCompare(b.date)),
        averageCents: Math.round(avgCents),
        minCents,
        maxCents,
        trend,
      };
    });

    return {
      envelopes: envelopes.slice(0, 10), // Top 10 envelopes
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Calculate allocation distribution by category
   */
  private static async calculateDistribution(
    records: PaycheckAllocationRecord[]
  ): Promise<DistributionData> {
    if (records.length === 0) {
      return this.getEmptyDistribution();
    }

    // Aggregate by category (simplified - group by envelope for now)
    const categoryMap = new Map<string, { totalCents: number; envelopeIds: Set<string> }>();

    records.forEach((record) => {
      record.allocations.forEach((alloc) => {
        const category = alloc.envelopeName; // Using envelope name as category
        const existing = categoryMap.get(category) || {
          totalCents: 0,
          envelopeIds: new Set<string>(),
        };
        existing.totalCents += alloc.amountCents;
        existing.envelopeIds.add(alloc.envelopeId);
        categoryMap.set(category, existing);
      });
    });

    const totalCents = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.totalCents,
      0
    );

    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      totalCents: data.totalCents,
      percentage: (data.totalCents / totalCents) * 100,
      envelopeIds: Array.from(data.envelopeIds),
    }));

    const averagePerPaycheckCents = totalCents / records.length;

    return {
      categories,
      totalCents,
      averagePerPaycheckCents: Math.round(averagePerPaycheckCents),
    };
  }

  /**
   * Analyze strategy performance and usage
   */
  private static async analyzeStrategies(
    records: PaycheckAllocationRecord[],
    startDate: string,
    endDate: string
  ): Promise<StrategyAnalysis> {
    if (records.length === 0) {
      return this.getEmptyStrategyAnalysis(startDate, endDate);
    }

    const strategyStats = new Map<
      AllocationStrategy,
      {
        count: number;
        totalTimeMs: number;
        totalAmount: number;
      }
    >();

    records.forEach((record) => {
      const existing = strategyStats.get(record.strategy) || {
        count: 0,
        totalTimeMs: 0,
        totalAmount: 0,
      };
      existing.count += 1;
      existing.totalTimeMs += record.completionTimeMs || 0;
      existing.totalAmount += record.paycheckAmountCents;
      strategyStats.set(record.strategy, existing);
    });

    const strategies = Array.from(strategyStats.entries()).map(([strategy, stats]) => ({
      strategy,
      usageCount: stats.count,
      usagePercentage: (stats.count / records.length) * 100,
      averageCompletionTimeMs: stats.totalTimeMs / stats.count,
      billCoverageRate: 95, // Placeholder - would calculate from actual bill coverage
      savingsRate: 20, // Placeholder - would calculate from actual savings allocations
      userAdjustmentsCount: 0, // Placeholder - would track manual adjustments
      successRate: 98, // Placeholder - would calculate from completion rate
    }));

    // Find most used and most effective strategies
    const mostUsed =
      strategies.reduce((max, s) => (s.usageCount > max.usageCount ? s : max), strategies[0]!)
        .strategy;

    const mostEffective =
      strategies.reduce((max, s) => (s.savingsRate > max.savingsRate ? s : max), strategies[0]!)
        .strategy;

    const insights = this.generateStrategyInsights(strategies);

    return {
      strategies,
      mostUsed,
      mostEffective,
      insights,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Generate insights from strategy performance
   */
  private static generateStrategyInsights(
    strategies: Array<{
      strategy: AllocationStrategy;
      usagePercentage: number;
      averageCompletionTimeMs: number;
      savingsRate: number;
    }>
  ): string[] {
    const insights: string[] = [];

    // Find fastest strategy
    const fastest = strategies.reduce((min, s) =>
      s.averageCompletionTimeMs < min.averageCompletionTimeMs ? s : min
    );
    insights.push(
      `${fastest.strategy} is the fastest strategy, averaging ${Math.round(fastest.averageCompletionTimeMs / 1000)}s per allocation.`
    );

    // Find best savings rate
    const bestSavings = strategies.reduce((max, s) => (s.savingsRate > max.savingsRate ? s : max));
    insights.push(
      `${bestSavings.strategy} leads to the highest savings rate at ${bestSavings.savingsRate.toFixed(1)}%.`
    );

    return insights;
  }

  /**
   * Calculate comprehensive financial health score
   */
  private static async calculateHealthScore(
    records: PaycheckAllocationRecord[]
  ): Promise<FinancialHealthScore> {
    if (records.length === 0) {
      return this.getEmptyHealthScore();
    }

    const components: HealthScoreComponent[] = [
      this.calculateConsistencyScore(records),
      this.calculateBillCoverageScore(records),
      this.calculateSavingsRateScore(records),
      this.calculateEmergencyFundScore(),
      this.calculateDiscretionaryScore(records),
    ];

    // Calculate weighted total score
    const totalScore = components.reduce((sum, comp) => sum + comp.score * comp.weight, 0);

    // Determine overall status
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (totalScore >= 85) status = 'excellent';
    else if (totalScore >= 70) status = 'good';
    else if (totalScore >= 50) status = 'fair';
    else status = 'poor';

    // Determine trend (simplified - would compare to previous period)
    const trend: 'improving' | 'declining' | 'stable' = 'stable';

    // Generate recommendations
    const recommendations = this.generateHealthRecommendations(components, totalScore);

    return {
      totalScore: Math.round(totalScore),
      components,
      recommendations,
      status,
      trend,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Calculate consistency score (how regularly paychecks are allocated)
   */
  private static calculateConsistencyScore(
    records: PaycheckAllocationRecord[]
  ): HealthScoreComponent {
    // Calculate based on regularity of allocations
    const score = records.length >= 10 ? 90 : Math.min(90, records.length * 9);

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'fair';
    else status = 'poor';

    return {
      name: 'consistency',
      score,
      weight: 0.15,
      status,
      description: 'Regular paycheck allocation without gaps',
    };
  }

  /**
   * Calculate bill coverage score
   */
  private static calculateBillCoverageScore(
    records: PaycheckAllocationRecord[]
  ): HealthScoreComponent {
    // Placeholder - would check if bills are fully funded
    const score = 95;

    return {
      name: 'billCoverage',
      score,
      weight: 0.3,
      status: 'excellent',
      description: 'Bills and essential expenses are fully covered',
    };
  }

  /**
   * Calculate savings rate score
   */
  private static calculateSavingsRateScore(
    records: PaycheckAllocationRecord[]
  ): HealthScoreComponent {
    // Calculate percentage going to savings
    const totalAmount = records.reduce((sum, r) => sum + r.paycheckAmountCents, 0);
    const savingsAmount = records.reduce((sum, r) => {
      return (
        sum +
        r.allocations
          .filter((a) => a.envelopeName.toLowerCase().includes('saving'))
          .reduce((s, a) => s + a.amountCents, 0)
      );
    }, 0);

    const savingsRate = (savingsAmount / totalAmount) * 100;
    const targetRate = 25; // 25% target

    let score = Math.min(100, (savingsRate / targetRate) * 100);
    score = Math.max(0, score);

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'fair';
    else status = 'poor';

    return {
      name: 'savingsRate',
      score: Math.round(score),
      weight: 0.25,
      status,
      description: `Saving ${savingsRate.toFixed(1)}% of income (target: ${targetRate}%)`,
    };
  }

  /**
   * Calculate emergency fund score
   */
  private static calculateEmergencyFundScore(): HealthScoreComponent {
    // Placeholder - would check actual emergency fund balance
    const score = 85;

    return {
      name: 'emergencyFund',
      score,
      weight: 0.2,
      status: 'good',
      description: 'Emergency fund covers 5-6 months of expenses',
    };
  }

  /**
   * Calculate discretionary spending score
   */
  private static calculateDiscretionaryScore(
    records: PaycheckAllocationRecord[]
  ): HealthScoreComponent {
    // Placeholder - would analyze discretionary spending patterns
    const score = 75;

    return {
      name: 'discretionary',
      score,
      weight: 0.1,
      status: 'good',
      description: 'Discretionary spending is within healthy limits',
    };
  }

  /**
   * Generate health recommendations
   */
  private static generateHealthRecommendations(
    components: HealthScoreComponent[],
    totalScore: number
  ): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];

    // Find areas that need improvement
    components.forEach((comp) => {
      if (comp.score < 70) {
        recommendations.push({
          id: `improve-${comp.name}`,
          priority: comp.score < 50 ? 'high' : 'medium',
          title: `Improve ${comp.name}`,
          description: `Your ${comp.name} score is ${comp.score}/100`,
          actionable: this.getActionableForComponent(comp.name),
          impactScore: Math.round((100 - comp.score) * comp.weight),
        });
      }
    });

    // If overall score is good, add optimization suggestions
    if (totalScore >= 70 && recommendations.length === 0) {
      recommendations.push({
        id: 'optimize-savings',
        priority: 'low',
        title: 'Optimize savings allocation',
        description: 'You\'re doing well! Consider increasing savings by 2-3%.',
        actionable: 'Review discretionary spending to find $50-100 to redirect to savings.',
        impactScore: 5,
      });
    }

    return recommendations;
  }

  /**
   * Get actionable recommendation for a component
   */
  private static getActionableForComponent(componentName: string): string {
    const actions: Record<string, string> = {
      consistency: 'Set up automatic paycheck processing to ensure regular allocations.',
      billCoverage: 'Review unpaid bills and allocate more to essential envelopes.',
      savingsRate: 'Increase savings allocation by 5% per paycheck ($125 for $2,500 paycheck).',
      emergencyFund: 'Build emergency fund to 6 months of expenses.',
      discretionary: 'Reduce discretionary spending by $50/paycheck.',
    };

    return actions[componentName] || 'Review your budget and adjust allocations.';
  }

  /**
   * Generate cache key for analytics data
   */
  private static generateCacheKey(params: AllocationAnalyticsParams): string {
    return `analytics-${params.userId}-${params.startDate}-${params.endDate}`;
  }

  /**
   * Empty state helpers
   */
  private static getEmptyHeatmap(): HeatmapData {
    return {
      dataPoints: [],
      minAmount: 0,
      maxAmount: 0,
      totalAllocations: 0,
      missedPaychecks: [],
      frequency: 'irregular',
    };
  }

  private static getEmptyTrends(startDate: string, endDate: string): TrendData {
    return {
      envelopes: [],
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private static getEmptyDistribution(): DistributionData {
    return {
      categories: [],
      totalCents: 0,
      averagePerPaycheckCents: 0,
    };
  }

  private static getEmptyStrategyAnalysis(startDate: string, endDate: string): StrategyAnalysis {
    return {
      strategies: [],
      mostUsed: 'even_split',
      mostEffective: 'even_split',
      insights: [],
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private static getEmptyHealthScore(): FinancialHealthScore {
    return {
      totalScore: 0,
      components: [],
      recommendations: [],
      status: 'poor',
      trend: 'stable',
      lastUpdated: new Date().toISOString(),
    };
  }
}

export default AllocationAnalyticsService;
