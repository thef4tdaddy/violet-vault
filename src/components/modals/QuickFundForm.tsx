import { Button } from "@/components/ui";
import { getButtonClasses, withHapticFeedback } from "@/utils/ui/touchFeedback";

interface Envelope {
  name: string;
  color?: string;
  currentBalance?: number;
}

interface QuickFundFormProps {
  envelope: Envelope;
  amount: number;
  setAmount: (amount: number) => void;
  unassignedCash: number;
  onConfirm: () => void;
  onClose: () => void;
}

const QuickFundForm = ({
  envelope,
  amount,
  setAmount,
  unassignedCash,
  onConfirm,
  onClose,
}: QuickFundFormProps) => {
  const handleQuickAmounts = (quickAmount: number) => {
    setAmount(Math.min(quickAmount, unassignedCash));
  };

  const quickAmounts = [5, 10, 20, 50].filter((amt) => amt <= unassignedCash);

  return (
    <>
      {/* Envelope Info */}
      <div className="bg-purple-50/60 rounded-lg p-4 mb-6 border border-purple-200">
        <div className="flex items-center space-x-3">
          {envelope.color && (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 border border-black"
              style={{ backgroundColor: envelope.color }}
            />
          )}
          <div className="flex-1">
            <h3 className="font-medium text-purple-900">{envelope.name}</h3>
            <p className="text-sm text-purple-700">
              Current: ${(envelope.currentBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fund Amount</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">$</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full pl-8 pr-4 py-3 border-2 border-black rounded-lg text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0.00"
            step="0.01"
            min="0"
            max={unassignedCash}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Available: ${unassignedCash.toFixed(2)}</p>
      </div>

      {/* Quick Amount Buttons */}
      {quickAmounts.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amounts</label>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                onClick={withHapticFeedback(() => handleQuickAmounts(quickAmount), "light")}
                className={getButtonClasses(
                  "py-2 px-3 text-sm font-medium border-2 border-black bg-white rounded-lg hover:bg-purple-50",
                  "small"
                )}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Result Preview */}
      {amount > 0 && (
        <div className="bg-green-50/60 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">New Balance:</span>
            <span className="text-lg font-bold text-green-600">
              ${((envelope.currentBalance || 0) + amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={withHapticFeedback(onConfirm, "confirm")}
          disabled={amount <= 0}
          className={getButtonClasses(
            "w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
            "primary"
          )}
        >
          Fund ${amount.toFixed(2)}
        </Button>

        <Button
          onClick={withHapticFeedback(onClose, "light")}
          className={getButtonClasses(
            "w-full bg-white text-gray-600 font-bold py-3 px-6 rounded-lg border-2 border-black shadow-lg hover:bg-gray-50",
            "secondary"
          )}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

export default QuickFundForm;
