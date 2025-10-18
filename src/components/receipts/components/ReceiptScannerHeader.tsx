import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

/**
 * Receipt Scanner Header Component
 * Extracted from ReceiptScanner with UI standards compliance
 */
const ReceiptScannerHeader = ({ onClose }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="glassmorphism p-2 rounded-lg border-2 border-black bg-purple-100/40">
          {React.createElement(getIcon("FileText"), {
            className: "h-6 w-6 text-purple-900",
          })}
        </div>
        <div>
          <h2 className="font-black text-black text-base">
            <span className="text-lg">R</span>ECEIPT <span className="text-lg">S</span>CANNER
          </h2>
          <p className="text-sm text-purple-900">
            Upload or capture a receipt to extract transaction details
          </p>
        </div>
      </div>
      <Button
        onClick={onClose}
        className="glassmorphism p-2 rounded-lg border-2 border-black hover:bg-purple-200/40 transition-colors"
      >
        <span className="text-black font-bold">×</span>
      </Button>
    </div>
  );
};

export default ReceiptScannerHeader;
