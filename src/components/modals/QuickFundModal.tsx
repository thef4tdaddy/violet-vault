import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";
import { useConfirm } from "../../hooks/common/useConfirm";
import QuickFundForm from "./QuickFundForm";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

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
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  envelope: { id: string; name: string; [key: string]: unknown };
  suggestedAmount: number;
  unassignedCash: number;
}) => {
  const [amount, setAmount] = useState(suggestedAmount || 0);
  const confirm = useConfirm();
  const modalRef = useModalAutoScroll(isOpen);

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
        onConfirm(unassignedCash);
        onClose();
      }
      return;
    }

    onConfirm(amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-black shadow-2xl bg-white/90 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-black shadow-xl">
              {React.createElement(getIcon("DollarSign"), {
                className: "w-8 h-8 text-white",
              })}
            </div>

            <h2 className="font-black text-black text-xl mb-2">
              💰 <span className="text-2xl">Q</span>UICK <span className="text-2xl">F</span>UND
            </h2>

            <p className="text-purple-900 text-sm leading-relaxed">
              Add money to <span className="font-bold">{envelope.name}</span>
            </p>
          </div>
          <ModalCloseButton onClick={onClose} className="ml-4" />
        </div>

        <QuickFundForm
          envelope={envelope as { id: string; name: string; [key: string]: unknown }}
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
