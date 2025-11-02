import ReactDOM from "react-dom";
import useEnvelopeForm from "@/hooks/budgeting/useEnvelopeForm";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
import SlideUpModal from "@/components/mobile/SlideUpModal";
import { ModalContent, DesktopModalHeader } from "./CreateEnvelopeModalComponents";

const CreateEnvelopeModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  onCreateBill,
  existingEnvelopes = [],
  allBills = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _forceMobileMode = false, // Internal prop for testing
}) => {
  const isMobile = useMobileDetection();

  const {
    // Form state
    formData,
    errors,
    isLoading,
    canSubmit,
    calculatedAmounts,

    // Form actions
    updateFormField,
    updateFormData,
    handleSubmit,
    handleClose,
  } = useEnvelopeForm({
    envelope: null, // New envelope
    existingEnvelopes,
    onSave: onCreateEnvelope,
    onClose,
    currentUser,
  });

  // Handle bill selection and auto-populate envelope data
  const handleBillSelection = (billId) => {
    if (!billId) return;

    const selectedBill = allBills.find((bill) => bill.id === billId);
    if (!selectedBill) return;

    // Auto-populate envelope fields from the selected bill
    const billData = {
      name: selectedBill.name || selectedBill.provider || "",
      category: selectedBill.category || "",
      color: selectedBill.color || formData.color,
      frequency: selectedBill.frequency || formData.frequency,
      monthlyAmount: selectedBill.amount?.toString() || "",
      description: `Bill envelope for ${selectedBill.name || selectedBill.provider}`,
      envelopeType: "BILL", // Set to bill type when bill is selected
    };

    updateFormData(billData);
  };

  if (!isOpen) return null;

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create Envelope"
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="px-6 pb-6">
          <ModalContent
            formData={formData}
            errors={errors}
            calculatedAmounts={calculatedAmounts as Record<string, number>}
            isLoading={isLoading}
            canSubmit={canSubmit}
            allBills={allBills}
            onUpdateField={updateFormField}
            onBillSelection={handleBillSelection}
            onCreateBill={onCreateBill}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal - use Portal to render at document root
  const modalContent = (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-2 border-black">
        <DesktopModalHeader onClose={handleClose} />

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ModalContent
            formData={formData}
            errors={errors}
            calculatedAmounts={calculatedAmounts}
            isLoading={isLoading}
            canSubmit={canSubmit}
            allBills={allBills}
            onUpdateField={updateFormField}
            onBillSelection={handleBillSelection}
            onCreateBill={onCreateBill}
            onCancel={handleClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );

  // Render modal at document root to avoid z-index/overflow issues
  return ReactDOM.createPortal(modalContent, document.body);
};

export default CreateEnvelopeModal;
