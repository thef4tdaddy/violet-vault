import React from "react";
import { Select, Button } from "@/components/ui";
import { FormSection } from "@/components/primitives/forms";
import { getIcon } from "@/utils";
import type { Transaction } from "@/types/finance";
import type { TransactionFormData } from "@/domain/schemas/transaction";

interface Envelope {
  id: string;
  name: string;
  envelopeType?: string;
}

interface EnvelopeSectionProps {
  transactionForm: TransactionFormData;
  setTransactionForm: (form: TransactionFormData) => void;
  canEdit: boolean;
  editingTransaction?: Transaction | null;
  envelopes: Envelope[];
  supplementalAccounts?: Array<{ id: string | number; name: string; type?: string }>;
  suggestEnvelope?: (description: string) => { id: string; name: string } | null;
}

/**
 * EnvelopeSection - Envelope and account assignment
 * Uses FormSection primitive for consistent layout
 */
export const EnvelopeSection: React.FC<EnvelopeSectionProps> = ({
  transactionForm,
  setTransactionForm,
  canEdit,
  editingTransaction,
  envelopes,
  supplementalAccounts = [],
  suggestEnvelope,
}) => {
  const selectedEnvelope = envelopes.find((env) => env.id === transactionForm.envelopeId);
  const isBillEnvelope = selectedEnvelope && selectedEnvelope.envelopeType === "bill";
  const suggested =
    transactionForm.description && suggestEnvelope
      ? suggestEnvelope(transactionForm.description)
      : null;

  return (
    <FormSection title="Envelope Assignment" subtitle="Assign transaction to envelope or account">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Envelope or Account
        </label>
        <Select
          value={transactionForm.envelopeId}
          onChange={(e) =>
            setTransactionForm({
              ...transactionForm,
              envelopeId: e.target.value,
            })
          }
          disabled={!!editingTransaction && !canEdit}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            !!editingTransaction && !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        >
          <option value="">Leave unassigned</option>

          {envelopes.length > 0 && (
            <optgroup label="📊 Budget Envelopes">
              {envelopes.map((envelope) => (
                <option key={envelope.id} value={envelope.id}>
                  {envelope.name}
                  {envelope.envelopeType === "bill" ? " 📝" : ""}
                  {envelope.envelopeType === "variable" ? " 🔄" : ""}
                  {envelope.envelopeType === "savings" ? " 💰" : ""}
                </option>
              ))}
            </optgroup>
          )}

          {supplementalAccounts.length > 0 && (
            <optgroup label="💼 Supplemental Accounts">
              {supplementalAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.type ? ` (${account.type})` : ""}
                </option>
              ))}
            </optgroup>
          )}
        </Select>

        {transactionForm.envelopeId && isBillEnvelope && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Bill Payment:</strong> Assigning this transaction to "
              {selectedEnvelope.name}" will automatically mark it as a bill payment and deduct from
              the envelope balance.
            </p>
          </div>
        )}

        {suggested && (
          <div className="mt-2">
            <Button
              type="button"
              onClick={() =>
                setTransactionForm({
                  ...transactionForm,
                  envelopeId: suggested.id,
                })
              }
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              {React.createElement(getIcon("Zap"), {
                className: "h-3 w-3 mr-1",
              })}
              Suggested: {suggested.name}
            </Button>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default EnvelopeSection;
