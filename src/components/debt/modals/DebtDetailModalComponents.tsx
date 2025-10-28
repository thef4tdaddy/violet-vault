import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface ModalHeaderProps {
  debt: Record<string, unknown>;
  onClose: () => void;
}

export const ModalHeader = ({ debt, onClose }: ModalHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{debt.name as string}</h3>
        <p className="text-gray-600">
          {debt.creditor as string} • {debt.type as string}
        </p>
      </div>
      <Button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
      </Button>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const StatCard = ({ label, value, icon, bgColor, textColor, iconColor }: StatCardProps) => {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${textColor} font-medium`}>{label}</p>
          <p className={`text-2xl font-bold ${textColor.replace("600", "700")}`}>{value}</p>
        </div>
        {React.createElement(getIcon(icon), {
          className: `h-8 w-8 ${iconColor}`,
        })}
      </div>
    </div>
  );
};

interface MainStatsProps {
  debt: Record<string, unknown>;
}

export const MainStats = ({ debt }: MainStatsProps) => {
  const currentBalance = (debt.currentBalance as number)?.toFixed(2) || "0.00";
  const minimumPayment = (debt.minimumPayment as number)?.toFixed(2) || "0.00";
  const interestRate = (debt.interestRate as number)?.toFixed(2) || "0.00";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        label="Current Balance"
        value={`$${currentBalance}`}
        icon="TrendingDown"
        bgColor="bg-red-50"
        textColor="text-red-600"
        iconColor="text-red-500"
      />
      <StatCard
        label="Monthly Payment"
        value={`$${minimumPayment}`}
        icon="Calendar"
        bgColor="bg-orange-50"
        textColor="text-orange-600"
        iconColor="text-orange-500"
      />
      <StatCard
        label="Interest Rate"
        value={`${interestRate}%`}
        icon="DollarSign"
        bgColor="bg-purple-50"
        textColor="text-purple-600"
        iconColor="text-purple-500"
      />
    </div>
  );
};

interface PayoffProjectionProps {
  payoffDisplay: {
    expectedPayoff: string;
    totalInterest: string;
    payoffDate: string;
  };
}

export const PayoffProjection = ({ payoffDisplay }: PayoffProjectionProps) => {
  if (!payoffDisplay) return null;

  return (
    <div className="bg-blue-50 rounded-xl p-4 mb-6">
      <h4 className="font-medium text-blue-900 mb-3">Payoff Projection</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-blue-600">Expected Payoff</p>
          <p className="font-semibold text-blue-900">{payoffDisplay.expectedPayoff}</p>
        </div>
        <div>
          <p className="text-blue-600">Total Interest</p>
          <p className="font-semibold text-blue-900">${payoffDisplay.totalInterest}</p>
        </div>
        <div>
          <p className="text-blue-600">Payoff Date</p>
          <p className="font-semibold text-blue-900">{payoffDisplay.payoffDate}</p>
        </div>
      </div>
    </div>
  );
};

interface RecentPaymentsProps {
  recentPayments: Array<{
    id: string;
    formattedAmount: string;
    displayDate: string;
    principalDisplay?: string;
    interestDisplay?: string;
  }>;
}

export const RecentPayments = ({ recentPayments }: RecentPaymentsProps) => {
  if (recentPayments.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {recentPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
          >
            <div>
              <p className="text-sm font-medium">${payment.formattedAmount}</p>
              <p className="text-xs text-gray-600">{payment.displayDate}</p>
            </div>
            <div className="text-right text-xs text-gray-600">
              {payment.principalDisplay && <p>Principal: ${payment.principalDisplay}</p>}
              {payment.interestDisplay && <p>Interest: ${payment.interestDisplay}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ModalActionsProps {
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ModalActions = ({ onClose, onEdit, onDelete }: ModalActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onClose}
        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
      >
        Close
      </Button>
      <Button
        onClick={onEdit}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
      >
        {React.createElement(getIcon("Edit"), {
          className: "h-4 w-4 mr-2",
        })}
        Edit Debt
      </Button>
      <Button
        onClick={onDelete}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center"
      >
        {React.createElement(getIcon("Trash2"), {
          className: "h-4 w-4 mr-2",
        })}
        Delete
      </Button>
    </div>
  );
};
