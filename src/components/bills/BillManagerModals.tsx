/**
 * BillManagerModals - Extracted modal components from BillManager
 * Reduces BillManager line count
 */
import AddBillModal from "./AddBillModal";
import BulkBillUpdateModal from "./BulkBillUpdateModal";
import BillDiscoveryModal from "./BillDiscoveryModal";
import BillDetailModal from "./modals/BillDetailModal";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";
import logger from "../../utils/common/logger";

const BillManagerModals = ({
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
