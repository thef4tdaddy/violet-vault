import React, { useEffect, useState } from "react";
import SlideUpModal from "./SlideUpModal";

/**
 * ResponsiveModal - Higher-order component that wraps existing modals
 * to provide slide-up behavior on mobile while preserving desktop modal behavior
 *
 * Features:
 * - Automatically detects screen size
 * - Slide-up behavior on mobile (< 640px)
 * - Traditional modal behavior on desktop
 * - Preserves all existing modal props and functionality
 *
 * Part of Issue #164 - Implement Slide-Up Modals for Mobile Flows
 */
interface ResponsiveModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  mobileHeight?: "auto" | "full" | "three-quarters" | "half";
  [key: string]: unknown;
}

const ResponsiveModal = ({
  isOpen = false,
  onClose,
  title,
  children,
  className = "",
  mobileHeight = "auto",
  ...props
}: ResponsiveModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  if (!isOpen) return null;

  // On mobile, render as slide-up modal
  if (isMobile) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        height={mobileHeight}
        showHandle={true}
        backdrop={true}
        className={className}
        {...props}
      >
        {children}
      </SlideUpModal>
    );
  }

  // On desktop, render children directly (preserves existing modal structure)
  return children;
};

/**
 * withResponsiveModal - Higher-order component that wraps existing modal components
 * to automatically add responsive slide-up behavior
 */
interface ModalWrapperProps {
  isOpen?: boolean;
  onClose?: (() => void) | undefined;
  title?: string;
  _forceMobileMode?: boolean;
  [key: string]: unknown;
}

export const withResponsiveModal = <P extends ModalWrapperProps>(
  ModalComponent: React.ComponentType<P>
) => {
  return React.forwardRef<unknown, P>((props: P, ref: React.Ref<unknown>) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // If on mobile, wrap the modal content with SlideUpModal
    if (isMobile && props?.isOpen) {
      return (
        <SlideUpModal
          isOpen={Boolean(props.isOpen)}
          onClose={props.onClose}
          title={typeof props.title === "string" ? props.title : "Modal"}
          height="auto"
          showHandle={true}
          backdrop={true}
        >
          <div className="px-6">
            <ModalComponent {...({ ...props, ref, _forceMobileMode: true } as P)} />
          </div>
        </SlideUpModal>
      );
    }

    // On desktop, render modal normally
    return <ModalComponent {...({ ...props, ref } as P)} />;
  });
};

export default ResponsiveModal;
