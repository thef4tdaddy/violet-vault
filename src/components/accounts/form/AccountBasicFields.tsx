import { ACCOUNT_TYPES } from "@/utils/accounts";
import { Select, Checkbox } from "@/components/ui";

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

interface AccountBasicFieldsProps {
  accountForm: AccountForm;
  setAccountForm: (form: AccountForm) => void;
  canEdit: boolean | null;
  editingAccount: EditingAccount | null;
}

const AccountBasicFields = ({
  accountForm,
  setAccountForm,
  canEdit,
  editingAccount,
}: AccountBasicFieldsProps) => (
  <>
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">Account Name *</label>
      <input
        type="text"
        value={accountForm.name}
        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
        disabled={Boolean(editingAccount && !canEdit)}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="e.g., Health FSA 2024"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">Account Type *</label>
      <Select
        value={accountForm.type}
        onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
        disabled={Boolean(editingAccount && !canEdit)}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {ACCOUNT_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.icon} {type.label}
          </option>
        ))}
      </Select>
    </div>

    <div className="mt-4">
      <Checkbox
        id="account-is-active"
        checked={accountForm.isActive}
        label="Account is active"
        disabled={Boolean(editingAccount && !canEdit)}
        onCheckedChange={(checked) =>
          setAccountForm({
            ...accountForm,
            isActive: Boolean(checked),
          })
        }
      />
    </div>
  </>
);

export default AccountBasicFields;
