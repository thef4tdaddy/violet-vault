import { useState } from "react";
import useEnvelopeEdit from "@/hooks/budgeting/useEnvelopeEdit";
import logger from "@/utils/common/logger";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
import EnvelopeModalHeader from "./envelope/EnvelopeModalHeader";
import DeleteEnvelopeModal from "./DeleteEnvelopeModal";
import SlideUpModal from "@/components/mobile/SlideUpModal";
import { ModalContent } from "./EditEnvelopeModalComponents";

const EditEnvelopeModal = ({
  isOpen = false,
  onClose,
  envelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
  _forceMobileMode = false, // Internal prop for testing
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  } = useEnvelopeEdit({
    isOpen,
    envelope,
    existingEnvelopes,
    onSave: onUpdateEnvelope,
    onClose,
    onDelete: onDeleteEnvelope,
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

  const isUnassignedCash = envelope.id === "unassigned";

  // Mobile slide-up modal
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
            <ModalContent
              formData={formData}
              errors={errors}
              calculatedAmounts={calculatedAmounts}
              canEdit={canEdit}
              canDelete={canDelete}
              canSubmit={canSubmit}
              isLoading={isLoading}
              isUnassignedCash={isUnassignedCash}
              envelopeId={envelope?.id}
              onUpdateField={updateFormField}
              onDelete={handleDeleteClick}
              onCancel={handleClose}
              onSubmit={handleSubmit}
            />
          </div>
        </SlideUpModal>

        {/* Delete Confirmation Modal */}
        <DeleteEnvelopeModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          envelope={envelope}
        />
      </>
    );
  }

  // Desktop centered modal
  return (
    <>
      <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
          <EnvelopeModalHeader
            title="Edit Envelope"
            subtitle="Modify envelope settings"
            lockLoading={lockLoading}
            isLocked={isLocked}
            isOwnLock={isOwnLock}
            isExpired={lock?.isExpired}
            lock={lock}
            onBreakLock={breakLock}
            onClose={handleClose}
          />

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <ModalContent
              formData={formData}
              errors={errors}
              calculatedAmounts={calculatedAmounts}
              canEdit={canEdit}
              canDelete={canDelete}
              canSubmit={canSubmit}
              isLoading={isLoading}
              isUnassignedCash={isUnassignedCash}
              envelopeId={envelope?.id}
              onUpdateField={updateFormField}
              onDelete={handleDeleteClick}
              onCancel={handleClose}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteEnvelopeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        envelope={envelope}
      />
    </>
  );
};

export default EditEnvelopeModal;
