import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useFABSelectors, useFABActions } from "../../stores/ui/fabStore";
import { useFABLoadingStates } from "../../hooks/mobile/useFABLoadingStates";
import { hapticFeedback } from "../../utils/ui/touchFeedback";

/**
 * FAB Action interface
 */
interface FABAction {
  id?: string;
  label: string;
  icon: string;
  color: string;
  action?: () => void;
}

/**
 * Individual action button in the menu
 */
interface FABActionButtonProps {
  action: FABAction;
  index: number;
  onActionClick: () => void;
  isLoading: boolean;
}

const FABActionButton = ({ action, index, onActionClick, isLoading }: FABActionButtonProps) => {
  const handleClick = () => {
    hapticFeedback(15, "medium");
    action.action?.();
    onActionClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action.action?.();
      onActionClick();
    }
  };

  const buttonClasses = [
    action.color,
    "text-white",
    "rounded-full",
    "p-3",
    "shadow-lg",
    "transition-all",
    "duration-200",
    "hover:scale-105",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-white",
    "focus:ring-opacity-50",
  ];

  if (isLoading) {
    buttonClasses.push("opacity-75", "cursor-wait");
  }

  return (
    <div
      className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {action.label}
      </span>
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={buttonClasses.join(" ")}
        title={action.label}
        role="menuitem"
        aria-label={action.label}
        disabled={isLoading}
      >
        {isLoading
          ? React.createElement(getIcon("Loader2"), {
              className: "h-4 w-4 animate-spin",
            })
          : React.createElement(getIcon(action.icon), { className: "h-4 w-4" })}
      </Button>
    </div>
  );
};

/**
 * Expandable action menu for FAB
 * Shows secondary actions when FAB is expanded
 */
const FABActionMenu = () => {
  const { isExpanded, secondaryActions } = useFABSelectors();
  const { setExpanded } = useFABActions();
  const { isActionLoading } = useFABLoadingStates();

  if (!isExpanded || secondaryActions.length === 0) {
    return null;
  }

  const handleActionClick = () => {
    setExpanded(false);
  };

  return (
    <div
      className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
      role="menu"
      aria-label="Additional actions"
    >
      {secondaryActions.map((action, index) => (
        <FABActionButton
          key={action.id || action.label}
          action={action}
          index={index}
          onActionClick={handleActionClick}
          isLoading={isActionLoading(action.id || action.label)}
        />
      ))}
    </div>
  );
};

export default FABActionMenu;
