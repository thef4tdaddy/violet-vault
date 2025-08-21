import React from "react";
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Target,
  Calendar,
} from "lucide-react";

const EnvelopeSummary = ({ totals }) => {
  const balanceAfterBills = totals.totalBalance - totals.totalUpcoming;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-xs text-gray-600">Total Allocated</p>
            <p className="text-lg font-semibold text-gray-900">
              ${totals.totalAllocated.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-xs text-gray-600">Balance / After Bills</p>
            <p className="text-lg font-semibold text-gray-900">
              ${totals.totalBalance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              ${balanceAfterBills.toFixed(2)} after bills
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
        <div className="flex items-center">
          <Target className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <p className="text-xs text-gray-600">Total Spent</p>
            <p className="text-lg font-semibold text-gray-900">
              ${totals.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
        <div className="flex items-center">
          <Calculator className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <p className="text-xs text-gray-600">Biweekly Need</p>
            <p className="text-lg font-semibold text-gray-900">
              ${totals.totalBiweeklyNeed.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <p className="text-xs text-gray-600">Bills due</p>
            <p className="text-lg font-semibold text-gray-900">
              {totals.billsDueCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeSummary;
