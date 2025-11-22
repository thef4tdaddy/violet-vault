import { Button } from "@/components/ui";
import { hasMinimumExtractedData } from "@/utils/receipts/receiptHelpers";

/**
 * Receipt Action Buttons Component
 * Scan another receipt or create transaction with UI standards compliance
 */
const ReceiptActionButtons = ({ extractedData, onReset, onConfirm }) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        onClick={onReset}
        className="glassmorphism flex-1 px-6 py-3 rounded-lg transition-colors border-2 border-black bg-gray-200/40 hover:bg-gray-300/40 backdrop-blur-sm"
      >
        <span className="font-black text-black">
          <span className="text-base">S</span>CAN <span className="text-base">A</span>NOTHER
        </span>
      </Button>
      <Button
        onClick={onConfirm}
        className="glassmorphism flex-1 px-6 py-3 rounded-lg transition-colors border-2 border-black bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasMinimumExtractedData(extractedData)}
      >
        <span className="font-black text-white">
          <span className="text-base">C</span>REATE <span className="text-base">T</span>RANSACTION
        </span>
      </Button>
    </div>
  );
};

export default ReceiptActionButtons;
