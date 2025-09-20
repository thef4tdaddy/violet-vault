import React from "react";
import { getIcon } from "../../utils";
import { useFABSelectors, useFABActions } from "../../stores/ui/fabStore";
import { hapticFeedback } from "../../utils/ui/touchFeedback";

/**
 * Secondary action button component
 */
const SecondaryActionButton = ({ action, index }) => (
  <div
    className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <span className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
      {action.label}
    </span>
    <button
      onClick={() => {
        hapticFeedback(15, "medium");
        action.action?.();
      }}
      className={`${action.color} text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105`}
      title={action.label}
    >
      {React.createElement(getIcon(action.icon), { className: "h-4 w-4" })}
    </button>
  </div>
);

/**
 * Main FAB button component
 */
const MainFABButton = ({ primaryAction, isExpanded, onPrimaryClick, onToggleClick }) => (
  <div className="flex items-center gap-3">
    {/* Primary Action Label (shown when not expanded) */}
    {!isExpanded && primaryAction && (
      <span className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-in slide-in-from-right-2 duration-200">
        {primaryAction.label}
      </span>
    )}

    {/* Main FAB Button */}
    <button
      onClick={onPrimaryClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onToggleClick();
      }}
      className={`bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105 ${
        isExpanded ? "rotate-45" : "rotate-0"
      }`}
      title={isExpanded ? "Close menu" : primaryAction?.label || "More actions"}
      style={{ width: "56px", height: "56px" }}
    >
      {React.createElement(getIcon(isExpanded ? "X" : primaryAction?.icon || "Plus"), {
        className: "h-6 w-6",
      })}
    </button>

    {/* Expansion Toggle (small button) */}
    <button
      onClick={onToggleClick}
      className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-105 ml-1"
      title={isExpanded ? "Close menu" : "More actions"}
    >
      {React.createElement(getIcon(isExpanded ? "ChevronDown" : "ChevronUp"), {
        className: "h-3 w-3",
      })}
    </button>
  </div>
);

/**
 * Contextual Floating Action Button with expandable menu
 * Uses Zustand FAB store for state management
 */
const FloatingActionButton = () => {
  // Get FAB state from Zustand store
  const { isExpanded, shouldShowFAB, primaryAction, secondaryActions } = useFABSelectors();

  // Get FAB actions from Zustand store
  const { setExpanded } = useFABActions();

  // Don't render if not visible
  if (!shouldShowFAB) {
    return null;
  }

  // Event handlers
  const handlePrimaryAction = () => {
    hapticFeedback(15, "medium");
    if (isExpanded) {
      setExpanded(false);
      hapticFeedback(10, "light");
    } else if (primaryAction?.action) {
      primaryAction.action();
    }
  };

  const handleToggleExpansion = () => {
    hapticFeedback(10, "light");
    if (isExpanded) {
      setExpanded(false);
    } else {
      setExpanded(true);
      hapticFeedback(15, "medium");
    }
  };

  const handleBackdropClick = () => {
    setExpanded(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      {/* FAB is mobile-only */}

      {/* Secondary Actions (shown when expanded) */}
      {isExpanded && secondaryActions.length > 0 && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {secondaryActions.map((action, index) => (
            <SecondaryActionButton key={action.id || action.label} action={action} index={index} />
          ))}
        </div>
      )}

      {/* Main FAB */}
      <MainFABButton
        primaryAction={primaryAction}
        isExpanded={isExpanded}
        onPrimaryClick={handlePrimaryAction}
        onToggleClick={handleToggleExpansion}
      />

      {/* Backdrop (close on click outside) */}
      {isExpanded && (
        <div className="fixed inset-0 bg-transparent -z-10" onClick={handleBackdropClick} />
      )}
    </div>
  );
};

export default FloatingActionButton;
