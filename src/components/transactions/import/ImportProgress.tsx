import React from "react";
import { getIcon } from "../../../utils";

interface ImportProgressProps {
  importData: unknown[];
  importProgress: number;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ importData, importProgress }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        {React.createElement(getIcon("RefreshCw"), {
          className: "mx-auto h-12 w-12 text-emerald-600 animate-spin",
        })}
        <h4 className="mt-4 text-lg font-medium text-gray-900">Importing Transactions</h4>
        <p className="mt-2 text-sm text-gray-600">Processing {importData.length} transactions...</p>
      </div>

      <div className="bg-gray-200 rounded-full h-3">
        <div
          className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${importProgress}%` }}
        />
      </div>

      <p className="text-center text-sm text-gray-600">{Math.round(importProgress)}% complete</p>
    </div>
  );
};

export default ImportProgress;
