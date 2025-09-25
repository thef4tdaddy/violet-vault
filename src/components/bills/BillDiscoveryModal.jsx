import React from "react";
import { useBillDiscovery } from "../../hooks/bills/useBillDiscovery";
import BillDiscoveryHeader from "./BillDiscoveryHeader";
import BillDiscoveryEmpty from "./BillDiscoveryEmpty";
import BillDiscoverySummary from "./BillDiscoverySummary";
import BillDiscoveryItem from "./BillDiscoveryItem";
import BillDiscoveryActions from "./BillDiscoveryActions";

const BillDiscoveryModal = ({
  isOpen,
  onClose,
  discoveredBills = [],
  onAddBills,
  onError,
  availableEnvelopes = [],
}) => {
  const discoveryState = useBillDiscovery({
    isOpen,
    discoveredBills,
    onAddBills,
    onError,
  });

  const {
    selectedBills,
    billEnvelopeMap,
    isProcessing,
    toggleBillSelection,
    updateBillEnvelope,
    selectAllBills,
    clearAllBills,
    calculateEstimatedTotal,
    handleAddSelected,
  } = discoveryState;

  const handleAddBills = async () => {
    const success = await handleAddSelected();
    if (success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <BillDiscoveryHeader
            onClose={onClose}
            discoveredBillsCount={discoveredBills.length}
          />

          {!discoveredBills.length ? (
            <BillDiscoveryEmpty />
          ) : (
            <>
              <BillDiscoverySummary
                selectedBillsCount={selectedBills.size}
                totalBillsCount={discoveredBills.length}
                estimatedTotal={calculateEstimatedTotal()}
                onSelectAll={selectAllBills}
                onClearAll={clearAllBills}
              />

              <div className="overflow-y-auto max-h-96 space-y-3">
                {discoveredBills.map((bill) => (
                  <BillDiscoveryItem
                    key={bill.id}
                    bill={bill}
                    isSelected={selectedBills.has(bill.id)}
                    assignedEnvelopeId={billEnvelopeMap[bill.id]}
                    availableEnvelopes={availableEnvelopes}
                    onToggleSelection={toggleBillSelection}
                    onUpdateEnvelope={updateBillEnvelope}
                  />
                ))}
              </div>

              <BillDiscoveryActions
                selectedBillsCount={selectedBills.size}
                isProcessing={isProcessing}
                onClose={onClose}
                onAddSelected={handleAddBills}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDiscoveryModal;
