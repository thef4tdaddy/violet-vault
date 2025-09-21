import React from "react";

const AccountFormActions = ({ editingAccount, canEdit, onClose, onSubmit }) => (
  <div className="flex gap-3 mt-6">
    <button
      onClick={onClose}
      className="flex-1 btn btn-secondary border-2 border-black"
    >
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={editingAccount && !canEdit}
      className="flex-1 btn btn-primary border-2 border-black disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {editingAccount ? "Update Account" : "Add Account"}
    </button>
  </div>
);

export default AccountFormActions;
