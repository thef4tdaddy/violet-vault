import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding";
import { createDefaultRule, validateRule } from "@/utils/budgeting/autofunding";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { Button } from "@/components/ui";
import StepNavigation from "./components/StepNavigation";
import RuleTypeStep from "./steps/RuleTypeStep";
import TriggerScheduleStep from "./steps/TriggerScheduleStep";
import RuleConfigurationStep from "./steps/RuleConfigurationStep";
import ReviewStep from "./steps/ReviewStep";
import logger from "@/utils/common/logger";

type EnvelopeOption = {
  id: string | number;
  name: string;
  category?: string;
  currentBalance?: number;
};

interface AutoFundingRuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: unknown[];
  onSaveRule: (rule: AutoFundingRule) => Promise<void> | void;
  editingRule?: AutoFundingRule | null;
}

type RuleValidationErrors = Record<string, string>;

const mapValidationErrors = (messages: string[]): RuleValidationErrors => {
  if (messages.length === 0) {
    return {};
  }

  const mapped: RuleValidationErrors = {};

  messages.forEach((message) => {
    const lower = message.toLowerCase();

    if (lower.includes("name")) {
      mapped.name = message;
      return;
    }

    if (lower.includes("type") && !lower.includes("target")) {
      mapped.type = message;
      return;
    }

    if (lower.includes("trigger")) {
      mapped.trigger = message;
      return;
    }

    if (lower.includes("amount")) {
      mapped.amount = message;
      return;
    }

    if (lower.includes("percentage")) {
      mapped.percentage = message;
      return;
    }

    if (lower.includes("target envelope")) {
      mapped.targetId = message;
      return;
    }

    if (lower.includes("target envelope") || lower.includes("target envelopes")) {
      mapped.targetIds = message;
      return;
    }

    mapped.general = mapped.general
      ? `${mapped.general}\n${message}`
      : message;
  });

  return mapped;
};

const cloneRule = (rule: AutoFundingRule): AutoFundingRule => ({
  ...rule,
  config: {
    ...rule.config,
    targetIds: [...(rule.config?.targetIds ?? [])],
    conditions: [...(rule.config?.conditions ?? [])],
    scheduleConfig: { ...(rule.config?.scheduleConfig ?? {}) },
  },
});

const buildDefaultRule = (): AutoFundingRule =>
  cloneRule(createDefaultRule() as AutoFundingRule);

interface RuleBuilderHeaderProps {
  editingRule: AutoFundingRule | null;
  step: number;
  onStepChange: (nextStep: number) => void;
  onClose: () => void;
}

