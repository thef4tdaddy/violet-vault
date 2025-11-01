import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useFABSelectors } from "@/stores/ui/fabStore";
import { useFABBehavior } from "@/hooks/mobile/useFABBehavior";
import { useFABSmartPositioning } from "@/hooks/mobile/useFABSmartPositioning";
import { useFABLoadingStates } from "@/hooks/mobile/useFABLoadingStates";
import FABActionMenu from "./FABActionMenu";

/**
 * Simple Floating Action Button component
 * Just the button - behavior is handled by hooks
 */
const FloatingActionButton: React.FC = () => {
  const { shouldShowFAB, primaryAction, isExpanded } = useFABSelectors();
  const { containerRef, handlePrimaryClick, handleLongPress, handleBackdropClick } =
    useFABBehavior();
  const { adjustedStyle } = useFABSmartPositioning();
  const { isAnyActionLoading } = useFABLoadingStates();

  if (!shouldShowFAB) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed right-4 z-50 lg:hidden" style={adjustedStyle}>
      {/* Pop-out menu */}
      <FABActionMenu />

      {/* Main FAB Button */}
      <Button
        onClick={handlePrimaryClick}
        onMouseDown={handleLongPress.onMouseDown}
        onTouchStart={handleLongPress.onTouchStart}
        onMouseUp={handleLongPress.onMouseUp}
        onMouseLeave={handleLongPress.onMouseLeave}
        onTouchEnd={handleLongPress.onTouchEnd}
        onTouchCancel={handleLongPress.onTouchCancel}
        className={`bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105 ${
          isExpanded ? "rotate-45" : "rotate-0"
        } ${isAnyActionLoading() ? "opacity-75 cursor-wait" : ""}`}
        disabled={isAnyActionLoading()}
        title={primaryAction?.label || "Actions"}
        aria-label="Floating action button"
        aria-expanded={isExpanded}
        aria-haspopup="menu"
        style={{ width: "56px", height: "56px" }}
      >
        {React.createElement(getIcon(isExpanded ? "X" : primaryAction?.icon || "Plus"), {
          className: "h-6 w-6",
        })}
      </Button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-transparent -z-10"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
