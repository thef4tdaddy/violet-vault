import React from "react";
import { X } from "lucide-react";
import FileUploader from "./FileUploader";
import FieldMapper from "./FieldMapper";
import ImportProgress from "./ImportProgress";

const ImportModal = ({
  isOpen,
  onClose,
  importStep,
  setImportStep,
  importData,
  setImportData,
  fieldMapping,
  setFieldMapping,
  importProgress,
  onImport,
  onFileUpload,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setImportStep(1);
    setImportData([]);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Import Transactions</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {importStep === 1 && <FileUploader onFileUpload={onFileUpload} />}

        {importStep === 2 && (
          <FieldMapper
            importData={importData}
            fieldMapping={fieldMapping}
            setFieldMapping={setFieldMapping}
            onBack={() => setImportStep(1)}
            onImport={onImport}
          />
        )}

        {importStep === 3 && (
          <ImportProgress importData={importData} importProgress={importProgress} />
        )}
      </div>
    </div>
  );
};

export default ImportModal;
