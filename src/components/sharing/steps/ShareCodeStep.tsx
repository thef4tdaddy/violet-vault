import { Button } from "@/components/ui";
import { renderIcon } from "../../../utils";
import React from "react";

interface ShareCodeStepProps {
  shareCode: string;
  setShareCode: (code: string) => void;
  onValidate: () => void;
  onQRScan: () => void;
  isValidating: boolean;
}

/**
 * Share Code Step - Step 1 of join budget flow
 * Extracted from JoinBudgetModal to reduce complexity
 */
const ShareCodeStep: React.FC<ShareCodeStepProps> = ({
  shareCode,
  setShareCode,
  onValidate,
  onQRScan,
  isValidating,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate();
  };

  return (
    <>
      <div>
        <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
          Share Code or QR Code
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toLowerCase())}
              placeholder="enter four words"
              className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-lg text-sm text-center tracking-wide lowercase"
              maxLength={50}
            />
            <Button
              onClick={onQRScan}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-black transition-colors border-2 border-black"
              title="Scan QR Code"
            >
              {renderIcon("QrCode", "h-5 w-5")}
            </Button>
          </div>

          <p className="text-xs text-purple-900">Enter 4 BIP39 words or scan a QR code</p>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!shareCode.trim() || isValidating}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-black transition-colors border-2 border-black disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Validating...
            </span>
          ) : (
            "Validate Share Code"
          )}
        </Button>
      </div>
    </>
  );
};

export default ShareCodeStep;
