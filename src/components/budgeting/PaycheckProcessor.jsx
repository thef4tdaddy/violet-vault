// src/components/PaycheckProcessor.jsx - Complete Component
import React, { useState } from "react";
import {
  DollarSign,
  User,
  Wallet,
  Calculator,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { BILL_CATEGORIES, ENVELOPE_TYPES } from "../../constants/categories";

const PaycheckProcessor = ({
  envelopes = [],
  paycheckHistory = [],
  onProcessPaycheck,
  currentUser,
}) => {
  const [paycheckAmount, setPaycheckAmount] = useState("");
  const [payerName, setPayerName] = useState(currentUser?.userName || "");
  const [allocationMode, setAllocationMode] = useState("allocate"); // 'allocate' or 'leftover'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const calculateAllocation = () => {
    const amount = parseFloat(paycheckAmount) || 0;
    if (amount <= 0) return null;

    if (allocationMode === "leftover") {
      return {
        mode: "leftover",
        totalAmount: amount,
        allocations: {},
        leftoverAmount: amount,
        summary: `All $${amount.toFixed(2)} will go to unassigned cash`,
      };
    }

    // Calculate how much each envelope needs (bill and variable envelopes with auto-allocate enabled)
    let remainingAmount = amount;
    const allocations = {};
    let totalAllocated = 0;

    // Filter to bill envelopes with auto-allocate enabled
    const billEnvelopes = envelopes.filter(
      (envelope) =>
        envelope.autoAllocate &&
        (envelope.envelopeType === ENVELOPE_TYPES.BILL ||
          BILL_CATEGORIES.includes(envelope.category)),
    );

    // Filter to variable expense envelopes with auto-allocate enabled
    const variableEnvelopes = envelopes.filter(
      (envelope) =>
        envelope.autoAllocate &&
        envelope.envelopeType === ENVELOPE_TYPES.VARIABLE &&
        envelope.monthlyBudget > 0,
    );

    // First, allocate to bill envelopes (higher priority)
    billEnvelopes.forEach((envelope) => {
      const needed = Math.max(
        0,
        envelope.biweeklyAllocation - envelope.currentBalance,
      );
      const allocation = Math.min(needed, remainingAmount);

      if (allocation > 0) {
        allocations[envelope.id] = allocation;
        remainingAmount -= allocation;
        totalAllocated += allocation;
      }
    });

    // Then, allocate to variable expense envelopes (biweekly portion of monthly budget)
    variableEnvelopes.forEach((envelope) => {
      const biweeklyTarget = (envelope.monthlyBudget || 0) / 2; // Half of monthly budget
      const needed = Math.max(0, biweeklyTarget - envelope.currentBalance);
      const allocation = Math.min(needed, remainingAmount);

      if (allocation > 0) {
        allocations[envelope.id] = allocation;
        remainingAmount -= allocation;
        totalAllocated += allocation;
      }
    });

    return {
      mode: "allocate",
      totalAmount: amount,
      allocations,
      totalAllocated,
      leftoverAmount: remainingAmount,
      summary: `$${totalAllocated.toFixed(
        2,
      )} to envelopes (bills + variable), $${remainingAmount.toFixed(2)} to unassigned`,
    };
  };

  const handleProcessPaycheck = async () => {
    const amount = parseFloat(paycheckAmount);
    if (!amount || amount <= 0 || !payerName.trim()) return;

    setIsProcessing(true);

    try {
      const result = onProcessPaycheck({
        amount,
        payerName: payerName.trim(),
        mode: allocationMode,
        date: new Date().toISOString(),
      });

      console.log("Paycheck processed:", result);

      setPaycheckAmount("");
      setShowPreview(false);
    } catch (error) {
      console.error("Failed to process paycheck:", error);
      alert("Failed to process paycheck");
    } finally {
      setIsProcessing(false);
    }
  };

  const preview = calculateAllocation();

  return (
    <div className="space-y-6">
      {/* Process New Paycheck */}
      <div className="glassmorphism rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          Add Paycheck
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Paycheck Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={paycheckAmount}
                onChange={(e) => {
                  setPaycheckAmount(e.target.value);
                  setShowPreview(false);
                }}
                className="glassmorphism w-full px-6 py-4 text-xl font-semibold border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <User className="h-4 w-4 inline mr-2" />
                Whose Paycheck?
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="glassmorphism w-full px-6 py-4 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Sarah, John, etc."
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <Calculator className="h-4 w-4 inline mr-2" />
                How should this be allocated?
              </label>
              <div className="space-y-4">
                <div className="glassmorphism border-2 border-white/20 rounded-2xl hover:border-purple-300 transition-all p-6">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <input
                      type="radio"
                      value="allocate"
                      checked={allocationMode === "allocate"}
                      onChange={(e) => setAllocationMode(e.target.value)}
                      className="w-5 h-5 text-purple-600 mt-0.5 justify-self-start"
                      disabled={isProcessing}
                    />
                    <div>
                      <div className="flex items-center mb-2">
                        <Wallet className="h-5 w-5 mr-3 text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          Auto-allocate to Envelopes
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Fill up bill and variable expense envelopes based on
                        their funding needs, then put leftovers in unassigned
                        cash
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glassmorphism border-2 border-white/20 rounded-2xl hover:border-emerald-300 transition-all p-6">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <input
                      type="radio"
                      value="leftover"
                      checked={allocationMode === "leftover"}
                      onChange={(e) => setAllocationMode(e.target.value)}
                      className="w-5 h-5 text-emerald-600 mt-0.5 justify-self-start"
                      disabled={isProcessing}
                    />
                    <div>
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 mr-3 text-emerald-600" />
                        <span className="font-semibold text-gray-900">
                          All to Unassigned Cash
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Put the entire paycheck into unassigned cash for manual
                        allocation later
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!paycheckAmount || !payerName.trim() || isProcessing}
                className="flex-1 btn btn-secondary py-4 text-lg font-semibold rounded-2xl"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Preview Allocation
              </button>

              {showPreview && (
                <button
                  onClick={handleProcessPaycheck}
                  disabled={isProcessing}
                  className="flex-1 btn btn-success py-4 text-lg font-semibold rounded-2xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm & Process
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="glassmorphism rounded-2xl p-6 border border-white/20">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
              <Calculator className="h-5 w-5 mr-2 text-purple-600" />
              Allocation Preview
            </h3>

            {!showPreview || !preview ? (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">
                  Enter amount and click "Preview Allocation"
                </p>
                <p className="text-sm mt-2">
                  See exactly where your money will go
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glassmorphism rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">
                      Total Paycheck:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ${preview.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 bg-emerald-50 p-3 rounded-xl">
                    {preview.summary}
                  </p>
                </div>

                {preview.mode === "allocate" &&
                  Object.keys(preview.allocations).length > 0 && (
                    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
                      <h4 className="font-semibold mb-4 text-purple-900">
                        Envelope Allocations:
                      </h4>
                      <div className="space-y-3">
                        {envelopes.map((envelope) => {
                          const allocation =
                            preview.allocations[envelope.id] || 0;
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
                                <span className="font-medium text-gray-900">
                                  {envelope.name}
                                </span>
                              </div>
                              <span className="font-bold text-purple-600">
                                ${allocation.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium opacity-90">
                        Unassigned Cash:
                      </span>
                      <div className="text-sm opacity-75 mt-1">
                        Available for manual allocation
                      </div>
                    </div>
                    <span className="text-2xl font-bold">
                      +${preview.leftoverAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Paycheck History */}
      {paycheckHistory.length > 0 && (
        <div className="glassmorphism rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900">
            <Clock className="h-5 w-5 mr-2 text-cyan-600" />
            Recent Paychecks
          </h3>
          <div className="space-y-4">
            {paycheckHistory.slice(0, 5).map((paycheck) => (
              <div
                key={paycheck.id}
                className="glassmorphism flex items-center justify-between p-6 rounded-2xl border border-white/20 hover:shadow-xl transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                    style={{
                      background:
                        paycheck.mode === "allocate"
                          ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    }}
                  >
                    {paycheck.payerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {paycheck.payerName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(paycheck.date).toLocaleDateString()} •
                      <span className="ml-1 font-medium">
                        {paycheck.mode === "allocate"
                          ? "Auto-allocated"
                          : "To unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl text-emerald-600">
                    ${paycheck.amount.toFixed(2)}
                  </div>
                  {paycheck.leftoverAmount !== undefined && (
                    <div className="text-sm text-gray-600">
                      +${paycheck.leftoverAmount.toFixed(2)} unassigned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {paycheckHistory.length > 5 && (
            <div className="text-center mt-6">
              <button className="btn btn-secondary rounded-2xl">
                View All Paychecks ({paycheckHistory.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(PaycheckProcessor);
