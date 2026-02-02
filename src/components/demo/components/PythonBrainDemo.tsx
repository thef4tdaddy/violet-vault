import React from "react";
import { getIcon } from "@/utils/ui/icons";

interface PaycheckPrediction {
  envelope: string;
  amount: number;
  confidence: number;
}

/**
 * Python Brain Demo Component
 * Shows ML-powered paycheck split predictions
 */
export const PythonBrainDemo: React.FC = () => {
  const Brain = getIcon("Brain");

  const predictions: PaycheckPrediction[] = [
    { envelope: "Rent", amount: 1200, confidence: 98 },
    { envelope: "Groceries", amount: 450, confidence: 95 },
    { envelope: "Utilities", amount: 180, confidence: 97 },
    { envelope: "Transportation", amount: 200, confidence: 92 },
    { envelope: "Entertainment", amount: 150, confidence: 88 },
    { envelope: "Savings", amount: 500, confidence: 96 },
  ];

  const totalPredicted = predictions.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border-2 border-black rounded-none p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-600 border-2 border-black">
          {React.createElement(Brain, { className: "w-8 h-8 text-white" })}
        </div>
        <div>
          <h3 className="text-3xl font-black font-mono text-white">PYTHON BRAIN</h3>
          <p className="text-sm font-mono text-purple-400">ML-POWERED PREDICTIONS</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-slate-300">
          Machine learning algorithms analyze your spending patterns to predict optimal paycheck
          splits with 95%+ accuracy.
        </p>

        <div className="bg-slate-950 border-2 border-black p-6">
          <div className="mb-4 pb-4 border-b border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-mono text-slate-400">NEXT PAYCHECK</span>
              <span className="text-2xl font-black font-mono text-white">
                ${totalPredicted.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {predictions.map((pred, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-slate-300">{pred.envelope}</span>
                  <span className="font-mono font-bold text-white">${pred.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-12">{pred.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-sm font-mono">
          <div>
            <div className="text-2xl font-black text-purple-400">95%</div>
            <div className="text-slate-400">AVG ACCURACY</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">12mo</div>
            <div className="text-slate-400">LEARNING WINDOW</div>
          </div>
        </div>
      </div>
    </div>
  );
};
