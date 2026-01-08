/**
 * AddBillModal Component - Refactored for Issue #152
 *
 * UI-only component using useBillForm hook for all business logic
 * Reduced from 923 LOC to ~350 LOC by extracting form logic
 * Enhanced with mobile slide-up functionality for Issue #164
 */
import { useEffect, useCallback, useMemo } from "react";
import type { FormEvent, RefObject } from "react";
import { useBillForm } from "@/hooks/budgeting/transactions/scheduled/expenses/useBillForm";
import useEditLock from "@/hooks/common/useEditLock";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
// Edit locking managed through useEditLock hook, but service needs initialization
import { useEditLockInit } from "@/hooks/common/useEditLockInit";
import { useAuth } from "@/hooks/auth/useAuth";
import EditLockIndicator from "../ui/EditLockIndicator";
import BillModalHeader from "./BillModalHeader";
import BillFormFields from "./BillFormFields";
import SlideUpModal from "../mobile/SlideUpModal";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
import { useLayoutData } from "@/hooks/layout/useLayoutData";
import { useSmartSuggestions } from "@/hooks/platform/analytics/useSmartSuggestions";
import type { BillIconOption } from "@/utils/billIcons/iconOptions";
import type { BillSuggestion } from "@/hooks/platform/analytics/useSmartSuggestions";
import type { BillFormData, Bill } from "@/types/bills";
import type { TransactionForStats } from "@/utils/analytics/categoryHelpers";

/**
 * Lock data structure for edit locking
 */
interface LockData {
  expiresAt?: unknown;
  userName?: string;
}

interface SmartSuggestionState {
  smartBillDetails: BillSuggestion | null;
  resolvedIconName: string;
  resolvedIconSuggestions: BillIconOption[];
  applyCategorySuggestion: () => void;
  applyIconSuggestion: () => void;
}

const useBillSmartSuggestionState = (
  formData: BillFormData,
  iconSuggestions: BillIconOption[],
  formSuggestedIconName: string,
  updateField: (field: keyof BillFormData, value: string | boolean) => void,
  suggestBillDetails: ReturnType<typeof useSmartSuggestions>["suggestBillDetails"]
): SmartSuggestionState => {
  const smartBillDetails = useMemo(
    () => suggestBillDetails(formData.name, formData.notes, formData.category),
    [formData.name, formData.notes, formData.category, suggestBillDetails]
  );

  const resolvedIconSuggestions = smartBillDetails?.iconSuggestions || iconSuggestions;
  const resolvedIconName = smartBillDetails?.iconName || formSuggestedIconName;

  const applyCategorySuggestion = useCallback(() => {
    if (!smartBillDetails) {
      return;
    }
    if (smartBillDetails.category) {
      updateField("category", smartBillDetails.category);
    }
    if (smartBillDetails.iconName) {
      updateField("iconName", smartBillDetails.iconName);
    }
  }, [smartBillDetails, updateField]);

  const applyIconSuggestion = useCallback(() => {
    if (!smartBillDetails?.iconName) {
      return;
    }
    updateField("iconName", smartBillDetails.iconName);
  }, [smartBillDetails, updateField]);

  return {
    smartBillDetails,
    resolvedIconName,
    resolvedIconSuggestions,
    applyCategorySuggestion,
    applyIconSuggestion,
  };
};

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBill?: (bill: unknown) => Promise<void> | void;
  onUpdateBill?: (bill: unknown) => Promise<void> | void;
  onDeleteBill?: (id: unknown, deleteEnvelope?: boolean) => Promise<void> | void;
  onError?: (message: string) => void;
  editingBill?: Bill | null;
  _forceMobileMode?: boolean;
}

interface BillModalState {
  isMobile: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
  formData: BillFormData;
  isSubmitting: boolean;
  categories: string[];
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateField: (field: keyof BillFormData, value: string | boolean) => void;
  canEdit: boolean;
  isLocked: boolean;
  isOwnLock: boolean;
  lock: LockData | null | undefined;
  breakLock: () => Promise<unknown> | void;
  smartBillDetails: BillSuggestion | null;
  resolvedIconName: string;
  resolvedIconSuggestions: BillIconOption[];
  applyCategorySuggestion: () => void;
  applyIconSuggestion: () => void;
  computeBiweeklyAmount: () => string | number;
  computeMonthlyAmount: () => string | number;
  computeNextDueDate: () => string;
}

