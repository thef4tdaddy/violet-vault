import React, { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
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

const ChartsAnalytics = ({
  transactions = [],
  envelopes = [],
  bills = [],
  paycheckHistory = [],
  savingsGoals = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("6months"); // 1month, 3months, 6months, 1year, all
  const [chartType, setChartType] = useState("line"); // line, bar, area

  // Memoized date range calculations
  const getDateRange = useMemo(() => {
    const now = new Date();
    const ranges = {
      "1month": new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      "3months": new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      "6months": new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      "1year": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      all: new Date(2020, 0, 1),
    };
    return ranges[dateRange];
  }, [dateRange]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => new Date(t.date) >= getDateRange);
  }, [transactions, getDateRange]);

  // Monthly spending trends
  const monthlyTrends = useMemo(() => {
    const grouped = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
          transactionCount: 0,
        };
      }

      if (transaction.amount > 0) {
        grouped[monthKey].income += transaction.amount;
      } else {
        grouped[monthKey].expenses += Math.abs(transaction.amount);
      }

      grouped[monthKey].net =
        grouped[monthKey].income - grouped[monthKey].expenses;
      grouped[monthKey].transactionCount++;
    });

    return Object.values(grouped).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [filteredTransactions]);

  // Envelope spending breakdown
  const envelopeSpending = useMemo(() => {
    const spending = {};

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0 && transaction.envelopeId) {
        const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
        const envelopeName = envelope ? envelope.name : "Unknown Envelope";

        if (!spending[envelopeName]) {
          spending[envelopeName] = {
            name: envelopeName,
            amount: 0,
            count: 0,
            color: envelope?.color || "#8B5CF6",
          };
        }

        spending[envelopeName].amount += Math.abs(transaction.amount);
        spending[envelopeName].count++;
      }
    });

    return Object.values(spending).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, envelopes]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = {};

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        const category = transaction.category || "Uncategorized";

        if (!categories[category]) {
          categories[category] = {
            name: category,
            amount: 0,
            count: 0,
          };
        }

        categories[category].amount += Math.abs(transaction.amount);
        categories[category].count++;
      }
    });

    return Object.values(categories).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Weekly spending patterns
  const weeklyPatterns = useMemo(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const patterns = days.map((day) => ({ day, amount: 0, count: 0 }));

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        const dayIndex = new Date(transaction.date).getDay();
        patterns[dayIndex].amount += Math.abs(transaction.amount);
        patterns[dayIndex].count++;
      }
    });

    return patterns;
  }, [filteredTransactions]);

  // Envelope health analysis
  const envelopeHealth = useMemo(() => {
    return envelopes.map((envelope) => {
      const monthlyBudget = envelope.monthlyAmount || 0;
      const currentBalance = envelope.currentBalance || 0;
      const spent =
        envelope.spendingHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

      const healthScore =
        monthlyBudget > 0 ? (currentBalance / monthlyBudget) * 100 : 100;
      let status = "healthy";

      if (healthScore < 20) status = "critical";
      else if (healthScore < 50) status = "warning";
      else if (healthScore > 150) status = "overfunded";

      return {
        name: envelope.name,
        currentBalance,
        monthlyBudget,
        spent,
        healthScore: Math.max(0, Math.min(200, healthScore)),
        status,
        color: envelope.color,
      };
    });
  }, [envelopes]);

  // Budget vs actual analysis
  const budgetVsActual = useMemo(() => {
    const analysis = {};

    envelopes.forEach((envelope) => {
      analysis[envelope.name] = {
        name: envelope.name,
        budgeted: envelope.monthlyAmount || 0,
        actual: 0,
        color: envelope.color,
      };
    });

    filteredTransactions.forEach((transaction) => {
      if (transaction.amount < 0 && transaction.envelopeId) {
        const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
        if (envelope && analysis[envelope.name]) {
          analysis[envelope.name].actual += Math.abs(transaction.amount);
        }
      }
    });

    return Object.values(analysis).filter(
      (item) => item.budgeted > 0 || item.actual > 0
    );
  }, [filteredTransactions, envelopes]);

  // Financial metrics
  const metrics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const avgMonthlyIncome =
      monthlyTrends.length > 0
        ? monthlyTrends.reduce((sum, m) => sum + m.income, 0) /
          monthlyTrends.length
        : 0;

    const avgMonthlyExpenses =
      monthlyTrends.length > 0
        ? monthlyTrends.reduce((sum, m) => sum + m.expenses, 0) /
          monthlyTrends.length
        : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      savingsRate,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions, monthlyTrends]);

  // Memoized chart colors
  const chartColors = useMemo(() => [
    "#a855f7",
    "#06b6d4", 
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
    "#84cc16",
    "#6366f1",
  ], []);

  // Optimized event handlers
  const handleDateRangeChange = useCallback((e) => {
    setDateRange(e.target.value);
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
      exportedBy: currentUser?.userName || 'Anonymous'
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [dateRange, metrics, monthlyTrends, envelopeSpending, categoryBreakdown, currentUser?.userName]);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "purple",
  }) => (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="relative">
          <div
            className={`absolute inset-0 bg-${color}-500 rounded-2xl blur-lg opacity-30`}
          ></div>
          <div className={`relative bg-${color}-500 p-3 rounded-2xl`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-sm">
          {trend > 0 ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? "text-emerald-600" : "text-red-600"}>
            {Math.abs(trend).toFixed(1)}% vs last period
          </span>
        </div>
      )}
    </div>
  );

  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);


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
          subtitle={`${
            filteredTransactions.filter((t) => t.amount > 0).length
          } transactions`}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${metrics.totalExpenses.toFixed(2)}`}
          subtitle={`${
            filteredTransactions.filter((t) => t.amount < 0).length
          } transactions`}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Net Cash Flow"
          value={`${
            metrics.netCashFlow >= 0 ? "+" : ""
          }$${metrics.netCashFlow.toFixed(2)}`}
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
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Cash Flow
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  name="Net"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Top Spending Envelopes */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Spending Envelopes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={envelopeSpending.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {envelopeSpending.slice(0, 8).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || chartColors[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
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

            <ResponsiveContainer width="100%" height={400}>
              {chartType === "line" && (
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Expenses"
                  />
                </LineChart>
              )}
              {chartType === "bar" && (
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              )}
              {chartType === "area" && (
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Weekly Spending Patterns */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Spending Patterns
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#a855f7" name="Amount Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget vs Actual Spending
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={budgetVsActual} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6b7280"
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budgeted" fill="#a855f7" name="Budgeted" />
                <Bar dataKey="actual" fill="#06b6d4" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown Pie Chart */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending by Category
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Details Table */}
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Category Details
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categoryBreakdown.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/40 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${category.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(
                        (category.amount / metrics.totalExpenses) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsAnalytics;
