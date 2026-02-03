import React from "react";

export interface MinimalHealthGaugeProps {
  score: number; // 0-100
  size?: number;
  loading?: boolean;
  title?: string;
}

/**
 * Minimal Health Gauge Component
 *
 * Pure SVG circular gauge displaying health score (0-100).
 * No animations, no external dependencies.
 *
 * Features:
 * - Circular progress indicator
 * - Color-coded by health status
 * - Score displayed in center
 * - Lightweight SVG implementation
 *
 * Health Ranges:
 * - Excellent (90-100): Green
 * - Good (75-89): Blue
 * - Fair (60-74): Yellow/Amber
 * - Poor (<60): Red
 *
 * Target: ~3KB
 *
 * @example
 * ```tsx
 * <MinimalHealthGauge score={85} title="Budget Health" />
 * ```
 */
export const MinimalHealthGauge: React.FC<MinimalHealthGaugeProps> = ({
  score,
  size = 200,
  loading = false,
  title = "Health Score",
}) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color based on score
  const getColor = (currentScore: number): string => {
    if (currentScore >= 90) return "#10b981"; // emerald-500 - Excellent
    if (currentScore >= 75) return "#3b82f6"; // blue-500 - Good
    if (currentScore >= 60) return "#f59e0b"; // amber-500 - Fair
    return "#ef4444"; // red-500 - Poor
  };

  // Determine status text
  const getStatus = (currentScore: number): string => {
    if (currentScore >= 90) return "Excellent";
    if (currentScore >= 75) return "Good";
    if (currentScore >= 60) return "Fair";
    return "Needs Attention";
  };

  const color = getColor(clampedScore);
  const status = getStatus(clampedScore);

  // SVG circle calculations
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const offset = circumference - progress;

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl p-6 hard-border flex items-center justify-center"
        style={{ width: size + 48, height: size + 80 }}
        role="region"
        aria-label="Health Gauge Loading"
        data-testid="health-gauge-loading"
      >
        <div className="animate-pulse space-y-4">
          <div className="rounded-full bg-gray-200" style={{ width: size, height: size }}></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 hard-border flex flex-col items-center"
      role="region"
      aria-label={title}
      data-testid="minimal-health-gauge"
    >
      {/* Title */}
      <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>

      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          role="img"
          aria-label={`Health score: ${clampedScore} out of 100`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
            data-testid="gauge-background"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            data-testid="gauge-progress"
          />
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          data-testid="gauge-center"
        >
          <div className="text-5xl font-black" style={{ color }} data-testid="gauge-score">
            {Math.round(clampedScore)}
          </div>
          <div className="text-sm font-bold text-gray-500 mt-1" data-testid="gauge-label">
            / 100
          </div>
        </div>
      </div>

      {/* Status text */}
      <div
        className="mt-4 px-4 py-2 rounded-full font-bold text-sm"
        style={{ backgroundColor: `${color}20`, color }}
        data-testid="gauge-status"
      >
        {status}
      </div>
    </div>
  );
};

export default MinimalHealthGauge;
