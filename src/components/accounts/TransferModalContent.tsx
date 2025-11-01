import { useTouchFeedback } from "@/utils/ui/touchFeedback";
import {
  TransferEnvelopeSelect,
  TransferAmountInput,
  TransferDescriptionInput,
} from "./transfer/TransferFormFields";
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

interface TransferModalContentProps {
  transferringAccount: TransferringAccount;
  transferForm: TransferForm;
  setTransferForm: (form: TransferForm) => void;
  envelopes: Envelope[];
  onClose: () => void;
  onTransfer: () => void;
}

/**
 * Extracted content component for TransferModal
 * Reduces main component complexity for ESLint compliance
 */
const TransferModalContent = ({
  transferringAccount,
  transferForm,
  setTransferForm,
  envelopes,
  onClose,
  onTransfer,
}: TransferModalContentProps) => {
  const confirmFeedback = useTouchFeedback("confirm", "success");

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Available Balance:</span>
          <span className="font-bold text-green-600">
            ${transferringAccount.currentBalance.toFixed(2)}
          </span>
        </div>
      </div>

      <TransferEnvelopeSelect
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        envelopes={envelopes}
      />

      <TransferAmountInput
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        transferringAccount={transferringAccount}
      />

      <TransferDescriptionInput
        transferForm={transferForm}
        setTransferForm={setTransferForm}
        transferringAccount={transferringAccount}
      />

      <div className="flex gap-3 pt-2">
        <Button onClick={onClose} className="flex-1 btn btn-secondary border-2 border-black">
          Cancel
        </Button>
        <Button
          onClick={confirmFeedback.onClick(onTransfer)}
          className={`flex-1 btn btn-primary border-2 border-black ${confirmFeedback.className}`}
        >
          Transfer ${transferForm.amount || "0.00"}
        </Button>
      </div>
    </div>
  );
};

export default TransferModalContent;
