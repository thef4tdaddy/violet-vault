import React from "react";
import { useReceiptScannerStore } from "@/stores/ui/receiptScannerStore";
import { renderIcon } from "@/utils/icons";
import Checkbox from "@/components/ui/forms/Checkbox";

/**
 * Receipt Scanner Privacy Settings
 * Allows users to control privacy options for receipt scanning
 */
const ReceiptPrivacySettings: React.FC = () => {
  const { saveRawText, encryptReceipts, setSaveRawText, setEncryptReceipts } =
    useReceiptScannerStore((state) => ({
      saveRawText: state.saveRawText,
      encryptReceipts: state.encryptReceipts,
      setSaveRawText: state.setSaveRawText,
      setEncryptReceipts: state.setEncryptReceipts,
    }));

  return (
    <div className="glassmorphism rounded-xl p-4 border-2 border-black space-y-4">
      <div className="flex items-center gap-2 mb-3">
        {renderIcon("Shield", { className: "h-5 w-5 text-purple-600" })}
        <h4 className="text-sm font-bold text-black">PRIVACY SETTINGS</h4>
      </div>

      {/* Save Raw OCR Text Toggle */}
      <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
        <Checkbox
          id="receipt-save-raw-text"
          checked={saveRawText}
          onCheckedChange={(checked) => setSaveRawText(Boolean(checked))}
        />
        <div>
          <label
            htmlFor="receipt-save-raw-text"
            className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer select-none"
          >
            {renderIcon("FileText", { className: "h-4 w-4 text-gray-600" })}
            Save raw OCR text with receipt
          </label>
          <p className="mt-1 text-xs text-gray-600">
            Store the complete OCR text output. Useful for debugging but may contain sensitive
            information.
          </p>
        </div>
      </div>

      {/* Encrypt Receipts Toggle */}
      <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
        <Checkbox
          id="receipt-encrypt"
          checked={encryptReceipts}
          onCheckedChange={(checked) => setEncryptReceipts(Boolean(checked))}
        />
        <div>
          <label
            htmlFor="receipt-encrypt"
            className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer select-none"
          >
            {renderIcon("Lock", { className: "h-4 w-4 text-green-600" })}
            Encrypt receipts when syncing
          </label>
          <p className="mt-1 text-xs text-gray-600">
            Recommended: Encrypt receipt data before uploading to cloud storage for enhanced
            security.
          </p>
        </div>
      </div>

      <div className="glassmorphism rounded-lg p-3 border border-blue-200 bg-blue-50/40">
        <div className="flex gap-2">
          {renderIcon("Info", { className: "h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" })}
          <p className="text-xs text-blue-800">
            <strong>Privacy Note:</strong> Receipt images and data are processed locally in your
            browser. No data is sent to external servers during OCR processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrivacySettings;
