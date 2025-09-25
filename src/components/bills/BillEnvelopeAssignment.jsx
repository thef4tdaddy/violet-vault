import React from "react";
import { getIcon } from "../../utils";

/**
 * Envelope assignment section for discovered bills
 * Handles envelope selection and suggestions
 */
const BillEnvelopeAssignment = ({
  bill,
  assignedEnvelopeId,
  availableEnvelopes,
  onUpdateEnvelope,
}) => {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        {React.createElement(getIcon("Target"), {
          className: "h-4 w-4 text-gray-400",
        })}
        <select
          value={assignedEnvelopeId || ""}
          onChange={(e) => onUpdateEnvelope(bill.id, e.target.value)}
          className="text-sm px-2 py-1 border border-gray-300 rounded flex-1"
        >
          <option value="">No envelope (use unassigned cash)</option>
          {availableEnvelopes.map((envelope) => (
            <option key={envelope.id} value={envelope.id}>
              {envelope.name}
              {envelope.id === bill.suggestedEnvelopeId && " (Suggested)"}
            </option>
          ))}
        </select>
      </div>

      {bill.suggestedEnvelopeName && (
        <p className="text-xs text-blue-600 mt-1 ml-6">
          💡 Suggested: {bill.suggestedEnvelopeName}(
          {Math.round(bill.envelopeConfidence * 100)}% match)
        </p>
      )}
    </div>
  );
};

export default BillEnvelopeAssignment;