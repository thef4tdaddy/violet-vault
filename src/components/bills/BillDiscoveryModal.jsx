import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  X,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  Plus,
} from "lucide-react";
import { getBillIcon, getIconByName } from "../../utils/billIcons";

const BillDiscoveryModal = ({
  isOpen,
  onClose,
  discoveredBills = [],
  onAddBills,
  onError,
  availableEnvelopes = [],
}) => {
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [billEnvelopeMap, setBillEnvelopeMap] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && discoveredBills.length > 0) {
      // Pre-populate envelope suggestions
      const envelopeMap = {};
      discoveredBills.forEach((bill) => {
        if (bill.suggestedEnvelopeId) {
          envelopeMap[bill.id] = bill.suggestedEnvelopeId;
        }
      });
      setBillEnvelopeMap(envelopeMap);
    }
  }, [isOpen, discoveredBills]);

  const toggleBillSelection = (billId) => {
    setSelectedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  };

  const updateBillEnvelope = (billId, envelopeId) => {
    setBillEnvelopeMap((prev) => ({
      ...prev,
      [billId]: envelopeId,
    }));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-100";
    if (confidence >= 0.6) return "text-blue-600 bg-blue-100";
    if (confidence >= 0.4) return "text-orange-600 bg-orange-100";
    return "text-gray-600 bg-gray-100";
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return CheckCircle;
    if (confidence >= 0.6) return Target;
    if (confidence >= 0.4) return Clock;
    return AlertTriangle;
  };

  const getBillIconComponent = (bill) => {
    if (bill.iconName && typeof bill.iconName === "string") {
      const IconComponent = getIconByName(bill.iconName);
      return <IconComponent className="h-6 w-6" />;
    }

    const IconComponent = getBillIcon(
      bill.provider || "",
      bill.description || "",
      bill.category || "",
    );
    return <IconComponent className="h-6 w-6" />;
  };

  const handleAddSelected = async () => {
    if (selectedBills.size === 0) {
      onError?.("No bills selected");
      return;
    }

    setIsProcessing(true);
    try {
      const billsToAdd = discoveredBills
        .filter((bill) => selectedBills.has(bill.id))
        .map((bill) => ({
          ...bill,
          envelopeId: billEnvelopeMap[bill.id] || null,
          isPaid: false,
          source: "auto_discovery",
          createdAt: new Date().toISOString(),
        }));

      await onAddBills(billsToAdd);
      onClose();
    } catch (error) {
      onError?.(error.message || "Failed to add discovered bills");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Search className="h-5 w-5 mr-2 text-blue-600" />
                Discovered Bills
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Found {discoveredBills.length} potential recurring bills from
                your transaction history
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {discoveredBills.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No new bills discovered</p>
              <p className="text-sm mt-1">
                Try adding more transaction history or check back later as you
                make more purchases.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Bar */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">{selectedBills.size}</span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {discoveredBills.length}
                      </span>{" "}
                      bills selected
                    </div>
                    <div className="text-sm text-blue-600">
                      Total estimated monthly: $
                      {discoveredBills
                        .filter((bill) => selectedBills.has(bill.id))
                        .reduce((sum, bill) => sum + Math.abs(bill.amount), 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const allIds = new Set(
                          discoveredBills.map((b) => b.id),
                        );
                        setSelectedBills(allIds);
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedBills(new Set())}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Bills List */}
              <div className="overflow-y-auto max-h-96 space-y-3">
                {discoveredBills.map((bill) => {
                  const isSelected = selectedBills.has(bill.id);
                  const ConfidenceIcon = getConfidenceIcon(bill.confidence);

                  return (
                    <div
                      key={bill.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isSelected
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox and Icon */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBillSelection(bill.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="text-xl">
                            {getBillIconComponent(bill)}
                          </div>
                        </div>

                        {/* Bill Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                {bill.provider}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(bill.confidence)}`}
                                >
                                  {Math.round(bill.confidence * 100)}%
                                </span>
                              </h4>
                              <p className="text-sm text-gray-600">
                                {bill.category}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${Math.abs(bill.amount).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {bill.frequency}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {bill.discoveryData.transactionCount} transactions
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Every ~{bill.discoveryData.avgInterval} days
                            </div>
                          </div>

                          {/* Envelope Assignment */}
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-gray-400" />
                              <select
                                value={billEnvelopeMap[bill.id] || ""}
                                onChange={(e) =>
                                  updateBillEnvelope(bill.id, e.target.value)
                                }
                                className="text-sm px-2 py-1 border border-gray-300 rounded flex-1"
                              >
                                <option value="">
                                  No envelope (use unassigned cash)
                                </option>
                                {availableEnvelopes.map((envelope) => (
                                  <option key={envelope.id} value={envelope.id}>
                                    {envelope.name}
                                    {envelope.id === bill.suggestedEnvelopeId &&
                                      " (Suggested)"}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {bill.suggestedEnvelopeName && (
                              <p className="text-xs text-blue-600 mt-1 ml-6">
                                💡 Suggested: {bill.suggestedEnvelopeName}(
                                {Math.round(bill.envelopeConfidence * 100)}%
                                match)
                              </p>
                            )}
                          </div>

                          {/* Discovery Details */}
                          {bill.discoveryData && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <p>
                                <strong>Sample transactions:</strong>
                                {bill.discoveryData.sampleTransactions.map(
                                  (txn, i) => (
                                    <span key={i}>
                                      {i > 0 && ", "}$
                                      {Math.abs(txn.amount).toFixed(2)} on{" "}
                                      {new Date(txn.date).toLocaleDateString()}
                                    </span>
                                  ),
                                )}
                              </p>
                              {bill.discoveryData.amountRange && (
                                <p className="mt-1">
                                  <strong>Amount range:</strong> $
                                  {Math.abs(
                                    bill.discoveryData.amountRange[0],
                                  ).toFixed(2)}{" "}
                                  - $
                                  {Math.abs(
                                    bill.discoveryData.amountRange[1],
                                  ).toFixed(2)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Selected bills will be added to your bill tracker
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSelected}
                      disabled={selectedBills.size === 0 || isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add {selectedBills.size} Bills
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDiscoveryModal;
