/**
 * Enhanced Analytics Types
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Advanced type definitions for Recharts-powered visualizations
 * Lazy-loaded only when user enables backend processing
 */

/**
 * Heatmap data point for calendar visualization
 */
export interface HeatmapDataPoint {
  date: string; // ISO date
  intensity: number; // 0-100
  amount: number;
  count: number;
}

/**
 * Trend data point for line/area charts
 */
export interface TrendDataPoint {
  date: string;
  [envelopeId: string]: number | string; // envelope amounts by ID
}

/**
 * Distribution data point for pie/donut charts
 */
export interface DistributionDataPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Health score component breakdown
 */
export interface HealthComponentScore {
  component: "consistency" | "billCoverage" | "savingsRate" | "emergencyFund" | "discretionary";
  score: number; // 0-100
  weight: number;
  description: string;
}

/**
 * ML-powered insight from backend processing
 */
export interface MLInsight {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  confidence: number; // 0-100
}

/**
 * Anomaly marker for trend charts
 */
export interface AnomalyMarker {
  date: string;
  severity: "high" | "medium" | "low";
  description: string;
}

/**
 * Strategy performance data for table
 */
export interface StrategyData {
  strategy: string;
  avgAmount: number;
  successRate: number; // 0-100
  recommendation: "good" | "fair" | "poor";
}

/**
 * Health trend data point for sparkline
 */
export interface HealthTrendPoint {
  date: string;
  score: number;
}
