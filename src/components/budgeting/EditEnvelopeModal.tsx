import { useState } from "react";
import { createPortal } from "react-dom";
import useEnvelopeEdit from "@/hooks/budgeting/envelopes/useEnvelopeEdit";
import logger from "@/utils/core/common/logger";
import { useMobileDetection } from "@/hooks/platform/common/useMobileDetection";
import EnvelopeModalHeader from "./envelope/EnvelopeModalHeader";
import DeleteEnvelopeModal from "./DeleteEnvelopeModal";
import SlideUpModal from "@/components/mobile/SlideUpModal";
import { ModalContent } from "./EditEnvelopeModalComponents";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface EnvelopeRef {
  id: string;
  [key: string]: unknown;
}

interface EditEnvelopeModalProps {
  isOpen?: boolean;
  onClose: () => void;
  envelope?: EnvelopeRef | null;
  onUpdateEnvelope?: (envelope: unknown) => Promise<void> | void;
  onDeleteEnvelope?: (envelopeId: string) => Promise<void> | void;
  existingEnvelopes?: unknown[];
  currentUser?: { userName: string; userColor: string };
  _forceMobileMode?: boolean;
}

const EditEnvelopeModal = ({
  isOpen = false,
  onClose,
  envelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _forceMobileMode = false,
}: EditEnvelopeModalProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    handleSubmit,
    handleClose,
    handleDelete,

    // Lock state
    lock,
    isLocked,
    isOwnLock,
    canEdit,
    lockLoading,
    breakLock,
    canDelete,
    isExpired,
  } = useEnvelopeEdit({
    isOpen,
    envelope: envelope as unknown as import("@/db/types").Envelope | null,
    existingEnvelopes: (existingEnvelopes || []) as Array<{
      id: string | number;
      name?: string;
      currentBalance?: number;
    }>,
    onSave: onUpdateEnvelope as (envelopeData: unknown) => Promise<void>,
    onClose,
    onDelete: onDeleteEnvelope as (envelopeId: string | number) => Promise<void>,
    currentUser,
  });

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteModal(false);
      await handleDelete();
    } catch (error) {
      // Error handling is done in the hook
      logger.error("Delete failed:", error);
    }
  };

  if (!isOpen || !envelope) return null;

  const envelopeId = (envelope as { id?: string }).id;
  const isUnassignedCash = envelopeId === "unassigned";
  const modalProps = {
    formData,
    errors,
    calculatedAmounts,
    canEdit,
    canDelete,
    canSubmit,
    isLoading,
    isUnassignedCash,
    envelopeId,
    onUpdateField: updateFormField,
    onDelete: handleDeleteClick,
    onCancel: handleClose,
    onSubmit: handleSubmit,
  };

  if (isMobile || _forceMobileMode) {
    return (
      <>
        <SlideUpModal
          isOpen={isOpen}
          onClose={handleClose}
          title="Edit Envelope"
          height="auto"
          showHandle={true}
          backdrop={true}
        >
          <div className="px-6 pb-6">
            <ModalContent {...modalProps} />
          </div>
        </SlideUpModal>
        <DeleteEnvelopeModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          envelope={envelope as unknown as import("@/types/finance").Envelope | null}
        />
      </>
    );
  }

  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-100 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border-2 border-black my-auto"
        >
          <EnvelopeModalHeader
            title="Edit Envelope"
            subtitle="Modify envelope settings"
            lockLoading={lockLoading}
            isLocked={isLocked}
            isOwnLock={isOwnLock}
            isExpired={isExpired}
            lock={lock}
            onBreakLock={breakLock}
            onClose={handleClose}
          />

          <div className="flex-1 p-6 overflow-y-auto">
            <ModalContent {...modalProps} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteEnvelopeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        envelope={envelope as unknown as import("@/types/finance").Envelope | null}
      />
    </>
  );

  // Render modal at document root to avoid z-index/overflow issues
  return createPortal(modalContent, document.body);
};

export default EditEnvelopeModal;
