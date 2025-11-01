import React, { useEffect, useRef } from "react";
import { getIcon } from "@/utils";
import { useTouchFeedback } from "@/utils/ui/touchFeedback";

interface ColorScheme {
  iconBg: string;
  iconColor: string;
  confirmBtn: string;
  confirmBtnDisabled: string;
}

export interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }> | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode; // For custom content between message and buttons
}

interface ModalHeaderProps {
  icon?: React.ComponentType<{ className?: string }> | null;
  destructive: boolean;
  title: string;
}

interface ModalActionsProps {
  cancelButtonRef: React.RefObject<HTMLButtonElement | null>;
  confirmButtonRef: React.RefObject<HTMLButtonElement | null>;
  cancelLabel: string;
  confirmLabel: string;
  destructive: boolean;
  isLoading: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

interface KeyboardHandlingProps {
  isOpen: boolean;
  isLoading: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelButtonRef: React.RefObject<HTMLButtonElement | null>;
  confirmButtonRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Get appropriate icon for modal type
 */
const getModalIcon = (
  icon?: React.ComponentType<{ className?: string }> | null,
  destructive?: boolean
): React.ComponentType<{ className?: string }> => {
  if (icon) return icon;
  if (destructive) return getIcon("Trash2");
  return getIcon("AlertTriangle");
};

/**
 * Get color scheme for modal buttons
 */
const getColorScheme = (destructive: boolean): ColorScheme => {
  return destructive
    ? {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        confirmBtnDisabled: "bg-red-300",
      }
    : {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        confirmBtnDisabled: "bg-blue-300",
      };
};

/**
 * Modal header component
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({ icon, destructive, title }) => {
  const Icon = getModalIcon(icon, destructive);
  const colorScheme = getColorScheme(destructive);

  return (
    <div className="flex items-center mb-4">
      <div
        className={`w-12 h-12 ${colorScheme.iconBg} rounded-full flex items-center justify-center mr-4`}
      >
        {React.createElement(Icon, {
          className: `h-6 w-6 ${colorScheme.iconColor}`,
        })}
      </div>
      <div className="flex-1">
        <h3 id="confirm-modal-title" className="font-black text-black text-base">
          {title}
        </h3>
        {destructive && <p className="text-sm text-red-600">This action cannot be undone</p>}
      </div>
    </div>
  );
};

/**
 * Modal action buttons component
 */
const ModalActions: React.FC<ModalActionsProps> = ({
  cancelButtonRef,
  confirmButtonRef,
  cancelLabel,
  confirmLabel,
  destructive,
  isLoading,
  onCancel,
  onConfirm,
}) => {
  const colorScheme = getColorScheme(destructive);
  const cancelTouchFeedback = useTouchFeedback("tap", "secondary");
  const confirmTouchFeedback = useTouchFeedback(
    destructive ? "warning" : "confirm",
    destructive ? "destructive" : "success"
  );

  return (
    <div className="flex gap-3 justify-end">
      <button
        ref={cancelButtonRef}
        type="button"
        onClick={cancelTouchFeedback.onClick(onCancel)}
        onTouchStart={cancelTouchFeedback.onTouchStart}
        disabled={isLoading}
        className={`px-4 py-2 text-gray-700 border-2 border-black rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${cancelTouchFeedback.className}`}
      >
        {cancelLabel}
      </button>
      <button
        ref={confirmButtonRef}
        type="button"
        onClick={confirmTouchFeedback.onClick(onConfirm)}
        onTouchStart={confirmTouchFeedback.onTouchStart}
        disabled={isLoading}
        className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${confirmTouchFeedback.className} ${
          isLoading ? colorScheme.confirmBtnDisabled : `${colorScheme.confirmBtn}`
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Processing...
          </div>
        ) : (
          confirmLabel
        )}
      </button>
    </div>
  );
};

/**
 * Custom hook for keyboard handling
 */
const useKeyboardHandling = ({
  isOpen,
  isLoading,
  onCancel,
  onConfirm,
  cancelButtonRef,
  confirmButtonRef,
}: KeyboardHandlingProps): void => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel?.();
      }
      if (e.key === "Enter" && e.target === cancelButtonRef.current) {
        onCancel?.();
      }
      if (e.key === "Enter" && e.target === confirmButtonRef.current) {
        onConfirm?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel, onConfirm, cancelButtonRef, confirmButtonRef]);
};

/**
 * Reusable ConfirmModal Component
 * Replaces window.confirm() with a custom modal for better UX and accessibility
 *
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #502 - Replace Confirms with ConfirmModal
 * Enhanced with Issue #159 - Touch Feedback and Animations
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isLoading = false,
  icon = null,
  onConfirm,
  onCancel,
  children, // For custom content between message and buttons
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management - focus cancel button by default for safety
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  useKeyboardHandling({
    isOpen,
    isLoading,
    onCancel,
    onConfirm,
    cancelButtonRef,
    confirmButtonRef,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <ModalHeader icon={icon} destructive={destructive} title={title} />

          {/* Content */}
          <div className="mb-6">
            <p id="confirm-modal-description" className="text-gray-700 mb-4">
              {message}
            </p>
            {children}
          </div>

          {/* Actions */}
          <ModalActions
            cancelButtonRef={cancelButtonRef}
            confirmButtonRef={confirmButtonRef}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
            destructive={destructive}
            isLoading={isLoading}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
