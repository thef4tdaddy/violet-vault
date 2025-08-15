/**
 * Auto-Funding Engine
 * Client-side rule processing system for automated envelope funding
 */

import logger from "./logger";

// Rule Types
export const RULE_TYPES = {
  FIXED_AMOUNT: "fixed_amount", // "Move $200 to Rent"
  PERCENTAGE: "percentage", // "Move 30% to Savings"
  CONDITIONAL: "conditional", // "If balance < $50, move $100"
  SPLIT_REMAINDER: "split_remainder", // "Split leftover funds evenly"
  PRIORITY_FILL: "priority_fill", // "Fill Rent before other envelopes"
};

// Trigger Types
export const TRIGGER_TYPES = {
  MANUAL: "manual", // User clicks "Run Rules"
  INCOME_DETECTED: "income_detected", // New positive transaction
  MONTHLY: "monthly", // Monthly schedule
  WEEKLY: "weekly", // Weekly schedule
  BIWEEKLY: "biweekly", // Biweekly schedule
  PAYDAY: "payday", // Detected payday pattern
};

// Condition Types for Conditional Rules
export const CONDITION_TYPES = {
  BALANCE_LESS_THAN: "balance_less_than",
  BALANCE_GREATER_THAN: "balance_greater_than",
  DATE_RANGE: "date_range",
  TRANSACTION_AMOUNT: "transaction_amount",
  UNASSIGNED_ABOVE: "unassigned_above",
};

/**
 * Auto-Funding Rule Class
 */
