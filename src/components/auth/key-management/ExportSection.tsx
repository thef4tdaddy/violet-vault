import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import PasswordField from "./PasswordField";

interface ExportSectionProps {
  exportPassword: string;
  showExportPassword: boolean;
  copiedToClipboard: boolean;
  loading: boolean;
  onUpdatePassword: (field: string, value: string) => void;
  onTogglePasswordVisibility: (field: string) => void;
  onCopyToClipboard: () => void;
  onDownloadUnprotected: () => void;
  onDownloadProtected: () => void;
  onGenerateQRCode: () => void;
}

const ExportSection: React.FC<ExportSectionProps> = ({
  exportPassword,
  showExportPassword,
  copiedToClipboard,
  loading,
  onUpdatePassword,
  onTogglePasswordVisibility,
  onCopyToClipboard,
  onDownloadUnprotected,
  onDownloadProtected,
  onGenerateQRCode,
}) => {
  return (
    <div className="space-y-8">
      {/* Quick Export Options */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Quick Export</h4>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onCopyToClipboard}
            disabled={loading}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-center mb-2">
              {copiedToClipboard
                ? React.createElement(getIcon("CheckCircle"), {
                    className: "h-5 w-5 text-green-600",
                  })
                : React.createElement(getIcon("Copy"), {
                    className: "h-5 w-5 text-purple-600",
                  })}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {copiedToClipboard ? "Copied!" : "Copy to Clipboard"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Temporary (30s)</div>
          </Button>

          <Button
            onClick={onDownloadUnprotected}
            disabled={loading}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            {React.createElement(getIcon("Download"), {
              className: "h-5 w-5 text-purple-600 mx-auto mb-2",
            })}
            <div className="text-sm font-medium text-gray-900">Download File</div>
            <div className="text-xs text-gray-500 mt-1">Unprotected</div>
          </Button>

          <Button
            onClick={onGenerateQRCode}
            disabled={loading}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            {React.createElement(getIcon("QrCode"), {
              className: "h-5 w-5 text-purple-600 mx-auto mb-2",
            })}
            <div className="text-sm font-medium text-gray-900">Generate QR Code</div>
            <div className="text-xs text-gray-500 mt-1">For mobile</div>
          </Button>
        </div>
      </div>

      {/* Protected Export */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Password-Protected Export</h4>
        <div className="space-y-4">
          <PasswordField
            label="Export Password"
            value={exportPassword}
            onChange={(e) => onUpdatePassword("export", e.target.value)}
            onToggleVisibility={() => onTogglePasswordVisibility("export")}
            showPassword={showExportPassword}
            placeholder="Enter password to protect key file"
            disabled={loading}
            minLength={8}
            required
          />

          <Button
            onClick={onDownloadProtected}
            disabled={loading || !exportPassword}
            className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {React.createElement(getIcon("Lock"), {
              className: "h-4 w-4 mr-2",
            })}
            Download Protected File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportSection;
