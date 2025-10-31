import { createElement } from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface EditingAccount {
  id: string | number;
}

interface AccountModalHeaderProps {
  editingAccount?: EditingAccount | null;
  onClose: () => void;
  isLocked: boolean;
  isOwnLock: boolean;
  breakLock: () => void;
  lockLoading: boolean;
}

const AccountModalHeader = ({
  editingAccount,
  onClose,
  isLocked,
  isOwnLock,
  breakLock,
  lockLoading,
}: AccountModalHeaderProps) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-3 flex-1">
      <h3 className="font-black text-black text-base">
        <span className="text-lg">{editingAccount ? "E" : "A"}</span>
        {editingAccount ? "DIT" : "DD"} <span className="text-lg">A</span>CCOUNT
      </h3>
      {lockLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
      )}
    </div>

    <div className="flex items-center gap-2">
      {isLocked && !isOwnLock && (
        <Button
          onClick={breakLock}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center"
        >
          {createElement(getIcon("Unlock"), {
            className: "h-3 w-3 mr-1",
          })}
          Break
        </Button>
      )}
      <Button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        {createElement(getIcon("X"), { className: "h-5 w-5" })}
      </Button>
    </div>
  </div>
);

export default AccountModalHeader;
