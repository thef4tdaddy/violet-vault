import React from "react";
import { Select, Checkbox, Button } from "@/components/ui";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";
import { DebtBasicInfo, DebtFinancialDetails, DebtPaymentDetails } from "./DebtFormSections";
import type { DebtFormState } from "@/hooks/budgeting/envelopes/liabilities/useDebtForm";

// Minimal strongly-typed shapes used by this form
type DebtFormData = DebtFormState & {
  id?: string;
  shouldCreateBill?: boolean;
};

type Bill = {
  id: string;
  name?: string;
  amount?: number;
};

type DebtFormFieldsProps = {
  formData: DebtFormData;
  setFormData: (patch: Partial<DebtFormData>) => void;
  errors: Partial<Record<string, string | undefined>>;
  canEdit: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  bills: Bill[];
  billsLoading?: boolean;
};

const DebtFormFields = ({
  formData,
  setFormData,
  errors,
  canEdit,
  isEditMode,
  isSubmitting,
  handleFormSubmit,
  onClose,
  bills,
  billsLoading,
}: DebtFormFieldsProps) => {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Basic Information */}
      <DebtBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        canEdit={canEdit}
      />

      {/* Financial Details */}
      <DebtFinancialDetails
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        canEdit={canEdit}
      />

      {/* Payment Details */}
      <DebtPaymentDetails
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        canEdit={canEdit}
      />

      {/* Connection Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Automation</h3>

        {/* Auto-pay toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900">Automatic Bill Creation</h4>
            <p className="text-sm text-gray-600">Create recurring bills for this debt's payments</p>
          </div>

          <Checkbox
            checked={Boolean(formData.createBill)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({
                createBill: e.target.checked,
                shouldCreateBill: e.target.checked,
              })
            }
            disabled={!canEdit}
          />
        </div>

        {/* Universal Connection Manager for standardized connection UI */}
        <UniversalConnectionManager
          entityType="debt"
          entityId={isEditMode ? (formData.id as string | undefined) : null}
          canEdit={canEdit}
          theme="red"
          showSelector={true}
        />

        {/* Legacy bill connection (fallback if needed) */}
        {formData.createBill && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connect to Existing Bill
            </label>
            <Select
              value={String(formData.existingBillId ?? "")}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ existingBillId: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={!canEdit || billsLoading}
            >
              <option value="">Choose a bill...</option>
              {bills.map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.name} - ${bill.amount?.toFixed(2)}
                </option>
              ))}
            </Select>

            {errors.existingBillId && (
              <p className="mt-1 text-sm text-red-600">{errors.existingBillId}</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={String(formData.notes ?? "")}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ notes: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Add any additional notes about this debt..."
          disabled={!canEdit}
        />
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !canEdit}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditMode ? "Update Debt" : "Add Debt"}
        </Button>
      </div>
    </form>
  );
};

export default DebtFormFields;
