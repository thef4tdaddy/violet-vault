import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
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
  const modalRef = useModalAutoScroll(isOpen);

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
