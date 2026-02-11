import { Button } from "../../../components/ui/buttons";

interface EditingAccount {
  id: string | number;
}

interface AccountFormActionsProps {
  editingAccount: EditingAccount | null;
  canEdit: boolean | null;
  onClose: () => void;
  onSubmit: () => void;
}

const AccountFormActions = ({
  editingAccount,
  canEdit,
  onClose,
  onSubmit,
}: AccountFormActionsProps) => (
  <div className="flex gap-3 mt-6">
    <Button onClick={onClose} className="flex-1 btn btn-secondary border-2 border-black">
      Cancel
    </Button>
    <Button
      onClick={onSubmit}
      disabled={Boolean(editingAccount && !canEdit)}
      className="flex-1 btn btn-primary border-2 border-black disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {editingAccount ? "Update Account" : "Add Account"}
    </Button>
  </div>
);

export default AccountFormActions;
