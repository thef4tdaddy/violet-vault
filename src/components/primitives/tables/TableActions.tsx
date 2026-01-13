import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

/**
 * Action definition for TableActions
 */
export interface TableAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

/**
 * Props for TableActions component
 */
export interface TableActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: TableAction[];
  className?: string;
}

/**
 * TableActions - Bulk actions bar for tables
 *
 * Features:
 * - Shows selected count
 * - Clear selection button
 * - Custom action buttons with icons
 * - Variant styling (default, danger)
 * - Disabled state support
 */
export const TableActions: React.FC<TableActionsProps> = ({
  selectedCount,
  onClearSelection,
  actions,
  className = "",
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}
    >
      <span className="text-sm font-medium text-blue-700">
        {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon ? getIcon(action.icon) : null;
          const buttonVariant = action.variant === "destructive" ? "destructive" : "primary";
          const buttonClassName =
            action.variant === "destructive"
              ? "px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              : "px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";

          return (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={buttonClassName}
              variant={buttonVariant}
            >
              {Icon && <Icon className="h-4 w-4 mr-1.5 inline-block" />}
              {action.label}
            </Button>
          );
        })}
        <Button
          onClick={onClearSelection}
          className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
          variant="secondary"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default TableActions;
