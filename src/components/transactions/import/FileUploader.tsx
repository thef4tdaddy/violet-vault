import React, { useState } from "react";
import { renderIcon } from "@/utils/icons";
import Checkbox from "@/components/ui/forms/Checkbox";
import { Button } from "@/components/ui";

interface FileUploaderProps {
  onFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    options: { clearExisting: boolean }
  ) => void;
  onScanReceipt?: () => void;
}

const FileUploader = ({ onFileUpload, onScanReceipt }: FileUploaderProps) => {
  const [clearExisting, setClearExisting] = useState(false);
  return (
    <div className="space-y-6">
      <div className="text-center">
        {renderIcon("Upload", { className: "mx-auto h-12 w-12 text-gray-400" })}
        <h4 className="mt-4 text-lg font-medium text-gray-900">Import Transactions</h4>
        <p className="mt-2 text-sm text-gray-600">
          Upload CSV/OFX files or scan receipts to import transactions
        </p>
      </div>

      <div className="space-y-4">
        {/* Scan Receipt Button */}
        {onScanReceipt && (
          <Button
            type="button"
            onClick={onScanReceipt}
            variant="secondary"
            className="w-full glassmorphism rounded-xl p-6 border-2 border-purple-500 hover:border-purple-600 transition-colors group"
          >
            <div className="flex items-center justify-center gap-3">
              {renderIcon("Camera", {
                className: "h-8 w-8 text-purple-600 group-hover:text-purple-700",
              })}
              <div className="text-left">
                <span className="block text-lg font-semibold text-purple-900">SCAN RECEIPT</span>
                <span className="block text-sm text-purple-700">
                  Use camera or upload receipt image
                </span>
              </div>
            </div>
          </Button>
        )}

        {/* CSV/OFX Upload */}
        <div className="border-2 border-dashed border-black rounded-xl p-6 bg-white shadow-inner">
          <input
            type="file"
            accept=".csv,.ofx"
            onChange={(e) => onFileUpload(e, { clearExisting })}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block text-center">
            {renderIcon("FileText", {
              className: "mx-auto h-12 w-12 text-gray-400",
            })}
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Upload CSV or OFX file
            </span>
            <span className="block text-sm text-gray-600">Click to upload or drag and drop</span>
          </label>
        </div>

        <div className="glassmorphism rounded-xl p-4 border-2 border-black">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <Checkbox
              id="import-clear-existing"
              checked={clearExisting}
              onCheckedChange={(checked) => setClearExisting(Boolean(checked))}
            />
            <div>
              <label
                htmlFor="import-clear-existing"
                className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer select-none"
              >
                {renderIcon("Trash2", { className: "h-4 w-4 text-red-500" })}
                Clear existing transactions and paychecks before import
              </label>
              <p className="mt-2 text-xs text-red-600">
                Warning: This will permanently delete all existing transaction history and paycheck
                records.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl p-4 border-2 border-black">
        <div className="flex">
          {renderIcon("AlertCircle", { className: "h-5 w-5 text-blue-400" })}
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-800">Supported File Formats</h5>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>CSV:</strong> Exported from banks like Chase, Wells Fargo, etc.
                </li>
                <li>
                  <strong>OFX:</strong> Open Financial Exchange format
                </li>
                <li>Files should include Date, Description, and Amount columns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
