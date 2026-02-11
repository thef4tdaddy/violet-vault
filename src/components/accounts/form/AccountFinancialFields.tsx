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

interface AccountFinancialFieldsProps {
  accountForm: AccountForm;
  setAccountForm: (form: AccountForm) => void;
  canEdit: boolean | null;
  editingAccount: EditingAccount | null;
}

const AccountFinancialFields = ({
  accountForm,
  setAccountForm,
  canEdit,
  editingAccount,
}: AccountFinancialFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-semibold text-purple-900 mb-2">
          Current Balance *
        </label>
        <input
          type="number"
          step="0.01"
          value={accountForm.currentBalance}
          onChange={(e) =>
            setAccountForm({
              ...accountForm,
              currentBalance: e.target.value,
            })
          }
          disabled={Boolean(editingAccount && !canEdit)}
          className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-purple-900 mb-2">
          Annual Contribution
        </label>
        <input
          type="number"
          step="0.01"
          value={accountForm.annualContribution}
          onChange={(e) =>
            setAccountForm({
              ...accountForm,
              annualContribution: e.target.value,
            })
          }
          disabled={Boolean(editingAccount && !canEdit)}
          className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="0.00"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">
        Expiration Date (Optional)
      </label>
      <input
        type="date"
        value={accountForm.expirationDate}
        onChange={(e) =>
          setAccountForm({
            ...accountForm,
            expirationDate: e.target.value,
          })
        }
        disabled={Boolean(editingAccount && !canEdit)}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">Description</label>
      <textarea
        value={accountForm.description}
        onChange={(e) =>
          setAccountForm({
            ...accountForm,
            description: e.target.value,
          })
        }
        disabled={Boolean(editingAccount && !canEdit)}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="Optional account description..."
        rows={3}
      />
    </div>
  </>
);

export default AccountFinancialFields;
