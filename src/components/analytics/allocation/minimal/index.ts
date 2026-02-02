/**
 * Minimal Offline Chart Components
 *
 * Phase 1.1: Lightweight, offline-first chart components for Tier 1 analytics
 * No external charting libraries, pure SVG and CSS implementations
 * Target: ~50KB total bundle size
 */

export { MinimalOverviewTab } from "./MinimalOverviewTab";
export type { MinimalOverviewTabProps, AllocationMetrics } from "./MinimalOverviewTab";

export { SimpleHeatmapGrid } from "./SimpleHeatmapGrid";
export type { SimpleHeatmapGridProps, HeatmapDataPoint } from "./SimpleHeatmapGrid";

export { MinimalHealthGauge } from "./MinimalHealthGauge";
export type { MinimalHealthGaugeProps } from "./MinimalHealthGauge";

export { BasicTrendsSparkline } from "./BasicTrendsSparkline";
export type {
  BasicTrendsSparklineProps,
  EnvelopeSparkline,
  SparklineDataPoint,
} from "./BasicTrendsSparkline";

export { DistributionTable } from "./DistributionTable";
export type { DistributionTableProps, CategoryDistribution } from "./DistributionTable";
