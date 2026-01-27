import React, { useEffect, useRef } from "react";
import { useImportDashboardStore } from "@/stores/ui/importDashboardStore";
import ImportDashboard from "./ImportDashboard";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

/**
 * ImportDashboardModal - Full-screen modal wrapper for the import dashboard
 * Provides backdrop, close handlers, and focus management
 */
export const ImportDashboardModal: React.FC = () => {
  const { isOpen, close, preloadedFile } = useImportDashboardStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current active element to restore focus later
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = "hidden";

      // Focus modal for keyboard accessibility
      modalRef.current?.focus();
    } else {
      // Restore body scroll
      document.body.style.overflow = "";

      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-dashboard-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="
          relative z-10
          w-full h-full
          md:w-[95vw] md:h-[90vh]
          md:max-w-7xl
          bg-white
          rounded-none md:rounded-3xl
          hard-border
          overflow-hidden
          shadow-2xl
          flex flex-col
          safe-area-inset-top safe-area-inset-bottom
        "
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <ModalCloseButton onClick={close} ariaLabel="Close import dashboard" />
        </div>

        {/* Dashboard Content */}
        <div className="w-full h-full overflow-hidden">
          <ImportDashboard preloadedFile={preloadedFile} onClose={close} />
        </div>
      </div>
    </div>
  );
};

export default ImportDashboardModal;
