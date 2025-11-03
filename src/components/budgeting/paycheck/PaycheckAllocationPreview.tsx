import React from "react";
import { getIcon } from "../../../utils";

/**
 * Enhanced allocation preview component
 * Shows detailed allocation preview with proper UI standards
 */
const PaycheckAllocationPreview = ({ preview, hasAmount, envelopes = [] }) => {
  if (!hasAmount || !preview) {
    return (
      <div className="glassmorphism rounded-2xl p-6 border-2 border-black">
        <h3 className="font-black text-black text-base flex items-center tracking-wide">
          {React.createElement(getIcon("Calculator"), {
            className: "h-5 w-5 mr-2 text-purple-600",
          })}
          <span className="text-lg">A</span>LLOCATION&nbsp;&nbsp;<span className="text-lg">P</span>REVIEW
        </h3>

        <div className="text-center py-12 text-gray-500 mt-6">
          {React.createElement(getIcon("Calculator"), {
            className: "h-16 w-16 mx-auto mb-4 opacity-30",
          })}
          <p className="text-lg font-medium">Enter amount and click "Preview Allocation"</p>
          <p className="text-sm mt-2">See exactly where your money will go</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black">
      <h3 className="font-black text-black text-base flex items-center tracking-wide">
        {React.createElement(getIcon("Calculator"), {
          className: "h-5 w-5 mr-2 text-purple-600",
        })}
        <span className="text-lg">A</span>LLOCATION&nbsp;&nbsp;<span className="text-lg">P</span>REVIEW
      </h3>

      <div className="space-y-6 mt-6">
        <AllocationSummary preview={preview} />

        {preview.mode === "allocate" && Object.keys(preview.allocations).length > 0 && (
          <EnvelopeAllocations preview={preview} envelopes={envelopes} />
        )}

        <UnassignedCashDisplay preview={preview} />
      </div>
    </div>
  );
};

/**
 * Allocation summary section
 */
const AllocationSummary = ({ preview }) => (
  <div className="glassmorphism rounded-2xl p-6 border border-white/20">
    <div className="flex justify-between items-center mb-3">
      <span className="font-semibold text-purple-900">Total Paycheck:</span>
      <span className="text-2xl font-bold text-emerald-600">${preview.totalAmount.toFixed(2)}</span>
    </div>
    <p className="text-sm text-purple-900 bg-emerald-50 p-3 rounded-xl">{preview.summary}</p>

    {/* Debug info for production troubleshooting */}
    {preview.debugInfo && preview.mode === "allocate" && (
      <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
        <strong>Allocation Debug:</strong> {preview.debugInfo.totalEnvelopes} total envelopes,{" "}
        {preview.debugInfo.autoAllocateEnvelopes} with auto-allocate enabled, found{" "}
        {preview.debugInfo.billEnvelopesFound} bills + {preview.debugInfo.variableEnvelopesFound}{" "}
        variable = {preview.debugInfo.allocatedEnvelopes} receiving funds
      </div>
    )}
  </div>
);

/**
 * Envelope allocations display
 */
const EnvelopeAllocations = ({ preview, envelopes }) => (
  <div className="glassmorphism rounded-2xl p-6 border border-white/20">
    <h4 className="font-semibold mb-4 text-purple-900">Envelope Allocations:</h4>
    <div className="space-y-3">
      {envelopes.map((envelope) => {
        const allocation = preview.allocations[envelope.id] || 0;
        if (allocation === 0) return null;

        return (
          <div
            key={envelope.id}
            className="flex justify-between items-center p-3 bg-purple-50 rounded-xl"
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: envelope.color }}
              />
              <span className="font-medium text-gray-900">{envelope.name}</span>
            </div>
            <span className="font-bold text-purple-600">${allocation.toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/**
 * Unassigned cash display section
 */
const UnassignedCashDisplay = ({ preview }) => (
  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white">
    <div className="flex justify-between items-center">
      <div>
        <span className="font-medium opacity-90">Unassigned Cash:</span>
        <div className="text-sm opacity-75 mt-1">Available for manual allocation</div>
      </div>
      <span className="text-2xl font-bold">+${preview.leftoverAmount.toFixed(2)}</span>
    </div>
  </div>
);

export default PaycheckAllocationPreview;
