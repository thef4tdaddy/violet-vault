import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { BillDiscoveryStep } from "./BillDiscoveryModal/BillDiscoveryStep";
import { useBillDiscoveryState } from "./BillDiscoveryModal/useBillDiscoveryState";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

export interface DiscoveredBill {
  id: string;
  provider: string;
  category: string;
  amount: number;
  frequency: string;
  confidence: number;
  dueDate: string;
  iconName?: string;
  description?: string;
  suggestedEnvelopeId?: string;
  suggestedEnvelopeName?: string;
  envelopeConfidence?: number;
  discoveryData: {
    transactionCount: number;
    avgInterval: number;
    sampleTransactions: Array<{ amount: number; date: string }>;
    amountRange?: [number, number];
  };
}

export interface Envelope {
  id: string;
  name: string;
}

interface BillDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredBills?: DiscoveredBill[];
  onAddBills: (bills: DiscoveredBill[]) => Promise<void>;
  onError?: (error: string) => void;
  availableEnvelopes?: Envelope[];
}

const BillDiscoveryModal: React.FC<BillDiscoveryModalProps> = ({
  isOpen,
  onClose,
  discoveredBills = [],
  onAddBills,
  onError,
  availableEnvelopes = [],
}) => {
  const {
    selectedBills,
    billEnvelopeMap,
    isProcessing,
    setIsProcessing,
    toggleBillSelection,
    updateBillEnvelope,
    selectAll,
    clearAll,
  } = useBillDiscoveryState(discoveredBills, isOpen);
  const modalRef = useModalAutoScroll(isOpen);

  const handleAddSelected = async () => {
    if (selectedBills.size === 0) {
      onError?.("No bills selected");
      return;
    }

    setIsProcessing(true);
    try {
      const billsToAdd: DiscoveredBill[] = discoveredBills
        .filter((bill: DiscoveredBill) => selectedBills.has(bill.id))
        .map((bill: DiscoveredBill) => ({
          ...bill,
          envelopeId: billEnvelopeMap[bill.id] || null,
          isPaid: false,
          source: "auto_discovery",
          createdAt: new Date().toISOString(),
        }));

      await onAddBills(billsToAdd);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add discovered bills";
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border-2 border-black my-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                {React.createElement(getIcon("Search"), {
                  className: "h-5 w-5 mr-2 text-blue-600",
                })}
                Discovered Bills
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Found {discoveredBills.length} potential recurring bills from your transaction
                history
              </p>
            </div>
            <ModalCloseButton onClick={onClose} />
          </div>

          {/* Content */}
          <BillDiscoveryStep
            discoveredBills={discoveredBills}
            selectedBills={selectedBills}
            billEnvelopeMap={billEnvelopeMap}
            availableEnvelopes={availableEnvelopes}
            onToggleSelection={toggleBillSelection}
            onUpdateEnvelope={updateBillEnvelope}
            onSelectAll={selectAll}
            onClearAll={clearAll}
          />

          {/* Footer Actions */}
          {discoveredBills.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Selected bills will be added to your bill tracker
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSelected}
                    disabled={selectedBills.size === 0 || isProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        {React.createElement(getIcon("Clock"), {
                          className: "h-4 w-4 mr-2 animate-spin",
                        })}
                        Adding...
                      </>
                    ) : (
                      <>
                        {React.createElement(getIcon("Plus"), {
                          className: "h-4 w-4 mr-2",
                        })}
                        Add {selectedBills.size} Bills
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDiscoveryModal;
