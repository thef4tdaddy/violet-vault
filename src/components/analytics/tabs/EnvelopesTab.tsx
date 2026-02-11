import React, { useMemo } from "react";
import {
  BudgetVsActualChart,
  DistributionPieChartWithDetails,
  CategoryBarChart,
} from "../../charts";

interface EnvelopeSpendingEntry {
  name?: string;
  amount?: number;
  count?: number;
  color?: string;
}

interface BudgetVsActualEntry {
  name?: string;
  budgeted?: number;
  actual?: number;
}

interface EnvelopeBalanceEntry {
  id?: string;
  name?: string;
  currentBalance?: number;
  targetAmount?: number;
  color?: string;
}

interface EnvelopeHealthEntry {
  id?: string;
  name?: string;
  status?: string;
  remaining?: number;
  budgeted?: number;
}

interface EnvelopesTabProps {
  envelopeSpending?: EnvelopeSpendingEntry[];
  budgetVsActual?: BudgetVsActualEntry[];
  envelopes?: EnvelopeBalanceEntry[];
  envelopeHealth?: EnvelopeHealthEntry[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const EnvelopesTab: React.FC<EnvelopesTabProps> = ({
  envelopeSpending = [],
  budgetVsActual = [],
  envelopes = [],
  envelopeHealth = [],
}) => {
  const spendingData = useMemo(() => {
    return (Array.isArray(envelopeSpending) ? envelopeSpending : [])
      .filter((entry) => entry != null)
      .slice(0, 12)
      .map((entry) => ({
        name: String(entry?.name ?? "Envelope"),
        amount: Math.abs(Number(entry?.amount ?? 0)),
        count: Number(entry?.count ?? 0),
        color: typeof entry?.color === "string" ? entry?.color : undefined,
      }));
  }, [envelopeSpending]);

  const balanceDistribution = useMemo(() => {
    return (Array.isArray(envelopes) ? envelopes : [])
      .filter((entry) => entry != null)
      .map((entry) => ({
        name: String(entry?.name ?? "Envelope"),
        balance: Number(entry?.currentBalance ?? 0),
        target: Number(entry?.targetAmount ?? 0),
        color: typeof entry?.color === "string" ? entry?.color : undefined,
      }))
      .filter((entry) => entry.balance !== 0);
  }, [envelopes]);

  const healthSnapshot = useMemo(() => {
    return (Array.isArray(envelopeHealth) ? envelopeHealth : [])
      .filter((entry) => entry != null)
      .slice(0, 6)
      .map((entry) => ({
        id: entry?.id ?? entry?.name ?? "",
        name: String(entry?.name ?? "Envelope"),
        status: String(entry?.status ?? "unknown"),
        remaining: Number(entry?.remaining ?? 0),
        budgeted: Number(entry?.budgeted ?? 0),
      }));
  }, [envelopeHealth]);

  return (
    <div className="space-y-6">
      {Array.isArray(budgetVsActual) && budgetVsActual.length > 0 && (
        <BudgetVsActualChart
          data={budgetVsActual as unknown as Array<Record<string, unknown>>}
          height={360}
        />
      )}

      {balanceDistribution.length > 0 && (
        <DistributionPieChartWithDetails
          title="Envelope Balances"
          subtitle=""
          data={balanceDistribution as unknown as Array<Record<string, unknown>>}
          dataKey="balance"
          nameKey="name"
          maxItems={8}
          detailContent={
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Balance Summary</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {balanceDistribution.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm"
                  >
                    <div className="font-medium text-gray-900">{entry.name}</div>
                    <div className="flex flex-col text-right">
                      <span className="font-semibold text-gray-900">
                        {currencyFormatter.format(entry.balance)}
                      </span>
                      {entry.target > 0 && (
                        <span className="text-xs text-gray-500">
                          Target {currencyFormatter.format(entry.target)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      )}

      {spendingData.length > 0 && (
        <CategoryBarChart
          title="Top Envelope Spending"
          subtitle=""
          data={spendingData as unknown as Array<Record<string, unknown>>}
          bars={[
            {
              dataKey: "amount",
              name: "Spent",
              fill: "#6366f1",
            },
          ]}
          categoryKey="name"
          orientation="horizontal"
          showLegend={false}
          height={360}
        />
      )}

      {healthSnapshot.length > 0 && (
        <div className="glassmorphism rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Envelope Health Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthSnapshot.map((entry) => (
              <div key={entry.id} className="bg-white/70 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-900">{entry.name}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {entry.status}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div>
                    Balance:{" "}
                    <span className="font-semibold">
                      {currencyFormatter.format(entry.remaining)}
                    </span>
                  </div>
                  <div>
                    Budgeted:{" "}
                    <span className="font-semibold">
                      {currencyFormatter.format(entry.budgeted)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvelopesTab;
export type {
  EnvelopesTabProps,
  EnvelopeSpendingEntry,
  BudgetVsActualEntry,
  EnvelopeBalanceEntry,
  EnvelopeHealthEntry,
};
