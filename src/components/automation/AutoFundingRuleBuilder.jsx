import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { createDefaultRule, validateRule } from "../../utils/budgeting/autofunding";
import RuleTypeStep from "./steps/RuleTypeStep";
import TriggerScheduleStep from "./steps/TriggerScheduleStep";
import RuleConfigurationStep from "./steps/RuleConfigurationStep";
import ReviewStep from "./steps/ReviewStep";
import StepNavigation from "./components/StepNavigation";

const AutoFundingRuleBuilder = ({
  isOpen,
  onClose,
  envelopes = [],
  onSaveRule,
  editingRule = null,
}) => {
  const [step, setStep] = useState(1);
  const [ruleData, setRuleData] = useState(() => createDefaultRule());
  const [validationErrors, setValidationErrors] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize with editing rule data
  useEffect(() => {
    if (editingRule) {
      setRuleData({ ...editingRule, config: { ...editingRule.config } });
    }
  }, [editingRule]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      if (!editingRule) {
        setRuleData(createDefaultRule());
      }
      setErrors({});
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
    const validation = validateRule(ruleData);
    setErrors(validation.isValid ? {} : { general: validation.errors });
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
    const validation = validateRule(ruleData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    const ruleToSave = editingRule
      ? { ...ruleData, id: editingRule.id, updatedAt: new Date().toISOString() }
      : ruleData;
    onSaveRule(ruleToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingRule ? "Edit Auto-Funding Rule" : "Create Auto-Funding Rule"}
                </h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-6 w-6" />
              </button>
            </div>
            <StepNavigation currentStep={step} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <RuleTypeStep ruleData={ruleData} updateRuleData={updateRuleData} errors={errors} />
            )}
            {step === 2 && (
              <TriggerScheduleStep ruleData={ruleData} updateRuleData={updateRuleData} />
            )}
            {step === 3 && (
              <RuleConfigurationStep
                ruleData={ruleData}
                updateConfig={updateConfig}
                envelopes={envelopes}
                toggleTargetEnvelope={toggleTargetEnvelope}
                errors={errors}
              />
            )}
            {step === 4 && <ReviewStep ruleData={ruleData} envelopes={envelopes} />}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={step > 1 ? prevStep : onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {step > 1 ? "Previous" : "Cancel"}
              </button>

              <div className="flex gap-3">
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {editingRule ? "Update Rule" : "Create Rule"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoFundingRuleBuilder;
