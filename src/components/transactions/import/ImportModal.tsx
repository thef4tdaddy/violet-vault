import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import FileUploader from "./FileUploader";
import FieldMapper from "./FieldMapper";
import ImportProgress from "./ImportProgress";

interface FieldMapping {
  date?: string;
  description?: string;
  amount?: string;
  category?: string;
  notes?: string;
  [key: string]: string | undefined;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importStep: number;
  setImportStep: (step: number) => void;
  importData: unknown[];
  setImportData: (data: unknown[]) => void;
  fieldMapping: FieldMapping;
  setFieldMapping: (mapping: FieldMapping) => void;
  importProgress: number;
  onImport: () => void;
  onFileUpload: (file: File) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
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
          <Button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            {React.createElement(getIcon("X"), { className: "h-6 w-6" })}
          </Button>
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
