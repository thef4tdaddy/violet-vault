import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getButtonClasses, withHapticFeedback } from "../../../utils/ui/touchFeedback";

// Type definitions
interface EnvelopeActionsProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
}

/**
 * Envelope actions component
 * Shows action buttons and toggle for envelope
 *
 * Part of EnvelopeItem refactoring for ESLint compliance
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
const EnvelopeActions = ({
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onViewHistory,
}: EnvelopeActionsProps) => {
  const getToggleIcon = (isCollapsed: boolean) =>
    React.createElement(getIcon(isCollapsed ? "ChevronDown" : "ChevronUp"), {
      className: "h-4 w-4",
    });

  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button
        onClick={withHapticFeedback(onEdit, "tap")}
        className={getButtonClasses(
          "px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 border-2 border-black text-sm",
          "small"
        )}
      >
        {React.createElement(getIcon("Edit"), { className: "h-4 w-4" })}
      </Button>
      <Button
        onClick={withHapticFeedback(onViewHistory, "navigation")}
        className={getButtonClasses(
          "px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 border-2 border-black text-sm",
          "small"
        )}
      >
        {React.createElement(getIcon("History"), { className: "h-4 w-4" })}
      </Button>
      <Button
        onClick={withHapticFeedback(onToggleCollapse, "tap")}
        className={getButtonClasses(
          "px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 border-2 border-black text-sm ml-auto",
          "small"
        )}
      >
        {getToggleIcon(isCollapsed)}
      </Button>
    </div>
  );
};

export default EnvelopeActions;
