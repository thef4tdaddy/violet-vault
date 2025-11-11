import React, { useState, useEffect } from "react";
import { getIcon } from "../../utils";
import {
  createDefaultRule,
  validateRule,
  type AutoFundingRule,
} from "../../utils/budgeting/autofunding";
import { Button } from "@/components/ui";
import { ModalCloseButton } from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
import { RuleTypeStep } from "./steps/RuleTypeStep";
import { TriggerScheduleStep } from "./steps/TriggerScheduleStep";
import { RuleConfigurationStep } from "./steps/RuleConfigurationStep";
import { ReviewStep } from "./steps/ReviewStep";
import { StepNavigation } from "./components/StepNavigation";

// Type definitions for the component
interface RuleBuilderModalProps {
  editingRule?: AutoFundingRule | null;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  handleSave: () => void;
  envelopes: Array<{
    id: string;
    name: string;
    category: string;
    currentBalance?: number;
  }>;
  toggleTargetEnvelope: (envelopeId: string) => void;
  errors: Record<string, string>;
  prevStep: () => number;
  nextStep: () => number;
}

// Modal footer navigation component
const ModalFooter = ({ 
  step, 
  prevStep, 
  onClose, 
  nextStep, 
  handleSave, 
  editingRule 
}: RuleBuilderModalProps) => (
  <div className="p-6 border-t border-gray-200">
    <div className="flex justify-between">
      <Button onClick={step > 1 ? prevStep : onClose} variant="secondary">
        {step > 1 ? "Previous" : "Cancel"}
      </Button>

      <div className="flex gap-3">
        {step < 4 ? (
          <Button onClick={nextStep} variant="primary">
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            variant="primary"
            color="green"
            className="flex items-center gap-2"
          >
            {React.createElement(getIcon("Check"), { className: "h-4 w-4" })}
            {editingRule ? "Update Rule" : "Create Rule"}
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Step content renderer
const StepContent = ({ 
  step, 
  ruleData, 
  updateRuleData, 
  updateConfig, 
  envelopes, 
  toggleTargetEnvelope, 
  errors 
}: RuleBuilderModalProps) => {
  if (step === 1) {
    return <RuleTypeStep ruleData={ruleData} updateRuleData={updateRuleData} errors={errors} />;
  }
  if (step === 2) {
    return <TriggerScheduleStep ruleData={ruleData} updateRuleData={updateRuleData} errors={errors} />;
  }
  if (step === 3) {
    return (
      <RuleConfigurationStep
        ruleData={ruleData}
        updateConfig={updateConfig}
        envelopes={envelopes}
        toggleTargetEnvelope={toggleTargetEnvelope}
        errors={errors}
      />
    );
  }
  if (step === 4) {
    return <ReviewStep ruleData={ruleData} envelopes={envelopes} />;
  }
  return null;
};

// Main modal wrapper
const RuleBuilderModal = ({
  editingRule,
  onClose,
  step,
  setStep,
  ruleData,
  updateRuleData,
  updateConfig,
  envelopes,
  toggleTargetEnvelope,
  errors,
  prevStep,
  nextStep,
  handleSave,
}: RuleBuilderModalProps) => {
  const modalRef = useModalAutoScroll(true);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingRule ? "Edit Auto-Funding Rule" : "Create Auto-Funding Rule"}
          </h2>
          <ModalCloseButton onClose={onClose} />
        </div>

        <StepContent
          step={step}
          ruleData={ruleData}
          updateRuleData={updateRuleData}
          updateConfig={updateConfig}
          envelopes={envelopes}
          toggleTargetEnvelope={toggleTargetEnvelope}
          errors={errors}
          prevStep={prevStep}
          nextStep={nextStep}
          handleSave={handleSave}
        />
      </div>
    </div>
  );
};

const AutoFundingRuleBuilder = ({
  isOpen,
  onClose,
  envelopes = [],
  onSaveRule,
  editingRule = null,
}) => {
  const [step, setStep] = useState(1);
  const [ruleData, setRuleData] = useState(() => createDefaultRule());
  const [_validationErrors, _setValidationErrors] = useState([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Initialize with editing rule data or reset when modal closes
  // Synchronize modal state when open/close status or editing rule changes
  useEffect(() => {
    if (!isOpen) {
      // Batch state updates when closing to synchronize modal state
      setStep(1);
      setRuleData(
        editingRule ? { ...editingRule, config: { ...editingRule.config } } : createDefaultRule()
      );
      setErrors({});
    } else if (editingRule) {
      // Initialize with editing rule when opening with existing data
      setRuleData({ ...editingRule, config: { ...editingRule.config } });
    }
  }, [isOpen, editingRule]);

  const updateRuleData = (updates) => {
    setRuleData((prev) => ({ ...prev, ...updates }));
    // Clear related errors when data changes
    if (updates.name !== undefined && errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    if (updates.type !== undefined && errors.type) {
      setErrors((prev) => ({ ...prev, type: undefined }));
    }
  };

  const updateConfig = (updates) => {
    setRuleData((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
    // Clear related errors
    Object.keys(updates).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    });
  };

  const toggleTargetEnvelope = (envelopeId) => {
    const currentTargets = ruleData.config.targetIds || [];
    const isSelected = currentTargets.includes(envelopeId);
    const newTargets = isSelected
      ? currentTargets.filter((id) => id !== envelopeId)
      : [...currentTargets, envelopeId];
    updateConfig({ targetIds: newTargets });
  };

  const validateCurrentStep = () => {
    // Step validation logic extracted to keep component small
    const validation = validateRule(ruleData as Partial<AutoFundingRule>);
    setErrors(validation.isValid ? {} : { general: validation.errors.join(", ") });
    return validation.isValid;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    const validation = validateRule(ruleData as Partial<AutoFundingRule>);
    if (!validation.isValid) {
      _setValidationErrors(validation.errors);
      return;
    }
    _setValidationErrors([]);
    const ruleToSave = editingRule
      ? { ...ruleData, id: editingRule.id, updatedAt: new Date().toISOString() }
      : ruleData;
    onSaveRule(ruleToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <RuleBuilderModal
      editingRule={editingRule}
      onClose={onClose}
      step={step}
      setStep={setStep}
      ruleData={ruleData}
      updateRuleData={updateRuleData}
      updateConfig={updateConfig}
      envelopes={envelopes}
      toggleTargetEnvelope={toggleTargetEnvelope}
      errors={errors}
      prevStep={prevStep}
      nextStep={nextStep}
      handleSave={handleSave}
    />
  );
};

export default AutoFundingRuleBuilder;
