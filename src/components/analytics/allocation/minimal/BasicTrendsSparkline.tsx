import React, { useState } from "react";

export interface SparklineDataPoint {
  value: number;
  label: string; // e.g., "Jan", "Feb", or a date
}

export interface EnvelopeSparkline {
  envelopeId: string;
  envelopeName: string;
  data: SparklineDataPoint[];
  color: string;
}

export interface BasicTrendsSparklineProps {
  envelopes: EnvelopeSparkline[];
  loading?: boolean;
  title?: string;
}

// Helper: Generate SVG path for sparkline
const generatePath = (data: SparklineDataPoint[], width: number, height: number): string => {
  if (data.length === 0) return "";

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const xStep = width / (data.length - 1 || 1);

  const points = data.map((point, index) => {
    const x = index * xStep;
    const y = height - ((point.value - min) / range) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
};

// Helper: Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper: Calculate point positions
const calculatePointPositions = (
  data: SparklineDataPoint[],
  width: number,
  height: number
): Array<{ x: number; y: number }> => {
  if (data.length === 0) return [];

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const xStep = width / (data.length - 1 || 1);

  return data.map((point, index) => ({
    x: index * xStep,
    y: height - ((point.value - min) / range) * height,
  }));
};

// Loading state component
const SparklineLoading: React.FC = () => (
  <div
    className="bg-white rounded-2xl p-6 hard-border"
    role="region"
    aria-label="Sparkline Loading"
    data-testid="sparkline-loading"
  >
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-48"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Empty state component
const SparklineEmpty: React.FC<{ title: string }> = ({ title }) => (
  <div
    className="bg-white rounded-2xl p-6 hard-border"
    role="region"
    aria-label={title}
    data-testid="basic-trends-sparkline"
  >
    <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 text-sm">No envelope data available</p>
  </div>
);

// Sparkline row component
interface SparklineRowProps {
  envelope: EnvelopeSparkline;
  isHovered: boolean;
  sparklineWidth: number;
  sparklineHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPointHover: (pointIndex: number, event: React.MouseEvent<SVGCircleElement>) => void;
}

const SparklineRow: React.FC<SparklineRowProps> = ({
  envelope,
  isHovered,
  sparklineWidth,
  sparklineHeight,
  onMouseEnter,
  onMouseLeave,
  onPointHover,
}) => {
  const latestValue = envelope.data.length > 0 ? envelope.data[envelope.data.length - 1].value : 0;

  return (
    <div
      className={`flex items-center gap-4 transition-all ${isHovered ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={`sparkline-${envelope.envelopeId}`}
    >
      <div className="w-48">
        <div className="font-bold text-sm text-gray-900">{envelope.envelopeName}</div>
        <div className="text-xs font-medium text-gray-500">{formatCurrency(latestValue)}</div>
      </div>
      <div className="flex-1">
        <svg
          width={sparklineWidth}
          height={sparklineHeight}
          className="w-full"
          viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Trend for ${envelope.envelopeName}`}
        >
          <path
            d={generatePath(envelope.data, sparklineWidth, sparklineHeight)}
            stroke={envelope.color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-testid={`sparkline-path-${envelope.envelopeId}`}
          />
          {isHovered &&
            calculatePointPositions(envelope.data, sparklineWidth, sparklineHeight).map(
              (pos, index) => (
                <circle
                  key={index}
                  cx={pos.x}
                  cy={pos.y}
                  r="4"
                  fill={envelope.color}
                  className="cursor-pointer"
                  onMouseEnter={(e) => onPointHover(index, e)}
                  data-testid={`sparkline-point-${envelope.envelopeId}-${index}`}
                />
              )
            )}
        </svg>
      </div>
    </div>
  );
};

/**
 * Basic Trends Sparkline Component
 *
 * Pure SVG sparklines showing trends for top 5 envelopes.
 * No external charting libraries, simple line path generation.
 *
 * Features:
 * - SVG line charts (sparklines)
 * - Show top 5 envelopes
 * - Hover to see values
 * - Color-coded by envelope
 * - Responsive design
 *
 * Target: ~6KB
 *
 * @example
 * ```tsx
 * <BasicTrendsSparkline
 *   envelopes={[
 *     {
 *       envelopeId: "1",
 *       envelopeName: "Groceries",
 *       data: [{ value: 100, label: "Jan" }, { value: 120, label: "Feb" }],
 *       color: "#8b5cf6"
 *     }
 *   ]}
 * />
 * ```
 */
export const BasicTrendsSparkline: React.FC<BasicTrendsSparklineProps> = ({
  envelopes,
  loading = false,
  title = "Envelope Trends",
}) => {
  const [hoveredEnvelope, setHoveredEnvelope] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    envelope: string;
    point: SparklineDataPoint;
    x: number;
    y: number;
  } | null>(null);

  // Limit to top 5 envelopes
  const displayEnvelopes = envelopes.slice(0, 5);

  // Handle sparkline hover
  const handleSparklineHover = (
    envelope: EnvelopeSparkline,
    pointIndex: number,
    event: React.MouseEvent<SVGCircleElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredEnvelope(envelope.envelopeId);
    setHoveredPoint({
      envelope: envelope.envelopeName,
      point: envelope.data[pointIndex],
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  if (loading) return <SparklineLoading />;
  if (displayEnvelopes.length === 0) return <SparklineEmpty title={title} />;

  const sparklineWidth = 200;
  const sparklineHeight = 40;

  return (
    <div
      className="bg-white rounded-2xl p-6 hard-border"
      role="region"
      aria-label={title}
      data-testid="basic-trends-sparkline"
    >
      <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {displayEnvelopes.map((envelope) => (
          <SparklineRow
            key={envelope.envelopeId}
            envelope={envelope}
            isHovered={hoveredEnvelope === envelope.envelopeId}
            sparklineWidth={sparklineWidth}
            sparklineHeight={sparklineHeight}
            onMouseEnter={() => setHoveredEnvelope(envelope.envelopeId)}
            onMouseLeave={() => {
              setHoveredEnvelope(null);
              setHoveredPoint(null);
            }}
            onPointHover={(pointIndex, event) => handleSparklineHover(envelope, pointIndex, event)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg"
          style={{
            left: `${hoveredPoint.x}px`,
            top: `${hoveredPoint.y - 50}px`,
            transform: "translateX(-50%)",
          }}
          role="tooltip"
          data-testid="sparkline-tooltip"
        >
          <div className="font-bold">{hoveredPoint.envelope}</div>
          <div className="text-gray-300">
            {hoveredPoint.point.label}: {formatCurrency(hoveredPoint.point.value)}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicTrendsSparkline;
