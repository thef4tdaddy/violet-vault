import React from "react";
import { ACCOUNT_COLORS } from "../../../utils/accounts";

const AccountColorAndSettings = ({ accountForm, setAccountForm, canEdit, editingAccount }) => (
  <>
    <div>
      <label className="block text-sm font-semibold text-purple-900 mb-2">Color</label>
      <div className="flex gap-2 flex-wrap">
        {ACCOUNT_COLORS.map((color) => (
          <button
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
      <input
        type="checkbox"
        id="isActive"
        checked={accountForm.isActive}
        onChange={(e) =>
          setAccountForm({
            ...accountForm,
            isActive: e.target.checked,
          })
        }
        disabled={editingAccount && !canEdit}
        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-2 border-black rounded disabled:cursor-not-allowed"
      />
      <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-purple-900">
        Account is active
      </label>
    </div>
  </>
);

export default AccountColorAndSettings;
