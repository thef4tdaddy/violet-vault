import React from "react";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
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
  importData: Record<string, unknown>[] | { data: Record<string, unknown>[] };
  setImportData: (data: unknown[]) => void;
  fieldMapping: FieldMapping | Record<string, string | undefined>;
  setFieldMapping: (mapping: FieldMapping | Record<string, string | undefined>) => void;
  importProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  onImport: () => void | Promise<void>;
  onFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    options: { clearExisting: boolean }
  ) => void;
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
  const modalRef = useModalAutoScroll(isOpen);

  // Normalize importData to always be an array
  const normalizedImportData: Record<string, unknown>[] = Array.isArray(importData)
    ? importData
    : importData.data;

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setImportStep(1);
    setImportData([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Import Transactions</h3>
          <ModalCloseButton onClick={handleClose} />
        </div>

        {importStep === 1 && <FileUploader onFileUpload={onFileUpload} />}

        {importStep === 2 && (
          <FieldMapper
            importData={normalizedImportData}
            fieldMapping={fieldMapping}
            setFieldMapping={setFieldMapping}
            onBack={() => setImportStep(1)}
            onImport={onImport}
          />
        )}

        {importStep === 3 && (
          <ImportProgress
            importData={normalizedImportData}
            importProgress={importProgress.percentage}
          />
        )}
      </div>
    </div>
  );
};

export default ImportModal;
