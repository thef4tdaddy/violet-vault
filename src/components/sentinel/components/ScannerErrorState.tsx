import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface ScannerErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * ScannerErrorState - Hard-lined error feedback
 */
const ScannerErrorState = ({ error, onRetry }: ScannerErrorStateProps) => {
  return (
    <div className="text-center py-12 border-4 border-black bg-red-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="inline-block p-4 border-2 border-black bg-white mb-6 animate-bounce">
        {React.createElement(getIcon("AlertTriangle"), { className: "h-12 w-12 text-red-600" })}
      </div>

      <h3 className="text-2xl font-black text-black uppercase tracking-tighter font-mono mb-2">
        SCAN_SYSTEM_FAILURE
      </h3>

      <p className="text-sm font-bold text-red-800 uppercase tracking-wide font-mono mb-8 max-w-xs mx-auto">
        {error}
      </p>

      <Button
        onClick={onRetry}
        className="px-8 py-3 border-2 border-black bg-black text-white font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] transition-all font-mono"
      >
        RESTART_SYSTEM
      </Button>
    </div>
  );
};

export default ScannerErrorState;
