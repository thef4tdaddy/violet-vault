import React from "react";
import { getIcon } from "@/utils";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
import SlideUpModal from "../mobile/SlideUpModal";
import TransferModalContent from "./TransferModalContent";
import { Button } from "@/components/ui";

interface TransferForm {
  envelopeId: string;
  amount: string;
  description: string;
}

interface Envelope {
  id: string | number;
  name: string;
  currentAmount?: number;
}

interface TransferringAccount {
  id: string | number;
  name: string;
  currentBalance: number;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: () => void;
  transferringAccount: TransferringAccount | null;
  transferForm: TransferForm;
  setTransferForm: (form: TransferForm) => void;
  envelopes: Envelope[];
  _forceMobileMode?: boolean;
}

const TransferModal = ({
  isOpen,
  onClose,
  onTransfer,
  transferringAccount,
  transferForm,
  setTransferForm,
  envelopes,
  _forceMobileMode = false, // Internal prop for testing
}: TransferModalProps) => {
  const isMobile = useMobileDetection();

  if (!isOpen || !transferringAccount) return null;

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Transfer from ${transferringAccount.name}`}
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="px-6 pb-6">
          <TransferModalContent
            transferringAccount={transferringAccount}
            transferForm={transferForm}
            setTransferForm={setTransferForm}
            envelopes={envelopes}
            onClose={onClose}
            onTransfer={onTransfer}
          />
        </div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Transfer from {transferringAccount.name}</h3>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
          </Button>
        </div>

        <TransferModalContent
          transferringAccount={transferringAccount}
          transferForm={transferForm}
          setTransferForm={setTransferForm}
          envelopes={envelopes}
          onClose={onClose}
          onTransfer={onTransfer}
        />
      </div>
    </div>
  );
};

export default TransferModal;
