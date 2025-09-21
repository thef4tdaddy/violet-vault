import React from "react";
import { ACCOUNT_TYPES } from "../../../utils/accounts";

const AccountBasicFields = ({
  accountForm,
  setAccountForm,
  canEdit,
  editingAccount,
}) => (
  <>
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">
        Account Name *
      </label>
      <input
        type="text"
        value={accountForm.name}
        onChange={(e) =>
          setAccountForm({ ...accountForm, name: e.target.value })
        }
        disabled={editingAccount && !canEdit}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="e.g., Health FSA 2024"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">
        Account Type *
      </label>
      <select
        value={accountForm.type}
        onChange={(e) =>
          setAccountForm({ ...accountForm, type: e.target.value })
        }
        disabled={editingAccount && !canEdit}
        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {ACCOUNT_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.icon} {type.label}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default AccountBasicFields;
