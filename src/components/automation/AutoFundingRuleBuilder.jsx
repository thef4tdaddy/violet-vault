import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Settings,
  Play,
  Calendar,
  Target,
  Percent,
  DollarSign,
  ArrowRight,
  Clock,
  AlertCircle,
  Check,
  Edit3,
} from "lucide-react";
import {
  RULE_TYPES,
  TRIGGER_TYPES,
  CONDITION_TYPES,
  createDefaultRule,
  validateRule,
} from "../../utils/budgeting/autofunding";

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
      setRuleData({
        ...editingRule,
        config: { ...editingRule.config },
      });
    }
  }, [editingRule]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setErrors({});
      setValidationErrors([]);
      if (!editingRule) {
        setRuleData(createDefaultRule());
      }
    }
  }, [isOpen, editingRule]);

  const updateRuleData = (updates) => {
    setRuleData((prev) => ({
      ...prev,
      ...updates,
    }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const updateConfig = (configUpdates) => {
    setRuleData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...configUpdates,
      },
    }));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1:
        if (!ruleData.name.trim()) {
          newErrors.name = "Rule name is required";
        }
        if (!ruleData.type) {
          newErrors.type = "Rule type is required";
        }
        break;

      case 2:
        if (!ruleData.trigger) {
          newErrors.trigger = "Trigger type is required";
        }
        break;

      case 3:
        switch (ruleData.type) {
          case RULE_TYPES.FIXED_AMOUNT:
            if (!ruleData.config.amount || ruleData.config.amount <= 0) {
              newErrors.amount = "Amount must be greater than 0";
            }
            if (!ruleData.config.targetId) {
              newErrors.targetId = "Target envelope is required";
            }
            break;

          case RULE_TYPES.PERCENTAGE:
            if (
              !ruleData.config.percentage ||
              ruleData.config.percentage <= 0
            ) {
              newErrors.percentage = "Percentage must be greater than 0";
            }
            if (ruleData.config.percentage > 100) {
              newErrors.percentage = "Percentage cannot exceed 100%";
            }
            if (!ruleData.config.targetId) {
              newErrors.targetId = "Target envelope is required";
            }
            break;

          case RULE_TYPES.SPLIT_REMAINDER:
            if (
              !ruleData.config.targetIds ||
              ruleData.config.targetIds.length === 0
            ) {
              newErrors.targetIds = "At least one target envelope is required";
            }
            break;

          case RULE_TYPES.PRIORITY_FILL:
            if (!ruleData.config.targetId) {
              newErrors.targetId = "Target envelope is required";
            }
            if (
              !ruleData.config.targetAmount ||
              ruleData.config.targetAmount <= 0
            ) {
              newErrors.targetAmount = "Target amount must be greater than 0";
            }
            break;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    // Validate the rule using our extracted utility
    const validation = validateRule(ruleData);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);

    // Create the rule data to save
    const ruleToSave = editingRule
      ? { ...ruleData, id: editingRule.id, updatedAt: new Date().toISOString() }
      : ruleData;

    onSaveRule(ruleToSave);
    onClose();
  };

  const addCondition = () => {
    const newCondition = {
      id: `condition_${Date.now()}`,
      type: CONDITION_TYPES.UNASSIGNED_ABOVE,
      value: 0,
      envelopeId: null,
    };

    updateConfig({
      conditions: [...ruleData.config.conditions, newCondition],
    });
  };

  const updateCondition = (conditionId, updates) => {
    const updatedConditions = ruleData.config.conditions.map((condition) =>
      condition.id === conditionId ? { ...condition, ...updates } : condition,
    );
    updateConfig({ conditions: updatedConditions });
  };

  const removeCondition = (conditionId) => {
    const filteredConditions = ruleData.config.conditions.filter(
      (condition) => condition.id !== conditionId,
    );
    updateConfig({ conditions: filteredConditions });
  };

  const toggleTargetEnvelope = (envelopeId) => {
    const currentTargets = ruleData.config.targetIds || [];
    const isSelected = currentTargets.includes(envelopeId);

    const newTargets = isSelected
      ? currentTargets.filter((id) => id !== envelopeId)
      : [...currentTargets, envelopeId];

    updateConfig({ targetIds: newTargets });
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
                  {editingRule
                    ? "Edit Auto-Funding Rule"
                    : "Create Auto-Funding Rule"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Step {step} of 4:{" "}
                  {step === 1
                    ? "Rule Type & Name"
                    : step === 2
                      ? "Trigger & Schedule"
                      : step === 3
                        ? "Configuration"
                        : "Review & Save"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNum === step
                        ? "bg-blue-600 text-white"
                        : stepNum < step
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step - 1) * 33.33}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={ruleData.name}
                    onChange={(e) => updateRuleData({ name: e.target.value })}
                    placeholder="e.g., Monthly Rent Funding"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-300 ring-2 ring-red-200" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={ruleData.description}
                    onChange={(e) =>
                      updateRuleData({ description: e.target.value })
                    }
                    placeholder="Describe what this rule does and when it should run..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rule Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        type: RULE_TYPES.FIXED_AMOUNT,
                        icon: DollarSign,
                        title: "Fixed Amount",
                        description:
                          "Move a specific dollar amount to an envelope",
                      },
                      {
                        type: RULE_TYPES.PERCENTAGE,
                        icon: Percent,
                        title: "Percentage",
                        description: "Move a percentage of available funds",
                      },
                      {
                        type: RULE_TYPES.SPLIT_REMAINDER,
                        icon: Target,
                        title: "Split Remainder",
                        description:
                          "Divide remaining funds across multiple envelopes",
                      },
                      {
                        type: RULE_TYPES.PRIORITY_FILL,
                        icon: ArrowRight,
                        title: "Priority Fill",
                        description:
                          "Fill envelope to target amount before others",
                      },
                    ].map(({ type, icon: Icon, title, description }) => (
                      <div
                        key={type}
                        onClick={() => updateRuleData({ type })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ruleData.type === type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`h-5 w-5 mt-0.5 ${
                              ruleData.type === type
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                          <div>
                            <h4
                              className={`font-medium ${
                                ruleData.type === type
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {title}
                            </h4>
                            <p
                              className={`text-sm mt-1 ${
                                ruleData.type === type
                                  ? "text-blue-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.type}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    When should this rule run? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        type: TRIGGER_TYPES.MANUAL,
                        icon: Play,
                        title: "Manual",
                        description: 'Run when you click "Execute Rules"',
                      },
                      {
                        type: TRIGGER_TYPES.INCOME_DETECTED,
                        icon: Plus,
                        title: "Income Detected",
                        description: "Run when new income is added",
                      },
                      {
                        type: TRIGGER_TYPES.MONTHLY,
                        icon: Calendar,
                        title: "Monthly",
                        description: "Run automatically every month",
                      },
                      {
                        type: TRIGGER_TYPES.BIWEEKLY,
                        icon: Clock,
                        title: "Biweekly",
                        description: "Run automatically every two weeks",
                      },
                    ].map(({ type, icon: Icon, title, description }) => (
                      <div
                        key={type}
                        onClick={() => updateRuleData({ trigger: type })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          ruleData.trigger === type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`h-5 w-5 mt-0.5 ${
                              ruleData.trigger === type
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                          <div>
                            <h4
                              className={`font-medium ${
                                ruleData.trigger === type
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {title}
                            </h4>
                            <p
                              className={`text-sm mt-1 ${
                                ruleData.trigger === type
                                  ? "text-blue-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority (Lower = Higher Priority)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={ruleData.priority}
                    onChange={(e) =>
                      updateRuleData({
                        priority: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rules with lower priority numbers execute first
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {ruleData.type === RULE_TYPES.FIXED_AMOUNT && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Transfer *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ruleData.config.amount}
                          onChange={(e) =>
                            updateConfig({
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.amount
                              ? "border-red-300 ring-2 ring-red-200"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Envelope *
                      </label>
                      <select
                        value={ruleData.config.targetId || ""}
                        onChange={(e) =>
                          updateConfig({ targetId: e.target.value })
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.targetId
                            ? "border-red-300 ring-2 ring-red-200"
                            : ""
                        }`}
                      >
                        <option value="">Select envelope...</option>
                        {envelopes.map((envelope) => (
                          <option key={envelope.id} value={envelope.id}>
                            {envelope.name} ($
                            {envelope.currentBalance?.toFixed(2) || "0.00"})
                          </option>
                        ))}
                      </select>
                      {errors.targetId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.targetId}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {ruleData.type === RULE_TYPES.PERCENTAGE && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Percentage to Transfer *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={ruleData.config.percentage}
                          onChange={(e) =>
                            updateConfig({
                              percentage: parseFloat(e.target.value) || 0,
                            })
                          }
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.percentage
                              ? "border-red-300 ring-2 ring-red-200"
                              : ""
                          }`}
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                      {errors.percentage && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.percentage}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Envelope *
                      </label>
                      <select
                        value={ruleData.config.targetId || ""}
                        onChange={(e) =>
                          updateConfig({ targetId: e.target.value })
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.targetId
                            ? "border-red-300 ring-2 ring-red-200"
                            : ""
                        }`}
                      >
                        <option value="">Select envelope...</option>
                        {envelopes.map((envelope) => (
                          <option key={envelope.id} value={envelope.id}>
                            {envelope.name} ($
                            {envelope.currentBalance?.toFixed(2) || "0.00"})
                          </option>
                        ))}
                      </select>
                      {errors.targetId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.targetId}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {ruleData.type === RULE_TYPES.SPLIT_REMAINDER && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Envelopes *
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select envelopes to split remaining funds evenly between
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {envelopes.map((envelope) => (
                        <div
                          key={envelope.id}
                          onClick={() => toggleTargetEnvelope(envelope.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            ruleData.config.targetIds?.includes(envelope.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {envelope.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Balance: $
                                {envelope.currentBalance?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            {ruleData.config.targetIds?.includes(
                              envelope.id,
                            ) && <Check className="h-5 w-5 text-blue-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.targetIds && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.targetIds}
                      </p>
                    )}
                  </div>
                )}

                {ruleData.type === RULE_TYPES.PRIORITY_FILL && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Envelope *
                      </label>
                      <select
                        value={ruleData.config.targetId || ""}
                        onChange={(e) =>
                          updateConfig({ targetId: e.target.value })
                        }
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.targetId
                            ? "border-red-300 ring-2 ring-red-200"
                            : ""
                        }`}
                      >
                        <option value="">Select envelope...</option>
                        {envelopes.map((envelope) => (
                          <option key={envelope.id} value={envelope.id}>
                            {envelope.name} ($
                            {envelope.currentBalance?.toFixed(2) || "0.00"})
                          </option>
                        ))}
                      </select>
                      {errors.targetId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.targetId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Amount *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ruleData.config.targetAmount || 0}
                          onChange={(e) =>
                            updateConfig({
                              targetAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.targetAmount
                              ? "border-red-300 ring-2 ring-red-200"
                              : ""
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Fill envelope to this amount before funding other rules
                      </p>
                      {errors.targetAmount && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.targetAmount}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Rule Summary
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Name:</span>
                      <span className="font-medium text-blue-900">
                        {ruleData.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-blue-700">Type:</span>
                      <span className="font-medium text-blue-900">
                        {ruleData.type === RULE_TYPES.FIXED_AMOUNT &&
                          "Fixed Amount"}
                        {ruleData.type === RULE_TYPES.PERCENTAGE &&
                          "Percentage"}
                        {ruleData.type === RULE_TYPES.SPLIT_REMAINDER &&
                          "Split Remainder"}
                        {ruleData.type === RULE_TYPES.PRIORITY_FILL &&
                          "Priority Fill"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-blue-700">Trigger:</span>
                      <span className="font-medium text-blue-900">
                        {ruleData.trigger === TRIGGER_TYPES.MANUAL && "Manual"}
                        {ruleData.trigger === TRIGGER_TYPES.INCOME_DETECTED &&
                          "Income Detected"}
                        {ruleData.trigger === TRIGGER_TYPES.MONTHLY &&
                          "Monthly"}
                        {ruleData.trigger === TRIGGER_TYPES.BIWEEKLY &&
                          "Biweekly"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-blue-700">Priority:</span>
                      <span className="font-medium text-blue-900">
                        {ruleData.priority}
                      </span>
                    </div>

                    {ruleData.config.amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Amount:</span>
                        <span className="font-medium text-blue-900">
                          ${ruleData.config.amount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {ruleData.config.percentage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Percentage:</span>
                        <span className="font-medium text-blue-900">
                          {ruleData.config.percentage}%
                        </span>
                      </div>
                    )}

                    {ruleData.config.targetId && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Target:</span>
                        <span className="font-medium text-blue-900">
                          {envelopes.find(
                            (e) => e.id === ruleData.config.targetId,
                          )?.name || "Unknown"}
                        </span>
                      </div>
                    )}

                    {ruleData.config.targetIds &&
                      ruleData.config.targetIds.length > 0 && (
                        <div>
                          <span className="text-blue-700">Targets:</span>
                          <div className="mt-1">
                            {ruleData.config.targetIds.map((id) => {
                              const envelope = envelopes.find(
                                (e) => e.id === id,
                              );
                              return envelope ? (
                                <span
                                  key={id}
                                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                                >
                                  {envelope.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  {ruleData.description && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <span className="text-blue-700 text-sm">
                        Description:
                      </span>
                      <p className="text-blue-900 text-sm mt-1">
                        {ruleData.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
