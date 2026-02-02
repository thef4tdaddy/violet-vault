import React, { useState } from "react";
import { getIcon } from "@/utils/ui/icons";

/**
 * Go Engine Demo Component
 * Showcases the 6,000 tx/sec Go-powered transaction engine
 */
export const GoEngineDemo: React.FC = () => {
  const [txCount, setTxCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const TARGET_TPS = 6000; // Transactions per second
  const DEMO_DURATION = 2000; // 2 seconds

  const Zap = getIcon("Zap");

  const startDemo = () => {
    setIsProcessing(true);
    setTxCount(0);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / DEMO_DURATION, 1);
      const currentCount = Math.floor(progress * TARGET_TPS * (DEMO_DURATION / 1000));

      setTxCount(currentCount);

      if (progress >= 1) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border-2 border-black rounded-none p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-600 border-2 border-black">
          {React.createElement(Zap, { className: "w-8 h-8 text-white" })}
        </div>
        <div>
          <h3 className="text-3xl font-black font-mono text-white">GO ENGINE</h3>
          <p className="text-sm font-mono text-purple-400">6,000 TX/SEC PROCESSING POWER</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-slate-300">
          The Go-powered backend processes transactions at blazing speed, capable of handling your
          entire financial history in seconds.
        </p>

        <div className="bg-slate-950 border-2 border-black p-6 font-mono">
          <div className="text-center">
            <div className="text-6xl font-black text-purple-400 mb-2">
              {txCount.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">TRANSACTIONS PROCESSED</div>
          </div>
        </div>

        {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library -- Demo page uses custom mono font styling */}
        <button
          onClick={startDemo}
          disabled={isProcessing}
          className={`w-full py-3 font-mono font-bold border-2 border-black rounded-none transition-colors ${
            isProcessing
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          }`}
        >
          {isProcessing ? "PROCESSING..." : "RUN DEMO"}
        </button>

        <div className="grid grid-cols-3 gap-4 text-center text-sm font-mono">
          <div>
            <div className="text-2xl font-black text-purple-400">6,000</div>
            <div className="text-slate-400">TX/SEC</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">&lt;10ms</div>
            <div className="text-slate-400">LATENCY</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-400">99.9%</div>
            <div className="text-slate-400">UPTIME</div>
          </div>
        </div>
      </div>
    </div>
  );
};
