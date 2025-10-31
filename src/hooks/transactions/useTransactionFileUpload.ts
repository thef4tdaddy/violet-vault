import React, { useState } from "react";
import { parseCSV, parseOFX, autoDetectFieldMapping } from "../../utils/transactions/fileParser";
import { globalToast } from "../../stores/ui/toastStore";

interface ImportData {
  data?: unknown[];
  clearExisting?: boolean;
}

interface FileUploadOptions {
  clearExisting?: boolean;
}

/**
 * Hook for handling transaction file upload and parsing
 * Extracted from useTransactionImport.js for better maintainability
 */
export const useTransactionFileUpload = () => {
  const [importData, setImportData] = useState<ImportData>({});
  const [importStep, setImportStep] = useState(1);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    options: FileUploadOptions = {}
  ) => {
    const file = event.target.files[0];
    if (!file) return;

    // Store the clear option for later use during import
    setImportData({ clearExisting: options.clearExisting || false });

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let parsedData: unknown[] = [];

      try {
        if (file.name.toLowerCase().endsWith(".csv")) {
          parsedData = parseCSV(content);
        } else if (file.name.toLowerCase().endsWith(".ofx")) {
          parsedData = parseOFX(content);
        } else {
          globalToast.showError(
            "Unsupported file type. Please use CSV or OFX files.",
            "Unsupported File"
          );
          return;
        }

        // Merge clear option with parsed data
        setImportData({
          data: parsedData,
          clearExisting: options.clearExisting || false,
        });
        setImportStep(2);
        setFieldMapping(autoDetectFieldMapping(parsedData as never) as Record<string, string>);
      } catch (error) {
        globalToast.showError("Error parsing file: " + error.message, "Parse Error", 8000);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const resetImport = () => {
    setImportStep(1);
    setImportData({});
    setFieldMapping({});
  };

  return {
    importData,
    setImportData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    handleFileUpload,
    resetImport,
  };
};
