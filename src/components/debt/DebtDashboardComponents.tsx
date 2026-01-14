import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { isDebtFeatureEnabled } from "@/utils/debts/debtDebugConfig";
import DebtList from "./ui/DebtList";
import { DebtStats, DebtAccount } from "../../types/debt";
import DebtStrategies from "./DebtStrategies";

// Use the same Debt type that DebtList uses internally
export type Debt = {
  id: string;
  name: string;
  creditor: string;
  type: string;
  [key: string]: unknown;
};

interface FilterOptions {
  type: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  showPaidOff?: boolean;
}

interface OverviewTabProps {
  debtStats: DebtStats;
  filteredDebts: DebtAccount[];
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  setShowUpcomingPaymentsModal: (show: boolean) => void;
  handleDebtClick: (debt: DebtAccount | Debt) => void;
  handleRecordPayment: (debt: DebtAccount | Debt, amount: number) => void;
  handleAddDebt: () => void;
  debtTypes?: Record<string, string>;
  debtsByType?: Record<string, DebtAccount[]>;
}

export const OverviewTab = ({
  debtStats: _debtStats,
  filteredDebts,
  filterOptions: _filterOptions,
  setFilterOptions: _setFilterOptions,
  setShowUpcomingPaymentsModal: _setShowUpcomingPaymentsModal,
  handleDebtClick,
  handleRecordPayment,
  handleAddDebt,
  debtTypes: _debtTypes,
  debtsByType: _debtsByType,
}: OverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Debt List */}
      {isDebtFeatureEnabled("ENABLE_DEBT_LIST") ? (
        <div className="rounded-lg border-2 border-black">
          <div className="p-4 border-b-2 border-black bg-gray-50 rounded-t-lg">
            <h3 className="font-black text-black text-base flex items-center tracking-wide">
              {React.createElement(getIcon("TrendingDown"), {
                className: "h-4 w-4 mr-2 text-red-600",
              })}
              <span className="text-lg">Y</span>OUR&nbsp;&nbsp;<span className="text-lg">D</span>
              EBTS ({filteredDebts.length})
            </h3>
          </div>

          {filteredDebts.length === 0 ? (
            <EmptyDebtList handleAddDebt={handleAddDebt} />
          ) : (
            <DebtList
              debts={filteredDebts}
              onDebtClick={handleDebtClick}
              onRecordPayment={handleRecordPayment}
            />
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-purple-900">Debt List disabled for debugging</p>
        </div>
      )}
    </div>
  );
};

interface EmptyDebtListProps {
  handleAddDebt: () => void;
}

const EmptyDebtList = ({ handleAddDebt }: EmptyDebtListProps) => {
  return (
    <div className="text-center py-12">
      {React.createElement(getIcon("CreditCard"), {
        className: "h-12 w-12 mx-auto text-gray-300 mb-4",
      })}
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Debts Found</h3>
      <p className="text-gray-500 mb-4">
        Start tracking your debts to get insights into your debt payoff journey.
      </p>
      <Button onClick={handleAddDebt} className="btn btn-primary border-2 border-black">
        {React.createElement(getIcon("Plus"), {
          className: "h-4 w-4 mr-2",
        })}
        Add Your First Debt
      </Button>
    </div>
  );
};

interface StrategiesTabProps {
  debts: DebtAccount[];
}

export const StrategiesTab = ({ debts }: StrategiesTabProps) => {
  return isDebtFeatureEnabled("ENABLE_DEBT_STRATEGIES") ? (
    <DebtStrategies debts={debts} />
  ) : (
    <div className="text-center py-12">
      <p className="text-gray-600">Debt strategies temporarily disabled for debugging</p>
    </div>
  );
};

interface DashboardHeaderProps {
  debtStats: DebtStats;
  handleAddDebt: () => void;
}

export const DashboardHeader = ({ debtStats, handleAddDebt }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="font-black text-black text-xl flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-red-500 p-3 rounded-2xl">
              {React.createElement(getIcon("CreditCard"), {
                className: "h-6 w-6 text-white",
              })}
            </div>
          </div>
          <span className="text-2xl">D</span>EBT&nbsp;&nbsp;<span className="text-2xl">T</span>
          RACKING
        </h2>
        <p className="text-purple-900 mt-1">
          {debtStats.activeDebtCount} active debts • Total: ${debtStats.totalDebt.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-row gap-3">
        <Button
          onClick={handleAddDebt}
          className="btn btn-primary border-2 border-black flex items-center"
          data-tour="add-debt"
        >
          {React.createElement(getIcon("Plus"), {
            className: "h-4 w-4 mr-2",
          })}
          Add Debt
        </Button>
      </div>
    </div>
  );
};
