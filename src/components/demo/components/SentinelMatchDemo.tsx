import React, { useState } from "react";
import { getIcon } from "@/utils/ui/icons";

interface MatchedTransaction {
  description: string;
  amount: number;
  matched: boolean;
}

/**
 * SentinelShare Demo Component
 * Demonstrates E2EE receipt matching and reconciliation
 */
export const SentinelMatchDemo: React.FC = () => {
  const [showMatching, setShowMatching] = useState(false);

  const Shield = getIcon("Shield");
  const Check = getIcon("Check");

  const transactions: MatchedTransaction[] = [
    { description: "Whole Foods Market", amount: 87.43, matched: false },
    { description: "Shell Gas Station", amount: 45.2, matched: false },
    { description: "Netflix Subscription", amount: 15.99, matched: false },
  ];

  const [matches, setMatches] = useState(transactions);

  const runMatching = () => {
    setShowMatching(true);

    // Simulate matching process
    transactions.forEach((_, idx) => {
      setTimeout(
        () => {
          setMatches((prev) => prev.map((m, i) => (i === idx ? { ...m, matched: true } : m)));
        },
        (idx + 1) * 800
      );
    });

    setTimeout(
      () => {
        setShowMatching(false);
      },
      transactions.length * 800 + 1000
    );
  };

  const resetDemo = () => {
    setMatches(transactions.map((t) => ({ ...t, matched: false })));
    setShowMatching(false);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border-2 border-black rounded-none p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-600 border-2 border-black">
          {React.createElement(Shield, { className: "w-8 h-8 text-white" })}
        </div>
        <div>
          <h3 className="text-3xl font-black font-mono text-white">SENTINELSHARE</h3>
          <p className="text-sm font-mono text-purple-400">E2EE RECEIPT MATCHING</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-slate-300">
          SentinelShare reconciles receipts with transactions using military-grade end-to-end
          encryption. Your data never leaves your device unencrypted.
        </p>

        <div className="bg-slate-950 border-2 border-black p-6">
          <div className="mb-4 pb-4 border-b border-slate-800">
            <span className="font-mono text-sm text-slate-400">RECEIPT QUEUE</span>
          </div>

          <div className="space-y-3">
            {matches.map((tx, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 border-2 transition-all ${
                  tx.matched
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700 bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {tx.matched ? (
                    React.createElement(Check, { className: "w-5 h-5 text-green-500" })
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-600" />
                  )}
                  <span className="font-mono text-sm text-slate-200">{tx.description}</span>
                </div>
                <span className="font-mono font-bold text-white">${tx.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Demo page uses custom mono font styling */}
          <button
            onClick={runMatching}
            disabled={showMatching}
            className={`flex-1 py-3 font-mono font-bold border-2 border-black rounded-none transition-colors ${
              showMatching
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
          >
            {showMatching ? "MATCHING..." : "RUN MATCHING"}
          </button>
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Demo page uses custom mono font styling */}
          <button
            onClick={resetDemo}
            disabled={showMatching}
            className="px-6 py-3 font-mono font-bold border-2 border-black bg-slate-800 hover:bg-slate-700 text-white rounded-none transition-colors disabled:opacity-50"
          >
            RESET
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center text-sm font-mono">
          <div>
            <div className="text-2xl font-black text-purple-400">AES-256</div>
            <div className="text-slate-400">ENCRYPTION</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">ZERO</div>
            <div className="text-slate-400">SERVER ACCESS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
