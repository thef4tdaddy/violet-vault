import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * Advanced Trend Analysis Charts for v1.10.0
 * Features:
 * - Historical trend analysis
 * - Spending velocity tracking
 * - Seasonal pattern detection
 * - Predictive forecasting
 * - Comparative analysis
 */
const TrendAnalysisCharts = ({ analyticsData, _timeFilter }) => {
  // Generate historical spending trends
  const spendingTrends = useMemo(() => {
    if (!analyticsData) return [];

    // Mock historical data - in real implementation, this would come from analytics
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentMonth = new Date().getMonth();
    const trends = [];

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      const month = months[monthIndex];

      // Simulate trending data with some variability
      const baseSpending = 2500 + Math.sin(i * 0.5) * 500;
      const variance = (Math.random() - 0.5) * 400;
      const spending = Math.max(0, baseSpending + variance);

      const baseIncome = 3000 + Math.sin(i * 0.3) * 200;
      const incomeVariance = (Math.random() - 0.5) * 300;
      const income = Math.max(0, baseIncome + incomeVariance);

      trends.push({
        month,
        spending: Math.round(spending),
        income: Math.round(income),
        net: Math.round(income - spending),
        forecast: i >= 9, // Last 3 months are forecasted
      });
    }

    return trends;
  }, [analyticsData]);

  // Calculate spending velocity (rate of change)
  const spendingVelocity = useMemo(() => {
    const velocity = [];
    for (let i = 1; i < spendingTrends.length; i++) {
      const current = spendingTrends[i];
      const previous = spendingTrends[i - 1];
      const change = current.spending - previous.spending;
      const percentChange =
        previous.spending > 0 ? (change / previous.spending) * 100 : 0;

      velocity.push({
        month: current.month,
        change,
        percentChange: Math.round(percentChange * 10) / 10,
        direction: change > 0 ? "increase" : "decrease",
      });
    }
    return velocity;
  }, [spendingTrends]);

  // Generate category trend analysis
  const categoryTrends = useMemo(() => {
    if (!analyticsData?.categoryBreakdown) return [];

    const categories = Object.entries(analyticsData.categoryBreakdown)
      .map(([name, data]) => ({
        name,
        current: data.expenses || 0,
        // Simulate historical data for trending
        trend: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(
            Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("en-US", { month: "short" }),
          amount: Math.max(
            0,
            (data.expenses || 0) * (0.8 + Math.random() * 0.4),
          ),
        })),
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 5); // Top 5 categories

    return categories;
  }, [analyticsData]);

  // Calculate seasonal patterns
  const seasonalPatterns = useMemo(() => {
    const seasons = [
      { name: "Winter", months: ["Dec", "Jan", "Feb"], color: "#3B82F6" },
      { name: "Spring", months: ["Mar", "Apr", "May"], color: "#10B981" },
      { name: "Summer", months: ["Jun", "Jul", "Aug"], color: "#F59E0B" },
      { name: "Fall", months: ["Sep", "Oct", "Nov"], color: "#EF4444" },
    ];

    return seasons.map((season) => {
      const seasonData = spendingTrends.filter((trend) =>
        season.months.includes(trend.month),
      );

      const avgSpending =
        seasonData.reduce((sum, data) => sum + data.spending, 0) /
        seasonData.length;
      const avgIncome =
        seasonData.reduce((sum, data) => sum + data.income, 0) /
        seasonData.length;

      return {
        ...season,
        avgSpending: Math.round(avgSpending),
        avgIncome: Math.round(avgIncome),
        avgNet: Math.round(avgIncome - avgSpending),
      };
    });
  }, [spendingTrends]);

  // Generate forecasting insights
  const forecastInsights = useMemo(() => {
    const recentTrends = spendingTrends.slice(-6, -3); // Last 3 months of actual data
    const avgSpending =
      recentTrends.reduce((sum, data) => sum + data.spending, 0) /
      recentTrends.length;
    const avgGrowth =
      spendingVelocity.slice(-3).reduce((sum, v) => sum + v.percentChange, 0) /
      3;

    const projectedNext = avgSpending * (1 + avgGrowth / 100);
    const confidence = Math.max(60, 90 - Math.abs(avgGrowth) * 2); // Lower confidence for higher volatility

    return {
      projectedSpending: Math.round(projectedNext),
      growthRate: Math.round(avgGrowth * 10) / 10,
      confidence: Math.round(confidence),
      trend:
        avgGrowth > 2 ? "increasing" : avgGrowth < -2 ? "decreasing" : "stable",
    };
  }, [spendingTrends, spendingVelocity]);

  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercent = (value) => `${value > 0 ? "+" : ""}${value}%`;

  return (
    <div className="space-y-8">
      {/* Forecast Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Spending Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Next Month Projection</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(forecastInsights.projectedSpending)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p
                  className={`text-2xl font-bold ${
                    forecastInsights.growthRate > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatPercent(forecastInsights.growthRate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence Level</p>
                <p className="text-2xl font-bold text-blue-600">
                  {forecastInsights.confidence}%
                </p>
              </div>
            </div>
          </div>
          <div
            className={`p-3 rounded-full ${
              forecastInsights.trend === "increasing"
                ? "bg-red-100"
                : forecastInsights.trend === "decreasing"
                  ? "bg-green-100"
                  : "bg-gray-100"
            }`}
          >
            {forecastInsights.trend === "increasing" ? (
              <TrendingUp className="h-6 w-6 text-red-600" />
            ) : forecastInsights.trend === "decreasing" ? (
              <TrendingDown className="h-6 w-6 text-green-600" />
            ) : (
              <BarChart3 className="h-6 w-6 text-gray-600" />
            )}
          </div>
        </div>
      </div>

      {/* Historical Trends Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          12-Month Financial Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={spendingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={(month) => `Month: ${month}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                fill="#10B981"
                fillOpacity={0.3}
                stroke="#10B981"
                name="Income"
              />
              <Bar dataKey="spending" fill="#EF4444" name="Spending" />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#6366F1"
                strokeWidth={3}
                strokeDasharray={(entry) => (entry?.forecast ? "5 5" : "none")}
                name="Net Amount"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 bg-gray-400 rounded"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)",
              }}
            ></div>
            <span>Forecasted Data</span>
          </div>
          <Info className="h-4 w-4" />
          <span>Last 3 months are projected based on historical trends</span>
        </div>
      </div>

      {/* Spending Velocity Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending Velocity Analysis
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "percentChange"
                    ? formatPercent(value)
                    : formatCurrency(value),
                  name === "percentChange" ? "Rate of Change" : "Amount Change",
                ]}
              />
              <Area
                type="monotone"
                dataKey="percentChange"
                fill="#8B5CF6"
                fillOpacity={0.6}
                stroke="#8B5CF6"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Trends */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Category Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryTrends.map((category, index) => (
            <div
              key={category.name}
              className="border border-gray-100 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-2">
                {category.name}
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={category.trend}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Amount"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Patterns */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seasonal Spending Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonalPatterns.map((season) => (
            <div
              key={season.name}
              className="border border-gray-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: season.color }}
                ></div>
                <h4 className="font-medium text-gray-900">{season.name}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Spending:</span>
                  <span className="font-medium">
                    {formatCurrency(season.avgSpending)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Income:</span>
                  <span className="font-medium">
                    {formatCurrency(season.avgIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net:</span>
                  <span
                    className={`font-medium ${
                      season.avgNet >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(season.avgNet))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • Your spending trend is currently{" "}
                <strong>{forecastInsights.trend}</strong> with{" "}
                {forecastInsights.confidence}% confidence
              </li>
              <li>
                • Seasonal analysis shows highest spending in{" "}
                <strong>
                  {
                    seasonalPatterns.reduce((max, season) =>
                      season.avgSpending > max.avgSpending ? season : max,
                    ).name
                  }
                </strong>
              </li>
              <li>
                • Average monthly spending velocity:{" "}
                <strong>
                  {formatPercent(
                    spendingVelocity.reduce(
                      (sum, v) => sum + v.percentChange,
                      0,
                    ) / spendingVelocity.length,
                  )}
                </strong>
              </li>
              {forecastInsights.growthRate > 5 && (
                <li className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    High spending growth detected - consider budget review
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisCharts;
