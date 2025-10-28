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
      category: "Food",
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
      expect((result.errors as ValidationErrors).name).toBe("Envelope name must be less than 50 characters");
    });

    it("should detect duplicate names", () => {
      const existingEnvelopes = [{ id: "1", name: "Existing Envelope" }];
      const formData = { ...validFormData, name: "Existing Envelope" };
      const result = validateEnvelopeForm(formData, existingEnvelopes);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).name).toBe("An envelope with this name already exists");
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
      expect((result.errors as ValidationErrors).monthlyAmount).toBe("Monthly amount must be a positive number");
    });

    it("should validate monthly amount maximum", () => {
      const formData = { ...validFormData, monthlyAmount: "100001" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).monthlyAmount).toBe("Monthly amount cannot exceed $100,000");
    });

    it("should require target amount for sinking funds", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe("Target amount is required for sinking funds");
    });

    it("should validate target amount format", () => {
      const formData = {
        ...validFormData,
        envelopeType: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: "invalid",
      };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).targetAmount).toBe("Target amount must be a positive number");
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
      const formData = { ...validFormData, color: "invalid-color" };
      const result = validateEnvelopeForm(formData);

      expect(result.isValid).toBe(false);
      expect((result.errors as ValidationErrors).color).toBe("Invalid color format");
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
      category: "Food",
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
        envelopeType: ENVELOPE_TYPES.VARIABLE 
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
        envelopeType: ENVELOPE_TYPES.VARIABLE 
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
        envelopeType: ENVELOPE_TYPES.VARIABLE 
      };
      const result = validateEnvelopeTypeChange(ENVELOPE_TYPES.SINKING_FUND, envelope);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Sinking funds require a target amount");
    });
  });
});
