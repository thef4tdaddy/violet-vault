import React from "react";
import { getIcon } from "../../../utils";

// Type definitions
interface AllocationItem {
  envelopeId: string;
  envelopeName: string;
  amount: number;
  priority?: string;
  [key: string]: unknown;
}

interface AllocationPreviewData {
  allocations: AllocationItem[];
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
}

interface AllocationPreviewProps {
  allocationPreview: AllocationPreviewData;
  hasAmount: boolean;
  allocationMode: string;
}

const AllocationPreview = ({ allocationPreview, hasAmount, allocationMode }: AllocationPreviewProps) => {
  const { allocations, totalAllocated, remainingAmount, allocationRate } = allocationPreview;

  if (!hasAmount) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        {React.createElement(getIcon("Target"), {
          className: "h-8 w-8 mx-auto text-gray-400 mb-2",
        })}
        <p className="text-gray-500">Enter a paycheck amount to see allocation preview</p>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        {React.createElement(getIcon("AlertCircle"), {
          className: "h-8 w-8 mx-auto text-yellow-600 mb-2",
        })}
        <p className="text-yellow-800 font-medium mb-1">No Auto-Allocating Envelopes</p>
        <p className="text-yellow-700 text-sm">
          Create envelopes with auto-allocation enabled to see allocation preview
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getPriorityLabel = (priority: string | undefined) => {
    switch (priority) {
      case "critical":
        return "Critical";
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Medium";
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-green-900 flex items-center">
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-4 w-4 mr-2",
            })}
            Allocation Preview
          </h3>
          <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-md">
            {allocationMode === "allocate" ? "Standard" : "Proportional"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-700 block">Total Allocated</span>
            <span className="font-bold text-green-900">${totalAllocated.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-green-700 block">Remaining</span>
            <span className="font-bold text-green-900">${remainingAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-green-700 block">Allocation Rate</span>
            <span className="font-bold text-green-900">{allocationRate}%</span>
          </div>
        </div>
      </div>

      {/* Allocations List */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Envelope Allocations</h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {allocations.map((allocation) => (
            <div
              key={allocation.envelopeId}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 truncate">
                    {allocation.envelopeName}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-md border ${getPriorityColor(allocation.priority)}`}
                  >
                    {getPriorityLabel(allocation.priority)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Monthly: ${allocation.monthlyAmount?.toFixed(2) || "0.00"} • Type:{" "}
                  {allocation.envelopeType}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${allocation.amount.toFixed(2)}</div>
                {allocationMode === "allocate" && allocation.monthlyAmount > 0 && (
                  <div className="text-xs text-gray-500">
                    {((allocation.amount / allocation.monthlyAmount) * 100).toFixed(0)}% of monthly
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining Amount Notice */}
      {remainingAmount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4 text-blue-600 mr-2",
            })}
            <div>
              <p className="text-sm font-medium text-blue-900">
                ${remainingAmount.toFixed(2)} will go to unassigned funds
              </p>
              <p className="text-xs text-blue-700">
                Consider creating additional envelopes or adjusting allocation amounts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationPreview;
