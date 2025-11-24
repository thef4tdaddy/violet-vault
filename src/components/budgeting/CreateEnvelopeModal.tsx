import { createPortal } from "react-dom";
import useEnvelopeForm from "@/hooks/budgeting/useEnvelopeForm";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
import SlideUpModal from "@/components/mobile/SlideUpModal";
import { ModalContent, DesktopModalHeader } from "./CreateEnvelopeModalComponents";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

interface Bill {
  id: string;
  name?: string;
  provider?: string;
  category?: string;
  color?: string;
  frequency?: string;
  amount?: number;
}

interface CreateEnvelopeModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onCreateEnvelope: (envelope: unknown) => void;
  onCreateBill: () => void;
  existingEnvelopes?: unknown[];
  allBills?: Bill[];
  currentUser?: { userName: string; userColor: string };
  _forceMobileMode?: boolean;
}

const CreateEnvelopeModal = ({
  isOpen = false,
  onClose,
  onCreateEnvelope,
  onCreateBill,
  existingEnvelopes = [],
  allBills = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _forceMobileMode = false, // Internal prop for testing
}: CreateEnvelopeModalProps) => {
  const isMobile = useMobileDetection();
  const modalRef = useModalAutoScroll(isOpen && !(isMobile || _forceMobileMode));

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
    existingEnvelopes: existingEnvelopes as Record<string, unknown>[],
    onSave: async (data: unknown) => {
      onCreateEnvelope(data);
    },
    onClose,
    currentUser,
  });

  // Handle bill selection and auto-populate envelope data
  const handleBillSelection = (billId: string) => {
    if (!billId) return;

    const selectedBill = allBills.find((bill: Bill) => bill.id === billId);
    if (!selectedBill) return;

    // Auto-populate envelope fields from the selected bill
    const billData = {
      name: selectedBill.name ?? selectedBill.provider ?? "",
      category: selectedBill.category ?? "",
      color: selectedBill.color ?? formData.color,
      frequency: selectedBill.frequency ?? formData.frequency,
      monthlyAmount: selectedBill.amount?.toString() ?? "",
      description: `Bill envelope for ${selectedBill.name ?? selectedBill.provider}`,
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
            allBills={allBills as unknown as import("@/types/bills").Bill[]}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-2 border-black my-auto"
      >
        <DesktopModalHeader onClose={handleClose} />

        {/* Form Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ModalContent
            formData={formData}
            errors={errors}
            calculatedAmounts={calculatedAmounts}
            isLoading={isLoading}
            canSubmit={canSubmit}
            allBills={allBills as unknown as import("@/types/bills").Bill[]}
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
  return createPortal(modalContent, document.body);
};

export default CreateEnvelopeModal;
