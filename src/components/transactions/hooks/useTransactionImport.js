import { useState } from "react";
import {
  parseCSV,
  parseOFX,
  autoDetectFieldMapping,
} from "../utils/fileParser";

export const useTransactionImport = (currentUser, onBulkImport) => {
  const [importData, setImportData] = useState([]);
  const [importStep, setImportStep] = useState(1);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importProgress, setImportProgress] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
          alert("Unsupported file type. Please use CSV or OFX files.");
          return;
        }

        setImportData(parsedData);
        setImportStep(2);
        setFieldMapping(autoDetectFieldMapping(parsedData));
      } catch (error) {
        alert("Error parsing file: " + error.message);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const handleImport = async () => {
    if (
      !fieldMapping.date ||
      !fieldMapping.description ||
      !fieldMapping.amount
    ) {
      alert("Please map at least Date, Description, and Amount fields");
      return;
    }

    setImportStep(3);
    const processedTransactions = [];

    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      setImportProgress((i / importData.length) * 100);

      try {
        const amount = parseFloat(
          row[fieldMapping.amount]?.replace(/[$,]/g, "") || "0",
        );
        
        const transaction = {
          id: `import_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          date:
            row[fieldMapping.date] || new Date().toISOString().split("T")[0],
          description: row[fieldMapping.description] || "Imported Transaction",
          amount,
          category: row[fieldMapping.category] || "Imported",
          notes: row[fieldMapping.notes] || "",
          envelopeId: "", // Empty means unassigned
          
          // Add type based on amount
          type: amount >= 0 ? "income" : "expense",
          
          // Import metadata
          reconciled: false,
          createdBy: currentUser?.userName || "Unknown",
          createdAt: new Date().toISOString(),
          importSource: "file_import",
        };

        processedTransactions.push(transaction);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }

      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    onBulkImport(processedTransactions);
    resetImport();
    
    // More informative success message
    const incomeCount = processedTransactions.filter(t => t.amount >= 0).length;
    const expenseCount = processedTransactions.filter(t => t.amount < 0).length;
    
    alert(
      `Successfully imported ${processedTransactions.length} transactions!\n` +
      `• ${incomeCount} income transactions\n` +
      `• ${expenseCount} expense transactions\n\n` +
      `All transactions have been added to your ledger with "Imported" category.`
    );
  };

  const resetImport = () => {
    setImportStep(1);
    setImportData([]);
    setImportProgress(0);
    setFieldMapping({});
  };

  return {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    handleFileUpload,
    handleImport,
    resetImport,
  };
};
