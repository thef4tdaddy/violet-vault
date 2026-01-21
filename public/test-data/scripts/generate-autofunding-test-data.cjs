#!/usr/bin/env node

/**
 * Generate Auto-Funding Test Data for Violet Vault
 * Loads the base budget file and adds Auto-Funding Rules to it.
 * Output: violet-vault-budget-autofunding.json
 */

const fs = require("fs");
const path = require("path");

// Load the base budget file
const baseBudgetPath = path.join(__dirname, "../data/violet-vault-budget.json");
let baseBudget;

try {
  const fileContent = fs.readFileSync(baseBudgetPath, "utf8");
  baseBudget = JSON.parse(fileContent);
  console.log("✓ Loaded base budget file");
} catch (error) {
  console.error("ERROR: Could not load base budget file. Please run generate-test-data.cjs first.");
  process.exit(1);
}

// --- AUTO-FUNDING RULES ---

const autoFundingRules = [
  // 1. Priority Fill Rule: Rent (High Priority)
  {
    id: "rule-rent-priority",
    name: "Prioritize Rent",
    description: "Ensure rent is covered first",
    type: "priority_fill",
    trigger: "income_detected",
    priority: 10,
    enabled: true,
    createdAt: new Date().toISOString(),
    config: {
      sourceType: "unassigned",
      targetType: "envelope",
      targetId: "env-rent",
      scheduleConfig: {},
    },
    executionCount: 5,
    lastExecuted: new Date().toISOString(),
  },

  // 2. Percentage Rule: 10% to Savings (Medium Priority)
  {
    id: "rule-savings-tithe",
    name: "Save 10%",
    description: "Allocate 10% of income to General Savings",
    type: "percentage",
    trigger: "income_detected",
    priority: 20,
    enabled: true,
    createdAt: new Date().toISOString(),
    config: {
      sourceType: "income",
      targetType: "envelope",
      targetId: "env-emergency",
      percentage: 10,
      scheduleConfig: {},
    },
    executionCount: 5,
    lastExecuted: new Date().toISOString(),
  },

  // 3. Fixed Amount: Gas (Medium Priority)
  {
    id: "rule-gas-fixed",
    name: "Gas Stipend",
    description: "Add $50 to Gas envelope per paycheck",
    type: "fixed_amount",
    trigger: "income_detected",
    priority: 30,
    enabled: true,
    createdAt: new Date().toISOString(),
    config: {
      sourceType: "unassigned",
      targetType: "envelope",
      targetId: "env-gas",
      amount: 50,
      scheduleConfig: {},
    },
    executionCount: 5,
    lastExecuted: new Date().toISOString(),
  },

  // 4. Conditional: Overflow to Emergency (Low Priority)
  {
    id: "rule-emergency-overflow",
    name: "Emergency Overflow",
    description: "If Unassigned Cash > $2000, move surplus to Emergency Fund",
    type: "conditional",
    trigger: "manual",
    priority: 90,
    enabled: true,
    createdAt: new Date().toISOString(),
    config: {
      sourceType: "unassigned",
      targetType: "envelope",
      targetId: "env-emergency",
      amount: 500,
      conditions: [{ field: "unassigned_cash", operator: "gt", value: 2000 }],
      scheduleConfig: {},
    },
    executionCount: 1,
    lastExecuted: new Date().toISOString(),
  },

  // 5. Split Remainder: Fun & Travel (Lowest Priority)
  {
    id: "rule-split-fun-travel",
    name: "Split Leftovers",
    description: "Split remaining unassigned cash between Fun and Travel",
    type: "split_remainder",
    trigger: "manual",
    priority: 100,
    enabled: false,
    createdAt: new Date().toISOString(),
    config: {
      sourceType: "unassigned",
      targetType: "multiple",
      targetIds: ["env-entertainment", "env-groceries"],
      scheduleConfig: {},
    },
    executionCount: 0,
    lastExecuted: null,
  },
];

// --- OUTPUT ---

const output = {
  ...baseBudget,
  autoFundingRules, // Add rules to the base budget
  exportMetadata: {
    ...baseBudget.exportMetadata,
    description: "Complete v2.0 Budget with Auto-Funding Rules",
  },
};

const outputPath = path.join(__dirname, "../data/violet-vault-budget-autofunding.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\n✨ Auto-Funding Test Data Generated!`);
console.log(`   - Loaded base budget with ${baseBudget.envelopes?.length || 0} envelopes`);
console.log(`   - Added ${autoFundingRules.length} auto-funding rules`);
console.log(`   - Output: ${outputPath}\n`);
