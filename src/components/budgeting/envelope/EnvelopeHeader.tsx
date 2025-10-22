import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { getButtonClasses, withHapticFeedback } from "@/utils/ui/touchFeedback";

interface Envelope {
  id: string;
  name: string;
  category: string;
  color?: string;
}

interface EnvelopeHeaderProps {
  envelope: Envelope;
  isCollapsed: boolean;
  onSelect: (envelopeId: string) => void;
  onEdit: (envelope: Envelope) => void;
  onViewHistory: (envelope: Envelope) => void;
  onToggleCollapse: () => void;
}

export const EnvelopeHeader: React.FC<EnvelopeHeaderProps> = ({
  envelope,
  isCollapsed,
  onSelect,
  onEdit,
  onViewHistory,
  onToggleCollapse,
}) => {
  // Guard against undefined envelope
  if (!envelope) {
    return null;
  }

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
          "md:hidden flex-shrink-0 mr-2 p-2 text-gray-400 hover:text-blue-600",
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
          {envelope.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: envelope.color }}
              title={`Color: ${envelope.color}`}
            />
          )}
          <h3 className="font-semibold text-gray-900 truncate">{envelope.name}</h3>
        </div>
        <p className="text-xs text-gray-600 mt-1">{envelope.category}</p>
      </div>

      <div className="flex gap-1">
        <Button
          onClick={withHapticFeedback((e) => {
            e.stopPropagation();
            onEdit?.(envelope);
          }, "light")}
          className={getButtonClasses(
            "p-2 text-gray-400 hover:text-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center",
            "small"
          )}
        >
          {React.createElement(getIcon("Edit"), { className: "h-4 w-4" })}
        </Button>
        <Button
          onClick={withHapticFeedback((e) => {
            e.stopPropagation();
            onViewHistory?.(envelope);
          }, "light")}
          className={getButtonClasses(
            "p-2 text-gray-400 hover:text-green-600 min-h-[44px] min-w-[44px] flex items-center justify-center",
            "small"
          )}
        >
          {React.createElement(getIcon("History"), {
            className: "h-4 w-4",
          })}
        </Button>
      </div>
    </div>
  );
};
