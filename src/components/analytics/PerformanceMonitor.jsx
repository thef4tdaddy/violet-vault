import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Clock,
  DollarSign,
  Wallet,
  Bell,
  BellOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePerformanceMonitor } from "../../hooks/analytics/usePerformanceMonitor";

/**
 * Performance Monitor for v1.10.0
 * Pure UI component - all logic extracted to usePerformanceMonitor hook
 */
const PerformanceMonitor = ({ analyticsData, balanceData }) => {
  const {
    alertsEnabled,
    selectedMetric,
    performanceHistory,
    performanceMetrics,
    setAlertsEnabled,
    setSelectedMetric,
  } = usePerformanceMonitor(analyticsData, balanceData);

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-blue-600 bg-blue-100";
    if (score >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const MetricCard = ({ title, score, icon, description }) => {
    const Icon = icon;
    return (
      <div className="bg-white/60 rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Icon className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}
          >
            {score}/100
          </span>
        </div>

        <div className="mb-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreBgColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    );
  };

  return (
    <div className="glassmorphism rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-purple-500 p-2 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            Performance Monitor
          </h3>
          <p className="text-gray-600 mt-1">
            Real-time financial health tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              alertsEnabled
                ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                : "text-gray-400 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {alertsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Live
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white mb-4">
            <span className="text-2xl font-bold">
              {performanceMetrics.overallScore}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Overall Financial Health
          </h4>
          <p className="text-gray-600 max-w-md mx-auto">
            {performanceMetrics.overallScore >= 90
              ? "Excellent financial management with strong performance across all areas"
              : performanceMetrics.overallScore >= 70
                ? "Good financial health with opportunities for optimization"
                : performanceMetrics.overallScore >= 50
                  ? "Fair financial standing that could benefit from focused improvements"
                  : "Financial health needs immediate attention and strategic planning"}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Budget Adherence"
          score={performanceMetrics.budgetAdherence}
          icon={Target}
          description="How well you're sticking to your planned spending"
        />
        <MetricCard
          title="Savings Rate"
          score={performanceMetrics.savingsRate}
          icon={TrendingUp}
          description="Your ability to save and build wealth"
        />
        <MetricCard
          title="Spending Efficiency"
          score={performanceMetrics.spendingEfficiency}
          icon={DollarSign}
          description="How balanced your spending is across categories"
        />
        <MetricCard
          title="Balance Stability"
          score={performanceMetrics.balanceStability}
          icon={Wallet}
          description="Accuracy between your actual and virtual balances"
        />
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: "overview", name: "Overview", icon: Eye },
          {
            id: "alerts",
            name: "Alerts",
            icon: Bell,
            count: performanceMetrics.alerts.length,
          },
          {
            id: "recommendations",
            name: "Tips",
            icon: Zap,
            count: performanceMetrics.recommendations.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
              selectedMetric === tab.id
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedMetric === "overview" && (
        <div className="space-y-4">
          {performanceHistory.length > 0 ? (
            <div className="bg-white/60 rounded-lg p-4 border border-white/20">
              <h4 className="font-medium text-gray-900 mb-3">
                Performance Trend
              </h4>
              <div className="flex items-end gap-1 h-20">
                {performanceHistory.slice(-20).map((entry, index) => (
                  <div
                    key={index}
                    className="bg-purple-500 rounded-t flex-1 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ height: `${(entry.score / 100) * 100}%` }}
                    title={`Score: ${entry.score} at ${new Date(entry.timestamp).toLocaleTimeString()}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Performance history will appear here over time</p>
            </div>
          )}
        </div>
      )}

      {selectedMetric === "alerts" && (
        <div className="space-y-3">
          {performanceMetrics.alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All Good!</p>
              <p>No performance alerts at this time.</p>
            </div>
          ) : (
            performanceMetrics.alerts.map((alert, index) => (
              <div
                key={index}
                className="bg-white/60 rounded-lg p-4 border border-white/20 flex items-start"
              >
                <div className="mr-3 mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                  {alert.action && (
                    <p className="text-purple-600 text-sm font-medium">
                      💡 {alert.action}
                    </p>
                  )}
                  {alert.details && (
                    <p className="text-gray-500 text-xs mt-2">
                      Affected: {alert.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedMetric === "recommendations" && (
        <div className="space-y-3">
          {performanceMetrics.recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">You're doing great!</p>
              <p>No specific recommendations at this time.</p>
            </div>
          ) : (
            performanceMetrics.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white/60 rounded-lg p-4 border border-white/20 flex items-start"
              >
                <div className="mr-3 mt-0.5">
                  {rec.type === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {rec.type === "info" && (
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  )}
                  {rec.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {rec.type === "tip" && (
                    <Zap className="h-5 w-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">{rec.message}</p>
                  {rec.action && (
                    <p className="text-purple-600 text-sm font-medium">
                      🎯 {rec.action}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
