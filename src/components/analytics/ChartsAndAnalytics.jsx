import React from "react";
import { getIcon } from "../../utils";
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
import { useChartsAnalytics } from "../../hooks/analytics/useChartsAnalytics";
import { useAnalyticsExport } from "../../hooks/analytics/useAnalyticsExport";
import MetricCard from "./ui/MetricCard";

const ChartsAnalytics = ({
  transactions = [],
  envelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  timeFilter = "thisMonth",
  focus = "overview",
}) => {
  const analyticsData = useAnalyticsData({
    transactions,
    envelopes,
    timeFilter,
  });

  const { formatters: _formatters } = useChartConfig();
  const { exportAnalyticsData } = useAnalyticsExport();
  const {
    activeTab,
    chartType,
    dateRange,
    handleDateRangeChange,
    handleChartTypeChange,
    handleTabChange,
  } = useChartsAnalytics(timeFilter, focus);

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

  const handleExport = () => {
    exportAnalyticsData(
      {
        dateRange,
        metrics,
        monthlyTrends,
        envelopeSpending,
        categoryBreakdown,
      },
      currentUser,
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
                {React.createElement(getIcon("BarChart3"), {
                  className: "h-6 w-6 text-white",
                })}
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
            className="btn btn-secondary border-2 border-black flex items-center rounded-xl px-4 py-2"
          >
            {React.createElement(getIcon("Download"), {
              className: "h-4 w-4 mr-2",
            })}
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Income"
          value={`$${(metrics?.totalIncome || 0).toFixed(2)}`}
          subtitle={`${filteredTransactions?.filter((t) => t?.amount > 0)?.length || 0} transactions`}
          icon={getIcon("TrendingUp")}
          color="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${(metrics?.totalExpenses || 0).toFixed(2)}`}
          subtitle={`${filteredTransactions?.filter((t) => t?.amount < 0)?.length || 0} transactions`}
          icon={getIcon("TrendingDown")}
          color="red"
        />
        <MetricCard
          title="Net Cash Flow"
          value={`${(metrics?.netCashFlow || 0) >= 0 ? "+" : ""}$${(metrics?.netCashFlow || 0).toFixed(2)}`}
          subtitle={`${(metrics?.savingsRate || 0).toFixed(1)}% savings rate`}
          icon={getIcon("DollarSign")}
          color={(metrics?.netCashFlow || 0) >= 0 ? "cyan" : "amber"}
        />
        <MetricCard
          title="Avg Monthly Expenses"
          value={`$${(metrics?.avgMonthlyExpenses || 0).toFixed(2)}`}
          subtitle={`${monthlyTrends?.length || 0} months of data`}
          icon={getIcon("Wallet")}
          color="purple"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="glassmorphism rounded-xl">
        <nav className="flex border-b border-white/20">
          {[
            { id: "overview", name: "Overview", icon: "BarChart3" },
            { id: "trends", name: "Trends", icon: "TrendingUp" },
            { id: "envelopes", name: "Envelopes", icon: "Wallet" },
            { id: "categories", name: "Categories", icon: "BarChart3" },
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
              {React.createElement(getIcon(tab.icon), {
                className: "h-4 w-4 inline mr-2",
              })}
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
            data={(monthlyTrends || []).filter(Boolean)}
            height={300}
          />

          {/* Top Spending Envelopes */}
          <DistributionPieChart
            title="Top Spending Envelopes"
            data={(envelopeSpending || []).filter(Boolean).slice(0, 8)}
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
                data={(monthlyTrends || []).filter(Boolean)}
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
                data={(monthlyTrends || []).filter(Boolean)}
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
                data={(monthlyTrends || []).filter(Boolean)}
                height={400}
                emptyMessage="No data available for the selected period"
              />
            )}
          </div>

          {/* Weekly Spending Patterns */}
          <CategoryBarChart
            title="Weekly Spending Patterns"
            data={weeklyPatterns || []}
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
            {envelopeHealth.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {React.createElement(getIcon("Wallet"), {
                  className: "h-12 w-12 mx-auto mb-3 text-gray-400",
                })}
                <p>No envelopes to display</p>
                <p className="text-sm">
                  Create some envelopes to see their health status
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {envelopeHealth
                  .filter((envelope) => envelope != null)
                  .map((envelope, index) => (
                    <div
                      key={envelope.name || index}
                      className="bg-white/60 rounded-lg p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: envelope.color || "#8B5CF6",
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {envelope.name || "Unknown Envelope"}
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
                          {envelope.status || "unknown"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className="font-medium">
                            ${(envelope.currentBalance || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">
                            ${(envelope.monthlyBudget || 0).toFixed(2)}
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
                              width: `${Math.min(100, envelope.healthScore || 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Budget vs Actual */}
          <BudgetVsActualChart data={budgetVsActual || []} height={400} />
        </div>
      )}

      {activeTab === "categories" && (
        <DistributionPieChartWithDetails
          title="Spending by Category"
          data={categoryBreakdown || []}
          dataKey="amount"
          nameKey="name"
          maxItems={8}
        />
      )}
    </div>
  );
};

export default ChartsAnalytics;
