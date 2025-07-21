// components/EnvelopeGrid.jsx
import React, { useState } from "react";
import { Wallet, Plus, Minus, ArrowRightLeft, DollarSign } from "lucide-react";

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
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all"
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
          const isLow = envelope.currentBalance < envelope.biweeklyAllocation;
          const isOverfunded = envelope.currentBalance > envelope.monthlyAmount;

          return (
            <div
              key={envelope.id}
              className={`rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all ${
                isLow
                  ? "bg-gradient-to-br from-red-500 to-red-600"
                  : isOverfunded
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}
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
                <p>Monthly: ${envelope.monthlyAmount.toFixed(2)}</p>
                <p>Biweekly: ${envelope.biweeklyAllocation.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {selectedEnvelope && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedEnvelope.name}
            </h3>
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

export default EnvelopeGrid;
