import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useTouchFeedback } from "../../utils/ui/touchFeedback";

/**
 * Reusable SlideUpModal component for mobile-optimized bottom sheet modals
 *
 * Features:
 * - Slide-up animation from bottom with hardware acceleration
 * - Gesture-based dismissal (swipe down to close)
 * - Configurable heights (full, three-quarters, half)
 * - Haptic feedback integration
 * - Accessibility compliance with keyboard navigation
 * - Native mobile look with shadows and rounded corners
 *
 * Part of Issue #164 - Implement Slide-Up Modals for Mobile Flows
 */

const MODAL_HEIGHTS = {
  full: "h-[95vh]",
  "three-quarters": "h-[75vh]",
  half: "h-[50vh]",
  auto: "h-auto max-h-[90vh]",
};

const SlideUpModal = ({
  isOpen = false,
  onClose,
  title,
  height = "three-quarters",
  children,
  showHandle = true,
  backdrop = true,
  className = "",
}) => {
  const modalRef = useRef(null);
  const handleRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startY: 0,
    currentY: 0,
    deltaY: 0,
  });

  const closeFeedback = useTouchFeedback("tap", "secondary");

  // Handle opening/closing animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Allow animation to complete
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Touch/drag handling for swipe-to-dismiss
  const handleTouchStart = (e) => {
    if (!modalRef.current) return;

    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      startY: touch.clientY,
      currentY: touch.clientY,
      deltaY: 0,
    });
  };

  const handleTouchMove = (e) => {
    if (!dragState.isDragging || !modalRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - dragState.startY;

    // Only allow downward dragging
    if (deltaY > 0) {
      setDragState((prev) => ({
        ...prev,
        currentY: touch.clientY,
        deltaY,
      }));

      // Apply transform for real-time feedback
      modalRef.current.style.transform = `translateY(${deltaY}px)`;

      // Add slight opacity reduction as user drags
      const opacity = Math.max(0.3, 1 - deltaY / 300);
      if (backdrop) {
        const backdropEl = modalRef.current.parentElement;
        backdropEl.style.backgroundColor = `rgba(0, 0, 0, ${0.5 * opacity})`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!dragState.isDragging || !modalRef.current) return;

    const { deltaY } = dragState;

    // If dragged down more than 100px, close modal
    if (deltaY > 100) {
      onClose?.();
    } else {
      // Snap back to original position
      modalRef.current.style.transform = "translateY(0)";
      if (backdrop) {
        const backdropEl = modalRef.current.parentElement;
        backdropEl.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      }
    }

    setDragState({
      isDragging: false,
      startY: 0,
      currentY: 0,
      deltaY: 0,
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-all duration-300 ${
        backdrop ? "bg-black/50" : ""
      } ${isAnimating ? "opacity-0" : "opacity-100"}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "slide-modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`
          fixed bottom-0 left-0 right-0
          bg-white rounded-t-3xl shadow-2xl
          ${MODAL_HEIGHTS[height]}
          transform transition-transform duration-300 ease-out
          ${isOpen && !isAnimating ? "translate-y-0" : "translate-y-full"}
          ${className}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          // Enable hardware acceleration
          willChange: "transform",
          // Ensure smooth scrolling
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Handle for visual indication of draggable area */}
        {showHandle && (
          <div ref={handleRef} className="flex justify-center pt-3 pb-2 cursor-pointer">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header with title and close button */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="slide-modal-title" className="font-bold text-lg text-black">
              {title}
            </h2>
            <Button
              onClick={closeFeedback.onClick(onClose)}
              onTouchStart={closeFeedback.onTouchStart}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${closeFeedback.className}`}
              aria-label="Close modal"
            >
              {React.createElement(getIcon("X"), {
                className: "h-5 w-5 text-gray-500",
              })}
            </Button>
          </div>
        )}

        {/* Content area with proper scrolling */}
        <div
          className={`
            flex-1 overflow-y-auto overflow-x-hidden
            ${title ? "pb-6" : "pt-2 pb-6"}
          `}
          style={{
            // Ensure content can scroll within modal
            maxHeight: title ? "calc(100% - 80px)" : "calc(100% - 20px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SlideUpModal;
