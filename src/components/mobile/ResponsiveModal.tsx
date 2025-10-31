import React, { useEffect, useState } from "react";
import SlideUpModal from "./SlideUpModal";

type ModalHeight = "full" | "three-quarters" | "half" | "auto";

/**
 * Props for ResponsiveModal component
 */
interface ResponsiveModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  mobileHeight?: ModalHeight;
  [key: string]: unknown;
}

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
const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen = false,
  onClose,
  title,
  children,
  className = "",
  mobileHeight = "auto",
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkIsMobile = (): void => {
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
 * Props for wrapped modal components
 */
interface WrappedModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  _forceMobileMode?: boolean;
}

/**
 * withResponsiveModal - Higher-order component that wraps existing modal components
 * to automatically add responsive slide-up behavior
 */
export const withResponsiveModal = <P extends WrappedModalProps>(
  ModalComponent: React.ComponentType<P>
) => {
  const WrappedComponent = React.forwardRef<unknown, P>((props, ref) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = (): void => {
        setIsMobile(window.innerWidth < 640);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // If on mobile, wrap the modal content with SlideUpModal
    if (isMobile && props?.isOpen) {
      const onCloseHandler = props.onClose || undefined;
      return (
        <SlideUpModal
          isOpen={Boolean(props.isOpen)}
          onClose={onCloseHandler}
          title={typeof props.title === "string" ? props.title : "Modal"}
          height="auto"
          showHandle={true}
          backdrop={true}
        >
          <div className="px-6">
            <ModalComponent {...(props as P)} ref={ref} />
          </div>
        </SlideUpModal>
      );
    }

    // On desktop, render modal normally
    return <ModalComponent {...(props as P)} ref={ref} />;
  });

  WrappedComponent.displayName = `withResponsiveModal(${ModalComponent.displayName || ModalComponent.name || "Component"})`;

  return WrappedComponent;
};

export default ResponsiveModal;
