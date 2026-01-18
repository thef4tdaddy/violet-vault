import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { USER_COLORS, validateSetupData, getStepTitle, getStepSubtitle } from "../userSetupHelpers";

describe("userSetupHelpers", () => {
  describe("USER_COLORS", () => {
    it("should have 8 color options", () => {
      expect(USER_COLORS).toHaveLength(8);
    });

    it("should have required properties for each color", () => {
      USER_COLORS.forEach((color) => {
        expect(color).toHaveProperty("name");
        expect(color).toHaveProperty("value");
        expect(typeof color.name).toBe("string");
        expect(typeof color.value).toBe("string");
        expect(color.value).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should include default purple color", () => {
      const purpleColor = USER_COLORS.find((color) => color.value === "#a855f7");
      expect(purpleColor).toBeTruthy();
      expect(purpleColor.name).toBe("Purple");
    });
  });

  describe("validateSetupData", () => {
    it("should validate complete setup data", () => {
      const validData = {
        masterPassword: "password123",
        userName: "John Doe",
        userColor: "#a855f7",
      };

      const result = validateSetupData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty password", () => {
      const invalidData = {
        masterPassword: "",
        userName: "John Doe",
        userColor: "#a855f7",
      };

      const result = validateSetupData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Master password is required");
    });

    it("should reject whitespace-only password", () => {
      const invalidData = {
        masterPassword: "   ",
        userName: "John Doe",
        userColor: "#a855f7",
      };

      const result = validateSetupData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Master password is required");
    });

    it("should reject empty username", () => {
      const invalidData = {
        masterPassword: "password123",
        userName: "",
        userColor: "#a855f7",
      };

      const result = validateSetupData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("User name is required");
    });

    it("should reject missing color", () => {
      const invalidData = {
        masterPassword: "password123",
        userName: "John Doe",
        userColor: "",
      };

      const result = validateSetupData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("User color is required");
    });

    it("should accumulate multiple errors", () => {
      const invalidData = {
        masterPassword: "",
        userName: "",
        userColor: "",
      };

      const result = validateSetupData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("getStepTitle", () => {
    it("should return welcome back message for returning user", () => {
      const title = getStepTitle(1, true, "John");
      const { container } = render(title);

      expect(container.textContent).toContain("WELCOME BACK");
      expect(container.textContent).toContain("JOHN");
    });

    it("should return get started message for step 1", () => {
      const title = getStepTitle(1, false, "");
      const { container } = render(title);

      expect(container.textContent).toContain("GET STARTED");
    });

    it("should return setup profile message for step 2", () => {
      const title = getStepTitle(2, false, "");
      const { container } = render(title);

      expect(container.textContent).toContain("SET UP PROFILE");
    });
  });

  describe("getStepSubtitle", () => {
    it("should return password prompt for returning user", () => {
      const subtitle = getStepSubtitle(1, true);
      const { container } = render(subtitle);

      expect(container.textContent).toContain("ENTER YOUR PASSWORD TO CONTINUE");
    });

    it("should return password creation prompt for step 1", () => {
      const subtitle = getStepSubtitle(1, false);
      const { container } = render(subtitle);

      expect(container.textContent).toContain("CREATE A SECURE MASTER PASSWORD");
    });

    it("should return profile setup prompt for step 2", () => {
      const subtitle = getStepSubtitle(2, false);
      const { container } = render(subtitle);

      expect(container.textContent).toContain("CHOOSE YOUR NAME AND COLOR");
    });
  });
});
