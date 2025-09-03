import React, { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import useEnvelopeEdit from "../../hooks/budgeting/useEnvelopeEdit";
import logger from "../../utils/common/logger";
import EnvelopeModalHeader from "./envelope/EnvelopeModalHeader";
import EnvelopeTypeSelector from "./shared/EnvelopeTypeSelector";
import EnvelopeBasicFields from "./envelope/EnvelopeBasicFields";
import EnvelopeBudgetFields from "./envelope/EnvelopeBudgetFields";
import { UniversalConnectionManager } from "../ui/ConnectionDisplay";
import DeleteEnvelopeModal from "./DeleteEnvelopeModal";

const EditEnvelopeModal = ({
  isOpen = false,
  onClose,
  envelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
  existingEnvelopes = [],
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            <div className="space-y-6">
              {/* Envelope Type Selection */}
              {!isUnassignedCash && (
                <EnvelopeTypeSelector
                  selectedType={formData.envelopeType}
                  onTypeChange={(type) => updateFormField("envelopeType", type)}
                  canEdit={canEdit}
                />
              )}

              {/* Basic Information */}
              <EnvelopeBasicFields
                formData={formData}
                onUpdateField={updateFormField}
                errors={errors}
                canEdit={canEdit}
              />

              {/* Bill Connection */}
              {canEdit && envelope?.id && (
                <UniversalConnectionManager
                  entityType="envelope"
                  entityId={envelope.id}
                  canEdit={canEdit}
                  theme="purple"
                />
              )}

              {/* Budget Settings */}
              {!isUnassignedCash && (
                <EnvelopeBudgetFields
                  formData={formData}
                  onUpdateField={updateFormField}
                  errors={errors}
                  calculatedAmounts={calculatedAmounts}
                  canEdit={canEdit}
                />
              )}

              {/* Additional Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Additional Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority || "medium"}
                      onChange={(e) => updateFormField("priority", e.target.value)}
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Auto Allocate */}
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="autoAllocate"
                      checked={formData.autoAllocate !== false}
                      onChange={(e) => updateFormField("autoAllocate", e.target.checked)}
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <label htmlFor="autoAllocate" className="ml-2 block text-sm text-gray-900">
                      Auto-allocate funds
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              {/* Delete Button */}
              <div>
                {canDelete && !isUnassignedCash && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Envelope
                  </button>
                )}
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isLoading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
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
