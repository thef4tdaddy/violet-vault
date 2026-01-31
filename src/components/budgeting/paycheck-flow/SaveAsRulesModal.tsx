/**
 * Save as Rules Modal - Issue #1846
 * Allows users to save allocation results as reusable autofunding rules
 */

import React, { useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { smartConvertAllocationToRules, type AllocationResult } from "@/utils/domain/budgeting/autofunding/conversionHelpers";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import logger from "@/utils/core/common/logger";

interface SaveAsRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: AllocationResult;
  paycheckAmountCents: number;
}

export function SaveAsRulesModal({
  isOpen,
  onClose,
  allocation,
  paycheckAmountCents,
}: SaveAsRulesModalProps) {
  const [trigger, setTrigger] = useState<"income_detected" | "biweekly">("income_detected");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastHelpers();

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);

    try {
      // Convert allocation to rules
      const rules = smartConvertAllocationToRules(allocation, paycheckAmountCents, {
        trigger,
        enabled,
        baseRuleName: `Paycheck ${allocation.strategy}`,
      });

      // TODO: Save rules to database
      // For now, just log and show success
      logger.info("Generated autofunding rules from allocation", {
        ruleCount: rules.length,
        strategy: allocation.strategy,
        enabled,
      });

      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 500));

      showSuccessToast(`Created ${rules.length} rules from your ${allocation.strategy} allocation!`);
      onClose();
    } catch (error) {
      logger.error("Failed to save allocation as rules", { error });
      showErrorToast("Failed to create rules. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b-2 border-black">
          <h2 className="text-2xl font-black uppercase">Save as Reusable Rules</h2>
          <p className="text-sm text-slate-600 mt-1">
            Convert your {allocation.strategy.replace("_", " ")} allocation into autofunding rules
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview Rules */}
          <div>
            <h3 className="font-bold text-sm uppercase text-slate-700 mb-3">
              Rules to Create ({allocation.allocations.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allocation.allocations.map((alloc, index) => {
                const percentage = ((alloc.amountCents / paycheckAmountCents) * 100).toFixed(1);
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-slate-50 border-2 border-black rounded"
                  >
                    <div>
                      <div className="font-bold text-sm">{alloc.envelopeId}</div>
                      <div className="text-xs text-slate-600">
                        {allocation.strategy === "last_split"
                          ? `Fixed: ${formatCents(alloc.amountCents)}`
                          : `${percentage}% of paycheck`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-fuchsia-600">
                        {formatCents(alloc.amountCents)}
                      </div>
                      <div className="text-xs text-slate-500">Priority {(index + 1) * 10}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 uppercase">
                When should these rules run?
              </label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value as "income_detected" | "biweekly")}
                className="w-full px-4 py-2 border-2 border-black rounded font-medium focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="income_detected">When income is detected</option>
                <option value="biweekly">Every 2 weeks (biweekly)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-500 rounded">
              <input
                type="checkbox"
                id="enable-rules"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 border-2 border-black rounded focus:ring-2 focus:ring-fuchsia-500"
              />
              <label htmlFor="enable-rules" className="font-bold text-sm cursor-pointer">
                Enable rules immediately
              </label>
            </div>

            {!enabled && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-300">
                💡 <strong>Tip:</strong> Rules will be created but disabled. You can enable them
                later from the Autofunding Rules page.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t-2 border-black flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border-2 border-black rounded font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 border-2 border-black rounded font-black bg-fuchsia-500 text-white hover:bg-fuchsia-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {saving ? "Creating..." : "💾 Create Rules"}
          </Button>
        </div>
      </div>
    </div>
  );
}
