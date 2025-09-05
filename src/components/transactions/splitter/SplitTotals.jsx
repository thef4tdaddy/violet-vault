import React from "react";
import { Calculator, CheckCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/transactions/splitterHelpers";

const SplitTotals = ({ totals }) => {
  const { original, allocated, remaining, isValid, isOverAllocated, isUnderAllocated } = totals;

  const getStatusColor = () => {
    if (isValid) return "text-green-600";
    if (isOverAllocated) return "text-red-600";
    return "text-orange-600";
  };

  const getStatusMessage = () => {
    if (isValid) return "Perfect balance!";
    if (isOverAllocated) return "Over-allocated";
    return "Under-allocated";
  };

  return (
    <div className="bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-sm border-2 border-black rounded-xl p-4 shadow-lg">
      <h4 className="font-black text-gray-900 mb-3 flex items-center">
        <div className="glassmorphism rounded-full p-1 mr-2 border border-purple-300">
          <Calculator className="h-4 w-4 text-purple-600" />
        </div>
        SPLIT SUMMARY
      </h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-purple-800 font-medium">Original Amount:</span>
          <span className="font-black text-gray-900">{formatCurrency(original)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-purple-800 font-medium">Total Allocated:</span>
          <span className={`font-black ${isOverAllocated ? "text-red-600" : "text-gray-900"}`}>
            {formatCurrency(allocated)}
          </span>
        </div>

        <div className="flex justify-between border-t-2 border-black pt-2">
          <span className="text-purple-800 font-medium">Remaining:</span>
          <span className={`font-black ${getStatusColor()}`}>
            {formatCurrency(remaining)}
          </span>
        </div>

        <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
          <div className="glassmorphism rounded-full p-1 mr-2 border border-gray-300">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <span className={`text-xs font-bold ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SplitTotals;