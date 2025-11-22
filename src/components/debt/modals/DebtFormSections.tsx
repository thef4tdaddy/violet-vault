import { TextInput } from "@/components/ui";
import { DEBT_TYPE_CONFIG, PAYMENT_FREQUENCIES } from "../../../constants/debts";
import type { DebtFormState } from "@/hooks/debts/useDebtForm";
import type { DebtType, PaymentFrequency } from "@/types/debt";

interface SectionProps {
  formData: DebtFormState;
  setFormData: (patch: Partial<DebtFormState>) => void;
  errors: Partial<Record<string, string | undefined>>;
  canEdit: boolean;
}

/**
 * Basic information section for DebtFormFields
 * Extracted to reduce complexity
 */
export const DebtBasicInfo = ({ formData, setFormData, errors, canEdit }: SectionProps) => {
  return (
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Debt Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ type: e.target.value as DebtType })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={!canEdit}
          >
            {Object.entries(DEBT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Financial details section for DebtFormFields
 * Extracted to reduce complexity
 */
export const DebtFinancialDetails = ({ formData, setFormData, errors, canEdit }: SectionProps) => {
  return (
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
          {errors.creditLimit && <p className="mt-1 text-sm text-red-600">{errors.creditLimit}</p>}
        </div>
      </div>
    </div>
  );
};

/**
 * Payment details section for DebtFormFields
 * Extracted to reduce complexity
 */
export const DebtPaymentDetails = ({ formData, setFormData, errors, canEdit }: SectionProps) => {
  return (
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

      <div className="space-y-2">
        <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700 mb-2">
          Payment Frequency
        </label>
        <select
          id="paymentFrequency"
          value={formData.paymentFrequency}
          onChange={(e) => setFormData({ paymentFrequency: e.target.value as PaymentFrequency })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          disabled={!canEdit}
        >
          {Object.entries(PAYMENT_FREQUENCIES).map(([key, value]) => (
            <option key={value} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
