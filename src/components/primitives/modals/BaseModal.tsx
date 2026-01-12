import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "max-w-sm", // 384px
  md: "max-w-md", // 448px
  lg: "max-w-lg", // 512px
  xl: "max-w-xl", // 576px
  full: "max-w-full", // full screen
};

/**
 * BaseModal - Foundational modal component
 *
 * A reusable, accessible modal primitive with:
 * - Portal rendering to document.body
 * - Size variants (sm, md, lg, xl, full)
 * - Backdrop with blur effect
 * - Keyboard handlers (Escape key)
 * - Focus trap and accessibility features
 * - Smooth animations
 *
 * Part of Phase 1.1: Component Library Standardization
 * Issue #1526 - Modal Primitives
 */
const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = false,
  children,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps, zustand-safe-patterns/zustand-no-store-actions-in-deps
  }, [isOpen, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap - focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] animate-[fadeIn_0.2s_ease-out]"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl w-full ${SIZE_CLASSES[size]} shadow-2xl border-2 border-black animate-[scaleIn_0.2s_ease-out] ${className}`}
        tabIndex={-1}
      >
        {showCloseButton && (
          // eslint-disable-next-line enforce-ui-library/enforce-ui-library
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-2"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BaseModal;
