// components/EnvelopeGrid.jsx
import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Minus,
  ArrowRightLeft,
  DollarSign,
  X,
} from "lucide-react";

const EnvelopeGrid = ({
  envelopes,
  unassignedCash,
  onSpend,
  onTransfer,
  onUpdateUnassigned,
}) => {
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [actionType, setActionType] = useState(""); // 'spend', 'transfer', 'add'
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferTarget, setTransferTarget] = useState("");

  const handleAction = () => {
    const actionAmount = parseFloat(amount);
    if (!actionAmount || actionAmount <= 0) return;

    if (actionType === "spend") {
      onSpend(selectedEnvelope.id, actionAmount, description);
    } else if (actionType === "transfer" && transferTarget) {
      if (transferTarget === "unassigned") {
        // Transfer to unassigned cash
        onSpend(selectedEnvelope.id, actionAmount, "Transfer to unassigned");
        onUpdateUnassigned(unassignedCash + actionAmount);
      } else {
        onTransfer(selectedEnvelope.id, transferTarget, actionAmount);
      }
    } else if (actionType === "add") {
      if (selectedEnvelope.id === "unassigned") {
        onUpdateUnassigned(unassignedCash + actionAmount);
      } else {
        // Add from unassigned cash
        if (unassignedCash >= actionAmount) {
          onUpdateUnassigned(unassignedCash - actionAmount);
          onTransfer("unassigned", selectedEnvelope.id, actionAmount);
        } else {
          alert("Not enough unassigned cash");
          return;
        }
      }
    }

    setSelectedEnvelope(null);
    setActionType("");
    setAmount("");
    setDescription("");
    setTransferTarget("");
  };

  return (
    <div>
      {/* Envelope Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {/* Unassigned Cash Envelope */}
        <div
          className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl shadow-2xl p-6 text-white cursor-pointer hover:shadow-emerald-500/25 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-emerald-300/20"
          style={{
            background:
              "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
            boxShadow:
              "0 20px 40px -15px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
          onClick={() =>
            setSelectedEnvelope({
              id: "unassigned",
              name: "Unassigned Cash",
              currentBalance: unassignedCash,
            })
          }
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="h-8 w-8" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Unassigned Cash</h3>
          <p className="text-3xl font-bold">${unassignedCash.toFixed(2)}</p>
        </div>

        {/* Bill Envelopes */}
        {envelopes.map((envelope) => {
          // Some imported data may not contain a monthlyAmount field. Fallback
          // to a value derived from the biweekly allocation (approximate
          // monthly amount) or 0 to avoid runtime errors when calling toFixed.
          const monthlyAmount =
            envelope.monthlyAmount ??
            (envelope.biweeklyAllocation
              ? (envelope.biweeklyAllocation * 26) / 12
              : 0);

          const isLow = envelope.currentBalance < envelope.biweeklyAllocation;
          const isOverfunded = envelope.currentBalance > monthlyAmount;

          return (
            <div
              key={envelope.id}
              className={`rounded-xl shadow-2xl p-6 text-white cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border ${
                isLow
                  ? "hover:shadow-red-500/25 border-red-300/20"
                  : isOverfunded
                    ? "hover:shadow-blue-500/25 border-blue-300/20"
                    : "hover:shadow-indigo-500/25 border-indigo-300/20"
              }`}
              style={{
                background: isLow
                  ? "linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)"
                  : isOverfunded
                    ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)"
                    : "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
                boxShadow: isLow
                  ? "0 20px 40px -15px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                  : isOverfunded
                    ? "0 20px 40px -15px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                    : "0 20px 40px -15px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
              onClick={() => setSelectedEnvelope(envelope)}
            >
              <div className="flex items-center justify-between mb-4">
                <Wallet className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {envelope.dueDate &&
                    new Date(envelope.dueDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{envelope.name}</h3>
              <p className="text-2xl font-bold mb-2">
                ${envelope.currentBalance.toFixed(2)}
              </p>
              <div className="text-sm opacity-90">
                <p>Monthly: ${monthlyAmount.toFixed(2)}</p>
                <p>Biweekly: ${envelope.biweeklyAllocation.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {selectedEnvelope && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedEnvelope.name}</h3>
              <button
                onClick={() => setSelectedEnvelope(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-lg mb-4">
              Current Balance:{" "}
              <span className="font-bold">
                ${selectedEnvelope.currentBalance.toFixed(2)}
              </span>
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setActionType("spend")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  actionType === "spend"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
              >
                <Minus className="h-5 w-5 mx-auto mb-1 text-red-600" />
                <span className="text-sm">Spend</span>
              </button>

              <button
                onClick={() => setActionType("add")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  actionType === "add"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <Plus className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <span className="text-sm">Add</span>
              </button>

              <button
                onClick={() => setActionType("transfer")}
                className={`p-3 rounded-lg border-2 transition-all ${
                  actionType === "transfer"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <ArrowRightLeft className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <span className="text-sm">Transfer</span>
              </button>
            </div>

            {actionType && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {actionType === "spend" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="What was this for?"
                    />
                  </div>
                )}

                {actionType === "transfer" &&
                  selectedEnvelope.id !== "unassigned" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transfer To
                      </label>
                      <select
                        value={transferTarget}
                        onChange={(e) => setTransferTarget(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select target...</option>
                        <option value="unassigned">Unassigned Cash</option>
                        {envelopes
                          .filter((env) => env.id !== selectedEnvelope.id)
                          .map((env) => (
                            <option key={env.id} value={env.id}>
                              {env.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEnvelope(null)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={
                      !amount || (actionType === "transfer" && !transferTarget)
                    }
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EnvelopeGrid);