export class AutoFundingRule {
  constructor(config) {
    this.id =
      config.id ||
      `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = config.name || "Untitled Rule";
    this.description = config.description || "";
    this.type = config.type || RULE_TYPES.FIXED_AMOUNT;
    this.trigger = config.trigger || TRIGGER_TYPES.MANUAL;
    this.priority = config.priority || 100; // Lower = higher priority
    this.enabled = config.enabled !== false;
    this.createdAt = config.createdAt || new Date().toISOString();
    this.lastExecuted = config.lastExecuted || null;
    this.executionCount = config.executionCount || 0;

    // Rule configuration
    this.config = {
      sourceType: config.config?.sourceType || "unassigned", // 'unassigned' | 'envelope' | 'income'
      sourceId: config.config?.sourceId || null,
      targetType: config.config?.targetType || "envelope", // 'envelope' | 'multiple'
      targetId: config.config?.targetId || null,
      targetIds: config.config?.targetIds || [],
      amount: config.config?.amount || 0,
      percentage: config.config?.percentage || 0,
      conditions: config.config?.conditions || [],
      scheduleConfig: config.config?.scheduleConfig || {},
      ...config.config,
    };
  }

  /**
   * Check if rule should execute based on trigger
   */
  shouldExecute(context) {
    if (!this.enabled) return false;

    const { trigger, data, currentDate } = context;

    // Check trigger type match
    if (this.trigger !== trigger && trigger !== TRIGGER_TYPES.MANUAL) {
      return false;
    }

    // Check conditions for conditional rules
    if (this.type === RULE_TYPES.CONDITIONAL) {
      return this.evaluateConditions(context);
    }

    // Check schedule for scheduled rules
    if (
      this.trigger === TRIGGER_TYPES.MONTHLY ||
      this.trigger === TRIGGER_TYPES.WEEKLY ||
      this.trigger === TRIGGER_TYPES.BIWEEKLY
    ) {
      return this.checkSchedule(currentDate);
    }

    return true;
  }

  /**
   * Evaluate conditions for conditional rules
   */
  evaluateConditions(context) {
    const { envelopes, unassignedCash, transactions } = context.data;

    return this.config.conditions.every((condition) => {
      switch (condition.type) {
        case CONDITION_TYPES.BALANCE_LESS_THAN:
          if (condition.envelopeId) {
            const envelope = envelopes.find(
              (e) => e.id === condition.envelopeId,
            );
            return envelope && envelope.currentBalance < condition.value;
          }
          return unassignedCash < condition.value;

        case CONDITION_TYPES.BALANCE_GREATER_THAN:
          if (condition.envelopeId) {
            const envelope = envelopes.find(
              (e) => e.id === condition.envelopeId,
            );
            return envelope && envelope.currentBalance > condition.value;
          }
          return unassignedCash > condition.value;

        case CONDITION_TYPES.UNASSIGNED_ABOVE:
          return unassignedCash > condition.value;

        default:
          return true;
      }
    });
  }

  /**
   * Check if rule should execute based on schedule
   */
  checkSchedule(currentDate) {
    if (!this.lastExecuted) return true;

    const lastExecuted = new Date(this.lastExecuted);
    const now = new Date(currentDate);
    const daysDiff = (now - lastExecuted) / (1000 * 60 * 60 * 24);

    switch (this.trigger) {
      case TRIGGER_TYPES.WEEKLY:
        return daysDiff >= 7;
      case TRIGGER_TYPES.BIWEEKLY:
        return daysDiff >= 14;
      case TRIGGER_TYPES.MONTHLY:
        return daysDiff >= 28; // Approximate monthly
      default:
        return true;
    }
  }

  /**
   * Calculate funding amount based on rule type
   */
  calculateFundingAmount(context) {
    const { envelopes, unassignedCash, transactions } = context.data;

    switch (this.type) {
      case RULE_TYPES.FIXED_AMOUNT:
        return Math.min(this.config.amount, unassignedCash);

      case RULE_TYPES.PERCENTAGE: {
        const baseAmount = this.getBaseAmountForPercentage(context);
        return Math.min(
          (baseAmount * this.config.percentage) / 100,
          unassignedCash,
        );
      }

      case RULE_TYPES.SPLIT_REMAINDER: {
        const targetCount = this.config.targetIds?.length || 1;
        return Math.floor(unassignedCash / targetCount);
      }

      case RULE_TYPES.PRIORITY_FILL:
        return this.calculatePriorityFillAmount(context);

      case RULE_TYPES.CONDITIONAL:
        return Math.min(this.config.amount || 0, unassignedCash);

      default:
        return 0;
    }
  }

  /**
   * Get base amount for percentage calculations
   */
  getBaseAmountForPercentage(context) {
    const { unassignedCash, transactions } = context.data;

    if (this.config.sourceType === "income") {
      // Use recent income transactions
      const recentIncome = transactions
        .filter(
          (t) =>
            t.amount > 0 &&
            new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return recentIncome || unassignedCash;
    }

    return unassignedCash;
  }

  /**
   * Calculate amount for priority fill rules
   */
  calculatePriorityFillAmount(context) {
    const { envelopes } = context.data;
    const targetEnvelope = envelopes.find((e) => e.id === this.config.targetId);

    if (!targetEnvelope) return 0;

    const targetAmount =
      this.config.targetAmount || targetEnvelope.monthlyBudget || 0;
    const currentBalance = targetEnvelope.currentBalance || 0;
    const needed = Math.max(0, targetAmount - currentBalance);

    return Math.min(needed, context.data.unassignedCash);
  }
}

/**
 * Auto-Funding Engine Class
 */
export class AutoFundingEngine {
  constructor() {
    this.rules = new Map();
    this.executionHistory = [];
    this.isExecuting = false;
  }

  /**
   * Add a new rule
   */
  addRule(ruleConfig) {
    const rule = new AutoFundingRule(ruleConfig);
    this.rules.set(rule.id, rule);

    logger.info("Auto-funding rule added", {
      ruleId: rule.id,
      name: rule.name,
      type: rule.type,
    });

    return rule;
  }

  /**
   * Update existing rule
   */
  updateRule(ruleId, updates) {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    Object.assign(rule, updates);
    rule.config = { ...rule.config, ...updates.config };

    logger.info("Auto-funding rule updated", { ruleId, updates });
    return rule;
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId) {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      logger.info("Auto-funding rule deleted", { ruleId });
    }
    return deleted;
  }

  /**
   * Get all rules, optionally filtered by enabled status
   */
  getRules(enabledOnly = false) {
    const rules = Array.from(this.rules.values());
    return enabledOnly ? rules.filter((rule) => rule.enabled) : rules;
  }

  /**
   * Get rules sorted by priority
   */
  getRulesByPriority(enabledOnly = true) {
    return this.getRules(enabledOnly).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute all applicable rules
   */
  async executeRules(context, budget) {
    if (this.isExecuting) {
      logger.warn("Auto-funding execution already in progress, skipping");
      return { success: false, error: "Execution in progress" };
    }

    this.isExecuting = true;
    const executionId = `execution_${Date.now()}`;
    const executionResults = [];

    try {
      logger.info("Starting auto-funding rule execution", {
        executionId,
        trigger: context.trigger,
      });

      const applicableRules = this.getRulesByPriority(true).filter((rule) =>
        rule.shouldExecute(context),
      );

      logger.debug("Found applicable rules", {
        count: applicableRules.length,
        rules: applicableRules.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
        })),
      });

      for (const rule of applicableRules) {
        try {
          const result = await this.executeRule(rule, context, budget);
          executionResults.push(result);

          // Update rule execution tracking
          rule.lastExecuted = new Date().toISOString();
          rule.executionCount++;
        } catch (error) {
          logger.error("Failed to execute rule", {
            ruleId: rule.id,
            error: error.message,
          });

          executionResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: error.message,
            executedAt: new Date().toISOString(),
          });
        }
      }

      // Record execution history
      const executionRecord = {
        id: executionId,
        trigger: context.trigger,
        executedAt: new Date().toISOString(),
        rulesExecuted: executionResults.length,
        totalFunded: executionResults
          .filter((r) => r.success)
          .reduce((sum, r) => sum + (r.amount || 0), 0),
        results: executionResults,
      };

      this.executionHistory.unshift(executionRecord);
      // Keep only last 50 executions
      this.executionHistory = this.executionHistory.slice(0, 50);

      logger.info("Auto-funding execution completed", executionRecord);

      return {
        success: true,
        execution: executionRecord,
        results: executionResults,
      };
    } catch (error) {
      logger.error("Auto-funding execution failed", {
        executionId,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
        executionId,
      };
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute a single rule
   */
  async executeRule(rule, context, budget) {
    logger.debug("Executing rule", { ruleId: rule.id, name: rule.name });

    const fundingAmount = rule.calculateFundingAmount(context);

    if (fundingAmount <= 0) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: false,
        error: "No funds available or amount is zero",
        amount: 0,
        executedAt: new Date().toISOString(),
      };
    }

    // Execute the funding based on rule type
    const transfers = this.planTransfers(rule, fundingAmount, context);

    for (const transfer of transfers) {
      await this.executeTransfer(transfer, budget);
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      success: true,
      amount: fundingAmount,
      transfers: transfers.length,
      targetEnvelopes: transfers.map((t) => t.toEnvelopeId),
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Plan transfers for a rule execution
   */
  planTransfers(rule, totalAmount, context) {
    const transfers = [];

    switch (rule.type) {
      case RULE_TYPES.FIXED_AMOUNT:
      case RULE_TYPES.PERCENTAGE:
      case RULE_TYPES.CONDITIONAL:
      case RULE_TYPES.PRIORITY_FILL:
        if (rule.config.targetId) {
          transfers.push({
            fromEnvelopeId: "unassigned",
            toEnvelopeId: rule.config.targetId,
            amount: totalAmount,
            description: `Auto-funding: ${rule.name}`,
          });
        }
        break;

      case RULE_TYPES.SPLIT_REMAINDER:
        if (rule.config.targetIds && rule.config.targetIds.length > 0) {
          const amountPerEnvelope = Math.floor(
            totalAmount / rule.config.targetIds.length,
          );
          rule.config.targetIds.forEach((envelopeId) => {
            transfers.push({
              fromEnvelopeId: "unassigned",
              toEnvelopeId: envelopeId,
              amount: amountPerEnvelope,
              description: `Auto-funding (split): ${rule.name}`,
            });
          });
        }
        break;
    }

    return transfers;
  }

  /**
   * Execute a transfer using the budget store
   */
  async executeTransfer(transfer, budget) {
    try {
      await budget.transferFunds(
        transfer.fromEnvelopeId,
        transfer.toEnvelopeId,
        transfer.amount,
        transfer.description,
      );

      logger.debug("Transfer executed", transfer);
    } catch (error) {
      logger.error("Transfer failed", { transfer, error: error.message });
      throw error;
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 10) {
    return this.executionHistory.slice(0, limit);
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory() {
    this.executionHistory = [];
    logger.info("Auto-funding execution history cleared");
  }

  /**
   * Export rules and history for backup
   */
  exportData() {
    return {
      rules: Array.from(this.rules.values()),
      executionHistory: this.executionHistory,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  }

  /**
   * Import rules and history from backup
   */
  importData(data) {
    if (data.rules) {
      this.rules.clear();
      data.rules.forEach((ruleData) => {
        const rule = new AutoFundingRule(ruleData);
        this.rules.set(rule.id, rule);
      });
    }

    if (data.executionHistory) {
      this.executionHistory = data.executionHistory;
    }

    logger.info("Auto-funding data imported", {
      rulesCount: this.rules.size,
      historyCount: this.executionHistory.length,
    });
  }
}

// Create singleton instance
export const autoFundingEngine = new AutoFundingEngine();

export default autoFundingEngine;
