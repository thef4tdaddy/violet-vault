import { renderConfidenceIndicator } from "../../../utils/receipts/receiptHelpers.tsx";

/**
 * Individual Extracted Data Field Component
 * Displays a single field with confidence indicator
 */
const ExtractedDataField = ({ label, value, confidence, fieldName, formatter = (val) => val }) => {
  return (
    <div className="glassmorphism rounded-lg p-3 border border-white/20 bg-white/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-purple-900 font-semibold">{label}:</span>
        <div className="flex items-center gap-2">
          {renderConfidenceIndicator(fieldName, confidence)}
          <span className="font-black text-black text-sm">
            {formatter(value) || "Not detected"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExtractedDataField;
