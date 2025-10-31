import { useDebtDetailModal } from "@/hooks/debts/useDebtDetailModal";
import { UniversalConnectionManager } from "../../ui/ConnectionDisplay";
import DebtProgressBar from "../ui/DebtProgressBar";
import QuickPaymentForm from "../ui/QuickPaymentForm";
import {
  ModalHeader,
  MainStats,
  PayoffProjection,
  RecentPayments,
  ModalActions,
} from "./DebtDetailModalComponents";

interface DebtDetailModalProps {
  debt?: Record<string, unknown>;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (debtId: string) => Promise<void>;
  onRecordPayment: (debtId: string, amount: number) => Promise<void>;
  onEdit: (debt: Record<string, unknown>) => void;
}

/**
 * Modal for viewing and managing individual debt details
 * Pure UI component - all business logic handled by useDebtDetailModal hook
 */
const DebtDetailModal = ({
  debt,
  isOpen,
  onClose,
  onDelete,
  onRecordPayment,
  onEdit,
}: DebtDetailModalProps) => {
  const {
    showPaymentForm,
    paymentAmount,
    setPaymentAmount,
    progressData,
    payoffDisplay,
    recentPayments,
    hasRecentPayments,
    isActiveDebt,
    handleRecordPayment,
    handleDelete,
    handleEdit,
    handleShowPaymentForm,
    handleCancelPayment,
  } = useDebtDetailModal({
    debt,
    isOpen,
    onClose,
    onDelete,
    onRecordPayment,
    onEdit,
  });

  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <ModalHeader debt={debt} onClose={onClose} />
        <MainStats debt={debt} />
        <DebtProgressBar progressData={progressData} />
        <PayoffProjection payoffDisplay={payoffDisplay} />

        {/* Universal Connection Manager for Debts */}
        <UniversalConnectionManager
          entityType="debt"
          entityId={debt.id}
          canEdit={true}
          theme="purple"
        />

        {hasRecentPayments && <RecentPayments recentPayments={recentPayments} />}

        {/* Quick Payment */}
        <QuickPaymentForm
          showPaymentForm={showPaymentForm}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          onSubmit={handleRecordPayment}
          onShowForm={handleShowPaymentForm}
          onCancel={handleCancelPayment}
          isActiveDebt={isActiveDebt}
        />

        <ModalActions onClose={onClose} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default DebtDetailModal;
