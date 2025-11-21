import { ReactNode } from "react";

// Base data types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  envelope?: string;
  date: string;
  type: "income" | "expense" | "transfer";
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Envelope {
  id: string;
  name: string;
  balance: number;
  budgetedAmount: number;
  category?: string;
  type: "bill" | "variable" | "savings";
  priority?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  userName: string;
  userColor: string;
  userId?: string;
}

// Chart data types
export interface ChartDataPoint {
  name?: string;
  month?: string;
  date?: Date | string;
  income?: number;
  expenses?: number;
  net?: number;
  budgeted?: number;
  actual?: number;
  transactionCount?: number;
  [key: string]: unknown;
}

export interface ChartSeries {
  type: "bar" | "line" | "area";
  dataKey: string;
  name: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean | object;
  activeDot?: object;
  [key: string]: unknown;
}

// Analytics data types
export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
}

// Make this more flexible to handle both array and object formats
export type CategoryBreakdown = unknown;

// Make this more flexible to handle both array and object formats
export type EnvelopeSpending = unknown;

export interface WeeklyPattern {
  day: string;
  income?: number;
  expenses?: number;
  net?: number;
  transactionCount?: number;
  // Allow for different data structures
  amount?: number;
  count?: number;
}

// Make this more flexible to handle both array and object formats
export type EnvelopeHealth = unknown;

export interface BudgetVsActual extends ChartDataPoint {
  name: string;
  budgeted: number;
  actual: number;
}

export interface AnalyticsMetrics {
  totalIncome?: number;
  totalExpenses?: number;
  netCashFlow?: number;
  transactionCount?: number;
  averageTransactionAmount?: number;
  topSpendingCategory?: string;
  budgetUtilization?: number;
  // Allow for additional properties from existing hooks
  [key: string]: unknown;
}

export interface AnalyticsData {
  filteredTransactions: Transaction[];
  monthlyTrends: MonthlyTrend[];
  envelopeSpending: EnvelopeSpending;
  categoryBreakdown: CategoryBreakdown;
  weeklyPatterns: WeeklyPattern[];
  envelopeHealth: EnvelopeHealth;
  budgetVsActual: BudgetVsActual[];
  metrics: AnalyticsMetrics;
  // Optional properties for flexibility
  totalIncome?: number;
}

export interface EnvelopeAnalysis {
  monthlyBudget?: number;
  spent?: number;
  name: string;
}

export interface BalanceData {
  envelopeAnalysis?: EnvelopeAnalysis[];
  actualBalance?: number;
  virtualBalance?: number;
  savingsGoals?: Array<{ currentAmount?: number }>;
}

// Trend Analysis Types
export interface SpendingTrend {
  month: string;
  income: number;
  spending: number;
  net: number;
  forecast?: boolean;
  [key: string]: unknown;
}

export interface CategoryTrend {
  name: string;
  trend: ChartDataPoint[];
  current?: number;
  previous?: number;
  [key: string]: unknown;
}

export interface SeasonalPattern {
  name: string;
  color: string;
  avgSpending: number;
  avgIncome: number;
  avgNet: number;
  categories?: string[];
  [key: string]: unknown;
}

export interface ForecastInsights {
  trend: string;
  confidence: number;
  projectedSpending?: number;
  growthRate?: number;
  [key: string]: unknown;
}

export interface InsightDetail {
  type: string;
  title: string;
  description: string;
  action: string;
}

export interface Insights {
  highestSpendingSeason: string;
  avgVelocity: number;
  hasHighGrowth: boolean;
  details?: InsightDetail[];
  [key: string]: unknown;
}

export interface SpendingVelocity {
  month: string;
  change: number;
  percentChange: number;
}

// Performance Types
// Performance Types
export interface PerformanceEntry {
  month: string;
  score: number;
  change: number;
  timestamp: string | number | Date;
  [key: string]: unknown;
}

export interface Alert {
  id: string;
  type: "warning" | "critical" | "success" | "info";
  message: string;
  date: string;
  title: string;
  severity: "warning" | "critical" | "success" | "info";
  action?: string;
  details?: string;
  [key: string]: unknown;
}

export interface Recommendation {
  id: string;
  type: "saving" | "spending" | "investment";
  title: string;
  description: string;
  impact: string;
  message: string;
  action?: string;
  [key: string]: unknown;
}

// Component prop types
export interface ChartsAnalyticsProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  currentUser?: User;
  timeFilter?: string;
  focus?: string;
}

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: Error | string | null;
  emptyMessage?: string;
  actions?: ReactNode;
  dataTestId?: string;
}

export interface ComposedFinancialChartProps {
  title?: string;
  subtitle?: string;
  data?: ChartDataPoint[];
  series?: ChartSeries[];
  height?: number;
  className?: string;
  loading?: boolean;
  error?: Error | string | null;
  emptyMessage?: string;
  actions?: ReactNode;
  showGrid?: boolean;
  showLegend?: boolean;
  formatTooltip?: (value: unknown, name: string, props: unknown) => ReactNode;
  xAxisKey?: string;
  [key: string]: unknown;
}

export interface CategoryBarChartProps {
  title?: string;
  subtitle?: string;
  data?: ChartDataPoint[];
  bars?: ChartSeries[];
  height?: number;
  className?: string;
  loading?: boolean;
  error?: Error | string | null;
  emptyMessage?: string;
  actions?: ReactNode;
  showGrid?: boolean;
  showLegend?: boolean;
  orientation?: "vertical" | "horizontal";
  formatTooltip?: (value: unknown, name: string, props: unknown) => ReactNode;
  maxBarSize?: number;
  [key: string]: unknown;
}

export interface AnalyticsHeaderProps {
  dateRange: { start?: Date | string; end?: Date | string } | unknown; // Flexible to handle different date range formats
  handleDateRangeChange: (range: { start?: Date | string; end?: Date | string } | unknown) => void;
  handleExport: () => void;
}

export interface MetricsGridProps {
  filteredTransactions?: Transaction[];
  metrics?: AnalyticsMetrics;
  envelopes?: Envelope[];
}

export interface TabNavigationProps {
  activeTab: string;
  handleTabChange: (tab: string) => void;
}

export interface TabContentProps {
  activeTab: string;
  chartType: string;
  handleChartTypeChange: (type: string) => void;
  monthlyTrends: MonthlyTrend[];
  envelopeSpending: EnvelopeSpending;
  weeklyPatterns: WeeklyPattern[];
  envelopeHealth: EnvelopeHealth;
  budgetVsActual: BudgetVsActual[];
  categoryBreakdown: CategoryBreakdown;
}

// Time filter types
export type TimeFilter = "thisWeek" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

// Chart types
export type ChartType = "bar" | "line" | "area" | "composed" | "pie";

// Focus types
export type FocusType = "overview" | "spending" | "income" | "trends" | "health";