const RuleBuilderHeader: React.FC<RuleBuilderHeaderProps> = ({
  editingRule,
  step,
  onStepChange,
  onClose,
}) => (
  <div className="border-b border-gray-200 px-6 py-5">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {editingRule ? "Edit Auto-Funding Rule" : "Create Auto-Funding Rule"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure how funds should move automatically between envelopes.
        </p>
      </div>
      <ModalCloseButton onClick={onClose} />
    </div>
    <div className="mt-4">
      <StepNavigation currentStep={step} onStepChange={onStepChange} />
    </div>
  </div>
);

interface RuleBuilderStepContentProps {
  step: number;
  ruleData: AutoFundingRule;
  envelopes: EnvelopeOption[];
  errors: RuleValidationErrors;
  updateRuleData: (updates: Partial<AutoFundingRule>) => void;
  updateConfig: (configUpdates: Partial<AutoFundingRule["config"]>) => void;
  toggleTargetEnvelope: (envelopeId: string) => void;
}

const RuleBuilderStepContent: React.FC<RuleBuilderStepContentProps> = ({
  step,
  ruleData,
  envelopes,
  errors,
  updateRuleData,
  updateConfig,
  toggleTargetEnvelope,
}) => {
  if (step === 1) {
    return (
      <RuleTypeStep
        ruleData={ruleData}
        updateRuleData={updateRuleData}
        errors={errors}
      />
    );
  }

  if (step === 2) {
    return (
      <TriggerScheduleStep
        ruleData={ruleData}
        updateRuleData={updateRuleData}
      />
    );
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

interface RuleBuilderFooterProps {
  step: number;
  isSaving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}

const RuleBuilderFooter: React.FC<RuleBuilderFooterProps> = ({
  step,
  isSaving,
  onPrevious,
  onNext,
  onSave,
}) => (
  <div className="border-t border-gray-200 px-6 py-5">
    <div className="flex justify-between">
      <Button
        onClick={onPrevious}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {step > 1 ? "Previous" : "Cancel"}
      </Button>

      <div className="flex gap-3">
        {step < 4 ? (
          <Button
            onClick={onNext}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Rule"}
          </Button>
        )}
      </div>
    </div>
  </div>
);

interface UseRuleBuilderParams {
  isOpen: boolean;
  editingRule: AutoFundingRule | null;
  onClose: () => void;
  onSaveRule: (rule: AutoFundingRule) => Promise<void> | void;
}

interface UseRuleBuilderReturn {
  step: number;
  ruleData: AutoFundingRule;
  errors: RuleValidationErrors;
  isSaving: boolean;
  handleStepChange: (step: number) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleUpdateRuleData: (updates: Partial<AutoFundingRule>) => void;
  handleUpdateConfig: (updates: Partial<AutoFundingRule["config"]>) => void;
  handleToggleTargetEnvelope: (envelopeId: string) => void;
  handleSave: () => Promise<void>;
}

const useRuleBuilder = ({
  isOpen,
  editingRule,
  onClose,
  onSaveRule,
}: UseRuleBuilderParams): UseRuleBuilderReturn => {
  const [step, setStep] = useState(1);
  const [ruleData, setRuleData] = useState<AutoFundingRule>(() =>
    editingRule ? cloneRule(editingRule) : buildDefaultRule()
  );
  const [errors, setErrors] = useState<RuleValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRuleData(editingRule ? cloneRule(editingRule) : buildDefaultRule());
      setErrors({});
    }
  }, [isOpen, editingRule]);

  const handleUpdateRuleData = useCallback(
    (updates: Partial<AutoFundingRule>) => {
      setRuleData((prev) => ({
        ...prev,
        ...updates,
        config: updates.config
          ? { ...prev.config, ...updates.config }
          : { ...prev.config },
      }));
    },
    []
  );

  const handleUpdateConfig = useCallback(
    (configUpdates: Partial<AutoFundingRule["config"]>) => {
      setRuleData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          ...configUpdates,
        },
      }));
    },
    []
  );

  const handleToggleTargetEnvelope = useCallback((envelopeId: string) => {
    setRuleData((prev) => {
      const currentIds = new Set(
        prev.config?.targetIds?.map((id) => id.toString()) ?? []
      );
      if (currentIds.has(envelopeId)) {
        currentIds.delete(envelopeId);
      } else {
        currentIds.add(envelopeId);
      }

      return {
        ...prev,
        config: {
          ...prev.config,
          targetIds: Array.from(currentIds),
        },
      };
    });
  }, []);

  const validationErrors = useMemo(() => validateRule(ruleData), [ruleData]);

  const canAdvance = useCallback(() => {
    if (step < 4) {
      if (!ruleData.name?.trim()) {
        setErrors({ name: "Rule name is required" });
        return false;
      }

      if (!ruleData.type) {
        setErrors({ type: "Select a rule type before continuing" });
        return false;
      }

      if (!ruleData.trigger) {
        setErrors({ trigger: "Select when this rule should run" });
        return false;
      }

      setErrors({});
      return true;
    }

    if (!validationErrors.isValid) {
      setErrors(mapValidationErrors(validationErrors.errors));
      return false;
    }

    setErrors({});
    return true;
  }, [ruleData, step, validationErrors]);

  const handleNextStep = useCallback(() => {
    if (!canAdvance()) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  }, [canAdvance]);

  const handlePreviousStep = useCallback(() => {
    if (step === 1) {
      onClose();
      return;
    }
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }, [onClose, step]);

  const handleStepChange = useCallback(
    (targetStep: number) => {
      if (targetStep < step) {
        setStep(targetStep);
        setErrors({});
        return;
      }

      if (targetStep === step) {
        return;
      }

      if (!canAdvance()) {
        return;
      }

      setStep(targetStep);
    },
    [canAdvance, step]
  );

  const handleSave = useCallback(async () => {
    if (!validationErrors.isValid) {
      setErrors(mapValidationErrors(validationErrors.errors));
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRule(ruleData);
      setErrors({});
      onClose();
    } catch (error) {
      logger.error("Failed to save auto-funding rule", error);
      setErrors({ general: "Unable to save rule. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [onClose, onSaveRule, ruleData, validationErrors]);

  return {
    step,
    ruleData,
    errors,
    isSaving,
    handleStepChange,
    handleNextStep,
    handlePreviousStep,
    handleUpdateRuleData,
    handleUpdateConfig,
    handleToggleTargetEnvelope,
    handleSave,
  };
};

const AutoFundingRuleBuilder: React.FC<AutoFundingRuleBuilderProps> = ({
  isOpen,
  onClose,
  envelopes,
  onSaveRule,
  editingRule = null,
}) => {
  const {
    step,
    ruleData,
    errors,
    isSaving,
    handleStepChange,
    handleNextStep,
    handlePreviousStep,
    handleUpdateRuleData,
    handleUpdateConfig,
    handleToggleTargetEnvelope,
    handleSave,
  } = useRuleBuilder({ isOpen, editingRule, onClose, onSaveRule });
  const normalizedEnvelopes = useMemo<EnvelopeOption[]>(() => {
    if (!Array.isArray(envelopes)) {
      return [];
    }

    return envelopes
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as {
          id?: unknown;
          name?: unknown;
          category?: unknown;
          currentBalance?: unknown;
        };

        const idValue =
          typeof record.id === "string" || typeof record.id === "number"
            ? (record.id as string | number)
            : undefined;
        const nameValue =
          typeof record.name === "string" && record.name.trim().length > 0
            ? record.name
            : undefined;

        if (idValue === undefined || nameValue === undefined) {
          return null;
        }

        const envelope: EnvelopeOption = {
          id: idValue,
          name: nameValue,
        };

        if (typeof record.category === "string" && record.category.trim().length > 0) {
          envelope.category = record.category;
        }

        if (typeof record.currentBalance === "number" && Number.isFinite(record.currentBalance)) {
          envelope.currentBalance = record.currentBalance;
        }

        return envelope;
      })
      .filter((env): env is EnvelopeOption => env !== null);
  }, [envelopes]);
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl border-2 border-black shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <RuleBuilderHeader
          editingRule={editingRule}
          step={step}
          onStepChange={handleStepChange}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <RuleBuilderStepContent
            step={step}
            ruleData={ruleData}
            envelopes={normalizedEnvelopes}
            errors={errors}
            updateRuleData={handleUpdateRuleData}
            updateConfig={handleUpdateConfig}
            toggleTargetEnvelope={handleToggleTargetEnvelope}
          />

          {errors.general && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}
        </div>

        <RuleBuilderFooter
          step={step}
          isSaving={isSaving}
          onPrevious={handlePreviousStep}
          onNext={handleNextStep}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default AutoFundingRuleBuilder;
