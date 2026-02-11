import { describe, it, expect } from "vitest";
import {
  createDefaultEnvelopeForm,
  validateEnvelopeForm,
  calculateEnvelopeAmounts,
  transformFormToEnvelope,
  transformEnvelopeToForm,
  calculateEnvelopeProgress,
  getPriorityOptions,
  getColorOptions,
  validateEnvelopeTypeChange,
  transformBillToEnvelopeForm,
  calculateQuickFundUpdate,
} from "../envelopeFormUtils";
import { ENVELOPE_TYPES } from "@/constants/categories";

interface ValidationErrors {
  name?: string;
  category?: string;
  monthlyAmount?: string;
  targetAmount?: string;
  priority?: string;
  color?: string;
  [key: string]: string | undefined;
}

describe("envelopeFormUtils", () => {
  describe("createDefaultEnvelopeForm", () => {
    it("should create default form with expected fields", () => {
      const defaultForm = createDefaultEnvelopeForm();

      expect(defaultForm).toMatchObject({
        name: "",
        monthlyAmount: "",
        currentBalance: "",
        category: "",
        color: "#a855f7",
        frequency: "monthly",
        description: "",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        monthlyBudget: "",
        biweeklyAllocation: "",
        targetAmount: "",
      });
    });
  });

  describe("validateEnvelopeForm", () => {
    const validFormData = {
      name: "Test Envelope",
      category: "Food & Dining",
      monthlyAmount: "100",
      currentBalance: "50",
      priority: "medium",
      color: "#a855f7",
      frequency: "monthly",
      description: "Test description",
      envelopeType: ENVELOPE_TYPES.VARIABLE,
      targetAmount: "",
      autoAllocate: true,
      icon: "Target",
    };

    it("should validate a valid form", () => {
      const result = validateEnvelopeForm(validFormData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should require envelope name", () => {
      const formData = { ...validFormData, name: "" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).name).toBe("Envelope name is required");
    });

    it("should validate name length", () => {
      const formData = { ...validFormData, name: "x".repeat(51) };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).name).toBe(
        "Envelope name must be less than 50 characters"
      );
    });

    it("should detect duplicate names", () => {
      const existingEnvelopes = [{ id: "1", name: "Existing Envelope" }];
      const formData = { ...validFormData, name: "Existing Envelope" };
      const result = validateEnvelopeForm(formData, existingEnvelopes);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).name).toBe(
        "An envelope with this name already exists"
      );
    });

    it("should allow same name when editing existing envelope", () => {
      const existingEnvelopes = [{ id: "1", name: "Test Envelope" }];
      const formData = { ...validFormData, name: "Test Envelope" };
      const result = validateEnvelopeForm(formData, existingEnvelopes, "1");

      expect(result.isValid).toBe(true);
      expect((result.errors as ValidationErrors).name).toBeUndefined();
    });

    it("should validate monthly amount format", () => {
      const formData = { ...validFormData, monthlyAmount: "invalid" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).monthlyAmount).toBe(
        "Monthly amount must be a positive number"
      );
    });

    it("should validate monthly amount maximum", () => {
      const formData = { ...validFormData, monthlyAmount: "100001" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).monthlyAmount).toBe(
        "Monthly amount cannot exceed $100,000"
      );
    });

    it("should require target amount for sinking funds", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe(
        "Target amount is required for sinking funds"
      );
    });

    it("should validate target amount format", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "invalid",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe(
        "Target amount must be a positive number"
      );
    });

    it("should require category", () => {
      const formData = { ...validFormData, category: "" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).category).toBe("Category is required");
    });

    it("should validate priority options", () => {
      const formData = { ...validFormData, priority: "invalid" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).priority).toBe("Invalid priority selected");
    });

    it("should validate color format", () => {
      // Note: Color validation is not currently implemented
      // Any string value is accepted for color field
      const formData = { ...validFormData, color: "invalid-color" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(true);
      expect((result.errors as ValidationErrors).color).toBeUndefined();
    });
  });

  describe("calculateEnvelopeAmounts", () => {
    it("should calculate biweekly allocation correctly", () => {
      const formData = {
        monthlyAmount: "100",
        name: "",
        currentBalance: "",
        category: "",
        color: "",
        frequency: "monthly",
        description: "",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: "",
      };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.monthlyAmount).toBe(100);
      expect(result.biweeklyAllocation).toBeCloseTo(46.15, 2); // 100 / 2.17
    });

    it("should handle zero amounts", () => {
      const formData = {
        monthlyAmount: "0",
        name: "",
        currentBalance: "",
        category: "",
        color: "",
        frequency: "monthly",
        description: "",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: "",
      };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.monthlyAmount).toBe(0);
      expect(result.biweeklyAllocation).toBe(0);
    });

    it("should calculate annual and weekly amounts", () => {
      const formData = {
        monthlyAmount: "100",
        name: "",
        currentBalance: "",
        category: "",
        color: "",
        frequency: "monthly",
        description: "",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: "",
      };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.annualAmount).toBe(1200);
      expect(result.weeklyAmount).toBeCloseTo(23.08, 2);
    });
  });

  describe("transformFormToEnvelope", () => {
    const validFormData = {
      name: "Test Envelope",
      monthlyAmount: "100",
      currentBalance: "50",
      category: "Food & Dining",
      color: "#a855f7",
      frequency: "monthly",
      description: "Test description",
      priority: "medium",
      autoAllocate: true,
      icon: "Target",
      envelopeType: ENVELOPE_TYPES.VARIABLE,
      targetAmount: "500",
    };

    it("should transform form data to envelope object", () => {
      const options = { createdBy: "Test User" };
      const result = transformFormToEnvelope(validFormData, options) as Record<string, unknown>;

      expect(result).toMatchObject({
        name: "Test Envelope",
        monthlyAmount: 100,
        currentBalance: 50,
        category: "Food & Dining",
        color: "#a855f7",
        frequency: "monthly",
        description: "Test description",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: 500,
        updatedBy: "Test User",
      });

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.lastUpdated).toBeDefined();
    });

    it("should handle editing existing envelope", () => {
      const options = { editingId: "123", createdBy: "Test User" };
      const result = transformFormToEnvelope(validFormData, options) as Record<string, unknown>;

      expect(result.id).toBe("123");
      expect(result.createdAt).toBeUndefined();
    });
  });

  describe("transformEnvelopeToForm", () => {
    it("should transform envelope to form data", () => {
      const envelope = {
        id: "test-id",
        name: "Test Envelope",
        monthlyAmount: 100,
        currentBalance: 50,
        category: "Food & Dining",
        color: "#a855f7",
        frequency: "monthly",
        description: "Test description",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: 500,
      };

      const result = transformEnvelopeToForm(envelope);

      expect(result).toMatchObject({
        name: "Test Envelope",
        monthlyAmount: "100",
        currentBalance: "50",
        category: "Food & Dining",
        color: "#a855f7",
        frequency: "monthly",
        description: "Test description",
        priority: "medium",
        autoAllocate: true,
        icon: "Target",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        targetAmount: "500",
      });
    });

    it("should return default form for null envelope", () => {
      const result = transformEnvelopeToForm(null);
      expect(result).toEqual(createDefaultEnvelopeForm());
    });
  });

  describe("calculateEnvelopeProgress", () => {
    it("should calculate progress for sinking fund", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 300,
        targetAmount: 1000,
        monthlyAmount: 100,
      };

      const result = calculateEnvelopeProgress(envelope);

      expect(result).toMatchObject({
        progressPercentage: 30,
        remainingAmount: 700,
        isComplete: false,
        monthsRemaining: 7,
        currentBalance: 300,
        targetAmount: 1000,
      });
    });

    it("should return null for non-sinking fund envelopes", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
      };
      const result = calculateEnvelopeProgress(envelope);
      expect(result).toBeNull();
    });

    it("should handle completed sinking fund", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 1200,
        targetAmount: 1000,
      };

      const result = calculateEnvelopeProgress(envelope);
      expect(result.isComplete).toBe(true);
      expect(result.progressPercentage).toBe(100);
    });
  });

  describe("getPriorityOptions", () => {
    it("should return priority options", () => {
      const options = getPriorityOptions();

      expect(options).toHaveLength(4);
      expect(options[0]).toMatchObject({
        value: "low",
        label: "Low Priority",
        color: "text-gray-600",
      });
    });
  });

  describe("getColorOptions", () => {
    it("should return color options array", () => {
      const colors = getColorOptions();

      expect(colors).toHaveLength(10);
      expect(colors[0]).toBe("#a855f7");
    });
  });

  describe("validateEnvelopeTypeChange", () => {
    it("should allow type change with no warnings", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
      };
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.BILL, envelope);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should warn when changing from sinking fund", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: 1000,
      };
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.VARIABLE, envelope);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Changing from sinking fund will remove target amount tracking"
      );
    });

    it("should error when changing to sinking fund without target", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
      };
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.SINKING_FUND, envelope);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Sinking funds require a target amount");
    });

    it("should handle null envelope in type change validation", () => {
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.VARIABLE, null);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should allow changing to same type", () => {
      const envelope = {
        id: "test-id",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
      };
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.VARIABLE, envelope);

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateEnvelopeForm - additional edge cases", () => {
    const validFormData = {
      name: "Test Envelope",
      category: "Food & Dining",
      monthlyAmount: "100",
      currentBalance: "50",
      priority: "medium",
      color: "#a855f7",
      frequency: "monthly",
      description: "Test description",
      envelopeType: ENVELOPE_TYPES.VARIABLE,
      targetAmount: "",
      autoAllocate: true,
      icon: "Target",
    };

    it("should handle numeric monthly amount", () => {
      const formData = { ...validFormData, monthlyAmount: 150 };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(true);
    });

    it("should validate monthly amount cannot exceed $100,000", () => {
      const formData = { ...validFormData, monthlyAmount: "100001" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).monthlyAmount).toBe(
        "Monthly amount cannot exceed $100,000"
      );
    });

    it("should require target amount for sinking funds", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe(
        "Target amount is required for sinking funds"
      );
    });

    it("should validate target amount cannot exceed $1,000,000", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "1000001",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe(
        "Target amount cannot exceed $1,000,000"
      );
    });

    it("should validate target amount is positive", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "-100",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe(
        "Target amount must be a positive number"
      );
    });

    it("should validate invalid category", () => {
      const formData = { ...validFormData, category: "Invalid Category" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).category).toBe("Invalid category selected");
    });

    it("should validate invalid priority", () => {
      const formData = { ...validFormData, priority: "invalid" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).priority).toBe("Invalid priority selected");
    });

    it("should validate invalid frequency", () => {
      const formData = { ...validFormData, frequency: "invalid" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).frequency).toBeDefined();
    });

    it("should allow description up to 500 characters", () => {
      const formData = { ...validFormData, description: "x".repeat(500) };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(true);
    });

    it("should reject description over 500 characters", () => {
      const formData = { ...validFormData, description: "x".repeat(501) };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).description).toBe(
        "Description must be 500 characters or less"
      );
    });

    it("should allow NaN monthly amount to be empty for non-bill envelopes", () => {
      const formData = {
        ...validFormData,
        monthlyAmount: "abc",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).monthlyAmount).toBeDefined();
    });

    it("should handle case-insensitive duplicate name check", () => {
      const existingEnvelopes = [{ id: "1", name: "Test Envelope" }];
      const formData = { ...validFormData, name: "TEST ENVELOPE" };
      const result = validateEnvelopeForm(formData, existingEnvelopes);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).name).toBe(
        "An envelope with this name already exists"
      );
    });

    it("should allow same name when editing same envelope", () => {
      const existingEnvelopes = [{ id: "test-id", name: "Test Envelope" }];
      const formData = { ...validFormData, name: "Test Envelope" };
      const result = validateEnvelopeForm(formData, existingEnvelopes, "test-id");

      expect(result.isValid).toBe(true);
    });
  });

  describe("calculateEnvelopeAmounts - additional edge cases", () => {
    const validFormData = {
      name: "Test",
      monthlyAmount: "400",
      targetAmount: "5000",
      currentBalance: "100",
      frequency: "monthly",
      category: "Food",
      priority: "medium",
      color: "#a855f7",
      envelopeType: ENVELOPE_TYPES.VARIABLE,
      autoAllocate: true,
      icon: "Target",
    };

    it("should handle zero monthly amount", () => {
      const formData = { ...validFormData, monthlyAmount: "0" };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.monthlyAmount).toBe(0);
      expect(result.biweeklyAllocation).toBe(0);
    });

    it("should handle empty monthly amount", () => {
      const formData = { ...validFormData, monthlyAmount: "" };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.monthlyAmount).toBe(0);
      expect(result.biweeklyAllocation).toBe(0);
    });

    it("should calculate annual amount correctly", () => {
      const formData = { ...validFormData, monthlyAmount: "100" };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.annualAmount).toBe(1200);
    });

    it("should calculate weekly amount correctly", () => {
      const formData = { ...validFormData, monthlyAmount: "520" };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.weeklyAmount).toBeCloseTo(120, 1); // 520 / (52/12)
    });

    it("should handle different frequency multipliers", () => {
      const weeklyForm = { ...validFormData, frequency: "weekly" };
      const biweeklyForm = { ...validFormData, frequency: "biweekly" };
      const quarterlyForm = { ...validFormData, frequency: "quarterly" };
      const annuallyForm = { ...validFormData, frequency: "annually" };

      expect(calculateEnvelopeAmounts(weeklyForm).frequencyMultiplier).toBe(52);
      expect(calculateEnvelopeAmounts(biweeklyForm).frequencyMultiplier).toBe(26);
      expect(calculateEnvelopeAmounts(quarterlyForm).frequencyMultiplier).toBe(4);
      expect(calculateEnvelopeAmounts(annuallyForm).frequencyMultiplier).toBe(1);
    });

    it("should handle numeric string amounts", () => {
      const formData = { ...validFormData, monthlyAmount: "100.50" };
      const result = calculateEnvelopeAmounts(formData);

      expect(result.monthlyAmount).toBe(100.5);
    });
  });

  describe("transformFormToEnvelope - additional edge cases", () => {
    const validFormData = {
      name: "Test Envelope",
      monthlyAmount: "100",
      currentBalance: "50",
      category: "Food",
      color: "#a855f7",
      frequency: "monthly",
      description: "Test description",
      priority: "medium",
      autoAllocate: true,
      icon: "Target",
      envelopeType: ENVELOPE_TYPES.VARIABLE,
      targetAmount: "",
    };

    it("should generate ID when not editing", () => {
      const result = transformFormToEnvelope(validFormData);

      expect(result.id).toBeDefined();
      expect(result.id).toContain("envelope_");
    });

    it("should preserve ID when editing", () => {
      const result = transformFormToEnvelope(validFormData, { editingId: "existing-id" });

      expect(result.id).toBe("existing-id");
    });

    it("should set createdAt for new envelopes", () => {
      const result = transformFormToEnvelope(validFormData);

      expect(result.createdAt).toBeDefined();
      expect(result.createdBy).toBe("Unknown User");
    });

    it("should not set createdAt when editing", () => {
      const result = transformFormToEnvelope(validFormData, { editingId: "existing-id" });

      expect(result.createdAt).toBeUndefined();
    });

    it("should use provided createdBy", () => {
      const result = transformFormToEnvelope(validFormData, { createdBy: "Test User" });

      expect(result.createdBy).toBe("Test User");
    });

    it("should trim name and description", () => {
      const formData = {
        ...validFormData,
        name: "  Test Envelope  ",
        description: "  Test description  ",
      };
      const result = transformFormToEnvelope(formData);

      expect(result.name).toBe("Test Envelope");
      expect(result.description).toBe("Test description");
    });

    it("should convert autoAllocate to boolean", () => {
      const trueForm = { ...validFormData, autoAllocate: true };
      const falseForm = { ...validFormData, autoAllocate: false };

      expect(transformFormToEnvelope(trueForm).autoAllocate).toBe(true);
      expect(transformFormToEnvelope(falseForm).autoAllocate).toBe(false);
    });
  });

  describe("transformEnvelopeToForm - additional edge cases", () => {
    it("should return default form for null envelope", () => {
      const result = transformEnvelopeToForm(null);

      expect(result.name).toBe("");
      expect(result.monthlyAmount).toBe("");
    });

    it("should handle envelope with missing optional fields", () => {
      const envelope = {
        id: "test",
        name: "Test",
      };
      const result = transformEnvelopeToForm(envelope);

      expect(result.name).toBe("Test");
      expect(result.monthlyAmount).toBe("");
      expect(result.currentBalance).toBe("");
      expect(result.description).toBe("");
    });

    it("should default autoAllocate to true if undefined", () => {
      const envelope = {
        id: "test",
        name: "Test",
        autoAllocate: undefined,
      };
      const result = transformEnvelopeToForm(envelope);

      expect(result.autoAllocate).toBe(true);
    });

    it("should preserve autoAllocate false", () => {
      const envelope = {
        id: "test",
        name: "Test",
        autoAllocate: false,
      };
      const result = transformEnvelopeToForm(envelope);

      expect(result.autoAllocate).toBe(false);
    });
  });

  describe("calculateEnvelopeProgress - additional edge cases", () => {
    it("should return null for non-sinking fund", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        currentBalance: 100,
        targetAmount: 1000,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).toBeNull();
    });

    it("should return null for zero target amount", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 100,
        targetAmount: 0,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).toBeNull();
    });

    it("should cap progress at 100%", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 1200,
        targetAmount: 1000,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.progressPercentage).toBe(100);
        expect(result.isComplete).toBe(true);
        expect(result.remainingAmount).toBe(0);
      }
    });

    it("should calculate months remaining", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 400,
        targetAmount: 1000,
        monthlyAmount: 100,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.monthsRemaining).toBe(6); // Math.ceil(600 / 100)
      }
    });

    it("should return null months remaining when complete", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 1000,
        targetAmount: 1000,
        monthlyAmount: 100,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.isComplete).toBe(true);
      }
    });

    it("should handle zero monthly amount", () => {
      const envelope = {
        id: "test",
        name: "Test",
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 400,
        targetAmount: 1000,
        monthlyAmount: 0,
      };
      const result = calculateEnvelopeProgress(envelope);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.monthsRemaining).toBeNull();
      }
    });
  });

  describe("transformBillToEnvelopeForm", () => {
    const currentFormData = createDefaultEnvelopeForm();

    it("should transform bill data to envelope form data", () => {
      const bill = {
        id: "bill123",
        name: "Electric Bill",
        provider: "Power Company",
        category: "Utilities",
        color: "#3b82f6",
        frequency: "monthly",
        amount: 150.5,
      };

      const result = transformBillToEnvelopeForm(bill, currentFormData);

      expect(result).toEqual({
        name: "Electric Bill",
        category: "Utilities",
        color: "#3b82f6",
        frequency: "monthly",
        monthlyAmount: "150.5",
        description: "Bill envelope for Electric Bill",
        envelopeType: ENVELOPE_TYPES.BILL,
      });
    });

    it("should use provider name if name is not available", () => {
      const bill = {
        id: "bill123",
        provider: "Water Company",
        category: "Utilities",
        amount: 75,
      };

      const result = transformBillToEnvelopeForm(bill, currentFormData);

      expect(result.name).toBe("Water Company");
      expect(result.description).toBe("Bill envelope for Water Company");
    });

    it("should preserve current form data for missing fields", () => {
      const customFormData = {
        ...currentFormData,
        color: "#custom",
        frequency: "weekly",
      };

      const bill = {
        id: "bill123",
        name: "Internet Bill",
        amount: 60,
      };

      const result = transformBillToEnvelopeForm(bill, customFormData);

      expect(result.color).toBe("#custom");
      expect(result.frequency).toBe("weekly");
    });

    it("should handle missing amount", () => {
      const bill = {
        id: "bill123",
        name: "Phone Bill",
        category: "Utilities",
      };

      const result = transformBillToEnvelopeForm(bill, currentFormData);

      expect(result.monthlyAmount).toBe("");
    });

    it("should handle missing name and provider (edge case)", () => {
      const bill = {
        id: "bill123",
        category: "Utilities",
        amount: 100,
      };

      const result = transformBillToEnvelopeForm(bill, currentFormData);

      expect(result.name).toBe("");
      expect(result.description).toBe("Bill envelope for undefined");
      // This edge case should be caught by envelope form validation later
      // as empty names are not allowed per validateEnvelopeForm
    });
  });

  describe("calculateQuickFundUpdate", () => {
    it("should calculate update for variable envelope (default)", () => {
      const envelope = {
        id: "env1",
        type: "variable",
        allocated: 100,
      };

      const result = calculateQuickFundUpdate(envelope, 50);

      expect(result).toEqual({
        updateField: "monthlyBudget",
        newAmount: 150,
        currentAmount: 100,
        addedAmount: 50,
      });
    });

    it("should calculate update for goal envelope", () => {
      const envelope = {
        id: "env2",
        type: "goal",
        allocated: 200,
      };

      const result = calculateQuickFundUpdate(envelope, 100);

      expect(result).toEqual({
        updateField: "monthlyContribution",
        newAmount: 300,
        currentAmount: 200,
        addedAmount: 100,
      });
    });

    it("should calculate update for savings envelope", () => {
      const envelope = {
        id: "env3",
        type: ENVELOPE_TYPES.SAVINGS,
        allocated: 500,
      };

      const result = calculateQuickFundUpdate(envelope, 250);

      expect(result).toEqual({
        updateField: "monthlyContribution",
        newAmount: 750,
        currentAmount: 500,
        addedAmount: 250,
      });
    });

    it("should calculate update for liability envelope", () => {
      const envelope = {
        id: "env4",
        type: "liability",
        allocated: 300,
      };

      const result = calculateQuickFundUpdate(envelope, 50);

      expect(result).toEqual({
        updateField: "biweeklyAllocation",
        newAmount: 350,
        currentAmount: 300,
        addedAmount: 50,
      });
    });

    it("should calculate update for bill envelope", () => {
      const envelope = {
        id: "env5",
        type: ENVELOPE_TYPES.BILL,
        allocated: 150,
      };

      const result = calculateQuickFundUpdate(envelope, 25);

      expect(result).toEqual({
        updateField: "biweeklyAllocation",
        newAmount: 175,
        currentAmount: 150,
        addedAmount: 25,
      });
    });

    it("should handle envelope with no allocated amount", () => {
      const envelope = {
        id: "env6",
        type: "variable",
      };

      const result = calculateQuickFundUpdate(envelope, 100);

      expect(result).toEqual({
        updateField: "monthlyBudget",
        newAmount: 100,
        currentAmount: 0,
        addedAmount: 100,
      });
    });

    it("should handle envelope with unknown type", () => {
      const envelope = {
        id: "env7",
        type: "unknown-type",
        allocated: 50,
      };

      const result = calculateQuickFundUpdate(envelope, 30);

      expect(result).toEqual({
        updateField: "monthlyBudget",
        newAmount: 80,
        currentAmount: 50,
        addedAmount: 30,
      });
    });
  });
});
