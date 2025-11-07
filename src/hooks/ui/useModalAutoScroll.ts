/**
 * useModalAutoScroll Hook
 *
 * Automatically scrolls modal to viewport center when opened.
 * Solves the issue where modals with `fixed` positioning and flex centering
 * appear below the fold when the page is scrolled down.
 *
 * Usage:
 * ```tsx
 * const MyModal = ({ isOpen, onClose }) => {
 *   const modalRef = useModalAutoScroll(isOpen);
 *
 *   return (
 *     <div className="fixed inset-0 ...">
 *       <div ref={modalRef} className="modal-content">
 *         ...
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */

import { useEffect, useRef } from "react";

export const useModalAutoScroll = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const scrollToCenter = () => {
        const modal = modalRef.current;
        if (!modal) return;

        const rect = modal.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const modalHeight = rect.height;
        const scrollTop = window.scrollY + rect.top;
        const targetScroll = scrollTop - viewportHeight / 2 + modalHeight / 2;

        window.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
      };

      // Small delay to ensure DOM is fully rendered
      setTimeout(scrollToCenter, 100);
    }
  }, [isOpen]);

  return modalRef;
};
