import { useState } from "react";
import { parseCSV, parseOFX, autoDetectFieldMapping } from "../../utils/transactions/fileParser";
import { globalToast } from "../../stores/ui/toastStore";

/**
 * Hook for handling transaction file upload and parsing
 * Extracted from useTransactionImport.js for better maintainability
 */
export const useTransactionFileUpload = () => {
  const [importData, setImportData] = useState([]);
  const [importStep, setImportStep] = useState(1);
  const [fieldMapping, setFieldMapping] = useState({});

  const handleFileUpload = (event, options = {}) => {
    const file = event.target.files[0];
    if (!file) return;

    // Store the clear option for later use during import
    setImportData({ clearExisting: options.clearExisting || false });

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let parsedData = [];

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
        setFieldMapping(autoDetectFieldMapping(parsedData));
      } catch (error) {
        globalToast.showError("Error parsing file: " + error.message, "Parse Error");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const resetImport = () => {
    setImportStep(1);
    setImportData([]);
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
