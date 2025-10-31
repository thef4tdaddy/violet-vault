/**
 * BillManagerModals - Extracted modal components from BillManager
 * Reduces BillManager line count
 */
import React from "react";
import AddBillModal from "./AddBillModal";
import BulkBillUpdateModal from "./BulkBillUpdateModal";
import BillDiscoveryModal from "./BillDiscoveryModal";
import BillDetailModal from "./modals/BillDetailModal";
import ObjectHistoryViewer from "@/components/history/ObjectHistoryViewer";
import logger from "@/utils/common/logger";

/**
 * Generic Bill-like entity - flexible to accept any bill structure
 */
type BillEntity = Record<string, unknown> & {
  id: string;
  name: string;
};

/**
 * Generic Envelope-like entity - flexible to accept any envelope structure
 */
type EnvelopeEntity = Record<string, unknown> & {
  id: string;
  name: string;
};

/**
 * Props for BillManagerModals component
 */
interface BillManagerModalsProps {
  // Modal state
  showAddBillModal: boolean;
  showBulkUpdateModal: boolean;
  showDiscoveryModal: boolean;
  showBillDetail: BillEntity | null;
  historyBill: BillEntity | null;
  editingBill: BillEntity | null;

  // Data
  bills: BillEntity[];
  envelopes: EnvelopeEntity[];
  selectedBills: Set<string>;
  discoveredBills: BillEntity[];

  // Handlers
  handleCloseModal: () => void;
  setShowBulkUpdateModal: (show: boolean) => void;
  setShowDiscoveryModal: (show: boolean) => void;
  setShowBillDetail: (bill: BillEntity | null) => void;
  setHistoryBill: (bill: BillEntity | null) => void;
  handleEditBill: (bill: BillEntity) => void;

  // Operations
  addBill: (bill: BillEntity) => Promise<void>;
  updateBill: (bill: BillEntity) => Promise<void>;
  deleteBill: (billId: string, deleteEnvelope?: boolean) => Promise<void>;
  handleBulkUpdate: (updates: BillEntity[]) => Promise<void>;
  handleAddDiscoveredBills: (bills: BillEntity[]) => Promise<void>;
  billOperations: {
    handlePayBill: (billId: string) => Promise<void>;
  };

  // Callbacks
  onError: (error: string) => void;
}

const BillManagerModals: React.FC<BillManagerModalsProps> = ({
  // Modal state
  showAddBillModal,
  showBulkUpdateModal,
  showDiscoveryModal,
  showBillDetail,
  historyBill,
  editingBill,

  // Data
  bills,
  envelopes,
  selectedBills,
  discoveredBills,

  // Handlers
  handleCloseModal,
  setShowBulkUpdateModal,
  setShowDiscoveryModal,
  setShowBillDetail,
  setHistoryBill,
  handleEditBill,

  // Operations
  addBill,
  updateBill,
  deleteBill,
  handleBulkUpdate,
  handleAddDiscoveredBills,
  billOperations,

  // Callbacks
  onError,
}) => {
  return (
    <>
      {showAddBillModal && (
        <AddBillModal
          isOpen={showAddBillModal}
          onClose={handleCloseModal}
          editingBill={(editingBill || undefined) as never}
          onAddBill={addBill as never}
          onUpdateBill={updateBill as never}
          onDeleteBill={deleteBill}
          onError={onError}
        />
      )}

      {showBulkUpdateModal && (
        <BulkBillUpdateModal
          isOpen={showBulkUpdateModal}
          onClose={() => setShowBulkUpdateModal(false)}
          selectedBills={
            Array.from(selectedBills)
              .map((id) => bills.find((b) => b.id === id))
              .filter((bill): bill is BillEntity => Boolean(bill)) as never
          }
          onUpdateBills={handleBulkUpdate as never}
          onError={onError}
        />
      )}

      {showDiscoveryModal && (
        <BillDiscoveryModal
          isOpen={showDiscoveryModal}
          onClose={() => {
            setShowDiscoveryModal(false);
          }}
          discoveredBills={discoveredBills as never}
          availableEnvelopes={envelopes as never}
          onAddBills={handleAddDiscoveredBills as never}
          onError={onError}
        />
      )}

      {showBillDetail && (
        <BillDetailModal
          bill={showBillDetail}
          isOpen={!!showBillDetail}
          onClose={() => setShowBillDetail(null)}
          onDelete={deleteBill}
          onMarkPaid={billOperations.handlePayBill}
          onEdit={(bill: BillEntity) => {
            setShowBillDetail(null);
            handleEditBill(bill);
          }}
          onCreateRecurring={(bill: BillEntity) => {
            logger.warn("Recurring bill creation not yet implemented", {
              billName: bill.name as string,
            });
          }}
        />
      )}

      {historyBill && (
        <ObjectHistoryViewer
          objectId={historyBill.id}
          objectType="bill"
          objectName={historyBill.name}
          onClose={() => setHistoryBill(null)}
        />
      )}
    </>
  );
};

export default BillManagerModals;
