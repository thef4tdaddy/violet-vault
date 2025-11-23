import { Button } from "@/components/ui";

interface QuickPaymentFormProps {
  showPaymentForm: boolean;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onShowForm: () => void;
  onCancel: () => void;
  isActiveDebt: boolean;
}

/**
 * Quick payment form component for recording debt payments
 * Pure UI component - receives state and handlers as props
 */
const QuickPaymentForm: React.FC<QuickPaymentFormProps> = ({
  showPaymentForm,
  paymentAmount,
  setPaymentAmount,
  onSubmit,
  onShowForm,
  onCancel,
  isActiveDebt,
}) => {
  if (!isActiveDebt) return null;

  if (!showPaymentForm) {
    return (
      <div className="mb-6">
        <Button
          onClick={onShowForm}
          className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          Record Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <form onSubmit={onSubmit} className="bg-green-50 rounded-xl p-4">
        <h4 className="font-medium text-green-900 mb-3">Record Payment</h4>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Payment amount"
            required
          />
          <Button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Record
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-green-700 border border-green-300 rounded-lg hover:bg-green-100"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuickPaymentForm;
