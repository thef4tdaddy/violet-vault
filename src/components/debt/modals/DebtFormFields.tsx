import { Select, TextInput, Checkbox } from "@/components/ui";
import { Button } from "@/components/ui";
import { DEBT_TYPE_CONFIG, PAYMENT_FREQUENCIES } from "../../../constants/debts";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";

/**
 * Form fields section for AddDebtModal
 * Pure UI component that preserves exact visual appearance
 */
// eslint-disable-next-line max-lines-per-function, complexity -- Large form component with multiple sections and validation
const DebtFormFields = ({
  // Form data and handlers
  formData,
  setFormData,
  errors,

  // UI state
  canEdit,
  isEditMode,
  isSubmitting,

  // Form handlers
  handleFormSubmit,
  onClose,

  // Data
  bills,
  billsLoading,
}) => {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Debt Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g., Chase Credit Card"
              disabled={!canEdit}
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creditor <span className="text-red-500">*</span>
            </label>
            <TextInput
              type="text"
              value={formData.creditor}
              onChange={(e) => setFormData({ creditor: e.target.value })}
              placeholder="e.g., Chase Bank"
              disabled={!canEdit}
              error={errors.creditor}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Debt Type</label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={!canEdit}
          >
            {Object.entries(DEBT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Financial Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Financial Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Balance <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.currentBalance}
              onChange={(e) => setFormData({ currentBalance: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00"
              disabled={!canEdit}
            />
            {errors.currentBalance && (
              <p className="mt-1 text-sm text-red-600">{errors.currentBalance}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Original Balance</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.originalBalance}
              onChange={(e) => setFormData({ originalBalance: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00 (optional)"
              disabled={!canEdit}
            />
            {errors.originalBalance && (
              <p className="mt-1 text-sm text-red-600">{errors.originalBalance}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (APR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interestRate}
                onChange={(e) => setFormData({ interestRate: e.target.value })}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
                disabled={!canEdit}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            {errors.interestRate && (
              <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ creditLimit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00 (optional)"
              disabled={!canEdit}
            />
            {errors.creditLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.creditLimit}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Payment <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.minimumPayment}
              onChange={(e) => setFormData({ minimumPayment: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00"
              disabled={!canEdit}
            />
            {errors.minimumPayment && (
              <p className="mt-1 text-sm text-red-600">{errors.minimumPayment}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Due Date</label>
            <input
              type="date"
              value={formData.paymentDueDate}
              onChange={(e) => setFormData({ paymentDueDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={!canEdit}
            />
            {errors.paymentDueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentDueDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
          <Select
            value={formData.paymentFrequency}
            onChange={(e) => setFormData({ paymentFrequency: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={!canEdit}
          >
            {PAYMENT_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

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
            checked={formData.shouldCreateBill}
            onCheckedChange={(checked) => setFormData({ shouldCreateBill: checked })}
            disabled={!canEdit}
          />
        </div>

        {/* Universal Connection Manager for standardized connection UI */}
        <UniversalConnectionManager
          entityType="debt"
          entityId={isEditMode ? formData.id : null}
          canEdit={canEdit}
          theme="red"
          showSelector={true}
        />

        {/* Legacy bill connection (fallback if needed) */}
        {formData.shouldCreateBill && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connect to Existing Bill
            </label>
            <Select
              value={formData.existingBillId || ""}
              onChange={(e) => setFormData({ existingBillId: e.target.value })}
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
          value={formData.notes}
          onChange={(e) => setFormData({ notes: e.target.value })}
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
