import { renderConfidenceIndicator } from "@/utils/features/receipts/receiptHelpers";

interface ExtractedDataFieldProps {
  label: string;
  value: string | number;
  confidence: number;
  fieldName: string;
  formatter?: (val: string | number) => string | number;
}

/**
 * Individual Extracted Data Field Component
 * Displays a single field with confidence indicator
 */
const ExtractedDataField = ({
  label,
  value,
  confidence,
  fieldName,
  formatter = (val: string | number) => val,
}: ExtractedDataFieldProps) => {
  return (
    <div className="glassmorphism rounded-lg p-3 border border-white/20 bg-white/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-purple-900 font-semibold">{label}:</span>
        <div className="flex items-center gap-2">
          {renderConfidenceIndicator(
            fieldName,
            (confidence as unknown as number) < 50
              ? "low"
              : (confidence as unknown as number) < 75
                ? "medium"
                : "high"
          )}
          <span className="font-black text-black text-sm">
            {formatter(value) || "Not detected"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExtractedDataField;
