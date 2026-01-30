/**
 * Allocation Strategy Step - Smart allocation UI (Step 1)
 * Placeholder - Full implementation in Issue #162
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React from "react";

interface AllocationStrategyStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

const AllocationStrategyStep: React.FC<AllocationStrategyStepProps> = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-6">HOW DO YOU WANT TO ALLOCATE?</h2>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="p-6 bg-purple-50 hard-border rounded-lg hover:bg-purple-100 transition-all text-left">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-black text-slate-900 mb-1">USE LAST SPLIT</div>
            <div className="text-sm text-slate-600">Same as your previous paycheck</div>
          </button>

          <button className="p-6 bg-blue-50 hard-border rounded-lg hover:bg-blue-100 transition-all text-left">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-black text-slate-900 mb-1">SPLIT EVENLY</div>
            <div className="text-sm text-slate-600">Weighted by monthly targets</div>
          </button>

          <button className="p-6 bg-fuchsia-50 hard-border rounded-lg hover:bg-fuchsia-100 transition-all text-left">
            <div className="text-2xl mb-2">✨</div>
            <div className="font-black text-slate-900 mb-1">SMART SPLIT</div>
            <div className="text-sm text-slate-600">AI-powered suggestions</div>
          </button>
        </div>

        {/* Allocation Grid Placeholder */}
        <div className="bg-slate-50 hard-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-slate-900">ALLOCATIONS</h3>
            <div className="text-sm font-bold">
              <span className="text-slate-600">Remaining:</span>
              <span className="ml-2 text-fuchsia-600 text-lg">$2,500.00</span>
            </div>
          </div>

          <div className="space-y-3">
            {["Rent", "Groceries", "Utilities", "Savings"].map((envelope, index) => (
              <div
                key={envelope}
                className="flex items-center justify-between p-4 bg-white hard-border rounded-lg"
              >
                <div>
                  <div className="font-bold text-slate-900">{envelope}</div>
                  <div className="text-sm text-slate-600">0.00% allocated</div>
                </div>
                <input
                  type="number"
                  placeholder="$0.00"
                  className="w-32 px-3 py-2 text-right font-black hard-border rounded focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="mt-4 p-4 bg-amber-50 hard-border rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>🚧 Placeholder Component</strong>
          <br />
          Full implementation coming in Issue #162 with Go engine integration and smart
          suggestions.
        </p>
      </div>
    </div>
  );
};

export default AllocationStrategyStep;
