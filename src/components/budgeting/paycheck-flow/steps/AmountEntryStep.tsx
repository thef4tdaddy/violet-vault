/**
 * Amount Entry Step - Paycheck amount input (Step 0)
 * Full implementation for Issue #1837
 * Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React, { useState, useEffect, useRef } from "react";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import { PaycheckHistoryService } from "@/utils/core/services/paycheckHistory";
import { validatePaycheckAmountSafe } from "@/utils/core/validation/paycheckWizardValidation";
import Button from "@/components/ui/buttons/Button";

interface AmountEntryStepProps {
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
}

/**
 * Format cents to dollar string
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "2500.00")
 */
const formatCentsToDollars = (cents: number): string => {
  return (cents / 100).toFixed(2);
};

/**
 * Parse dollar string to cents
 * @param dollars - Dollar amount string (e.g., "2500.00")
 * @returns Amount in cents
 */
const parseDollarsToCents = (dollars: string): number => {
  const parsed = parseFloat(dollars);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
};

const PayerNameSection: React.FC<{
  payerNameInput: string;
  onPayerNameChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  showAutocomplete: boolean;
  setShowAutocomplete: (show: boolean) => void;
  filteredSuggestions: string[];
  onSelect: (name: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  autocompleteRef: React.RefObject<HTMLDivElement | null>;
}> = ({
  payerNameInput,
  onPayerNameChange,
  onKeyDown,
  showAutocomplete,
  setShowAutocomplete,
  filteredSuggestions,
  onSelect,
  inputRef,
  autocompleteRef,
}) => (
  <div className="mb-6">
    <label htmlFor="payer-name" className="block text-sm font-bold text-slate-700 mb-2">
      Who paid you? <span className="text-slate-500 font-normal">(optional)</span>
    </label>
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id="payer-name"
        value={payerNameInput}
        onChange={(e) => onPayerNameChange(e.target.value)}
        onFocus={() => payerNameInput.trim() !== "" && setShowAutocomplete(true)}
        onKeyDown={onKeyDown}
        placeholder="e.g., Acme Corp"
        className="
          w-full px-4 py-3
          text-lg font-semibold
          hard-border rounded-lg
          focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2
          focus:border-transparent
          transition-all
        "
      />

      {showAutocomplete && filteredSuggestions.length > 0 && (
        <div
          ref={autocompleteRef}
          className="
            absolute z-10 w-full mt-2
            bg-white hard-border rounded-lg
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            max-h-48 overflow-y-auto
          "
        >
          {filteredSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              type="button"
              onClick={() => onSelect(suggestion)}
              className="
                w-full px-4 py-3 text-left
                text-slate-900 font-semibold
                hover:bg-fuchsia-50
                transition-colors
                border-b-2 border-slate-200 last:border-b-0
              "
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
    <p className="mt-2 text-sm text-slate-600">
      We'll remember this for next time to make entry faster
    </p>
  </div>
);

const HistoryHintSection: React.FC<{
  payerNameInput: string;
  historyHint: { lastAmount: string; lastDate: string; frequency?: string } | null;
}> = ({ payerNameInput, historyHint }) => {
  if (!historyHint) return null;
  return (
    <div className="mb-6 p-4 bg-blue-50 hard-border rounded-lg">
      <p className="text-sm text-blue-900">
        💡 <strong>Last paycheck from {payerNameInput}:</strong> {historyHint.lastAmount} on{" "}
        {historyHint.lastDate}
        {historyHint.frequency && ` ⏰ Usually ${historyHint.frequency}`}
      </p>
    </div>
  );
};

const AmountInputSection: React.FC<{
  amountInput: string;
  onAmountChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  validationError: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ amountInput, onAmountChange, onKeyDown, validationError, inputRef }) => (
  <div className="mb-6">
    <label htmlFor="paycheck-amount" className="block text-sm font-bold text-slate-700 mb-2">
      Paycheck Amount
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        id="paycheck-amount"
        value={amountInput}
        onChange={(e) => onAmountChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="2500.00"
        className={`
          w-full pl-12 pr-4 py-4
          text-2xl font-black
          hard-border rounded-lg
          focus:ring-2 focus:ring-offset-2
          focus:border-transparent
          transition-all
          ${validationError ? "ring-2 ring-red-500 border-red-500" : "focus:ring-fuchsia-500"}
        `}
        aria-label="Paycheck amount"
        aria-describedby="amount-help-text"
        autoComplete="off"
      />
    </div>

    {validationError && <p className="mt-2 text-sm text-red-600 font-bold">⚠️ {validationError}</p>}

    {!validationError && (
      <p className="mt-2 text-sm text-slate-600">
        Enter the total amount from your paycheck ($1.00 - $1,000,000.00)
      </p>
    )}
  </div>
);

const AmountEntryStep: React.FC<AmountEntryStepProps> = ({ onNext }) => {
  const payerName = usePaycheckFlowStore((state) => state.payerName);
  const paycheckAmountCents = usePaycheckFlowStore((state) => state.paycheckAmountCents);
  const setPayerName = usePaycheckFlowStore((state) => state.setPayerName);
  const setPaycheckAmountCents = usePaycheckFlowStore((state) => state.setPaycheckAmountCents);

  // Local form state
  const [payerNameInput, setPayerNameInput] = useState(payerName || "");
  const [amountInput, setAmountInput] = useState(
    paycheckAmountCents ? formatCentsToDollars(paycheckAmountCents) : ""
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [historyHint, setHistoryHint] = useState<{
    lastAmount: string;
    lastDate: string;
    frequency?: string;
  } | null>(null);

  // Refs
  const payerInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Get recent payers for autocomplete
  const recentPayers = PaycheckHistoryService.getRecentPayers(10);

  // Auto-focus payer name input on mount
  useEffect(() => {
    payerInputRef.current?.focus();
  }, []);

  // Handle clicks outside autocomplete to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        !payerInputRef.current?.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Handle payer name change
   */
  const handlePayerNameChange = (value: string) => {
    setPayerNameInput(value);
    setPayerName(value || null);

    const hasMatches =
      value.trim() !== "" &&
      recentPayers.some((p) => p.toLowerCase().includes(value.toLowerCase()));
    setShowAutocomplete(hasMatches);

    if (value.trim() !== "") {
      const history = PaycheckHistoryService.getByPayerName(value);
      if (history) {
        setAmountInput(formatCentsToDollars(history.lastAmountCents));
        setHistoryHint({
          lastAmount: `$${(history.lastAmountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          lastDate: new Date(history.lastDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          frequency: history.frequency,
        });
      } else {
        setHistoryHint(null);
      }
    } else {
      setHistoryHint(null);
    }
  };

  const handleAutocompleteSelect = (name: string) => {
    handlePayerNameChange(name);
    setShowAutocomplete(false);
    amountInputRef.current?.focus();
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) return;
    setAmountInput(sanitized);
    setValidationError(null);
  };

  const handleSubmit = () => {
    const amountCents = parseDollarsToCents(amountInput);
    const result = validatePaycheckAmountSafe(amountCents);

    if (!result.success) {
      setValidationError(result.error.issues[0]?.message || "Invalid amount");
      amountInputRef.current?.focus();
      return;
    }

    setPaycheckAmountCents(amountCents);
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filteredSuggestions = payerNameInput.trim()
    ? recentPayers.filter((p) => p.toLowerCase().includes(payerNameInput.toLowerCase()))
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white hard-border rounded-lg p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black text-slate-900 mb-6">HOW MUCH DID YOU GET PAID?</h2>

        <PayerNameSection
          payerNameInput={payerNameInput}
          onPayerNameChange={handlePayerNameChange}
          onKeyDown={handleKeyDown}
          showAutocomplete={showAutocomplete}
          setShowAutocomplete={setShowAutocomplete}
          filteredSuggestions={filteredSuggestions}
          onSelect={handleAutocompleteSelect}
          inputRef={payerInputRef}
          autocompleteRef={autocompleteRef}
        />

        <HistoryHintSection payerNameInput={payerNameInput} historyHint={historyHint} />

        <AmountInputSection
          amountInput={amountInput}
          onAmountChange={handleAmountChange}
          onKeyDown={handleKeyDown}
          validationError={validationError}
          inputRef={amountInputRef}
        />

        <div className="bg-slate-100 hard-border rounded-lg p-4">
          <p className="text-sm text-slate-600">
            💡 <strong>Tip:</strong> Press{" "}
            <kbd className="px-2 py-1 bg-white hard-border rounded text-xs font-mono">Enter</kbd> to
            continue, or click the CONTINUE button below
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmountEntryStep;
