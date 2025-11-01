import React from "react";
import { Button } from "@/components/ui";
import { useConfirm } from "@/hooks/common/useConfirm";
import { renderIcon } from "@/utils";
import type { Transaction } from "@/types/finance";

interface SplitterHeaderProps {
  transaction: Transaction;
  onClose?: () => void;
  hasUnsavedChanges: boolean;
}

const SplitterHeader: React.FC<SplitterHeaderProps> = ({
  transaction,
  onClose,
  hasUnsavedChanges,
}) => {
  const confirm = useConfirm();

  const handleClose = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await confirm({
        title: "Unsaved Changes",
        message: "You have unsaved changes. Are you sure you want to close?",
        confirmLabel: "Discard Changes",
        cancelLabel: "Keep Editing",
        destructive: true,
      });
      if (confirmed) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 border-b-2 border-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-xl mr-3 border-2 border-white/30 shadow-md">
            {renderIcon("Scissors", "h-5 w-5 text-white")}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">SPLIT TRANSACTION</h2>
            <p className="text-blue-100 text-sm font-medium">
              {transaction.description} • ${Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>
        </div>
        <Button
          onClick={handleClose}
          className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all border-2 border-white/20 shadow-md hover:shadow-lg glassmorphism backdrop-blur-sm"
        >
          {renderIcon("X", "h-5 w-5")}
        </Button>
      </div>
    </div>
  );
};

export default SplitterHeader;
