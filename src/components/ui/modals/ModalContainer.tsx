import React, { useEffect, useRef } from "react";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalContainerProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Modal title */
  title?: string;
  /** Close handler */
  onClose: () => void;
  /** Modal children content */
  children: React.ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Custom className for modal content */
  className?: string;
}

/**
 * ModalContainer Component
 * Standardized wrapper for custom modals with consistent styling
 *
 * Features:
 * - Glassmorphism backdrop with blur
 * - Configurable sizes
 * - Keyboard support (Escape to close)
 * - Focus management
 * - Scrollable content
 *
 * Usage:
 * <ModalContainer
 *   isOpen={isOpen}
 *   title="Settings"
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 * >
 *   <div>Modal content here</div>
 * </ModalContainer>
 */
const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  title,
  onClose,
  children,
  size = "md",
  closeOnEscape = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);

  // Keep refs updated with latest values
  useEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
    // eslint-disable-next-line zustand-safe-patterns/zustand-no-store-actions-in-deps
  }, [onClose, closeOnEscape]);

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscapeRef.current && e.key === "Escape") {
        onCloseRef.current();
      }
    };

    // Focus content when opened
    if (contentRef.current) {
      contentRef.current.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-scroll modal to viewport center when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const scrollToCenter = () => {
        const modal = contentRef.current;
        if (!modal) return;

        const rect = modal.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const modalHeight = rect.height;
        const scrollTop = window.scrollY + rect.top;
        const targetScroll = scrollTop - viewportHeight / 2 + modalHeight / 2;

        window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
      };

      // Small delay to ensure DOM is rendered
      setTimeout(scrollToCenter, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
      ref={modalRef}
    >
      <div
        className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto border-2 border-black ${className}`}
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
        tabIndex={-1}
      >
        {title && (
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 id="modal-title" className="font-black text-black text-lg">
              {title}
            </h2>
            <ModalCloseButton onClick={onClose} />
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalContainer;
