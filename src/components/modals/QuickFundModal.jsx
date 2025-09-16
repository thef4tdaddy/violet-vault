import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";
import { useConfirm } from "../../hooks/common/useConfirm";
import QuickFundForm from "./QuickFundForm";

/**
 * Quick Fund Modal
 * Triggered by swipe gestures for fast envelope funding
 */
const QuickFundModal = ({
  isOpen,
  onClose,
  onConfirm,
  envelope,
  suggestedAmount,
  unassignedCash,
}) => {
  const [amount, setAmount] = useState(suggestedAmount || 0);
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen) {
      setAmount(suggestedAmount || 0);
    }
  }, [isOpen, suggestedAmount]);

  if (!isOpen || !envelope) return null;

  const handleConfirm = async () => {
    if (amount <= 0) {
      return;
    }

    if (amount > unassignedCash) {
      const confirmed = await confirm({
        title: "Insufficient Funds",
        message: `You only have $${unassignedCash.toFixed(2)} in unassigned cash. Fund with available amount?`,
        confirmLabel: "Fund Available",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        onConfirm(envelope.id, unassignedCash);
        onClose();
      }
      return;
    }

    onConfirm(envelope.id, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphism rounded-lg max-w-md w-full p-6 border-2 border-black bg-white/90 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black shadow-xl">
            {getIcon("DollarSign", "w-8 h-8 text-white")}
          </div>

          <h2 className="font-black text-black text-xl mb-2">
            💰 <span className="text-2xl">Q</span>UICK{" "}
            <span className="text-2xl">F</span>UND
          </h2>

          <p className="text-purple-900 text-sm leading-relaxed">
            Add money to <span className="font-bold">{envelope.name}</span>
          </p>
        </div>

        <QuickFundForm
          envelope={envelope}
          amount={amount}
          setAmount={setAmount}
          unassignedCash={unassignedCash}
          onConfirm={handleConfirm}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default QuickFundModal;
