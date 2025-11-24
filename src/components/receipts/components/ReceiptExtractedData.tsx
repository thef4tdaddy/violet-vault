import React from "react";
import { getIcon } from "../../../utils";
import ExtractedDataField from "./ExtractedDataField";
import ExtractedItemsList from "./ExtractedItemsList";

interface ExtractedData {
  merchant?: string;
  date?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  items?: unknown[];
  confidence: {
    merchant?: number;
    date?: number;
    total?: number;
    subtotal?: number;
    tax?: number;
    items?: number;
  };
}

interface ReceiptExtractedDataProps {
  extractedData: ExtractedData | null;
}

/**
 * Receipt Extracted Data Component (Refactored)
 * Displays OCR results with confidence indicators and UI standards compliance
 * Reduced from 108 lines to ~35 lines by extracting reusable components
 */
const ReceiptExtractedData: React.FC<ReceiptExtractedDataProps> = ({ extractedData }) => {
  if (!extractedData) return null;

  const formatCurrency = (value: number | undefined) => (value ? `$${value.toFixed(2)}` : null);

  return (
    <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-green-100/40 backdrop-blur-sm">
      <h3 className="font-black text-black text-base mb-4 flex items-center gap-2">
        {React.createElement(getIcon("CheckCircle"), {
          className: "h-5 w-5 text-green-900",
        })}
        <span className="text-lg">E</span>XTRACTED <span className="text-lg">I</span>NFORMATION
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <ExtractedDataField
            label="Merchant"
            value={extractedData.merchant}
            confidence={extractedData.confidence.merchant}
            fieldName="merchant"
          />

          <ExtractedDataField
            label="Total Amount"
            value={extractedData.total}
            confidence={extractedData.confidence.total}
            fieldName="total"
            formatter={formatCurrency}
          />

          <ExtractedDataField
            label="Date"
            value={extractedData.date}
            confidence={extractedData.confidence.date}
            fieldName="date"
          />
        </div>

        <div className="space-y-3">
          {extractedData.tax && (
            <ExtractedDataField
              label="Tax"
              value={extractedData.tax}
              confidence={extractedData.confidence.tax}
              fieldName="tax"
              formatter={formatCurrency}
            />
          )}

          {extractedData.subtotal && (
            <ExtractedDataField
              label="Subtotal"
              value={extractedData.subtotal}
              confidence={extractedData.confidence.subtotal}
              fieldName="subtotal"
              formatter={formatCurrency}
            />
          )}

          <div className="glassmorphism rounded-lg p-2 border border-white/20 bg-gray-100/20 backdrop-blur-sm">
            <div className="text-xs text-purple-900">
              <span className="font-semibold">Processing time:</span> {extractedData.processingTime}
              ms
            </div>
          </div>
        </div>
      </div>

      <ExtractedItemsList items={extractedData.items} />
    </div>
  );
};

export default ReceiptExtractedData;
