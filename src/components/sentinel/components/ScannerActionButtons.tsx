import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface ScannerActionButtonsProps {
  onReset: () => void;
  onConfirm: () => void;
  isValid: boolean;
}

/**
 * ScannerActionButtons - Final action controls for the OCR flow
 */
const ScannerActionButtons = ({ onReset, onConfirm, isValid }: ScannerActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-black mt-8">
      <Button
        onClick={onReset}
        variant="outline"
        className="flex-1 px-4 py-4 border-2 border-black bg-white text-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px] transition-all font-mono flex items-center justify-center gap-2"
      >
        {React.createElement(getIcon("RefreshCw"), { className: "h-4 w-4" })}
        RESCAN_IMAGE
      </Button>

      <Button
        onClick={onConfirm}
        disabled={!isValid}
        className={`flex-2 px-4 py-4 border-2 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono flex items-center justify-center gap-2 ${
          isValid
            ? "bg-purple-600 text-white hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[4px] active:translate-y-[4px]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none translate-x-[4px] translate-y-[4px]"
        }`}
      >
        {React.createElement(getIcon("CheckCircle2"), { className: "h-5 w-5" })}
        CONFIRM_AND_MATCH
      </Button>
    </div>
  );
};

export default ScannerActionButtons;
