import React from "react";
import { Select } from "@/components/ui";
import { getIcon, getIconByName, getBillIcon } from "@/utils/icons";
import { getConfidenceColor } from "./utils";
import type { DiscoveredBill, Envelope } from "../BillDiscoveryModal";

interface BillItemContentProps {
  bill: DiscoveredBill;
  billEnvelopeMap: Record<string, string>;
  availableEnvelopes: Envelope[];
  onUpdateEnvelope: (billId: string, envelopeId: string) => void;
}

export const BillItemContent: React.FC<BillItemContentProps> = ({
  bill,
  billEnvelopeMap,
  availableEnvelopes,
  onUpdateEnvelope,
}) => {
  const getBillIconComponent = () => {
    if (bill.iconName && typeof bill.iconName === "string") {
      const IconComponent = getIconByName(bill.iconName);
      return React.createElement(IconComponent, { className: "h-6 w-6" });
    }

    const IconComponent = getBillIcon(
      bill.provider || "",
      bill.description || "",
      bill.category || ""
    );
    return React.createElement(IconComponent, { className: "h-6 w-6" });
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl">{getBillIconComponent()}</div>
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {bill.provider}
              <span
                className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(bill.confidence)}`}
              >
                {Math.round(bill.confidence * 100)}%
              </span>
            </h4>
            <p className="text-sm text-gray-600">{bill.category}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">${Math.abs(bill.amount).toFixed(2)}</p>
          <p className="text-xs text-gray-500 capitalize">{bill.frequency}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("Calendar"), {
            className: "h-3 w-3",
          })}
          Due: {new Date(bill.dueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("TrendingUp"), {
            className: "h-3 w-3",
          })}
          {bill.discoveryData.transactionCount} transactions
        </div>
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("Zap"), {
            className: "h-3 w-3",
          })}
          Every ~{bill.discoveryData.avgInterval} days
        </div>
      </div>

      {/* Envelope Assignment */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          {React.createElement(getIcon("Target"), {
            className: "h-4 w-4 text-gray-400",
          })}
          <Select
            value={billEnvelopeMap[bill.id] || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onUpdateEnvelope(bill.id, e.target.value)
            }
            className="text-sm px-2 py-1 border border-gray-300 rounded flex-1"
          >
            <option value="">No envelope (use unassigned cash)</option>
            {availableEnvelopes.map((envelope: Envelope) => (
              <option key={envelope.id} value={envelope.id}>
                {envelope.name}
                {envelope.id === bill.suggestedEnvelopeId && " (Suggested)"}
              </option>
            ))}
          </Select>
        </div>

        {bill.suggestedEnvelopeName && (
          <p className="text-xs text-blue-600 mt-1 ml-6">
            💡 Suggested: {bill.suggestedEnvelopeName}(
            {bill.envelopeConfidence && Math.round(bill.envelopeConfidence * 100)}% match)
          </p>
        )}
      </div>

      {/* Discovery Details */}
      {bill.discoveryData && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <p>
            <strong>Sample transactions:</strong>
            {bill.discoveryData.sampleTransactions.map((txn, i: number) => (
              <span key={i}>
                {i > 0 && ", "}${Math.abs(txn.amount).toFixed(2)} on{" "}
                {new Date(txn.date).toLocaleDateString()}
              </span>
            ))}
          </p>
          {bill.discoveryData.amountRange && (
            <p className="mt-1">
              <strong>Amount range:</strong> $
              {Math.abs(bill.discoveryData.amountRange[0]).toFixed(2)} - $
              {Math.abs(bill.discoveryData.amountRange[1]).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
