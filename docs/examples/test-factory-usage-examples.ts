/**
 * Test Factory Usage Examples
 * Demonstrates how to use Phase 3 test factories and fixtures
 *
 * This file contains practical examples of using the test factories
 * in real-world testing scenarios.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  // Domain Factories
  createEnvelope,
  createBill,
  createRecurringBill,
  createTransaction,
  createIncomeTransaction,
  createSavingsGoal,
  createEnvelopes,
  createBills,
  createTransactions,
  // API Response Factories
  createAPISuccessResponse,
  createAPIErrorResponse,
  createFirebaseDocument,
  createFirebaseChunks,
  createGitHubIssueResponse,
  // Fixtures
  standardEnvelopes,
  standardBills,
  sampleTransactions,
  emptyBudgetState,
  fullBudgetState,
  newUserScenario,
  activeUserScenario,
  generateLargeDataset,
  // Utilities
  generateId,
  generateAmount,
  generateFutureDate,
} from "@/utils/testing/factories";

// ============================================================================
// EXAMPLE 1: Basic Factory Usage in Unit Tests
// ============================================================================

describe("Example 1: Basic Factory Usage", () => {
  it("should create envelope with defaults", () => {
    const envelope = createEnvelope();

    expect(envelope.id).toBeDefined();
    expect(envelope.name).toBeDefined();
    expect(envelope.archived).toBe(false);
  });

  it("should create envelope with custom properties", () => {
    const envelope = createEnvelope({
      name: "Groceries",
      category: "food",
      currentBalance: 250,
    });

    expect(envelope.name).toBe("Groceries");
    expect(envelope.category).toBe("food");
    expect(envelope.currentBalance).toBe(250);
  });

  it("should create multiple envelopes", () => {
    const envelopes = createEnvelopes(5);

    expect(envelopes).toHaveLength(5);
    envelopes.forEach((envelope) => {
      expect(envelope.id).toBeDefined();
    });
  });
});

// ============================================================================
// EXAMPLE 2: Testing Services with Factories
// ============================================================================

describe("Example 2: Service Layer Testing", () => {
  it("should save and retrieve envelope", async () => {
    // Create test envelope
    const envelope = createEnvelope({
      name: "Test Envelope",
      currentBalance: 100,
    });

    // Mock or actual service call
    // await envelopeService.save(envelope);
    // const retrieved = await envelopeService.getById(envelope.id);

    // expect(retrieved).toEqual(envelope);
  });

  it("should process bill payment", async () => {
    const bill = createBill({
      name: "Electric Bill",
      amount: 150,
      isPaid: false,
    });

    // await billService.markAsPaid(bill.id);
    // const updated = await billService.getById(bill.id);

    // expect(updated.isPaid).toBe(true);
  });

  it("should calculate savings goal progress", () => {
    const goal = createSavingsGoal({
      targetAmount: 1000,
      currentAmount: 500,
    });

    // const progress = savingsService.calculateProgress(goal);
    // expect(progress).toBe(50);
  });
});

// ============================================================================
// EXAMPLE 3: Using Fixtures for Component Tests
// ============================================================================

describe("Example 3: Component Testing with Fixtures", () => {
  it("should render envelope grid with standard envelopes", () => {
    // Use predefined fixture
    // const { getByText } = render(<EnvelopeGrid envelopes={standardEnvelopes} />);
    // expect(getByText('Groceries')).toBeInTheDocument();
    // expect(getByText('Gas')).toBeInTheDocument();
  });

  it("should handle empty state", () => {
    // Use empty budget state
    // const { getByText } = render(<BudgetDashboard state={emptyBudgetState} />);
    // expect(getByText('No envelopes yet')).toBeInTheDocument();
  });

  it("should display full budget", () => {
    // Use full budget state
    // const { getByText } = render(<BudgetDashboard state={fullBudgetState} />);
    // expect(fullBudgetState.envelopes.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// EXAMPLE 4: Testing Different User Scenarios
// ============================================================================

describe("Example 4: User Scenario Testing", () => {
  it("should handle new user scenario", () => {
    const state = newUserScenario;

    // New user should have minimal data
    expect(state.bills).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.unassignedCash).toBe(0);
    expect(state.envelopes.length).toBeLessThanOrEqual(5);
  });

  it("should handle active user scenario", () => {
    const state = activeUserScenario;

    // Active user should have complete budget
    expect(state.envelopes.length).toBeGreaterThan(0);
    expect(state.bills.length).toBeGreaterThan(0);
    expect(state.transactions.length).toBeGreaterThan(0);
    expect(state.unassignedCash).toBeGreaterThan(0);
  });
});

// ============================================================================
// EXAMPLE 5: Performance Testing with Large Datasets
// ============================================================================

describe("Example 5: Performance Testing", () => {
  it("should handle large number of transactions", () => {
    const largeDataset = generateLargeDataset({
      transactions: 1000,
    });

    expect(largeDataset.transactions).toHaveLength(1000);

    // Test performance
    // const startTime = performance.now();
    // filterTransactions(largeDataset.transactions, { category: 'groceries' });
    // const duration = performance.now() - startTime;
    // expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });

  it("should paginate large envelope list", () => {
    const largeDataset = generateLargeDataset({
      envelopes: 100,
    });

    const page1 = largeDataset.envelopes.slice(0, 20);
    const page2 = largeDataset.envelopes.slice(20, 40);

    expect(page1).toHaveLength(20);
    expect(page2).toHaveLength(20);
  });
});

// ============================================================================
// EXAMPLE 6: API Response Testing
// ============================================================================

describe("Example 6: API Response Testing", () => {
  it("should handle successful API response", () => {
    const response = createAPISuccessResponse({
      data: { userId: "123" },
      message: "User created successfully",
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual({ userId: "123" });
  });

  it("should handle API error response", () => {
    const error = createAPIErrorResponse({
      error: "Invalid credentials",
      code: "AUTH_ERROR",
    });

    expect(error.success).toBe(false);
    expect(error.code).toBe("AUTH_ERROR");
  });

  it("should handle Firebase document", () => {
    const doc = createFirebaseDocument();

    expect(doc.encryptedData).toBeDefined();
    expect(doc.timestamp).toBeDefined();
  });

  it("should handle chunked Firebase upload", () => {
    const chunks = createFirebaseChunks(5);

    expect(chunks).toHaveLength(5);
    chunks.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index);
      expect(chunk.totalChunks).toBe(5);
    });
  });
});

// ============================================================================
// EXAMPLE 7: Testing Transaction Types
// ============================================================================

describe("Example 7: Transaction Type Testing", () => {
  it("should create expense transaction", () => {
    const expense = createTransaction({
      amount: 50,
      type: "expense",
      merchant: "Grocery Store",
    });

    expect(expense.type).toBe("expense");
    expect(expense.amount).toBe(50);
  });

  it("should create income transaction", () => {
    const income = createIncomeTransaction({
      amount: 5000,
      description: "Monthly Salary",
    });

    expect(income.type).toBe("income");
    expect(income.amount).toBe(5000);
  });

  it("should test transaction filtering", () => {
    const transactions = [
      createTransaction({ type: "expense", amount: 100 }),
      createIncomeTransaction({ amount: 5000 }),
      createTransaction({ type: "expense", amount: 50 }),
    ];

    const expenses = transactions.filter((t) => t.type === "expense");
    const income = transactions.filter((t) => t.type === "income");

    expect(expenses).toHaveLength(2);
    expect(income).toHaveLength(1);
  });
});

// ============================================================================
// EXAMPLE 8: Testing Bill Types
// ============================================================================

describe("Example 8: Bill Testing", () => {
  it("should create recurring bill", () => {
    const bill = createRecurringBill({
      name: "Internet",
      amount: 79.99,
      frequency: "monthly",
    });

    expect(bill.isRecurring).toBe(true);
    expect(bill.frequency).toBe("monthly");
  });

  it("should test bill payment status", () => {
    const unpaidBill = createBill({ isPaid: false });
    const paidBill = createBill({ isPaid: true });

    expect(unpaidBill.isPaid).toBe(false);
    expect(paidBill.isPaid).toBe(true);
  });

  it("should use standard bills fixture", () => {
    const bills = standardBills;

    // Standard bills includes recurring bills
    const recurringBills = bills.filter((b) => b.isRecurring);
    expect(recurringBills.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// EXAMPLE 9: Integration Testing
// ============================================================================

describe("Example 9: Integration Testing", () => {
  let testEnvelope: ReturnType<typeof createEnvelope>;
  let testTransaction: ReturnType<typeof createTransaction>;

  beforeEach(() => {
    testEnvelope = createEnvelope({
      name: "Test Envelope",
      currentBalance: 500,
    });

    testTransaction = createTransaction({
      amount: 100,
      envelopeId: testEnvelope.id,
    });
  });

  it("should link transaction to envelope", () => {
    expect(testTransaction.envelopeId).toBe(testEnvelope.id);
  });

  it("should update envelope balance after transaction", () => {
    const newBalance = testEnvelope.currentBalance! - testTransaction.amount;

    expect(newBalance).toBe(400);
  });
});

// ============================================================================
// EXAMPLE 10: Custom Utility Usage
// ============================================================================

describe("Example 10: Using Factory Utilities", () => {
  it("should generate unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });

  it("should generate amounts in range", () => {
    const amount = generateAmount(100, 200);

    expect(amount).toBeGreaterThanOrEqual(100);
    expect(amount).toBeLessThanOrEqual(200);
  });

  it("should generate future dates", () => {
    const futureDate = generateFutureDate(30);
    const now = new Date();

    expect(futureDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
  });

  it("should create custom entity with utilities", () => {
    const bill = createBill({
      id: generateId(),
      amount: generateAmount(50, 200),
      dueDate: generateFutureDate(30),
    });

    expect(bill.id).toBeDefined();
    expect(bill.amount).toBeGreaterThanOrEqual(50);
    expect(bill.amount).toBeLessThanOrEqual(200);
  });
});

// ============================================================================
// EXAMPLE 11: Validation Testing
// ============================================================================

describe("Example 11: Schema Validation", () => {
  it("should generate data that passes schema validation", () => {
    const envelope = createEnvelope();

    // All factory data automatically passes Zod validation
    // expect(() => validateEnvelope(envelope)).not.toThrow();
  });

  it("should test partial updates", () => {
    const originalBill = createBill({
      name: "Electric Bill",
      amount: 150,
    });

    const updates = { amount: 175 };
    const updatedBill = { ...originalBill, ...updates };

    expect(updatedBill.amount).toBe(175);
    expect(updatedBill.name).toBe("Electric Bill");
  });
});

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * Best Practices for Using Test Factories:
 *
 * 1. Use factories instead of manual object creation
 *    ✅ const envelope = createEnvelope();
 *    ❌ const envelope = { id: '123', name: 'Test', ... };
 *
 * 2. Override only what you need
 *    ✅ createEnvelope({ name: 'Custom' });
 *    ❌ createEnvelope({ name: 'Custom', id: '123', archived: false, ... });
 *
 * 3. Use fixtures for common scenarios
 *    ✅ const state = fullBudgetState;
 *    ❌ const state = { envelopes: [...], bills: [...], ... };
 *
 * 4. Use batch creation for lists
 *    ✅ const envelopes = createEnvelopes(10);
 *    ❌ const envelopes = [createEnvelope(), createEnvelope(), ...];
 *
 * 5. Combine factories with utilities
 *    ✅ createBill({ id: generateId(), amount: generateAmount() });
 *
 * 6. Test edge cases by overriding defaults
 *    ✅ createEnvelope({ currentBalance: -50 }); // Over budget
 *    ✅ createSavingsGoal({ currentAmount: 1000, targetAmount: 1000 }); // Completed
 *
 * 7. Use scenarios for realistic test data
 *    ✅ const state = activeUserScenario; // Real-world data
 */
