import React, { useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import {
  TrendLineChart,
  CategoryBarChart,
  DistributionPieChart,
  DistributionPieChartWithDetails,
  CashFlowChart,
  BudgetVsActualChart,
  useChartConfig,
} from "../charts";
import { useAnalyticsData } from "../../hooks/analytics/useAnalyticsData";
import logger from "../../utils/common/logger";

const ChartsAnalytics = ({
  transactions = [],
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  timeFilter = "thisMonth", // New prop for time filtering
  focus = "overview", // New prop for focused analysis
}) => {
  // Use the extracted analytics data hook
  const analyticsData = useAnalyticsData({
    transactions,
    envelopes,
    timeFilter,
  });

  const { formatters } = useChartConfig();
  const [activeTab, setActiveTab] = useState(focus || "overview");
  const [chartType, setChartType] = useState("line"); // line, bar, area
  const [dateRange, setDateRange] = useState(timeFilter);

  // Destructure analytics data
  const {
    filteredTransactions,
    monthlyTrends,
    envelopeSpending,
    categoryBreakdown,
    weeklyPatterns,
    envelopeHealth,
    budgetVsActual,
    metrics,
  } = analyticsData;

  // Optimized event handlers
  const handleDateRangeChange = useCallback((e) => {
    setDateRange(e.target.value);
    logger.debug("Date range changed:", e.target.value);
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleExport = useCallback(() => {
    // Export functionality
    const dataToExport = {
      dateRange,
      metrics,
      monthlyTrends,
      envelopeSpending,
      categoryBreakdown,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.userName || "Anonymous",
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [
    dateRange,
    metrics,
    monthlyTrends,
    envelopeSpending,
    categoryBreakdown,
    currentUser?.userName,
  ]);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "purple",
  }) => {
    const Icon = icon;

    const gradientClasses = {
      red: "from-red-500 to-red-600",
      orange: "from-orange-500 to-orange-600",
      amber: "from-amber-500 to-amber-600",
      yellow: "from-yellow-500 to-yellow-600",
      emerald: "from-emerald-500 to-emerald-600",
      teal: "from-teal-500 to-teal-600",
      cyan: "from-cyan-500 to-cyan-600",
      blue: "from-blue-500 to-blue-600",
      indigo: "from-indigo-500 to-indigo-600",
      purple: "from-purple-500 to-purple-600",
      pink: "from-pink-500 to-pink-600",
      gray: "from-gray-500 to-gray-600",
    };

    const textClasses = {
      red: "text-red-100",
      orange: "text-orange-100",
      amber: "text-amber-100",
      yellow: "text-yellow-100",
      emerald: "text-emerald-100",
      teal: "text-teal-100",
      cyan: "text-cyan-100",
      blue: "text-blue-100",
      indigo: "text-indigo-100",
      purple: "text-purple-100",
      pink: "text-pink-100",
      gray: "text-gray-100",
    };

    const iconClasses = {
      red: "text-red-200",
      orange: "text-orange-200",
      amber: "text-amber-200",
      yellow: "text-yellow-200",
      emerald: "text-emerald-200",
      teal: "text-teal-200",
      cyan: "text-cyan-200",
      blue: "text-blue-200",
      indigo: "text-indigo-200",
      purple: "text-purple-200",
      pink: "text-pink-200",
      gray: "text-gray-200",
    };

    return (
      <div
        className={`bg-gradient-to-br ${gradientClasses[color] || gradientClasses.purple} p-4 rounded-lg text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`${textClasses[color] || textClasses.purple} text-sm`}
            >
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p
                className={`text-xs ${textClasses[color] || textClasses.purple} mt-2`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <Icon
            className={`h-8 w-8 ${iconClasses[color] || iconClasses.purple}`}
          />
        </div>
        {trend && (
          <div className="mt-3 flex items-center text-sm">
            {trend > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-white mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-white mr-1" />
            )}
            <span className="text-white">
              {Math.abs(trend).toFixed(1)}% vs last period
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center text-gray-900">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-cyan-500 p-3 rounded-2xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            Analytics & Reports
          </h2>
          <p className="text-gray-800 mt-1">
            Financial insights and spending patterns
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-lg"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center rounded-xl px-4 py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Income"
          value={`$${metrics.totalIncome.toFixed(2)}`}
          subtitle={`${filteredTransactions.filter((t) => t.amount > 0).length} transactions`}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${metrics.totalExpenses.toFixed(2)}`}
          subtitle={`${filteredTransactions.filter((t) => t.amount < 0).length} transactions`}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Net Cash Flow"
          value={`${metrics.netCashFlow >= 0 ? "+" : ""}$${metrics.netCashFlow.toFixed(2)}`}
          subtitle={`${metrics.savingsRate.toFixed(1)}% savings rate`}
          icon={DollarSign}
          color={metrics.netCashFlow >= 0 ? "cyan" : "amber"}
        />
        <MetricCard
          title="Avg Monthly Expenses"
          value={`$${metrics.avgMonthlyExpenses.toFixed(2)}`}
          subtitle={`${monthlyTrends.length} months of data`}
          icon={Wallet}
          color="purple"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="glassmorphism rounded-xl">
        <nav className="flex border-b border-white/20">
          {[
            { id: "overview", name: "Overview", icon: BarChart3 },
            { id: "trends", name: "Trends", icon: TrendingUp },
            { id: "envelopes", name: "Envelopes", icon: Wallet },
            { id: "categories", name: "Categories", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600 bg-cyan-50/50"
                  : "border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/30"
              }`}
            >
              <tab.icon className="h-4 w-4 inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Cash Flow */}
          <CashFlowChart
            title="Monthly Cash Flow"
            data={monthlyTrends}
            height={300}
          />

          {/* Top Spending Envelopes */}
          <DistributionPieChart
            title="Top Spending Envelopes"
            data={envelopeSpending?.slice(0, 8)}
            dataKey="amount"
            nameKey="name"
            height={300}
            emptyMessage="No envelope spending data available"
          />
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Spending Trends Chart */}
          <div className="glassmorphism rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Spending Trends
              </h3>
              <div className="flex gap-2">
                {["line", "bar", "area"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeChange(type)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      chartType === type
                        ? "bg-cyan-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {chartType === "line" && (
              <TrendLineChart
                data={monthlyTrends}
                lines={[
                  { dataKey: "income", name: "Income", color: "#10b981" },
                  { dataKey: "expenses", name: "Expenses", color: "#ef4444" },
                ]}
                height={400}
                emptyMessage="No data available for the selected period"
              />
            )}

            {chartType === "bar" && (
              <CategoryBarChart
                data={monthlyTrends}
                bars={[
                  { dataKey: "income", name: "Income", fill: "#10b981" },
                  { dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
                ]}
                height={400}
                emptyMessage="No data available for the selected period"
              />
            )}

            {chartType === "area" && (
              <CashFlowChart
                data={monthlyTrends}
                height={400}
                emptyMessage="No data available for the selected period"
              />
            )}
          </div>

          {/* Weekly Spending Patterns */}
          <CategoryBarChart
            title="Weekly Spending Patterns"
            data={weeklyPatterns}
            bars={[
              { dataKey: "amount", name: "Amount Spent", fill: "#a855f7" },
            ]}
            height={300}
            emptyMessage="No weekly spending data available"
          />
        </div>
      )}

      {activeTab === "envelopes" && (
        <div className="space-y-6">
          {/* Envelope Health Overview */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Envelope Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {envelopeHealth.map((envelope, index) => (
                <div
                  key={index}
                  className="bg-white/60 rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: envelope.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {envelope.name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        envelope.status === "critical"
                          ? "bg-red-100 text-red-800"
                          : envelope.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : envelope.status === "overfunded"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {envelope.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-medium">
                        ${envelope.currentBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">
                        ${envelope.monthlyBudget.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          envelope.status === "critical"
                            ? "bg-red-500"
                            : envelope.status === "warning"
                              ? "bg-yellow-500"
                              : envelope.status === "overfunded"
                                ? "bg-blue-500"
                                : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(100, envelope.healthScore)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget vs Actual */}
          <BudgetVsActualChart data={budgetVsActual} height={400} />
        </div>
      )}

      {activeTab === "categories" && (
        <DistributionPieChartWithDetails
          title="Spending by Category"
          data={categoryBreakdown}
          dataKey="amount"
          nameKey="name"
          maxItems={8}
        />
      )}
    </div>
  );
};

export default ChartsAnalytics;
