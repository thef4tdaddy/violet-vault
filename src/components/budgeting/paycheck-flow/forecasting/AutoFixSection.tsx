/**
 * AutoFixSection Component - Issue #1853
 * Displays auto-fix suggestions and allows one-click application
 */

import React from "react";
import Button from "@/components/ui/buttons/Button";
import type { AutoFixSuggestion } from "@/utils/domain/budgeting/autoFixSuggestions";
import { formatCentsAsCurrency } from "@/utils/domain/budgeting/billCoverageCalculations";

interface AutoFixSectionProps {
  suggestions: AutoFixSuggestion[];
  onApply: (suggestions: AutoFixSuggestion[]) => void;
  isApplying?: boolean;
}

export function AutoFixSection({ suggestions, onApply, isApplying = false }: AutoFixSectionProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const totalTransfer = suggestions.reduce((sum, s) => sum + s.amountCents, 0);

  return (
    <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💡</span>
        <h4 className="font-black text-amber-900 uppercase tracking-wide">
          Auto-Fix Suggestions
        </h4>
      </div>

      {/* Summary */}
      <div className="mb-3 p-2 bg-white rounded border border-amber-300">
        <div className="text-sm text-amber-900">
          <span className="font-bold">Total to redistribute:</span>{" "}
          <span className="font-black">{formatCentsAsCurrency(totalTransfer)}</span>
        </div>
        <div className="text-xs text-amber-700 mt-1">
          {suggestions.length} transfer{suggestions.length > 1 ? "s" : ""} from discretionary to
          bill envelopes
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="p-2 bg-white rounded border border-amber-200 hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-black text-fuchsia-600">
                {formatCentsAsCurrency(suggestion.amountCents)}
              </span>
              <span className="text-slate-600">from</span>
              <span className="font-bold text-slate-900 truncate">
                {suggestion.fromEnvelopeName}
              </span>
              <span className="text-slate-600">→</span>
              <span className="font-bold text-slate-900 truncate">{suggestion.toEnvelopeName}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 ml-2">{suggestion.reason}</div>
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <Button
        onClick={() => onApply(suggestions)}
        disabled={isApplying}
        className="w-full px-4 py-3 bg-amber-500 text-white border-2 border-black rounded-lg font-black uppercase tracking-wide hover:bg-amber-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:bg-slate-300 disabled:text-slate-500"
      >
        {isApplying ? "APPLYING..." : "✨ APPLY AUTO-FIX"}
      </Button>

      {/* Disclaimer */}
      <div className="mt-2 text-xs text-amber-700 text-center">
        This will adjust your allocations. You can still make changes after applying.
      </div>
    </div>
  );
}
