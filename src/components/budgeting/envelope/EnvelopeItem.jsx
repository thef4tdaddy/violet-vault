import React, { Suspense } from "react";
import {
  Edit,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getStatusStyle, getUtilizationColor } from "../../../utils/budgeting";
import { ENVELOPE_TYPES } from "../../../constants/categories";

// Lazy load the bill funding info component
const BillEnvelopeFundingInfo = React.lazy(
  () => import("../BillEnvelopeFundingInfo"),
);

const EnvelopeItem = ({
  envelope,
  onSelect,
  onEdit,
  onViewHistory,
  isSelected,
  bills = [],
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
      case "overspent":
        return <AlertTriangle className="h-4 w-4" />;
      case "underfunded":
        return <Clock className="h-4 w-4" />;
      case "healthy":
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const utilizationColorClass = getUtilizationColor(
    envelope.utilizationRate,
    envelope.status,
  );

  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${getStatusStyle(envelope)} ${
        isSelected ? "ring-2 ring-purple-500" : ""
      }`}
      onClick={() => onSelect?.(envelope.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {envelope.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">{envelope.category}</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs ${utilizationColorClass}`}
          >
            {envelope.status !== "healthy" && getStatusIcon(envelope.status)}
            <span className="ml-1">
              {(envelope.utilizationRate * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(envelope);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewHistory?.(envelope);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            ${(envelope.currentBalance || 0).toFixed(2)}
          </p>
        </div>
        <div>
          {envelope.envelopeType === ENVELOPE_TYPES.BILL ? (
            // For bill envelopes, show how much more is needed instead of negative "available"
            (() => {
              // Find linked bills to get the target amount
              const linkedBills = bills.filter(bill => bill.envelopeId === envelope.id && !bill.isPaid);
              const nextBill = linkedBills
                .filter(bill => new Date(bill.dueDate) >= new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
              const targetAmount = nextBill ? (nextBill.amount || 0) : (envelope.monthlyBudget || envelope.monthlyAmount || 0);
              const currentBalance = envelope.currentBalance || 0;
              const amountNeeded = Math.max(0, targetAmount - currentBalance);
              
              return (
                <>
                  <p className="text-xs text-gray-500">
                    {amountNeeded > 0 ? "Still Need" : "Surplus"}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      amountNeeded > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    ${amountNeeded > 0 ? amountNeeded.toFixed(2) : (currentBalance - targetAmount).toFixed(2)}
                  </p>
                </>
              );
            })()
          ) : (
            // For non-bill envelopes, keep the original "Available" display
            <>
              <p className="text-xs text-gray-500">Available</p>
              <p
                className={`text-lg font-semibold ${
                  envelope.available >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${envelope.available.toFixed(2)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-gray-500">Spent</p>
          <p className="font-medium text-red-600">
            ${envelope.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Upcoming</p>
          <p className="font-medium text-orange-600">
            ${envelope.totalUpcoming.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Overdue</p>
          <p className="font-medium text-red-700">
            ${envelope.totalOverdue.toFixed(2)}
          </p>
        </div>
      </div>


      {/* Minimal Bill Info for Bill Envelopes - most info already shown above */}
      {envelope.envelopeType === ENVELOPE_TYPES.BILL && bills.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Suspense
            fallback={
              <div className="text-xs text-gray-500">
                Loading funding info...
              </div>
            }
          >
            {(() => {
              // Find linked bills to get minimal additional info
              const linkedBills = bills.filter(bill => bill.envelopeId === envelope.id && !bill.isPaid);
              const nextBill = linkedBills
                .filter(bill => new Date(bill.dueDate) >= new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
              
              if (!nextBill) return null;
              
              const daysUntil = Math.ceil((new Date(nextBill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div className="text-xs text-gray-500">
                  Next: {nextBill.name || nextBill.provider} in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </div>
              );
            })()}
          </Suspense>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              envelope.utilizationRate > 1
                ? "bg-red-500"
                : envelope.utilizationRate > 0.8
                  ? "bg-orange-500"
                  : envelope.utilizationRate > 0.5
                    ? "bg-blue-500"
                    : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(envelope.utilizationRate * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnvelopeItem;
