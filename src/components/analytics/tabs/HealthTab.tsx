import React from "react";
import { BudgetVsActualChart } from "../../charts";

interface EnvelopeHealth {
  id?: string;
  name: string;
  status?: "critical" | "warning" | "overfunded" | "healthy" | string;
  currentBalance?: number;
  monthlyBudget?: number;
  healthScore?: number;
}

interface BudgetVsActualData {
  [key: string]: unknown;
}

interface HealthTabProps {
  envelopeHealth: EnvelopeHealth[] | null | undefined;
  budgetVsActual: BudgetVsActualData[] | null | undefined;
}

/**
 * Health tab content for analytics - envelope health monitoring
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const HealthTab: React.FC<HealthTabProps> = ({ envelopeHealth, budgetVsActual }) => {
  return (
    <div className="space-y-6">
      {/* Envelope Health Overview */}
      {envelopeHealth && envelopeHealth.length > 0 && (
        <div className="glassmorphism rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Envelope Health Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {envelopeHealth
              .filter(Boolean)
              .slice(0, 12)
              .map((envelope) => (
                <div
                  key={envelope.id || envelope.name}
                  className="bg-white/60 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{envelope.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
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
        </div>
      )}

      {/* Budget vs Actual */}
      <BudgetVsActualChart data={budgetVsActual || []} height={400} />
    </div>
  );
};

export default HealthTab;
