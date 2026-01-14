import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { formatFileSize } from "@/utils/receipts/receiptHelpers";

interface UploadedImage {
  url: string;
  name: string;
  size: number;
}

interface ReceiptImagePreviewProps {
  uploadedImage: UploadedImage | null;
  showImagePreview: boolean;
  onTogglePreview: () => void;
}

/**
 * Receipt Image Preview Component
 * Shows uploaded image with toggle visibility and UI standards compliance
 */
const ReceiptImagePreview = ({
  uploadedImage,
  showImagePreview,
  onTogglePreview,
}: ReceiptImagePreviewProps) => {
  if (!uploadedImage) return null;

  return (
    <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-black text-black text-base">
          <span className="text-lg">S</span>CANNED <span className="text-lg">R</span>ECEIPT
        </h3>
        <Button
          onClick={onTogglePreview}
          className="glassmorphism flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black bg-purple-200/40 hover:bg-purple-300/40 transition-colors backdrop-blur-sm"
        >
          {React.createElement(getIcon("Eye"), {
            className: "h-4 w-4 text-purple-900",
          })}
          <span className="font-black text-purple-900 text-sm">
            {showImagePreview ? (
              <>
                <span className="text-base">H</span>IDE
              </>
            ) : (
              <>
                <span className="text-base">S</span>HOW
              </>
            )}{" "}
            <span className="text-base">I</span>MAGE
          </span>
        </Button>
      </div>

      {showImagePreview && (
        <div className="mt-3 glassmorphism rounded-lg p-2 border border-white/20 bg-white/20 backdrop-blur-sm">
          <img
            src={uploadedImage.url}
            alt="Receipt"
            className="max-w-full h-auto rounded-lg max-h-64 object-contain mx-auto border border-black"
          />
        </div>
      )}

      <div className="text-xs text-purple-900 mt-2">
        <span className="font-semibold">{uploadedImage.name}</span> •{" "}
        {formatFileSize(uploadedImage.size)}
      </div>
    </div>
  );
};

export default ReceiptImagePreview;
