import React from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { useTouchFeedback } from "../../../utils/ui/touchFeedback";

interface PayerPrediction {
  average: number;
  mostRecent: number;
  count: number;
}

interface PaycheckPayerSelectorProps {
  payerName: string;
  uniquePayers: string[];
  showAddNewPayer: boolean;
  newPayerName: string;
  isProcessing: boolean;
  onPayerChange: (payer: string) => void;
  onNewPayerNameChange: (name: string) => void;
  onAddNewPayer: () => void;
  onToggleAddNewPayer: (show: boolean) => void;
  getPayerPrediction: (payer: string) => PayerPrediction | null;
}

/**
 * Paycheck payer selector component
 * Handles payer dropdown and add new payer functionality
 */
const PaycheckPayerSelector: React.FC<PaycheckPayerSelectorProps> = ({
  payerName,
  uniquePayers,
  showAddNewPayer,
  newPayerName,
  isProcessing,
  onPayerChange,
  onNewPayerNameChange,
  onAddNewPayer,
  onToggleAddNewPayer,
  getPayerPrediction,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-3">
        {React.createElement(getIcon("User"), {
          className: "h-4 w-4 inline mr-2",
        })}
        Whose Paycheck?
      </label>

      {!showAddNewPayer && uniquePayers.length > 0 ? (
        <div className="space-y-3">
          {/* Dropdown for existing payers */}
          <Select
            value={payerName}
            onChange={(e) => {
              if (e.target.value === "ADD_NEW") {
                onToggleAddNewPayer(true);
              } else {
                onPayerChange(e.target.value);
              }
            }}
            className="glassmorphism w-full px-6 py-4 border-2 border-black rounded-2xl focus:ring-2 focus:ring-purple-500"
            disabled={isProcessing}
          >
            <option value="">Select a person...</option>
            {uniquePayers.map((payer) => {
              const prediction = getPayerPrediction(payer);
              return (
                <option key={payer} value={payer}>
                  {payer} {prediction ? `(avg: $${prediction.average.toFixed(2)})` : ""}
                </option>
              );
            })}
            <option value="ADD_NEW">+ Add New Person</option>
          </Select>

          {/* Show prediction info for selected payer */}
          {payerName &&
            (() => {
              const prediction = getPayerPrediction(payerName);
              return prediction ? (
                <PayerPredictionInfo payerName={payerName} prediction={prediction} />
              ) : null;
            })()}
        </div>
      ) : (
        <AddNewPayerForm
          uniquePayers={uniquePayers}
          newPayerName={newPayerName}
          onNewPayerNameChange={onNewPayerNameChange}
          onAddNewPayer={onAddNewPayer}
          onToggleAddNewPayer={onToggleAddNewPayer}
        />
      )}
    </div>
  );
};

/**
 * Payer prediction information display
 */
interface PayerPredictionInfoProps {
  payerName: string;
  prediction: PayerPrediction;
}

const PayerPredictionInfo: React.FC<PayerPredictionInfoProps> = ({ payerName, prediction }) => (
  <div className="glassmorphism p-4 rounded-xl border border-blue-200/50 bg-blue-50/20">
    <div className="text-sm text-gray-600">
      {React.createElement(getIcon("TrendingUp"), {
        className: "h-4 w-4 inline mr-2 text-blue-500",
      })}
      <strong>{payerName}'s History:</strong>
      {` Avg: $${prediction.average.toFixed(2)} • Last: $${prediction.mostRecent.toFixed(2)} (${prediction.count} paychecks)`}
    </div>
  </div>
);

/**
 * Add new payer form component
 */
interface AddNewPayerFormProps {
  uniquePayers: string[];
  newPayerName: string;
  onNewPayerNameChange: (name: string) => void;
  onAddNewPayer: () => void;
  onToggleAddNewPayer: (show: boolean) => void;
}

const AddNewPayerForm: React.FC<AddNewPayerFormProps> = ({
  uniquePayers,
  newPayerName,
  onNewPayerNameChange,
  onAddNewPayer,
  onToggleAddNewPayer,
}) => {
  const confirmTouchFeedback = useTouchFeedback("confirm", "success");
  const cancelTouchFeedback = useTouchFeedback("tap", "secondary");

  return (
    <div className="space-y-3">
      {uniquePayers.length === 0 && (
        <div className="glassmorphism p-4 rounded-xl border border-blue-200/50 bg-blue-50/20 mb-4">
          <div className="text-sm text-gray-600">
            {React.createElement(getIcon("User"), {
              className: "h-4 w-4 inline mr-2 text-blue-500",
            })}
            <strong>First paycheck?</strong> Let's start by adding who this paycheck is for.
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <input
          type="text"
          value={newPayerName}
          onChange={(e) => onNewPayerNameChange(e.target.value)}
          className="glassmorphism flex-1 px-6 py-4 border-2 border-black rounded-2xl focus:ring-2 focus:ring-purple-500"
          placeholder="Enter new person's name"
          onKeyPress={(e) => e.key === "Enter" && onAddNewPayer()}
          autoFocus
        />
        <Button
          onClick={confirmTouchFeedback.onClick(onAddNewPayer)}
          onTouchStart={confirmTouchFeedback.onTouchStart}
          className={`px-6 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 border-2 border-black ${confirmTouchFeedback.className}`}
          disabled={!newPayerName.trim()}
        >
          {React.createElement(getIcon("CheckCircle"), {
            className: "h-5 w-5",
          })}
        </Button>
        {uniquePayers.length > 0 ? (
          <Button
            onClick={cancelTouchFeedback.onClick(() => {
              onToggleAddNewPayer(false);
              onNewPayerNameChange("");
            })}
            onTouchStart={cancelTouchFeedback.onTouchStart}
            className={`px-6 py-4 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 border-2 border-black ${cancelTouchFeedback.className}`}
            title="Back to person selection"
          >
            ←
          </Button>
        ) : (
          <Button
            onClick={cancelTouchFeedback.onClick(() => {
              onToggleAddNewPayer(false);
              onNewPayerNameChange("");
            })}
            onTouchStart={cancelTouchFeedback.onTouchStart}
            className={`px-6 py-4 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 border-2 border-black ${cancelTouchFeedback.className}`}
            title="Cancel"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaycheckPayerSelector;
