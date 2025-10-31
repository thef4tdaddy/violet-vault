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
import type { Bill, Envelope } from "@/types/bills";

/**
 * Props for BillManagerModals component
 */
interface BillManagerModalsProps {
  // Modal state
  showAddBillModal: boolean;
  showBulkUpdateModal: boolean;
  showDiscoveryModal: boolean;
  showBillDetail: Bill | null;
  historyBill: Bill | null;
  editingBill: Bill | null;

  // Data
  bills: Bill[];
  envelopes: Envelope[];
  selectedBills: Set<string>;
  discoveredBills: Bill[];

  // Handlers
  handleCloseModal: () => void;
  setShowBulkUpdateModal: (show: boolean) => void;
  setShowDiscoveryModal: (show: boolean) => void;
  setShowBillDetail: (bill: Bill | null) => void;
  setHistoryBill: (bill: Bill | null) => void;
  handleEditBill: (bill: Bill) => void;

  // Operations
  addBill: (bill: Bill) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (billId: string, deleteEnvelope?: boolean) => Promise<void>;
  handleBulkUpdate: (updates: Bill[]) => Promise<void>;
  handleAddDiscoveredBills: (bills: Bill[]) => Promise<void>;
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
          editingBill={editingBill}
          onAddBill={addBill}
          onUpdateBill={updateBill}
          onDeleteBill={deleteBill}
          onError={onError}
        />
      )}

      {showBulkUpdateModal && (
        <BulkBillUpdateModal
          isOpen={showBulkUpdateModal}
          onClose={() => setShowBulkUpdateModal(false)}
          selectedBills={Array.from(selectedBills)
            .map((id) => bills.find((b) => b.id === id))
            .filter(Boolean)}
          onUpdateBills={handleBulkUpdate}
          onError={onError}
        />
      )}

      {showDiscoveryModal && (
        <BillDiscoveryModal
          isOpen={showDiscoveryModal}
          onClose={() => {
            setShowDiscoveryModal(false);
          }}
          discoveredBills={discoveredBills}
          availableEnvelopes={envelopes}
          onAddBills={handleAddDiscoveredBills}
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
          onEdit={(bill) => {
            setShowBillDetail(null);
            handleEditBill(bill);
          }}
          onCreateRecurring={(bill) => {
            logger.warn("Recurring bill creation not yet implemented:", bill.name);
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
