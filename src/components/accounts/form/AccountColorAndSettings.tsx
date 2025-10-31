import { ACCOUNT_COLORS } from "../../../utils/accounts";
import { Button, Checkbox } from "@/components/ui";

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

interface AccountColorAndSettingsProps {
  accountForm: AccountForm;
  setAccountForm: (form: AccountForm) => void;
  canEdit: boolean | null;
  editingAccount: EditingAccount | null;
}

const AccountColorAndSettings = ({
  accountForm,
  setAccountForm,
  canEdit,
  editingAccount,
}: AccountColorAndSettingsProps) => (
  <>
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">Color</label>
      <div className="flex gap-2 flex-wrap">
        {ACCOUNT_COLORS.map((color) => (
          <Button
            key={color}
            type="button"
            onClick={() => setAccountForm({ ...accountForm, color })}
            className={`w-6 h-6 rounded-lg border-2 transition-all ${
              accountForm.color === color
                ? "border-black scale-110 ring-2 ring-purple-500"
                : "border-gray-200 hover:border-black"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>

    <div className="flex items-center">
      <Checkbox
        id="isActive"
        checked={accountForm.isActive}
        onChange={(e) =>
          setAccountForm({
            ...accountForm,
            isActive: e.target.checked,
          })
        }
        disabled={Boolean(editingAccount && !canEdit)}
      />
      <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-purple-900">
        Account is active
      </label>
    </div>
  </>
);

export default AccountColorAndSettings;
