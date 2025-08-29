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
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Allocated</p>
            <p className="text-2xl font-bold">
              ${totals.totalAllocated.toFixed(2)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Balance / After Bills</p>
            <p className="text-2xl font-bold">
              ${totals.totalBalance.toFixed(2)}
            </p>
            <p className="text-xs text-green-100 mt-2">
              ${balanceAfterBills.toFixed(2)} after bills
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Total Spent</p>
            <p className="text-2xl font-bold">
              ${totals.totalSpent.toFixed(2)}
            </p>
          </div>
          <Target className="h-8 w-8 text-red-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Biweekly Need</p>
            <p className="text-2xl font-bold">
              ${totals.totalBiweeklyNeed.toFixed(2)}
            </p>
          </div>
          <Calculator className="h-8 w-8 text-purple-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Bills due</p>
            <p className="text-2xl font-bold">{totals.billsDueCount || 0}</p>
          </div>
          <Calendar className="h-8 w-8 text-orange-200" />
        </div>
      </div>
    </div>
  );
};

export default EnvelopeSummary;
