import { Select } from "@/components/ui";

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

interface TransferEnvelopeSelectProps {
  transferForm: TransferForm;
  setTransferForm: (form: TransferForm) => void;
  envelopes: Envelope[];
}

const TransferEnvelopeSelect = ({
  transferForm,
  setTransferForm,
  envelopes,
}: TransferEnvelopeSelectProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Transfer to Envelope *</label>
    <Select
      value={transferForm.envelopeId}
      onChange={(e) =>
        setTransferForm({
          ...transferForm,
          envelopeId: e.target.value,
        })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
      required
    >
      <option value="">Select an envelope...</option>
      {envelopes.map((envelope: Envelope) => (
        <option key={envelope.id} value={envelope.id}>
          {envelope.name} ($
          {envelope.currentAmount?.toFixed(2) || "0.00"})
        </option>
      ))}
    </Select>
  </div>
);

interface TransferAmountInputProps {
  transferForm: TransferForm;
  setTransferForm: (form: TransferForm) => void;
  transferringAccount: TransferringAccount;
}

const TransferAmountInput = ({
  transferForm,
  setTransferForm,
  transferringAccount,
}: TransferAmountInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
    <input
      type="number"
      step="0.01"
      max={transferringAccount.currentBalance}
      value={transferForm.amount}
      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
      placeholder="0.00"
      required
    />
  </div>
);

interface TransferDescriptionInputProps {
  transferForm: TransferForm;
  setTransferForm: (form: TransferForm) => void;
  transferringAccount: TransferringAccount;
}

const TransferDescriptionInput = ({
  transferForm,
  setTransferForm,
  transferringAccount,
}: TransferDescriptionInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
    <input
      type="text"
      value={transferForm.description}
      onChange={(e) =>
        setTransferForm({
          ...transferForm,
          description: e.target.value,
        })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
      placeholder={`Transfer from ${transferringAccount.name}`}
    />
  </div>
);

export { TransferEnvelopeSelect, TransferAmountInput, TransferDescriptionInput };
