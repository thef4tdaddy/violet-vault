import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { getButtonClasses, withHapticFeedback } from "@/utils/ui/feedback/touchFeedback";
import {
  AUTO_CLASSIFY_ENVELOPE_TYPE,
  ENVELOPE_TYPE_CONFIG,
  EnvelopeType,
} from "@/constants/categories";

interface Envelope {
  id: string;
  name: string;
  category: string;
  color?: string;
  envelopeType?: string;
  type?: string;
}

interface EnvelopeHeaderProps {
  envelope: Envelope;
  isCollapsed: boolean;
  onSelect?: (envelopeId: string) => void;
  onEdit?: (envelope: Envelope) => void;
  onViewHistory?: (envelope: Envelope) => void;
  onToggleCollapse: () => void;
}

export const EnvelopeHeader: React.FC<EnvelopeHeaderProps> = React.memo(
  ({ envelope, isCollapsed, onSelect, onEdit, onViewHistory, onToggleCollapse }) => {
    // Guard against undefined envelope
    if (!envelope) {
      return null;
    }

    // Determine color class based on type
    const envelopeType =
      envelope.envelopeType ||
      envelope.type ||
      AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category || "");

    let finalType = envelopeType;
    // Map liability types
    const liabilityTypes = [
      "liability",
      "credit_card",
      "mortgage",
      "auto",
      "student",
      "personal",
      "business",
      "other",
      "chapter13",
    ];
    if (liabilityTypes.includes(finalType)) {
      finalType = "bill";
    }

    const config = ENVELOPE_TYPE_CONFIG[finalType as EnvelopeType];
    // Use config color class if available (e.g. bg-blue-500 from border-blue-500), otherwise use envelope.color style
    // We assume borderColor is like "border-blue-500", so we replace border with bg
    const colorClass = config ? config.borderColor.replace("border-", "bg-") : null;

    return (
      <div
        className="flex justify-between items-start mb-4"
        onClick={withHapticFeedback(() => onSelect?.(envelope.id), "light")}
      >
        {/* Mobile collapse button */}
        <Button
          onClick={withHapticFeedback((e) => {
            e.stopPropagation();
            onToggleCollapse();
          }, "light")}
          className={getButtonClasses(
            "md:hidden shrink-0 mr-2 p-2 text-gray-400 hover:text-blue-600",
            "small"
          )}
          aria-label={isCollapsed ? "Expand envelope" : "Collapse envelope"}
        >
          {React.createElement(getIcon(isCollapsed ? "ChevronRight" : "ChevronDown"), {
            className: "h-4 w-4",
          })}
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Color indicator */}
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${colorClass || ""}`}
              style={
                !colorClass && envelope.color ? { backgroundColor: envelope.color } : undefined
              }
              title={`Type: ${finalType}`}
            />
            <h3 className="font-semibold text-gray-900 truncate">{envelope.name}</h3>
          </div>
          <p className="text-xs text-gray-600 mt-1">{envelope.category}</p>
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <Button
              onClick={withHapticFeedback((e) => {
                e.stopPropagation();
                onEdit(envelope);
              }, "light")}
              className={getButtonClasses(
                "p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 min-h-[40px] min-w-[40px] flex items-center justify-center rounded border border-blue-200",
                "small"
              )}
              title="Edit envelope"
            >
              {React.createElement(getIcon("Edit"), { className: "h-3.5 w-3.5" })}
            </Button>
          )}
          {onViewHistory && (
            <Button
              onClick={withHapticFeedback((e) => {
                e.stopPropagation();
                onViewHistory(envelope);
              }, "light")}
              className={getButtonClasses(
                "p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 min-h-[40px] min-w-[40px] flex items-center justify-center rounded border border-amber-200",
                "small"
              )}
              title="View transaction history"
            >
              {React.createElement(getIcon("Clock"), {
                className: "h-3.5 w-3.5",
              })}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

EnvelopeHeader.displayName = "EnvelopeHeader";
