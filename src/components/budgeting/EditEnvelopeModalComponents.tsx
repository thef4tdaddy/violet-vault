import React from "react";
import { Select, Button } from "@/components/ui";
import { getIcon } from "@/utils";
import EnvelopeTypeSelector from "./shared/EnvelopeTypeSelector";
import EnvelopeBasicFields from "./envelope/EnvelopeBasicFields";
import EnvelopeBudgetFields from "./envelope/EnvelopeBudgetFields";
import { UniversalConnectionManager } from "@/components/ui/ConnectionDisplay";
import { ENVELOPE_TYPES } from "@/constants/categories";

interface AdditionalSettingsProps {
  formData: {
    priority?: string;
    autoAllocate?: boolean;
  };
  canEdit: boolean;
  onUpdateField: (field: string, value: unknown) => void;
}

/**
 * Additional settings section for Edit Envelope modal
 */
export const AdditionalSettings = ({
  formData,
  canEdit,
  onUpdateField,
}: AdditionalSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Additional Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <Select
            value={formData.priority || "medium"}
            onChange={(e) => onUpdateField("priority", e.target.value)}
            disabled={!canEdit}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </Select>
        </div>

        {/* Auto Allocate */}
        <div className="flex items-center pt-8">
          <input
            type="checkbox"
            id="autoAllocate"
            checked={formData.autoAllocate !== false}
            onChange={(e) => onUpdateField("autoAllocate", e.target.checked)}
            disabled={!canEdit}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:cursor-not-allowed"
          />
          <label htmlFor="autoAllocate" className="ml-3 text-sm text-gray-700">
            Auto-allocate funds
          </label>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonsProps {
  canDelete: boolean;
  isUnassignedCash: boolean;
  canSubmit: boolean;
  isLoading: boolean;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * Action buttons for Edit Envelope modal
 */
export const ActionButtons = ({
  canDelete,
  isUnassignedCash,
  canSubmit,
  isLoading,
  onDelete,
  onCancel,
  onSubmit,
}: ActionButtonsProps) => {
  return (
    <div className="flex justify-between pt-4">
      {/* Delete Button */}
      <div>
        {canDelete && !isUnassignedCash && (
          <Button
            type="button"
            onClick={onDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
          >
            {React.createElement(getIcon("Trash2"), {
              className: "h-4 w-4 mr-2",
            })}
            Delete Envelope
          </Button>
        )}
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {React.createElement(getIcon("Save"), {
            className: "h-4 w-4 mr-2",
          })}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

interface ModalContentProps {
  formData: {
    envelopeType: string;
    priority?: string;
    autoAllocate?: boolean;
  };
  errors: Record<string, string>;
  calculatedAmounts: Record<string, number>;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  isLoading: boolean;
  isUnassignedCash: boolean;
  envelopeId?: string;
  onUpdateField: (field: string, value: unknown) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * Modal content for Edit Envelope modal
 */
export const ModalContent = ({
  formData,
  errors,
  calculatedAmounts,
  canEdit,
  canDelete,
  canSubmit,
  isLoading,
  isUnassignedCash,
  envelopeId,
  onUpdateField,
  onDelete,
  onCancel,
  onSubmit,
}: ModalContentProps) => {
  return (
    <div className="space-y-6">
      {/* Envelope Type Selection */}
      {!isUnassignedCash && (
        <EnvelopeTypeSelector
          selectedType={formData.envelopeType}
          onTypeChange={(type) => onUpdateField("envelopeType", type)}
          excludeTypes={
            formData.envelopeType === ENVELOPE_TYPES.SAVINGS ||
            formData.envelopeType === ENVELOPE_TYPES.SINKING_FUND ||
            formData.envelopeType === ENVELOPE_TYPES.SUPPLEMENTAL
              ? []
              : [ENVELOPE_TYPES.SAVINGS, ENVELOPE_TYPES.SINKING_FUND, ENVELOPE_TYPES.SUPPLEMENTAL]
          }
          disabled={!canEdit}
        />
      )}

      {/* Basic Information */}
      <EnvelopeBasicFields
        formData={formData}
        onUpdateField={onUpdateField}
        errors={errors}
        canEdit={canEdit}
      />

      {/* Bill Connection */}
      {canEdit && envelopeId && (
        <UniversalConnectionManager
          entityType="envelope"
          entityId={envelopeId}
          canEdit={canEdit}
          theme="purple"
        />
      )}

      {/* Budget Settings */}
      {!isUnassignedCash && (
        <EnvelopeBudgetFields
          formData={formData}
          onUpdateField={onUpdateField}
          errors={errors}
          calculatedAmounts={calculatedAmounts}
          canEdit={canEdit}
        />
      )}

      {/* Additional Settings */}
      <AdditionalSettings formData={formData} canEdit={canEdit} onUpdateField={onUpdateField} />

      {/* Action Buttons */}
      <ActionButtons
        canDelete={canDelete}
        isUnassignedCash={isUnassignedCash}
        canSubmit={canSubmit}
        isLoading={isLoading}
        onDelete={onDelete}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
};
