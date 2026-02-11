import React from "react";
import { getIcon } from "../../../utils";

/**
 * Receipt Processing State Component
 * Shows loading state during OCR processing with UI standards compliance
 */
const ReceiptProcessingState = () => {
  return (
    <div className="text-center py-8">
      <div className="glassmorphism p-4 rounded-lg inline-block mb-4 border-2 border-black bg-purple-200/40 backdrop-blur-sm">
        {React.createElement(getIcon("Loader2"), {
          className: "h-8 w-8 text-purple-900 animate-spin",
        })}
      </div>
      <p className="font-black text-black text-base" data-testid="processing-message">
        <span className="text-lg">P</span>ROCESSING <span className="text-lg">R</span>ECEIPT...
      </p>
      <p className="text-sm text-purple-900">Using AI to extract transaction details</p>
    </div>
  );
};

export default ReceiptProcessingState;
