/**
 * Paycheck Wizard Modal - Multi-step paycheck allocation wizard
 * Part of Issue #1785: Wizard Modal Container
 * Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
 */

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

// Step placeholder components (will be implemented in subsequent issues)
import AmountEntryStep from "./steps/AmountEntryStep";
import AllocationStrategyStep from "./steps/AllocationStrategyStep";
import ReviewStep from "./steps/ReviewStep";
import SuccessStep from "./steps/SuccessStep";

/**
 * Step configuration
 * Maps step indices to components and metadata
 */
const WIZARD_STEPS = [
  { component: AmountEntryStep, title: "Enter Paycheck Amount", key: "amount" },
  { component: AllocationStrategyStep, title: "Allocate Funds", key: "allocate" },
  { component: ReviewStep, title: "Review & Confirm", key: "review" },
  { component: SuccessStep, title: "Success!", key: "success" },
] as const;

const TOTAL_STEPS = WIZARD_STEPS.length;

/**
 * Slide animation variants for step transitions
 * "Hard Lines" aesthetic: Sharp, decisive movements
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

/**
 * Spring transition config
 * Smooth but responsive, matching "Hard Lines" premium feel
 */
const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/**
 * PaycheckWizardModal
 * Full-screen wizard modal for paycheck allocation workflow
 *
 * Features:
 * - Multi-step navigation with smooth transitions (Framer Motion)
 * - State persistence via Zustand (survives refresh)
 * - "Hard Lines" aesthetic (thick borders, sharp corners, high contrast)
 * - Accessibility (ESC key, focus management, aria labels)
 * - Responsive design (mobile + desktop)
 */
export const PaycheckWizardModal: React.FC = () => {
  const isOpen = usePaycheckFlowStore((state) => state.isOpen);
  const currentStep = usePaycheckFlowStore((state) => state.currentStep);
  const closeWizard = usePaycheckFlowStore((state) => state.closeWizard);
  const nextStep = usePaycheckFlowStore((state) => state.nextStep);
  const previousStep = usePaycheckFlowStore((state) => state.previousStep);
  const reset = usePaycheckFlowStore((state) => state.reset);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const previousStepRef = useRef<number>(currentStep);

  // Calculate slide direction for animations
  const direction = currentStep > previousStepRef.current ? 1 : -1;
  previousStepRef.current = currentStep;

  // Handle ESC key to close modal (with confirmation on first 2 steps)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // On success step, allow direct close
        if (currentStep === TOTAL_STEPS - 1) {
          handleClose();
          return;
        }

        // On other steps, confirm before closing (prevents accidental data loss)
        const confirmed = window.confirm(
          "Are you sure you want to close? Your progress will be saved."
        );
        if (confirmed) {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, currentStep]);

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

  /**
   * Handle modal close
   * Closes wizard without resetting state (allows resume later)
   */
  const handleClose = () => {
    closeWizard();
    // Note: We don't reset() here to allow resume later
    // Only reset on explicit "finish" from success step
  };

  /**
   * Handle finish (from success step)
   * Closes wizard and resets all state
   */
  const handleFinish = () => {
    reset();
    closeWizard();
  };

  if (!isOpen) return null;

  const CurrentStepComponent = WIZARD_STEPS[currentStep]?.component;
  const stepTitle = WIZARD_STEPS[currentStep]?.title ?? "Paycheck Wizard";
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - "Hard Lines" aesthetic: solid, decisive */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content - "Hard Lines" aesthetic */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paycheck-wizard-title"
        className="
          relative z-10
          w-full h-full
          md:w-[90vw] md:h-[85vh]
          md:max-w-5xl
          bg-slate-50
          rounded-none md:rounded-lg
          hard-border
          overflow-hidden
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          flex flex-col
          safe-area-inset-top safe-area-inset-bottom
        "
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header - Stepper with "Hard Lines" aesthetic */}
        <div className="bg-white hard-border border-t-0 border-l-0 border-r-0 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1
              id="paycheck-wizard-title"
              className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight"
            >
              {stepTitle}
            </h1>

            {/* Close Button */}
            <ModalCloseButton
              onClick={handleClose}
              ariaLabel="Close paycheck wizard"
              variant="outlineRed"
            />
          </div>

          {/* Step Indicator - "Hard Lines" aesthetic: thick, bold indicators */}
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                {/* Step Circle */}
                <div
                  className={`
                    flex items-center justify-center
                    w-10 h-10
                    rounded-full
                    hard-border
                    font-black
                    transition-all
                    ${
                      index === currentStep
                        ? "bg-fuchsia-500 text-white scale-110"
                        : index < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-white text-slate-400"
                    }
                  `}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  aria-current={index === currentStep ? "step" : undefined}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>

                {/* Connector Line */}
                {index < TOTAL_STEPS - 1 && (
                  <div
                    className={`
                      flex-1 h-1
                      transition-all
                      ${index < currentStep ? "bg-green-500" : "bg-slate-300"}
                    `}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content Area - AnimatePresence for smooth transitions */}
        <div className="flex-1 overflow-hidden relative bg-slate-50">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={springTransition}
              className="absolute inset-0 overflow-auto p-6 md:p-8"
            >
              {CurrentStepComponent ? (
                <CurrentStepComponent
                  onNext={nextStep}
                  onBack={previousStep}
                  onFinish={handleFinish}
                />
              ) : (
                <div className="text-center text-slate-600">
                  <p>Step {currentStep + 1} not implemented yet</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer - Navigation Buttons with "Hard Lines" aesthetic */}
        <div className="bg-white hard-border border-b-0 border-l-0 border-r-0 p-6">
          <div className="flex justify-between items-center">
            {/* Back Button */}
            {!isFirstStep && !isLastStep && (
              <button
                onClick={previousStep}
                className="
                  px-6 py-3
                  bg-white text-slate-900
                  hard-border
                  rounded-lg
                  font-bold
                  tracking-wide
                  hover:bg-slate-100
                  focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2
                  transition-all
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                  active:translate-x-[1px] active:translate-y-[1px]
                "
                aria-label="Go back to previous step"
              >
                ← BACK
              </button>
            )}

            {isFirstStep && <div />}

            {/* Continue/Finish Button - Hidden on last step (handled by step component) */}
            {!isLastStep && (
              <button
                onClick={nextStep}
                className="
                  px-8 py-3
                  bg-fuchsia-500 text-white
                  hard-border
                  rounded-lg
                  font-black
                  tracking-wide
                  hover:bg-fuchsia-600
                  focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2
                  transition-all
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  active:translate-x-[2px] active:translate-y-[2px]
                  ml-auto
                "
                aria-label="Continue to next step"
              >
                CONTINUE →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaycheckWizardModal;
