import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useFABSelectors, useFABActions } from "@/stores/ui/fabStore";
import { useFABLoadingStates } from "@/hooks/platform/mobile/useFABLoadingStates";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";

/**
 * FAB Action interface - matches the store's FABAction interface
 */
interface FABAction {
  id: string;
  label: string;
  icon: string;
  action: (() => void) | null;
  color: string;
}

/**
 * Props for FABActionButton
 */
interface FABActionButtonProps {
  action: FABAction;
  index: number;
  onActionClick: () => void;
  isLoading: boolean;
}

/**
 * Individual action button in the menu
 */
const FABActionButton: React.FC<FABActionButtonProps> = ({
  action,
  index,
  onActionClick,
  isLoading,
}) => {
  const handleClick = (): void => {
    hapticFeedback(15, "medium");
    action.action?.();
    onActionClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
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
const FABActionMenu: React.FC = () => {
  const { isExpanded, secondaryActions } = useFABSelectors();
  const { setExpanded } = useFABActions();
  const { isActionLoading } = useFABLoadingStates();

  if (!isExpanded || secondaryActions.length === 0) {
    return null;
  }

  const handleActionClick = (): void => {
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
          key={action.id}
          action={action}
          index={index}
          onActionClick={handleActionClick}
          isLoading={isActionLoading(action.id)}
        />
      ))}
    </div>
  );
};

export default FABActionMenu;