const useBillModalState = ({
  isOpen,
  editingBill,
  _forceMobileMode = false,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onClose,
  onError,
}: AddBillModalProps): BillModalState => {
  const isMobile = useMobileDetection();
  const modalRef = useModalAutoScroll(isOpen && !(isMobile || _forceMobileMode));
  const { transactions: layoutTransactions = [], bills: billsQuery } = useLayoutData();

  const transactionsForStats = useMemo(() => {
    if (!Array.isArray(layoutTransactions)) {
      return [] as TransactionForStats[];
    }

    return layoutTransactions
      .map((transaction) => {
        if (!transaction || typeof transaction !== "object") {
          return null;
        }

        const record = transaction as {
          amount?: unknown;
          date?: unknown;
          category?: unknown;
        };

        const amount = Number(record.amount ?? 0);
        const rawDate = record.date;
        const date =
          typeof rawDate === "string"
            ? rawDate
            : rawDate instanceof Date
              ? rawDate.toISOString().split("T")[0]
              : undefined;

        if (!date) {
          return null;
        }

        const category = typeof record.category === "string" ? record.category : undefined;

        return {
          amount,
          date,
          category,
        } as TransactionForStats;
      })
      .filter((value): value is TransactionForStats => value !== null);
  }, [layoutTransactions]);

  const rawBills = useMemo(() => {
    const billsArray = Array.isArray(billsQuery?.bills) ? (billsQuery?.bills as unknown[]) : [];
    return billsArray.map((bill) => ({ ...(bill as Record<string, unknown>) }));
  }, [billsQuery?.bills]);

  const { suggestBillDetails } = useSmartSuggestions({
    transactions: transactionsForStats,
    bills: rawBills,
  });

  const {
    formData,
    isSubmitting,
    suggestedIconName: formSuggestedIconName,
    iconSuggestions,
    categories,
    handleSubmit,
    updateField,
    resetForm,
    calculateBiweeklyAmount,
    calculateMonthlyAmount,
    getNextDueDate,
  } = useBillForm({
    editingBill,
    onAddBill,
    onUpdateBill,
    onDeleteBill,
    onClose,
    onError,
  });

  const { budgetId, user: currentUser } = useAuth();

  // Using hook to avoid direct service import
  useEditLockInit(isOpen ? budgetId : null, isOpen ? currentUser : null);

  const { isLocked, isOwnLock, canEdit, lock, breakLock } = useEditLock(
    editingBill ? "bill" : null,
    editingBill?.id || null,
    {
      autoAcquire: true,
      autoRelease: true,
      showToasts: true,
    }
  );

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetForm is a stable store action
  }, [isOpen]);

  const {
    smartBillDetails,
    resolvedIconName,
    resolvedIconSuggestions,
    applyCategorySuggestion,
    applyIconSuggestion,
  } = useBillSmartSuggestionState(
    formData,
    iconSuggestions,
    formSuggestedIconName,
    updateField,
    suggestBillDetails
  );

  const computeBiweeklyAmount = useCallback(() => {
    const customFrequency = formData.customFrequency ? Number(formData.customFrequency) : undefined;
    return calculateBiweeklyAmount(formData.amount, formData.frequency, customFrequency);
  }, [calculateBiweeklyAmount, formData.amount, formData.frequency, formData.customFrequency]);

  const computeMonthlyAmount = useCallback(() => {
    const customFrequency = formData.customFrequency ? Number(formData.customFrequency) : undefined;
    return calculateMonthlyAmount(formData.amount, formData.frequency, customFrequency);
  }, [calculateMonthlyAmount, formData.amount, formData.frequency, formData.customFrequency]);

  const computeNextDueDate = useCallback(() => {
    return getNextDueDate(formData.frequency, formData.dueDate);
  }, [getNextDueDate, formData.frequency, formData.dueDate]);

  return {
    isMobile,
    modalRef,
    formData,
    isSubmitting,
    categories,
    handleSubmit,
    updateField,
    canEdit,
    isLocked,
    isOwnLock,
    lock,
    breakLock,
    smartBillDetails,
    resolvedIconName,
    resolvedIconSuggestions,
    applyCategorySuggestion,
    applyIconSuggestion,
    computeBiweeklyAmount,
    computeMonthlyAmount,
    computeNextDueDate,
  };
};

const AddBillModal = (props: AddBillModalProps) => {
  const { isOpen, onClose, editingBill = null, _forceMobileMode = false } = props;

  const {
    isMobile,
    modalRef,
    formData,
    isSubmitting,
    categories,
    handleSubmit,
    updateField,
    canEdit,
    isLocked,
    isOwnLock,
    lock,
    breakLock,
    smartBillDetails,
    resolvedIconName,
    resolvedIconSuggestions,
    applyCategorySuggestion,
    applyIconSuggestion,
    computeBiweeklyAmount,
    computeMonthlyAmount,
    computeNextDueDate,
  } = useBillModalState(props);

  if (!isOpen) return null;

  const modalTitle = editingBill ? "Edit Bill" : "Add Bill";

  const renderModalContent = () => (
    <>
      {editingBill && (isLocked || isOwnLock) && (
        <div className="border-b border-gray-200 px-6 py-3">
          <EditLockIndicator
            isLocked={isLocked}
            isOwnLock={isOwnLock}
            lock={lock}
            onBreakLock={breakLock}
            showDetails={true}
          />
        </div>
      )}

      <BillFormFields
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onClose={onClose}
        suggestedIconName={resolvedIconName}
        iconSuggestions={resolvedIconSuggestions}
        categories={categories}
        smartSuggestion={smartBillDetails}
        onApplySmartCategory={applyCategorySuggestion}
        onApplySmartIcon={applyIconSuggestion}
        calculateBiweeklyAmount={computeBiweeklyAmount}
        calculateMonthlyAmount={computeMonthlyAmount}
        getNextDueDate={computeNextDueDate}
      />
    </>
  );

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="pb-6">{renderModalContent()}</div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl my-auto border-2 border-black"
      >
        <BillModalHeader editingBill={editingBill} formData={formData} onClose={onClose} />
        {renderModalContent()}
      </div>
    </div>
  );
};

export default AddBillModal;
