import React from "react";
import { getIcon } from "../../../utils";

interface SwipeState {
  isSwipeActive: boolean;
  swipeProgress: number;
  swipeDirection: "left" | "right" | null;
}

interface SwipeIndicatorOverlayProps {
  swipeState: SwipeState;
  unassignedCash: number;
}

/**
 * Swipe indicator overlay component for envelope interactions
 * Shows visual feedback during swipe gestures
 *
 * Part of Issue #160 - Swipe gestures for envelope interactions
 * Related to Epic #158 - Mobile UI/UX Enhancements
 */
const SwipeIndicatorOverlay = ({ swipeState, unassignedCash }: SwipeIndicatorOverlayProps) => {
  if (!swipeState.isSwipeActive || swipeState.swipeProgress <= 0.2) {
    return null;
  }

  const { swipeDirection, swipeProgress } = swipeState;

  return (
    <>
      {/* Right Swipe - Quick Fund */}
      {swipeDirection === "right" && unassignedCash > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-transparent rounded-lg flex items-center justify-start pl-6 pointer-events-none">
          <div
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-150"
            style={{
              opacity: swipeProgress,
              scale: `${0.8 + swipeProgress * 0.2}`,
            }}
          >
            {React.createElement(getIcon("DollarSign"), {
              className: "w-5 h-5",
            })}
            <span className="font-medium">Quick Fund</span>
          </div>
        </div>
      )}

      {/* Left Swipe - View History */}
      {swipeDirection === "left" && (
        <div className="absolute inset-0 bg-gradient-to-l from-blue-500/30 to-transparent rounded-lg flex items-center justify-end pr-6 pointer-events-none">
          <div
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-150"
            style={{
              opacity: swipeProgress,
              scale: `${0.8 + swipeProgress * 0.2}`,
            }}
          >
            {React.createElement(getIcon("History"), {
              className: "w-5 h-5",
            })}
            <span className="font-medium">View History</span>
          </div>
        </div>
      )}

      {/* No Cash Error for Right Swipe */}
      {swipeDirection === "right" && unassignedCash <= 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-transparent rounded-lg flex items-center justify-start pl-6 pointer-events-none">
          <div
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-150"
            style={{
              opacity: swipeProgress,
              scale: `${0.8 + swipeProgress * 0.2}`,
            }}
          >
            {React.createElement(getIcon("AlertCircle"), {
              className: "w-5 h-5",
            })}
            <span className="font-medium">No Cash Available</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SwipeIndicatorOverlay;
