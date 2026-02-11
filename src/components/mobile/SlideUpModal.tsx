import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import { useTouchFeedback } from "@/utils/ui/feedback/touchFeedback";

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
} as const;

type ModalHeight = keyof typeof MODAL_HEIGHTS;

const SWIPE_THRESHOLD = 100;
const BACKDROP_OPACITY = 0.5;

// ============================================================================
// Helper Functions
// ============================================================================

// Apply drag transform to modal and backdrop
function applyDragTransform(
  modalRef: React.RefObject<HTMLDivElement | null>,
  deltaY: number,
  backdrop: boolean
) {
  if (!modalRef.current) return;

  modalRef.current.style.transform = `translateY(${deltaY}px)`;

  // Add slight opacity reduction as user drags
  const opacity = Math.max(0.3, 1 - deltaY / 300);
  if (backdrop) {
    const backdropEl = modalRef.current.parentElement;
    if (backdropEl) {
      backdropEl.style.backgroundColor = `rgba(0, 0, 0, ${BACKDROP_OPACITY * opacity})`;
    }
  }
}

// Reset drag transform to original position
function resetDragTransform(modalRef: React.RefObject<HTMLDivElement | null>, backdrop: boolean) {
  if (!modalRef.current) return;

  modalRef.current.style.transform = "translateY(0)";
  if (backdrop) {
    const backdropEl = modalRef.current.parentElement;
    if (backdropEl) {
      backdropEl.style.backgroundColor = `rgba(0, 0, 0, ${BACKDROP_OPACITY})`;
    }
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  closeFeedback: ReturnType<typeof useTouchFeedback>;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, closeFeedback }) => (
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
);

const DragHandle = ({ handleRef }: { handleRef: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={handleRef}
    className="flex justify-center pt-3 pb-2 cursor-pointer"
    data-testid="drag-handle"
  >
    <div className="w-12 h-1 bg-gray-300 rounded-full" />
  </div>
);

interface ModalPanelProps {
  modalRef: React.RefObject<HTMLDivElement | null>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  height: ModalHeight;
  isOpen: boolean;
  isAnimating: boolean;
  className: string;
  showHandle: boolean;
  title?: string;
  onClose?: () => void;
  closeFeedback: ReturnType<typeof useTouchFeedback>;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  children: React.ReactNode;
}

const ModalPanel: React.FC<ModalPanelProps> = ({
  modalRef,
  handleRef,
  height,
  isOpen,
  isAnimating,
  className,
  showHandle,
  title,
  onClose,
  closeFeedback,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  children,
}) => (
  <div
    ref={modalRef}
    data-testid="modal-panel"
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
      willChange: "transform",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {showHandle && <DragHandle handleRef={handleRef} />}
    {title && <ModalHeader title={title} onClose={onClose} closeFeedback={closeFeedback} />}
    <div
      className={`
        flex-1 overflow-y-auto overflow-x-hidden
        ${title ? "pb-6" : "pt-2 pb-6"}
      `}
      style={{
        maxHeight: title ? "calc(100% - 80px)" : "calc(100% - 20px)",
      }}
    >
      {children}
    </div>
  </div>
);

// ============================================================================
// Custom Hooks
// ============================================================================

interface DragState {
  isDragging: boolean;
  startY: number;
  currentY: number;
  deltaY: number;
}

// Process drag move logic
function processDragMove(
  dragState: DragState,
  modalRef: React.RefObject<HTMLDivElement | null>,
  touch: React.Touch,
  backdrop: boolean,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
): void {
  if (!dragState.isDragging || !modalRef.current) return;

  const deltaY = touch.clientY - dragState.startY;

  // Only allow downward dragging
  if (deltaY > 0) {
    setDragState((prev) => ({
      ...prev,
      currentY: touch.clientY,
      deltaY,
    }));

    applyDragTransform(modalRef, deltaY, backdrop);
  }
}

// Process drag end logic
function processDragEnd(
  dragState: DragState,
  modalRef: React.RefObject<HTMLDivElement | null>,
  backdrop: boolean,
  onClose: (() => void) | undefined,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
): void {
  if (!dragState.isDragging || !modalRef.current) return;

  const { deltaY } = dragState;

  // If dragged down more than threshold, close modal
  if (deltaY > SWIPE_THRESHOLD) {
    onClose?.();
  } else {
    // Snap back to original position
    resetDragTransform(modalRef, backdrop);
  }

  setDragState({
    isDragging: false,
    startY: 0,
    currentY: 0,
    deltaY: 0,
  });
}

// Hook to manage drag state for swipe-to-dismiss
function useDragHandlers(
  modalRef: React.RefObject<HTMLDivElement | null>,
  backdrop: boolean,
  onClose?: () => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    currentY: 0,
    deltaY: 0,
  });

  const handleTouchStart = (e: React.TouchEvent): void => {
    if (!modalRef.current) return;

    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      startY: touch.clientY,
      currentY: touch.clientY,
      deltaY: 0,
    });
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    processDragMove(dragState, modalRef, e.touches[0], backdrop, setDragState);
  };

  const handleTouchEnd = (): void => {
    processDragEnd(dragState, modalRef, backdrop, onClose, setDragState);
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

interface SlideUpModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  height?: ModalHeight;
  children: React.ReactNode;
  showHandle?: boolean;
  backdrop?: boolean;
  className?: string;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isOpen = false,
  onClose,
  title,
  height = "three-quarters",
  children,
  showHandle = true,
  backdrop = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const closeFeedback = useTouchFeedback("tap", "secondary");

  // Use drag handlers hook
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useDragHandlers(
    modalRef,
    backdrop,
    onClose
  );

  // Handle opening/closing animations
  useEffect(() => {
    if (!isOpen) return;

    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Early return if not open
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
      <ModalPanel
        modalRef={modalRef}
        handleRef={handleRef}
        height={height}
        isOpen={isOpen}
        isAnimating={isAnimating}
        className={className}
        showHandle={showHandle}
        title={title}
        onClose={onClose}
        closeFeedback={closeFeedback}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      >
        {children}
      </ModalPanel>
    </div>
  );
};

export default SlideUpModal;
