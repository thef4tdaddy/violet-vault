import type { ReactNode } from "react";
import ComposedFinancialChart from "./ComposedFinancialChart";

const LINE_SERIES = [
  { type: "line", dataKey: "income", name: "Income", stroke: "#10b981", strokeWidth: 3 },
  { type: "line", dataKey: "expenses", name: "Expenses", stroke: "#ef4444", strokeWidth: 3 },
  { type: "line", dataKey: "net", name: "Net", stroke: "#6366f1", strokeWidth: 3 },
];

const AREA_SERIES = [
  {
    type: "area",
    dataKey: "income",
    name: "Income",
    stroke: "#10b981",
    fill: "#10b981",
    fillOpacity: 0.2,
  },
  {
    type: "area",
    dataKey: "expenses",
    name: "Expenses",
    stroke: "#ef4444",
    fill: "#ef4444",
    fillOpacity: 0.2,
  },
  { type: "line", dataKey: "net", name: "Net", stroke: "#6366f1", strokeWidth: 3 },
];

const BAR_SERIES = [
  { type: "bar", dataKey: "income", name: "Income", fill: "#10b981" },
  { type: "bar", dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
  { type: "line", dataKey: "net", name: "Net", stroke: "#6366f1", strokeWidth: 3 },
];

const SERIES_BY_TYPE = {
  line: LINE_SERIES,
  area: AREA_SERIES,
  bar: BAR_SERIES,
};

interface TrendLineChartProps {
  title?: string;
  subtitle?: ReactNode;
  data?: Array<Record<string, unknown>>;
  chartType?: string;
  type?: string;
  height?: number;
  [key: string]: unknown;
}

const TrendLineChart = ({
  title = "Trend Analysis",
  subtitle,
  data = [],
  chartType = "line",
  type,
  height = 300,
  ...props
}: TrendLineChartProps) => {
  const resolvedType = type || chartType || "line";
  const chartData = Array.isArray(data) ? data : [];
  const series = SERIES_BY_TYPE[resolvedType] || SERIES_BY_TYPE.line;

  return (
    <ComposedFinancialChart
      title={title}
      subtitle={subtitle}
      data={chartData}
      series={series}
      height={height}
      {...props}
    />
  );
};

export default TrendLineChart;
