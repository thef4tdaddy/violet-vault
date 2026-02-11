import React from "react";
import { getIcon } from "@/utils";

interface ImportSuccessProps {
  importResult: {
    success: boolean;
    importResult: {
      budgetId: string;
      fingerprint: string;
      exportedAt?: string;
      deviceFingerprint?: string;
    };
    loginResult: {
      success: boolean;
      error?: string;
      suggestion?: string;
      code?: string;
      canCreateNew?: boolean;
      data?: unknown;
    };
  } | null;
}

const ImportSuccess: React.FC<ImportSuccessProps> = ({ importResult }) => {
  if (!importResult || !importResult.success) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        {React.createElement(getIcon("CheckCircle"), {
          className: "h-4 w-4 text-green-600 mr-2 mt-0.5",
        })}
        <div className="text-sm">
          <p className="text-green-800 font-medium">Key Import Successful</p>
          <p className="text-green-700 mt-1">
            Successfully imported and logged in with key from{" "}
            {importResult.importResult.deviceFingerprint || "unknown device"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportSuccess;
