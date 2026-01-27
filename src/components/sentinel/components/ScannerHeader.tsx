import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface ScannerHeaderProps {
  onClose: () => void;
}

/**
 * ScannerHeader - Hard-lined header for the OCR Scanner
 */
const ScannerHeader = ({ onClose }: ScannerHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
      <div className="flex items-center space-gap-3">
        <div className="p-2 border-2 border-black bg-purple-600 text-white">
          {React.createElement(getIcon("ScanText"), { className: "h-6 w-6" })}
        </div>
        <div>
          <h2 className="text-xl font-black text-black tracking-tight leading-none uppercase font-mono">
            SENTINEL <span className="text-purple-700">SCANNER</span>
          </h2>
          <p className="text-[10px] font-bold text-purple-900 uppercase tracking-widest mt-1 font-mono">
            v2.1 SENTINEL SHARE | OCR ENGINE ACTIVATED
          </p>
        </div>
      </div>
      <Button
        onClick={onClose}
        variant="ghost"
        className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors duration-100 group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        aria-label="Close scanner"
      >
        {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
      </Button>
    </div>
  );
};

export default ScannerHeader;
