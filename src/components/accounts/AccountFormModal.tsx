import { useMobileDetection } from "@/hooks/platform/common/useMobileDetection";
import EditLockIndicator from "../ui/EditLockIndicator";
import SlideUpModal from "../mobile/SlideUpModal";
import AccountModalHeader from "./form/AccountModalHeader";
import AccountBasicFields from "./form/AccountBasicFields";
import AccountFinancialFields from "./form/AccountFinancialFields";
import AccountColorAndSettings from "./form/AccountColorAndSettings";
import AccountFormActions from "./form/AccountFormActions";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { LockDocument as ServiceLockDocument } from "@/types/editLock";

interface AccountForm {
  name: string;
  type: string;
  currentBalance: string;
  annualContribution: string;
  expirationDate: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface EditingAccount {
  id: string | number;
}

interface ModalContentProps {
  editingAccount: EditingAccount | null;
  accountForm: AccountForm;
  setAccountForm: (form: AccountForm) => void;
  canEdit: boolean | null;
  isLocked: boolean;
  isOwnLock: boolean;
  lock: ServiceLockDocument | null;
  breakLock: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

// Extract modal content for reuse between mobile and desktop
const ModalContent = ({
  editingAccount,
  accountForm,
  setAccountForm,
  canEdit,
  isLocked,
  isOwnLock,
  lock,
  breakLock,
  onClose,
  onSubmit,
}: ModalContentProps) => (
  <>
    {/* Edit Lock Warning */}
    {editingAccount && (
      <EditLockIndicator
        isLocked={isLocked}
        isOwnLock={isOwnLock}
        lock={lock}
        onBreakLock={breakLock}
        className="mb-4"
      />
    )}

    <div className="space-y-4">
      <AccountBasicFields
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        canEdit={canEdit}
        editingAccount={editingAccount}
      />

      <AccountFinancialFields
        accountForm={accountForm}
        setAccountForm={setAccountForm}
        canEdit={canEdit}
        editingAccount={editingAccount}
      />

      <AccountColorAndSettings accountForm={accountForm} setAccountForm={setAccountForm} />
    </div>

    <AccountFormActions
      editingAccount={editingAccount}
      canEdit={canEdit}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  </>
);

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingAccount: EditingAccount | null;
  accountForm: AccountForm;
  setAccountForm: (form: AccountForm) => void;
  isLocked: boolean;
  isOwnLock: boolean;
  canEdit: boolean | null;
  lock: ServiceLockDocument | null;
  breakLock: () => void;
  lockLoading: boolean;
  _forceMobileMode?: boolean;
}

const AccountFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingAccount,
  accountForm,
  setAccountForm,
  // Edit Locking
  isLocked,
  isOwnLock,
  canEdit,
  lock,
  breakLock,
  lockLoading,
  _forceMobileMode = false, // Internal prop for testing
}: AccountFormModalProps) => {
  const isMobile = useMobileDetection();
  const modalRef = useModalAutoScroll(isOpen && !(isMobile || _forceMobileMode));

  if (!isOpen) return null;

  const modalContentProps = {
    editingAccount,
    accountForm,
    setAccountForm,
    canEdit,
    isLocked,
    isOwnLock,
    lock,
    breakLock,
    onClose,
    onSubmit,
  };

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={editingAccount ? "Edit Account" : "Add Account"}
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="px-6 pb-6">
          <ModalContent {...modalContentProps} />
        </div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl my-auto"
      >
        <AccountModalHeader
          editingAccount={editingAccount}
          onClose={onClose}
          isLocked={isLocked}
          isOwnLock={isOwnLock}
          breakLock={breakLock}
          lockLoading={lockLoading}
        />

        <ModalContent {...modalContentProps} />
      </div>
    </div>
  );
};

export default AccountFormModal;
