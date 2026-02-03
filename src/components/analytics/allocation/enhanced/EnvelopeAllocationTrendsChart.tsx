/**
 * Envelope Allocation Trends Chart Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Multi-line chart showing allocation trends across selected envelopes
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React, { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import type { TrendDataPoint, AnomalyMarker } from "@/types/analyticsEnhanced";
import { ChartExportButton } from "../shared/ChartExportButton";

export interface EnvelopeAllocationTrendsChartProps {
  data: TrendDataPoint[];
  selectedEnvelopes: string[]; // envelope IDs
  anomalies: AnomalyMarker[];
  onExport?: () => void;
  className?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#a4de6c", "#d0ed57"];

/**
 * Format currency for tooltip
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Format date for display
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Custom tooltip component
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-700 dark:text-gray-300">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * EnvelopeAllocationTrendsChart Component
 *
 * Displays allocation trends for selected envelopes with anomaly markers
 *
 * @example
 * ```tsx
 * <EnvelopeAllocationTrendsChart
 *   data={trendData}
 *   selectedEnvelopes={["env1", "env2", "env3"]}
 *   anomalies={[{ date: "2024-01-15", severity: "high", description: "Unusual spike" }]}
 *   onExport={() => console.log('Export triggered')}
 * />
 * ```
 */
export const EnvelopeAllocationTrendsChart: React.FC<EnvelopeAllocationTrendsChartProps> = ({
  data,
  selectedEnvelopes,
  anomalies,
  onExport,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={chartRef} className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Allocation Trends</h3>
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View Details
            </button>
          )}
          <ChartExportButton chartRef={chartRef} filename="allocation-trends" />
        </div>
      </div>

      {selectedEnvelopes.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
          <p>Select envelopes to view trends</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <YAxis
              tickFormatter={(value: number) => `$${(value / 100).toFixed(0)}`}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />

            {/* Trend lines for each envelope */}
            {selectedEnvelopes.map((envelopeId, idx) => (
              <Line
                key={envelopeId}
                type="monotone"
                dataKey={envelopeId}
                name={envelopeId}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}

            {/* Anomaly markers */}
            {anomalies.map((anomaly, idx) => {
              const dataPoint = data.find((d) => d.date === anomaly.date);
              if (!dataPoint) return null;

              const severityColor = {
                high: "#ef4444",
                medium: "#f59e0b",
                low: "#10b981",
              };

              return (
                <ReferenceDot
                  key={`anomaly-${idx}`}
                  x={anomaly.date}
                  y={
                    selectedEnvelopes.length > 0
                      ? (dataPoint[selectedEnvelopes[0]!] as number)
                      : 0
                  }
                  r={8}
                  fill={severityColor[anomaly.severity]}
                  stroke="#fff"
                  strokeWidth={2}
                  label={{
                    value: "!",
                    fill: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Anomaly legend */}
      {anomalies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            Anomalies Detected
          </h4>
          <div className="space-y-1">
            {anomalies.slice(0, 3).map((anomaly, idx) => (
              <div key={`anomaly-desc-${idx}`} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      anomaly.severity === "high"
                        ? "#ef4444"
                        : anomaly.severity === "medium"
                          ? "#f59e0b"
                          : "#10b981",
                  }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(anomaly.date)}: {anomaly.description}
                </span>
              </div>
            ))}
            {anomalies.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-4">
                +{anomalies.length - 3} more anomalies
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopeAllocationTrendsChart;
