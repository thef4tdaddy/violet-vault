import { renderHook, act } from "@testing-library/react";
import { usePaycheckFlowStore } from "../paycheckFlowStore";

describe("paycheckFlowStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      usePaycheckFlowStore.setState({
        isOpen: false,
        currentStep: 0,
        paycheckAmountCents: null,
        payerName: null,
        selectedStrategy: null,
        allocations: [],
      });
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe("initial state", () => {
    it("should have isOpen as false", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.isOpen).toBe(false);
    });

    it("should have currentStep as 0", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.currentStep).toBe(0);
    });

    it("should have paycheckAmountCents as null", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.paycheckAmountCents).toBeNull();
    });

    it("should have selectedStrategy as null", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.selectedStrategy).toBeNull();
    });

    it("should have allocations as empty array", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.allocations).toEqual([]);
    });

    it("should have payerName as null", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      expect(result.current.payerName).toBeNull();
    });
  });

  describe("Modal state", () => {
    it("should open wizard and reset to step 0", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.openWizard();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentStep).toBe(0);
    });

    it("should close wizard", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.openWizard();
        result.current.closeWizard();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should reset currentStep to 0 when opening wizard", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(2);
        result.current.openWizard();
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe("Step navigation", () => {
    it("should advance to next step", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it("should go back to previous step", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(2);
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it("should not go below step 0", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it("should not go above step 3", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(3);
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);
    });

    it("should set step directly", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it("should clamp step to valid range (0-3)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(5);
      });
      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.setStep(-1);
      });
      expect(result.current.currentStep).toBe(0);
    });

    it("should navigate through all steps sequentially", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      expect(result.current.currentStep).toBe(0);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.previousStep();
      });
      expect(result.current.currentStep).toBe(2);
    });
  });

  describe("Paycheck amount", () => {
    it("should set paycheck amount in cents", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(250000); // $2,500.00
      });

      expect(result.current.paycheckAmountCents).toBe(250000);
    });

    it("should update paycheck amount", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(100000);
      });
      expect(result.current.paycheckAmountCents).toBe(100000);

      act(() => {
        result.current.setPaycheckAmountCents(200000);
      });
      expect(result.current.paycheckAmountCents).toBe(200000);
    });

    it("should reject invalid paycheck amounts (negative)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      // Set valid amount first
      act(() => {
        result.current.setPaycheckAmountCents(250000);
      });
      expect(result.current.paycheckAmountCents).toBe(250000);

      // Try to set invalid amount (should be rejected)
      act(() => {
        result.current.setPaycheckAmountCents(-100);
      });

      // State should remain unchanged
      expect(result.current.paycheckAmountCents).toBe(250000);
    });

    it("should reject invalid paycheck amounts (below minimum)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(50); // Below $1.00 minimum
      });

      // State should remain null (not set)
      expect(result.current.paycheckAmountCents).toBeNull();
    });

    it("should reject invalid paycheck amounts (above maximum)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      // Set valid amount first
      act(() => {
        result.current.setPaycheckAmountCents(250000);
      });

      act(() => {
        result.current.setPaycheckAmountCents(200_000_000); // Above $1M maximum
      });

      // State should remain at previous valid value
      expect(result.current.paycheckAmountCents).toBe(250000);
    });

    it("should accept minimum valid amount ($1.00)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(100); // $1.00 (minimum)
      });

      expect(result.current.paycheckAmountCents).toBe(100);
    });

    it("should accept maximum valid amount ($1,000,000)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(100_000_000); // $1M (maximum)
      });

      expect(result.current.paycheckAmountCents).toBe(100_000_000);
    });
  });

  describe("Payer name", () => {
    it("should set payer name", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPayerName("Acme Corp");
      });

      expect(result.current.payerName).toBe("Acme Corp");
    });

    it("should update payer name", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPayerName("Acme Corp");
      });
      expect(result.current.payerName).toBe("Acme Corp");

      act(() => {
        result.current.setPayerName("TechCo Inc");
      });
      expect(result.current.payerName).toBe("TechCo Inc");
    });

    it("should allow null payer name", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPayerName("Acme Corp");
      });
      expect(result.current.payerName).toBe("Acme Corp");

      act(() => {
        result.current.setPayerName(null);
      });
      expect(result.current.payerName).toBeNull();
    });

    it("should allow empty string payer name", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPayerName("");
      });

      expect(result.current.payerName).toBe("");
    });
  });

  describe("Allocation strategy", () => {
    it("should set selected strategy to 'last'", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("last");
      });

      expect(result.current.selectedStrategy).toBe("last");
    });

    it("should set selected strategy to 'even'", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("even");
      });

      expect(result.current.selectedStrategy).toBe("even");
    });

    it("should set selected strategy to 'smart'", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("smart");
      });

      expect(result.current.selectedStrategy).toBe("smart");
    });

    it("should set selected strategy to 'manual'", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("manual");
      });

      expect(result.current.selectedStrategy).toBe("manual");
    });

    it("should update strategy", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("even");
      });
      expect(result.current.selectedStrategy).toBe("even");

      act(() => {
        result.current.setSelectedStrategy("smart");
      });
      expect(result.current.selectedStrategy).toBe("smart");
    });
  });

  describe("Allocations", () => {
    it("should set allocations array", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      const allocations = [
        { envelopeId: "env_1", amountCents: 100000 },
        { envelopeId: "env_2", amountCents: 150000 },
      ];

      act(() => {
        result.current.setAllocations(allocations);
      });

      expect(result.current.allocations).toEqual(allocations);
    });

    it("should update allocations", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      const allocations1 = [{ envelopeId: "env_1", amountCents: 50000 }];
      const allocations2 = [
        { envelopeId: "env_1", amountCents: 75000 },
        { envelopeId: "env_2", amountCents: 75000 },
      ];

      act(() => {
        result.current.setAllocations(allocations1);
      });
      expect(result.current.allocations).toEqual(allocations1);

      act(() => {
        result.current.setAllocations(allocations2);
      });
      expect(result.current.allocations).toEqual(allocations2);
    });

    it("should reject empty allocations array (validation fails)", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      // Set valid allocations first
      act(() => {
        result.current.setAllocations([{ envelopeId: "env_1", amountCents: 100000 }]);
      });
      expect(result.current.allocations).toHaveLength(1);

      // Try to set empty array (should be rejected by validation)
      act(() => {
        result.current.setAllocations([]);
      });

      // State should remain at previous valid value
      expect(result.current.allocations).toHaveLength(1);
    });

    it("should reject allocations with negative amounts", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      const invalidAllocations = [
        { envelopeId: "env_1", amountCents: 100000 },
        { envelopeId: "env_2", amountCents: -50000 }, // Invalid: negative
      ];

      act(() => {
        result.current.setAllocations(invalidAllocations);
      });

      // State should remain empty (not set)
      expect(result.current.allocations).toEqual([]);
    });

    it("should reject allocations with missing envelope IDs", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      const invalidAllocations = [
        { envelopeId: "", amountCents: 100000 }, // Invalid: empty envelope ID
      ];

      act(() => {
        result.current.setAllocations(invalidAllocations as any);
      });

      // State should remain empty
      expect(result.current.allocations).toEqual([]);
    });

    it("should accept allocations with zero amounts", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      const allocations = [
        { envelopeId: "env_1", amountCents: 250000 },
        { envelopeId: "env_2", amountCents: 0 }, // Zero is valid (non-negative)
      ];

      act(() => {
        result.current.setAllocations(allocations);
      });

      expect(result.current.allocations).toEqual(allocations);
    });
  });

  describe("Reset", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.openWizard();
        result.current.setPaycheckAmountCents(100000);
        result.current.setPayerName("Acme Corp");
        result.current.setSelectedStrategy("even");
        result.current.setAllocations([{ envelopeId: "env_1", amountCents: 100000 }]);
        result.current.nextStep();
        result.current.reset();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.paycheckAmountCents).toBeNull();
      expect(result.current.payerName).toBeNull();
      expect(result.current.selectedStrategy).toBeNull();
      expect(result.current.allocations).toEqual([]);
    });

    it("should reset even from complex state", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.openWizard();
        result.current.setStep(3);
        result.current.setPaycheckAmountCents(500000);
        result.current.setSelectedStrategy("smart");
        result.current.setAllocations([
          { envelopeId: "env_1", amountCents: 200000 },
          { envelopeId: "env_2", amountCents: 150000 },
          { envelopeId: "env_3", amountCents: 150000 },
        ]);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentStep).toBe(0);
      expect(result.current.paycheckAmountCents).toBeNull();
      expect(result.current.selectedStrategy).toBeNull();
      expect(result.current.allocations).toEqual([]);
    });
  });

  describe("Selective subscriptions", () => {
    it("should support selective subscriptions with exported selectors", () => {
      const { result } = renderHook(() => usePaycheckFlowStore((state) => state.currentStep));

      // Initial value
      expect(result.current).toBe(0);

      // Update currentStep
      act(() => {
        usePaycheckFlowStore.setState({ currentStep: 2 });
      });

      expect(result.current).toBe(2);
    });

    it("should allow subscribing to multiple values using selectors", () => {
      const { result } = renderHook(() => {
        const store = usePaycheckFlowStore();
        return {
          step: store.currentStep,
          strategy: store.selectedStrategy,
        };
      });

      expect(result.current.step).toBe(0);
      expect(result.current.strategy).toBeNull();

      act(() => {
        usePaycheckFlowStore.setState({
          currentStep: 2,
          selectedStrategy: "smart",
        });
      });

      expect(result.current.step).toBe(2);
      expect(result.current.strategy).toBe("smart");
    });
  });

  describe("Persistence (Privacy)", () => {
    it("should persist currentStep", async () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(2);
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = JSON.parse(localStorage.getItem("paycheck-flow-storage") || "{}");
      expect(stored.state.currentStep).toBe(2);
    });

    it("should persist selectedStrategy", async () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setSelectedStrategy("smart");
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = JSON.parse(localStorage.getItem("paycheck-flow-storage") || "{}");
      expect(stored.state.selectedStrategy).toBe("smart");
    });

    it("should persist payerName (non-sensitive, helps with autocomplete)", async () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPayerName("Acme Corp");
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = JSON.parse(localStorage.getItem("paycheck-flow-storage") || "{}");
      expect(stored.state.payerName).toBe("Acme Corp");
    });

    it("should NOT persist paycheckAmountCents (sensitive data)", async () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(500000);
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = JSON.parse(localStorage.getItem("paycheck-flow-storage") || "{}");

      // CRITICAL: Sensitive financial data should NOT be persisted
      expect(stored.state.paycheckAmountCents).toBeUndefined();
    });

    it("should NOT persist allocations (sensitive data)", async () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setAllocations([
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ]);
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = JSON.parse(localStorage.getItem("paycheck-flow-storage") || "{}");

      // CRITICAL: Sensitive financial data should NOT be persisted
      expect(stored.state.allocations).toBeUndefined();
    });
  });

  describe("Selectors", () => {
    it("should export selectIsOpen selector", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.openWizard();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should export selectCurrentStep selector", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it("should export selectPaycheckAmountCents selector", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());

      act(() => {
        result.current.setPaycheckAmountCents(250000);
      });

      expect(result.current.paycheckAmountCents).toBe(250000);
    });

    it("should export selectAllocations selector", () => {
      const { result } = renderHook(() => usePaycheckFlowStore());
      const allocations = [{ envelopeId: "env_1", amountCents: 100000 }];

      act(() => {
        result.current.setAllocations(allocations);
      });

      expect(result.current.allocations).toEqual(allocations);
    });
  });
});
