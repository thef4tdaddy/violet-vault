/**
 * Health Score Gauge Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Circular gauge displaying financial health score with component breakdown
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React, { useRef } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { HealthComponentScore, MLInsight, HealthTrendPoint } from "@/types/analyticsEnhanced";
import { ChartExportButton } from "../shared/ChartExportButton";

export interface HealthScoreGaugeProps {
  score: number; // 0-100
  components: HealthComponentScore[];
  recommendations: MLInsight[];
  trendData: HealthTrendPoint[];
  className?: string;
}

/**
 * Get color based on score
 */
const getScoreColor = (score: number): string => {
  if (score < 50) return "#ef4444"; // red
  if (score < 75) return "#f59e0b"; // yellow/amber
  return "#10b981"; // green
};

/**
 * Component progress bar
 */
interface ComponentProgressProps {
  component: HealthComponentScore;
}

const ComponentProgress: React.FC<ComponentProgressProps> = ({ component }) => {
  const color = getScoreColor(component.score);

  const formatComponentName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {formatComponentName(component.component)}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{component.description}</p>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {component.score}/100
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${component.score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

/**
 * HealthScoreGauge Component
 *
 * Displays overall health score with detailed component breakdown
 *
 * @example
 * ```tsx
 * <HealthScoreGauge
 *   score={85}
 *   components={healthComponents}
 *   recommendations={mlRecommendations}
 *   trendData={last30DaysTrend}
 * />
 * ```
 */
interface GaugeChartProps {
  score: number;
  color: string;
  circumference: number;
  progress: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ score, color, circumference, progress }) => (
  <svg width="220" height="220" className="mb-4">
    {/* Background circle */}
    <circle
      cx="110"
      cy="110"
      r="80"
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="12"
      className="dark:stroke-gray-700"
    />

    {/* Progress circle */}
    <circle
      cx="110"
      cy="110"
      r="80"
      fill="none"
      stroke={color}
      strokeWidth="12"
      strokeDasharray={circumference}
      strokeDashoffset={circumference - progress}
      transform="rotate(-90 110 110)"
      strokeLinecap="round"
      className="transition-all duration-1000"
    />

    {/* Score text */}
    <text
      x="110"
      y="110"
      textAnchor="middle"
      fontSize="48"
      fontWeight="bold"
      fill={color}
      className="dark:fill-current"
    >
      {score}
    </text>

    {/* Label */}
    <text
      x="110"
      y="140"
      textAnchor="middle"
      fontSize="14"
      fill="#6b7280"
      className="dark:fill-gray-400"
    >
      out of 100
    </text>
  </svg>
);

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  components,
  recommendations,
  trendData,
  className = "",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 80; // radius = 80
  const progress = (score / 100) * circumference;

  return (
    <div ref={chartRef} className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Health Score</h3>
        <ChartExportButton chartRef={chartRef} filename="health-score" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gauge and Sparkline */}
        <div className="flex flex-col items-center">
          {/* Circular Gauge */}
          <GaugeChart
            score={score}
            color={color}
            circumference={circumference}
            progress={progress}
          />

          {/* Status badge */}
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold mb-4`}
            style={{ backgroundColor: `${color}20`, color }}
          >
            {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor"}
          </div>

          {/* Trend sparkline */}
          {trendData.length > 0 && (
            <div className="w-full">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 text-center">
                30-Day Trend
              </h4>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={trendData}>
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={color}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Component breakdown and recommendations */}
        <div>
          {/* Component breakdown */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Health Components
            </h4>
            {components.map((comp) => (
              <ComponentProgress key={comp.component} component={comp} />
            ))}
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              AI Recommendations
            </h4>
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, index) => {
                  const iconMap = {
                    warning: "⚠️",
                    success: "✅",
                    info: "ℹ️",
                  };

                  return (
                    <div
                      key={`rec-${index}`}
                      className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{iconMap[rec.type]}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {rec.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {rec.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Confidence: {rec.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recommendations at this time. Keep up the good work!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
