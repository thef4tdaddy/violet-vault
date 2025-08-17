import React from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

const FileUploader = ({ onFileUpload }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h4 className="mt-4 text-lg font-medium text-gray-900">
          Upload Transaction File
        </h4>
        <p className="mt-2 text-sm text-gray-600">
          Support for CSV and OFX files from your bank
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          accept=".csv,.ofx"
          onChange={onFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block text-center"
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Click to upload or drag and drop
          </span>
          <span className="block text-sm text-gray-600">
            CSV or OFX files only
          </span>
        </label>
      </div>

      <div className="glassmorphism rounded-lg p-4 border border-white/20">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-800">
              Supported File Formats
            </h5>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>CSV:</strong> Exported from banks like Chase, Wells
                  Fargo, etc.
                </li>
                <li>
                  <strong>OFX:</strong> Open Financial Exchange format
                </li>
                <li>
                  Files should include Date, Description, and Amount columns
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
