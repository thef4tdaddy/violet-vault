import React, { useState, useEffect, useCallback } from "react";
import { getIcon } from "../../utils";
import {
  removeCorruptedEnvelopes,
  repairCorruptedEnvelopes,
  getEnvelopeIntegrityReport,
} from "../../utils/budgeting/envelopeIntegrityChecker";
import { useConfirm } from "../../hooks/common/useConfirm";
import useToast from "../../hooks/common/useToast";
import logger from "../../utils/common/logger";

/**
 * Envelope Integrity Checker Component
 * Addresses GitHub issue #539 - empty envelopes with no details
 */
const EnvelopeIntegrityChecker = ({ isOpen, onClose }) => {
  const [report, setReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEnvelopes, setSelectedEnvelopes] = useState(new Set());
  const { addToast } = useToast();
  const confirm = useConfirm();

  const scanForCorruptedEnvelopes = useCallback(async () => {
    setIsScanning(true);
    try {
      logger.debug("🔍 Scanning envelopes for integrity issues...");
      const integrityReport = await getEnvelopeIntegrityReport();
      setReport(integrityReport);

      if (integrityReport.corrupted > 0) {
        addToast({
          type: "warning",
          title: "Envelope Issues Found",
          message: `Found ${integrityReport.corrupted} corrupted envelope${integrityReport.corrupted === 1 ? "" : "s"}`,
          duration: 5000,
        });
      } else {
        addToast({
          type: "success",
          title: "All Envelopes Healthy",
          message: "No integrity issues found",
          duration: 3000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to scan envelopes", error);
      addToast({
        type: "error",
        title: "Scan Failed",
        message: "Could not scan envelopes for integrity issues",
        duration: 5000,
      });
    } finally {
      setIsScanning(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isOpen) {
      scanForCorruptedEnvelopes();
    }
  }, [isOpen, scanForCorruptedEnvelopes]);

  const handleSelectEnvelope = (envelopeId) => {
    const newSelected = new Set(selectedEnvelopes);
    if (newSelected.has(envelopeId)) {
      newSelected.delete(envelopeId);
    } else {
      newSelected.add(envelopeId);
    }
    setSelectedEnvelopes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEnvelopes.size === report?.corruptedEnvelopes.length) {
      setSelectedEnvelopes(new Set());
    } else {
      setSelectedEnvelopes(new Set(report?.corruptedEnvelopes.map((env) => env.id) || []));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedEnvelopes.size === 0) return;

    const confirmed = await confirm({
      title: "Remove Corrupted Envelopes",
      message: `Are you sure you want to permanently remove ${selectedEnvelopes.size} corrupted envelope${selectedEnvelopes.size === 1 ? "" : "s"}? This action cannot be undone.`,
      confirmLabel: "Remove Envelopes",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await removeCorruptedEnvelopes([...selectedEnvelopes]);

      if (result.success) {
        addToast({
          type: "success",
          title: "Envelopes Removed",
          message: result.message,
          duration: 3000,
        });

        // Rescan after removal
        setSelectedEnvelopes(new Set());
        await scanForCorruptedEnvelopes();
      } else {
        addToast({
          type: "error",
          title: "Removal Failed",
          message: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to remove envelopes", error);
      addToast({
        type: "error",
        title: "Removal Failed",
        message: "Could not remove corrupted envelopes",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepairSelected = async () => {
    if (selectedEnvelopes.size === 0) return;

    const selectedEnvelopeObjects =
      report?.corruptedEnvelopes.filter((env) => selectedEnvelopes.has(env.id)) || [];

    setIsProcessing(true);
    try {
      const result = await repairCorruptedEnvelopes(selectedEnvelopeObjects);

      if (result.success) {
        addToast({
          type: "success",
          title: "Envelopes Repaired",
          message: result.message,
          duration: 3000,
        });

        // Rescan after repair
        setSelectedEnvelopes(new Set());
        await scanForCorruptedEnvelopes();
      } else {
        addToast({
          type: "error",
          title: "Repair Failed",
          message: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to repair envelopes", error);
      addToast({
        type: "error",
        title: "Repair Failed",
        message: "Could not repair corrupted envelopes",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {React.createElement(getIcon("FileText"), {
              className: "h-6 w-6 text-purple-600 mr-3",
            })}
            <div>
              <h2 className="text-xl font-bold text-gray-900">Envelope Integrity Checker</h2>
              <p className="text-sm text-gray-600">Detect and fix corrupted envelopes</p>
            </div>
          </div>
          <Button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {React.createElement(getIcon("X"), {
              className: "h-5 w-5",
            })}
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary */}
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  {React.createElement(getIcon("CheckCircle"), {
                    className: "h-8 w-8 text-green-600",
                  })}
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-green-900">{report.healthy}</p>
                    <p className="text-sm text-green-700">Healthy Envelopes</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  {React.createElement(getIcon("AlertTriangle"), {
                    className: "h-8 w-8 text-yellow-600",
                  })}
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-yellow-900">{report.corrupted}</p>
                    <p className="text-sm text-yellow-700">Issues Found</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  {React.createElement(getIcon("FileText"), {
                    className: "h-8 w-8 text-blue-600",
                  })}
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-blue-900">{report.total}</p>
                    <p className="text-sm text-blue-700">Total Envelopes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanning State */}
          {isScanning && (
            <div className="text-center py-8">
              {React.createElement(getIcon("RefreshCw"), {
                className: "h-8 w-8 text-purple-600 animate-spin mx-auto mb-3",
              })}
              <p className="text-gray-600">Scanning envelopes for integrity issues...</p>
            </div>
          )}

          {/* Results */}
          {report && !isScanning && (
            <>
              {report.corrupted === 0 ? (
                <div className="text-center py-8">
                  {React.createElement(getIcon("CheckCircle"), {
                    className: "h-16 w-16 text-green-600 mx-auto mb-4",
                  })}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    All Envelopes Healthy!
                  </h3>
                  <p className="text-gray-600">No integrity issues found in your envelope data.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={isProcessing}
                    >
                      {selectedEnvelopes.size === report.corruptedEnvelopes.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>

                    <Button
                      onClick={handleRepairSelected}
                      disabled={selectedEnvelopes.size === 0 || isProcessing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {React.createElement(getIcon("Wrench"), {
                        className: "h-4 w-4 mr-2",
                      })}
                      Repair Selected ({selectedEnvelopes.size})
                    </Button>

                    <Button
                      onClick={handleRemoveSelected}
                      disabled={selectedEnvelopes.size === 0 || isProcessing}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {React.createElement(getIcon("Trash2"), {
                        className: "h-4 w-4 mr-2",
                      })}
                      Remove Selected ({selectedEnvelopes.size})
                    </Button>

                    <Button
                      onClick={scanForCorruptedEnvelopes}
                      disabled={isProcessing || isScanning}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {React.createElement(getIcon("RefreshCw"), {
                        className: "h-4 w-4 mr-2",
                      })}
                      Rescan
                    </Button>
                  </div>

                  {/* Corrupted Envelopes List */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      {React.createElement(getIcon("AlertTriangle"), {
                        className: "h-5 w-5 mr-2",
                      })}
                      Corrupted Envelopes ({report.corrupted})
                    </h3>

                    <div className="space-y-3">
                      {report.corruptedEnvelopes.map((envelope) => (
                        <div
                          key={envelope.id}
                          className="bg-white border border-yellow-300 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={selectedEnvelopes.has(envelope.id)}
                                onChange={() => handleSelectEnvelope(envelope.id)}
                                className="mt-1 mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {envelope.name || "[MISSING NAME]"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {envelope.id} | Category: {envelope.category || "[MISSING]"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Balance: ${envelope.currentBalance ?? "N/A"} | Monthly: $
                                  {envelope.monthlyAmount ?? "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {envelope.issues.map((issue, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Recommendations</h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeIntegrityChecker;
