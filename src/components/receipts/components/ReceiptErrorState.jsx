import React from "react";
import { XCircle } from "lucide-react";

/**
 * Receipt Error State Component
 * Shows error messages with retry functionality and UI standards compliance
 */
const ReceiptErrorState = ({ error, onRetry }) => {
  return (
    <div className="glassmorphism rounded-lg p-4 mb-4 border-2 border-black bg-red-100/40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-900" />
        <p className="font-black text-black text-base">
          <span className="text-lg">P</span>ROCESSING <span className="text-lg">F</span>AILED
        </p>
      </div>
      <p className="text-red-900 text-sm mt-2">{error}</p>
      <button
        onClick={onRetry}
        className="glassmorphism mt-3 px-4 py-2 rounded-lg border-2 border-black bg-red-200/40 hover:bg-red-300/40 transition-colors backdrop-blur-sm"
      >
        <span className="font-black text-black text-sm">
          <span className="text-base">T</span>RY <span className="text-base">A</span>GAIN
        </span>
      </button>
    </div>
  );
};

export default ReceiptErrorState;