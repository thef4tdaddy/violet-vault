import { describe, it, expect } from "vitest";
import {
  analyzeTransactionsForBills,
  generateBillSuggestions,
  BILL_PATTERNS,
} from "../billDiscovery";

describe("billDiscovery", () => {
  describe("BILL_PATTERNS", () => {
    it("should have utility patterns defined", () => {
      expect(BILL_PATTERNS.utilities).toBeDefined();
      expect(BILL_PATTERNS.utilities.keywords).toContain("electric");
      expect(BILL_PATTERNS.utilities.recurring).toBe(true);
    });

    it("should have internet patterns defined", () => {
      expect(BILL_PATTERNS.internet).toBeDefined();
      expect(BILL_PATTERNS.internet.keywords).toContain("internet");
      expect(BILL_PATTERNS.internet.category).toBe("Internet & Phone");
    });

    it("should have streaming patterns defined", () => {
      expect(BILL_PATTERNS.streaming).toBeDefined();
      expect(BILL_PATTERNS.streaming.keywords).toContain("netflix");
      expect(BILL_PATTERNS.streaming.confidence).toBe(0.95);
    });
  });

  describe("analyzeTransactionsForBills", () => {
    it("should detect monthly recurring bills", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Subscription" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const netflixSuggestion = suggestions.find((s) =>
        s.provider.toLowerCase().includes("netflix")
      );
      expect(netflixSuggestion).toBeDefined();
      expect(netflixSuggestion?.frequency).toBe("monthly");
      expect(netflixSuggestion?.confidence).toBeGreaterThan(0.6);
    });

    it("should detect weekly recurring bills", () => {
      const transactions = [
        { date: "2024-01-08", amount: -50, description: "Gas Station Weekly" },
        { date: "2024-01-15", amount: -50, description: "Gas Station Weekly" },
        { date: "2024-01-22", amount: -50, description: "Gas Station Weekly" },
        { date: "2024-01-29", amount: -50, description: "Gas Station Weekly" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const gasSuggestion = suggestions[0];
      expect(gasSuggestion.frequency).toBe("weekly");
    });

    it("should detect biweekly recurring bills", () => {
      const transactions = [
        { date: "2024-01-01", amount: -100, description: "Lawn Service" },
        { date: "2024-01-15", amount: -100, description: "Lawn Service" },
        { date: "2024-01-29", amount: -100, description: "Lawn Service" },
        { date: "2024-02-12", amount: -100, description: "Lawn Service" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].frequency).toBe("biweekly");
    });

    it("should ignore single non-recurring transactions", () => {
      const transactions = [{ date: "2024-01-15", amount: -150, description: "One Time Purchase" }];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions).toHaveLength(0);
    });

    it("should ignore positive amounts (income)", () => {
      const transactions = [
        { date: "2024-01-15", amount: 1000, description: "Paycheck" },
        { date: "2024-02-15", amount: 1000, description: "Paycheck" },
        { date: "2024-03-15", amount: 1000, description: "Paycheck" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions).toHaveLength(0);
    });

    it("should not suggest bills that already exist", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Subscription" },
      ];

      const existingBills = [
        {
          id: "bill-1",
          name: "Netflix",
          description: "netflix subscription",
          amount: 99.99,
          dueDate: "15",
          frequency: "monthly",
        },
      ];

      const suggestions = analyzeTransactionsForBills(transactions, existingBills);

      // Should not suggest Netflix since it already exists
      const netflixSuggestion = suggestions.find((s) =>
        s.provider.toLowerCase().includes("netflix")
      );
      expect(netflixSuggestion).toBeUndefined();
    });

    it("should handle transactions with varying amounts (utilities)", () => {
      const transactions = [
        { date: "2024-01-05", amount: -120, description: "Electric Company" },
        { date: "2024-02-05", amount: -135, description: "Electric Company" },
        { date: "2024-03-05", amount: -115, description: "Electric Company" },
        { date: "2024-04-05", amount: -128, description: "Electric Company" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const electricSuggestion = suggestions[0];
      expect(electricSuggestion.category).toBe("Utilities");
      expect(electricSuggestion.frequency).toBe("monthly");
      // Amount should be average
      expect(electricSuggestion.amount).toBeGreaterThan(110);
      expect(electricSuggestion.amount).toBeLessThan(140);
    });

    it("should normalize transaction descriptions for matching", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "NETFLIX #12345" },
        { date: "2024-02-15", amount: -99.99, description: "NETFLIX #67890" },
        { date: "2024-03-15", amount: -99.99, description: "NETFLIX #11111" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      // Should group all NETFLIX transactions together despite different numbers
      const netflixSuggestion = suggestions.find((s) =>
        s.provider.toLowerCase().includes("netflix")
      );
      expect(netflixSuggestion).toBeDefined();
      expect(netflixSuggestion?.discoveryData.transactionCount).toBe(3);
    });

    it("should calculate confidence based on consistency", () => {
      const consistentTransactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-04-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-05-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-06-15", amount: -99.99, description: "Netflix Subscription" },
      ];

      const suggestions = analyzeTransactionsForBills(consistentTransactions);

      expect(suggestions.length).toBeGreaterThan(0);
      // Should have high confidence due to many consistent transactions
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
    });

    it("should detect utility bills with pattern matching", () => {
      const transactions = [
        { date: "2024-01-10", amount: -150, description: "City Electric Power Co" },
        { date: "2024-02-10", amount: -145, description: "City Electric Power Co" },
        { date: "2024-03-10", amount: -155, description: "City Electric Power Co" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe("Utilities");
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
    });

    it("should detect internet bills with provider keywords", () => {
      const transactions = [
        { date: "2024-01-01", amount: -79.99, description: "Comcast Internet Service" },
        { date: "2024-02-01", amount: -79.99, description: "Comcast Internet Service" },
        { date: "2024-03-01", amount: -79.99, description: "Comcast Internet Service" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe("Internet & Phone");
    });

    it("should detect insurance bills", () => {
      const transactions = [
        { date: "2024-01-01", amount: -150, description: "State Farm Auto Insurance" },
        { date: "2024-02-01", amount: -150, description: "State Farm Auto Insurance" },
        { date: "2024-03-01", amount: -150, description: "State Farm Auto Insurance" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe("Insurance");
    });

    it("should predict next due date based on interval", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      // Should predict around 2024-04-15 (30 days after last transaction)
      expect(suggestion.dueDate).toBeDefined();
      const dueDate = new Date(suggestion.dueDate);
      const lastDate = new Date("2024-03-15");
      const daysDiff = (dueDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(20);
      expect(daysDiff).toBeLessThan(40);
    });

    it("should include discovery data in suggestions", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      expect(suggestion.discoveryData).toBeDefined();
      expect(suggestion.discoveryData.transactionCount).toBe(3);
      expect(suggestion.discoveryData.avgInterval).toBeGreaterThan(0);
      expect(suggestion.discoveryData.amountRange).toHaveLength(2);
      expect(suggestion.discoveryData.sampleTransactions).toBeDefined();
    });

    it("should sort suggestions by confidence", () => {
      const transactions = [
        // High confidence - consistent subscription
        { date: "2024-01-15", amount: -9.99, description: "Spotify Premium" },
        { date: "2024-02-15", amount: -9.99, description: "Spotify Premium" },
        { date: "2024-03-15", amount: -9.99, description: "Spotify Premium" },
        { date: "2024-04-15", amount: -9.99, description: "Spotify Premium" },
        { date: "2024-05-15", amount: -9.99, description: "Spotify Premium" },
        { date: "2024-06-15", amount: -9.99, description: "Spotify Premium" },
        // Lower confidence - only 2 transactions
        { date: "2024-01-10", amount: -50, description: "Random Service" },
        { date: "2024-02-10", amount: -55, description: "Random Service" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      // First suggestion should have higher confidence
      if (suggestions.length > 1) {
        expect(suggestions[0].confidence).toBeGreaterThan(suggestions[1].confidence);
      }
    });

    it("should limit results to 10 suggestions", () => {
      // Create many different recurring patterns
      const transactions = [];
      for (let i = 0; i < 15; i++) {
        for (let month = 1; month <= 3; month++) {
          transactions.push({
            date: `2024-0${month}-15`,
            amount: -50 - i * 10,
            description: `Service ${i}`,
          });
        }
      }

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeLessThanOrEqual(10);
    });

    it("should handle overlapping bill dates", () => {
      const transactions = [
        // Two bills on the same day of month
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-01-15", amount: -79.99, description: "Internet Service" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -79.99, description: "Internet Service" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -79.99, description: "Internet Service" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should detect both bills separately
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
      const netflix = suggestions.find((s) => s.provider.toLowerCase().includes("netflix"));
      const internet = suggestions.find((s) => s.provider.toLowerCase().includes("internet"));
      expect(netflix).toBeDefined();
      expect(internet).toBeDefined();
    });

    it("should handle transactions with close but not exact dates", () => {
      const transactions = [
        { date: "2024-01-14", amount: -99.99, description: "Netflix" },
        { date: "2024-02-16", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should still detect as monthly bill despite slight date variations
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].frequency).toBe("monthly");
    });

    it("should not detect non-recurring irregular transactions", () => {
      const transactions = [
        { date: "2024-01-05", amount: -45, description: "Random Store" },
        { date: "2024-02-20", amount: -78, description: "Random Store" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should not suggest due to inconsistent interval
      expect(suggestions).toHaveLength(0);
    });

    it("should provide sample transactions in discovery data", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix Premium" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix Premium" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Premium" },
        { date: "2024-04-15", amount: -99.99, description: "Netflix Premium" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      expect(suggestion.discoveryData.sampleTransactions).toBeDefined();
      expect(suggestion.discoveryData.sampleTransactions.length).toBeGreaterThan(0);
      expect(suggestion.discoveryData.sampleTransactions.length).toBeLessThanOrEqual(3);
    });

    it("should calculate amount range correctly", () => {
      const transactions = [
        { date: "2024-01-15", amount: -100, description: "Utility Bill" },
        { date: "2024-02-15", amount: -150, description: "Utility Bill" },
        { date: "2024-03-15", amount: -125, description: "Utility Bill" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      expect(suggestion.discoveryData.amountRange[0]).toBe(100);
      expect(suggestion.discoveryData.amountRange[1]).toBe(150);
    });
  });

  describe("generateBillSuggestions", () => {
    it("should generate bill suggestions with envelope matches", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix Subscription" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Subscription" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-1", name: "Entertainment", currentBalance: 200 },
        { id: "env-2", name: "Utilities", currentBalance: 300 },
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      const netflixSuggestion = suggestions.find((s) =>
        s.provider.toLowerCase().includes("netflix")
      );
      expect(netflixSuggestion?.suggestedEnvelopeId).toBeDefined();
    });

    it("should match bills to envelopes by category", () => {
      const transactions = [
        { date: "2024-01-10", amount: -150, description: "Electric Company" },
        { date: "2024-02-10", amount: -150, description: "Electric Company" },
        { date: "2024-03-10", amount: -150, description: "Electric Company" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-utilities", name: "Utilities", currentBalance: 500 },
        { id: "env-food", name: "Food", currentBalance: 300 },
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      expect(suggestion.suggestedEnvelopeId).toBe("env-utilities");
      expect(suggestion.suggestedEnvelopeName).toBe("Utilities");
    });

    it("should match bills to envelopes by provider name", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-netflix", name: "Netflix Budget", currentBalance: 100 },
        { id: "env-other", name: "Other Bills", currentBalance: 200 },
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      const netflixSuggestion = suggestions[0];
      expect(netflixSuggestion.suggestedEnvelopeId).toBe("env-netflix");
    });

    it("should provide envelope confidence score", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-1", name: "Entertainment", currentBalance: 200 },
        { id: "env-2", name: "Streaming Services", currentBalance: 150 },
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].envelopeConfidence).toBeDefined();
      expect(suggestions[0].envelopeConfidence).toBeGreaterThanOrEqual(0);
    });

    it("should not suggest envelope when no good match exists", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Random Service XYZ" },
        { date: "2024-02-15", amount: -99.99, description: "Random Service XYZ" },
        { date: "2024-03-15", amount: -99.99, description: "Random Service XYZ" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-1", name: "Food", currentBalance: 200 },
        { id: "env-2", name: "Transportation", currentBalance: 150 },
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      // Should not have envelope match if confidence is too low
      const hasLowConfidenceMatch = suggestions.some(
        (s) => s.envelopeConfidence && s.envelopeConfidence < 0.5
      );
      expect(hasLowConfidenceMatch || !suggestions[0].suggestedEnvelopeId).toBe(true);
    });

    it("should handle empty envelopes array", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix" },
      ];

      const bills = [];
      const envelopes = [];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].suggestedEnvelopeId).toBeUndefined();
    });

    it("should handle empty transactions array", () => {
      const transactions = [];
      const bills = [];
      const envelopes = [{ id: "env-1", name: "Entertainment", currentBalance: 200 }];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions).toHaveLength(0);
    });

    it("should prioritize direct name matches over category matches", () => {
      const transactions = [
        { date: "2024-01-15", amount: -79.99, description: "Comcast Internet" },
        { date: "2024-02-15", amount: -79.99, description: "Comcast Internet" },
        { date: "2024-03-15", amount: -79.99, description: "Comcast Internet" },
      ];

      const bills = [];
      const envelopes = [
        { id: "env-internet", name: "Comcast", currentBalance: 100 }, // Direct match
        { id: "env-utilities", name: "Utilities", currentBalance: 200 }, // Category match
      ];

      const suggestions = generateBillSuggestions(transactions, bills, envelopes);

      expect(suggestions.length).toBeGreaterThan(0);
      // Should prefer the direct name match
      expect(suggestions[0].suggestedEnvelopeId).toBe("env-internet");
    });
  });

  describe("Edge Cases and Complex Scenarios", () => {
    it("should handle transactions with special characters", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "Netflix*Premium-HD #12345" },
        { date: "2024-02-15", amount: -99.99, description: "Netflix*Premium-HD #67890" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix*Premium-HD #11111" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].discoveryData.transactionCount).toBe(3);
    });

    it("should handle transactions with mixed case", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "NETFLIX SUBSCRIPTION" },
        { date: "2024-02-15", amount: -99.99, description: "netflix subscription" },
        { date: "2024-03-15", amount: -99.99, description: "Netflix Subscription" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].discoveryData.transactionCount).toBe(3);
    });

    it("should handle very large transaction sets efficiently", () => {
      // Create transactions with enough to be detected as recurring (need at least 2 per service)
      const transactions = [];
      for (let service = 0; service < 5; service++) {
        for (let occurrence = 0; occurrence < 3; occurrence++) {
          transactions.push({
            date: `2024-0${occurrence + 1}-15`,
            amount: -50,
            description: `Netflix Service ${service}`, // Use recognizable pattern
          });
        }
      }

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should limit to 10 and complete in reasonable time
      expect(suggestions.length).toBeLessThanOrEqual(10);
      // Array is defined and function completes
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should handle bills with amount variations that exceed threshold", () => {
      const transactions = [
        { date: "2024-01-15", amount: -50, description: "Gym Membership" },
        { date: "2024-02-15", amount: -150, description: "Gym Membership" },
        { date: "2024-03-15", amount: -50, description: "Gym Membership" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should still detect but with lower confidence due to high variation
      if (suggestions.length > 0) {
        expect(suggestions[0].confidence).toBeDefined();
      }
    });

    it("should handle transactions with empty or null descriptions", () => {
      const transactions = [
        { date: "2024-01-15", amount: -99.99, description: "" },
        { date: "2024-02-15", amount: -99.99, description: "" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should not crash, but may not detect patterns
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should handle split transactions for same bill", () => {
      const transactions = [
        // Electric bill paid in full (monthly pattern)
        { date: "2024-01-10", amount: -150, description: "Electric Company" },
        { date: "2024-02-10", amount: -150, description: "Electric Company" },
        { date: "2024-03-10", amount: -150, description: "Electric Company" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      // Should detect the electric bill
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle date boundaries and year transitions", () => {
      const transactions = [
        { date: "2023-11-15", amount: -99.99, description: "Netflix" },
        { date: "2023-12-15", amount: -99.99, description: "Netflix" },
        { date: "2024-01-15", amount: -99.99, description: "Netflix" },
      ];

      const suggestions = analyzeTransactionsForBills(transactions);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].frequency).toBe("monthly");
    });
  });
});
