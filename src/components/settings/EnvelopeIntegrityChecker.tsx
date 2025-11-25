import React, { useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useEnvelopeIntegrity } from "@/hooks/settings/useEnvelopeIntegrity";
import { EnvelopeIntegrityStatusCards } from "./EnvelopeIntegrityStatusCards";
import { EnvelopeIntegrityActions } from "./EnvelopeIntegrityActions";
import { EnvelopeIntegrityCorruptedList } from "./EnvelopeIntegrityCorruptedList";
import { EnvelopeIntegrityRecommendations } from "./EnvelopeIntegrityRecommendations";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

/**
 * Envelope Integrity Checker Component
 * Addresses GitHub issue #539 - empty envelopes with no details
 * Refactored using extracted components and custom hook for better maintainability
 */

interface EnvelopeIntegrityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnvelopeIntegrityChecker: React.FC<EnvelopeIntegrityCheckerProps> = ({ isOpen, onClose }) => {
  // Use extracted hook for all logic
  const {
    report,
    isScanning,
    isProcessing,
    selectedEnvelopes,
    scanForCorruptedEnvelopes,
    handleSelectEnvelope,
    handleSelectAll,
    handleRemoveSelected,
    handleRepairSelected,
  } = useEnvelopeIntegrity();

  const modalRef = useModalAutoScroll(isOpen);

  // Auto-scan when modal opens
  useEffect(() => {
    if (isOpen) {
      scanForCorruptedEnvelopes();
    }
  }, [isOpen, scanForCorruptedEnvelopes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black my-auto"
      >
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
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary */}
          <EnvelopeIntegrityStatusCards report={report} />

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
                  <EnvelopeIntegrityActions
                    selectedCount={selectedEnvelopes.size}
                    totalCorrupted={report.corruptedEnvelopes.length}
                    isProcessing={isProcessing}
                    isScanning={isScanning}
                    onSelectAll={handleSelectAll}
                    onRepairSelected={handleRepairSelected}
                    onRemoveSelected={handleRemoveSelected}
                    onRescan={scanForCorruptedEnvelopes}
                  />

                  {/* Corrupted Envelopes List */}
                  <EnvelopeIntegrityCorruptedList
                    corruptedEnvelopes={report.corruptedEnvelopes}
                    selectedEnvelopes={selectedEnvelopes}
                    onSelectEnvelope={handleSelectEnvelope}
                  />

                  {/* Recommendations */}
                  <EnvelopeIntegrityRecommendations recommendations={report.recommendations} />
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
