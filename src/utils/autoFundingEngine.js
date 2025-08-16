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

// Income Detection Types
export const INCOME_DETECTION_TYPES = {
  AMOUNT_THRESHOLD: "amount_threshold", // Income >= certain amount
  DESCRIPTION_KEYWORDS: "description_keywords", // Contains keywords like "payroll", "salary"
  RECURRING_PATTERN: "recurring_pattern", // Recurring positive amounts
  BANK_CATEGORY: "bank_category", // Categorized as income by bank
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

  /**
   * Calculate amount for priority queue rules (enhanced priority system)
   */
  calculatePriorityQueueAmount(context, remainingCash) {
    const { envelopes } = context.data;
    
    // For priority queue rules, calculate based on remaining cash after higher priority rules
    switch (this.type) {
      case RULE_TYPES.FIXED_AMOUNT:
        return Math.min(this.config.amount, remainingCash);
      
      case RULE_TYPES.PERCENTAGE:
        const baseAmount = this.getBaseAmountForPercentage(context);
        return Math.min((baseAmount * this.config.percentage) / 100, remainingCash);
      
      case RULE_TYPES.PRIORITY_FILL:
        const targetEnvelope = envelopes.find((e) => e.id === this.config.targetId);
        if (!targetEnvelope) return 0;
        
        const targetAmount = this.config.targetAmount || targetEnvelope.monthlyBudget || 0;
        const currentBalance = targetEnvelope.currentBalance || 0;
        const needed = Math.max(0, targetAmount - currentBalance);
        
        return Math.min(needed, remainingCash);
      
      default:
        return Math.min(this.calculateFundingAmount(context), remainingCash);
    }
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
    this.incomePatterns = new Map(); // Track learned income patterns
    this.paydayHistory = []; // Track payday detection history
    this.undoStack = []; // Track undoable operations (last 10 executions)
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
      logger.info("Starting enhanced auto-funding rule execution", {
        executionId,
        trigger: context.trigger,
        availableCash: context.data.unassignedCash,
      });

      // Get rules sorted by priority (lower number = higher priority)
      const applicableRules = this.getRulesByPriority(true).filter((rule) =>
        rule.shouldExecute(context),
      );

      logger.debug("Found applicable rules with priorities", {
        count: applicableRules.length,
        rules: applicableRules.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          priority: r.priority,
        })),
      });

      // Enhanced priority execution with remaining cash tracking
      let remainingCash = context.data.unassignedCash;
      
      for (const rule of applicableRules) {
        if (remainingCash <= 0) {
          logger.debug("No remaining cash for further rules", {
            ruleId: rule.id,
            ruleName: rule.name,
          });
          break;
        }

        try {
          const result = await this.executeRuleWithPriority(rule, context, budget, remainingCash);
          executionResults.push(result);
          
          if (result.success) {
            remainingCash -= result.amount;
            logger.debug("Rule executed successfully", {
              ruleId: rule.id,
              amount: result.amount,
              remainingCash,
            });
          }

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

      // Add to undo stack if there were successful transfers
      if (executionRecord.totalFunded > 0) {
        this.addToUndoStack(executionRecord, executionResults);
      }

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
   * Execute a single rule (legacy method - kept for compatibility)
   */
  async executeRule(rule, context, budget) {
    return this.executeRuleWithPriority(rule, context, budget, context.data.unassignedCash);
  }

  /**
   * Execute a single rule with priority-aware cash management
   */
  async executeRuleWithPriority(rule, context, budget, availableCash) {
    logger.debug("Executing rule with priority", { 
      ruleId: rule.id, 
      name: rule.name, 
      priority: rule.priority,
      availableCash 
    });

    const fundingAmount = rule.calculatePriorityQueueAmount(context, availableCash);

    if (fundingAmount <= 0) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: false,
        error: availableCash <= 0 ? "No funds available" : "Amount calculated as zero",
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

  /**
   * Smart Income Detection - Analyze transaction to determine if it's income
   */
  isIncomeTransaction(transaction) {
    // Must be positive amount
    if (transaction.amount <= 0) return false;

    const amount = transaction.amount;
    const description = (transaction.description || "").toLowerCase();

    // 1. Amount threshold detection (income typically > $100)
    const amountThreshold = 100;
    if (amount >= amountThreshold) {
      logger.debug("Income detected by amount threshold", {
        amount,
        threshold: amountThreshold,
      });
    }

    // 2. Description keyword detection
    const incomeKeywords = [
      "payroll", "salary", "wage", "pay", "direct deposit", "dd",
      "employer", "company", "inc", "corp", "llc", "paycheck",
      "biweekly", "weekly", "monthly", "income", "earnings",
      "deposit", "transfer from", "ach credit", "eft credit"
    ];

    const hasIncomeKeywords = incomeKeywords.some(keyword => 
      description.includes(keyword)
    );

    if (hasIncomeKeywords) {
      logger.debug("Income detected by keywords", {
        description,
        matchedKeywords: incomeKeywords.filter(k => description.includes(k)),
      });
    }

    // 3. Recurring pattern detection (check for similar amounts in history)
    const isRecurringIncome = this.checkRecurringIncomePattern(transaction);

    // 4. Bank category detection (if categorized as income)
    const isBankCategorizedIncome = 
      transaction.category && 
      ["income", "payroll", "salary", "deposit"].includes(
        transaction.category.toLowerCase()
      );

    // Income detection scoring
    let incomeScore = 0;
    if (amount >= amountThreshold) incomeScore += 2;
    if (hasIncomeKeywords) incomeScore += 3;
    if (isRecurringIncome) incomeScore += 4;
    if (isBankCategorizedIncome) incomeScore += 3;
    if (amount >= 500) incomeScore += 1; // Larger amounts more likely to be income

    const isIncome = incomeScore >= 3;

    if (isIncome) {
      logger.info("Income transaction detected", {
        amount,
        description: transaction.description,
        incomeScore,
        detectionMethods: {
          amountThreshold: amount >= amountThreshold,
          keywords: hasIncomeKeywords,
          recurring: isRecurringIncome,
          bankCategory: isBankCategorizedIncome,
        },
      });

      // Learn this pattern for future detection
      this.learnIncomePattern(transaction);
    }

    return isIncome;
  }

  /**
   * Check if transaction matches a recurring income pattern
   */
  checkRecurringIncomePattern(transaction) {
    const amount = transaction.amount;
    const date = new Date(transaction.date);
    
    // Look for similar amounts in the past 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Check stored income patterns
    for (const [patternKey, pattern] of this.incomePatterns) {
      const amountDiff = Math.abs(amount - pattern.averageAmount);
      const amountTolerance = pattern.averageAmount * 0.1; // 10% tolerance

      if (amountDiff <= amountTolerance) {
        // Check if timing matches (weekly, biweekly, monthly)
        const daysSinceLastIncome = this.calculateDaysSince(pattern.lastDate, date);
        
        if (this.matchesRecurringPattern(daysSinceLastIncome, pattern.frequency)) {
          logger.debug("Recurring income pattern matched", {
            amount,
            patternAmount: pattern.averageAmount,
            frequency: pattern.frequency,
            daysSinceLastIncome,
          });
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Learn income patterns from confirmed income transactions
   */
  learnIncomePattern(transaction) {
    const amount = transaction.amount;
    const description = (transaction.description || "").toLowerCase();
    const date = new Date(transaction.date);

    // Create pattern key based on amount range and description similarity
    const amountRange = Math.floor(amount / 100) * 100; // Round to nearest $100
    const patternKey = `${amountRange}_${this.extractKeyWords(description)}`;

    if (this.incomePatterns.has(patternKey)) {
      const pattern = this.incomePatterns.get(patternKey);
      
      // Update pattern with new data
      pattern.count++;
      pattern.averageAmount = (pattern.averageAmount * (pattern.count - 1) + amount) / pattern.count;
      pattern.lastDate = date;
      
      // Calculate frequency based on time between occurrences
      if (pattern.count >= 2) {
        const daysDiff = this.calculateDaysSince(pattern.firstDate, date);
        pattern.frequency = this.estimateFrequency(daysDiff, pattern.count);
      }
    } else {
      // Create new pattern
      this.incomePatterns.set(patternKey, {
        count: 1,
        averageAmount: amount,
        firstDate: date,
        lastDate: date,
        frequency: "unknown",
        description: transaction.description,
      });
    }

    logger.debug("Income pattern learned", {
      patternKey,
      pattern: this.incomePatterns.get(patternKey),
    });
  }

  /**
   * Extract key words from description for pattern matching
   */
  extractKeyWords(description) {
    // Remove common words and keep meaningful identifiers
    const commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"];
    const words = description.split(/\s+/).filter(word => 
      word.length > 2 && !commonWords.includes(word.toLowerCase())
    );
    return words.slice(0, 3).join("_"); // Use first 3 meaningful words
  }

  /**
   * Calculate days between two dates
   */
  calculateDaysSince(fromDate, toDate) {
    return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if days match a recurring pattern
   */
  matchesRecurringPattern(days, frequency) {
    const tolerance = 2; // 2-day tolerance

    switch (frequency) {
      case "weekly":
        return Math.abs(days - 7) <= tolerance || Math.abs(days - 14) <= tolerance;
      case "biweekly":
        return Math.abs(days - 14) <= tolerance || Math.abs(days - 28) <= tolerance;
      case "monthly":
        return Math.abs(days - 30) <= tolerance || Math.abs(days - 31) <= tolerance;
      case "semimonthly":
        return Math.abs(days - 15) <= tolerance || Math.abs(days - 16) <= tolerance;
      default:
        return false;
    }
  }

  /**
   * Estimate frequency based on historical data
   */
  estimateFrequency(totalDays, occurrences) {
    if (occurrences < 2) return "unknown";
    
    const averageDays = totalDays / (occurrences - 1);
    
    if (averageDays >= 6 && averageDays <= 8) return "weekly";
    if (averageDays >= 13 && averageDays <= 16) return "biweekly";
    if (averageDays >= 14 && averageDays <= 17) return "semimonthly";
    if (averageDays >= 28 && averageDays <= 33) return "monthly";
    
    return "irregular";
  }

  /**
   * Handle new transaction and trigger income-based rules
   */
  async handleNewTransaction(transaction, budget) {
    if (!this.isIncomeTransaction(transaction)) {
      return null;
    }

    logger.info("Processing income transaction for auto-funding", {
      amount: transaction.amount,
      description: transaction.description,
    });

    // Find rules triggered by income detection
    const incomeTriggeredRules = this.getRules(true).filter(
      rule => rule.trigger === TRIGGER_TYPES.INCOME_DETECTED
    );

    if (incomeTriggeredRules.length === 0) {
      logger.debug("No income-triggered rules found");
      return null;
    }

    // Execute income-triggered rules
    const context = {
      trigger: TRIGGER_TYPES.INCOME_DETECTED,
      currentDate: new Date().toISOString(),
      data: {
        envelopes: budget.envelopes || [],
        unassignedCash: budget.unassignedCash || 0,
        transactions: budget.allTransactions || [],
        triggeredBy: transaction,
        incomeAmount: transaction.amount,
      },
    };

    return await this.executeRules(context, budget);
  }

  /**
   * Enhanced export that includes learned patterns
   */
  exportDataWithPatterns() {
    return {
      ...this.exportData(),
      incomePatterns: Array.from(this.incomePatterns.entries()),
      paydayHistory: this.paydayHistory,
    };
  }

  /**
   * Enhanced import that includes learned patterns
   */
  importDataWithPatterns(data) {
    this.importData(data);
    
    if (data.incomePatterns) {
      this.incomePatterns.clear();
      data.incomePatterns.forEach(([key, pattern]) => {
        this.incomePatterns.set(key, pattern);
      });
    }

    if (data.paydayHistory) {
      this.paydayHistory = data.paydayHistory;
    }

    logger.info("Auto-funding data with patterns imported", {
      rulesCount: this.rules.size,
      patternsCount: this.incomePatterns.size,
    });
  }

  /**
   * Add execution to undo stack
   */
  addToUndoStack(executionRecord, executionResults) {
    const undoableTransfers = [];
    
    // Extract transfer information for undo
    executionResults.forEach(result => {
      if (result.success && result.transfers) {
        // Get the transfers that were made for this rule
        const ruleTransfers = this.getLastTransfersForExecution(result);
        undoableTransfers.push(...ruleTransfers);
      }
    });

    if (undoableTransfers.length > 0) {
      const undoItem = {
        executionId: executionRecord.id,
        executedAt: executionRecord.executedAt,
        transfers: undoableTransfers,
        totalAmount: executionRecord.totalFunded,
        trigger: executionRecord.trigger,
        canUndo: true,
      };

      this.undoStack.unshift(undoItem);
      // Keep only last 10 undoable operations
      this.undoStack = this.undoStack.slice(0, 10);

      logger.debug("Added execution to undo stack", {
        executionId: executionRecord.id,
        transfersCount: undoableTransfers.length,
        totalAmount: executionRecord.totalFunded,
      });
    }
  }

  /**
   * Get transfer details for undo purposes
   */
  getLastTransfersForExecution(result) {
    // Since we don't store detailed transfer info in results,
    // we'll reconstruct it based on the rule execution
    const transfers = [];
    
    if (result.targetEnvelopes && result.targetEnvelopes.length > 0) {
      if (result.targetEnvelopes.length === 1) {
        // Single target transfer
        transfers.push({
          fromEnvelopeId: "unassigned",
          toEnvelopeId: result.targetEnvelopes[0],
          amount: result.amount,
          description: `Auto-funding: ${result.ruleName}`,
          ruleId: result.ruleId,
        });
      } else {
        // Multiple target transfers (split remainder)
        const amountPerEnvelope = result.amount / result.targetEnvelopes.length;
        result.targetEnvelopes.forEach(envelopeId => {
          transfers.push({
            fromEnvelopeId: "unassigned",
            toEnvelopeId: envelopeId,
            amount: amountPerEnvelope,
            description: `Auto-funding (split): ${result.ruleName}`,
            ruleId: result.ruleId,
          });
        });
      }
    }

    return transfers;
  }

  /**
   * Get list of undoable executions
   */
  getUndoableExecutions() {
    return this.undoStack.filter(item => item.canUndo);
  }

  /**
   * Undo the most recent auto-funding execution
   */
  async undoLastExecution(budget) {
    const undoableExecutions = this.getUndoableExecutions();
    if (undoableExecutions.length === 0) {
      throw new Error("No undoable executions available");
    }

    return this.undoExecution(undoableExecutions[0].executionId, budget);
  }

  /**
   * Undo a specific auto-funding execution by ID
   */
  async undoExecution(executionId, budget) {
    const undoItem = this.undoStack.find(item => 
      item.executionId === executionId && item.canUndo
    );

    if (!undoItem) {
      throw new Error(`Execution ${executionId} is not undoable`);
    }

    try {
      logger.info("Starting undo operation", {
        executionId,
        transfersToReverse: undoItem.transfers.length,
        totalAmount: undoItem.totalAmount,
      });

      // Reverse all transfers
      for (const transfer of undoItem.transfers) {
        await this.reverseTransfer(transfer, budget);
      }

      // Mark as undone
      undoItem.canUndo = false;
      undoItem.undoneAt = new Date().toISOString();

      // Add undo record to execution history
      const undoRecord = {
        id: `undo_${executionId}_${Date.now()}`,
        trigger: "manual_undo",
        executedAt: new Date().toISOString(),
        rulesExecuted: 0,
        totalFunded: -undoItem.totalAmount, // Negative to indicate reversal
        results: [{
          ruleId: "undo",
          ruleName: "Undo Auto-funding",
          success: true,
          amount: undoItem.totalAmount,
          executedAt: new Date().toISOString(),
          originalExecutionId: executionId,
        }],
        isUndo: true,
        originalExecutionId: executionId,
      };

      this.executionHistory.unshift(undoRecord);

      logger.info("Undo operation completed successfully", {
        executionId,
        amountReversed: undoItem.totalAmount,
      });

      return {
        success: true,
        executionId,
        amountReversed: undoItem.totalAmount,
        transfersReversed: undoItem.transfers.length,
        undoRecord,
      };

    } catch (error) {
      logger.error("Undo operation failed", {
        executionId,
        error: error.message,
      });
      throw new Error(`Failed to undo execution: ${error.message}`);
    }
  }

  /**
   * Reverse a single transfer
   */
  async reverseTransfer(transfer, budget) {
    try {
      // Reverse the transfer: move money back from target to source
      await budget.transferFunds(
        transfer.toEnvelopeId,
        transfer.fromEnvelopeId,
        transfer.amount,
        `Undo: ${transfer.description}`,
      );

      logger.debug("Transfer reversed", {
        from: transfer.toEnvelopeId,
        to: transfer.fromEnvelopeId,
        amount: transfer.amount,
      });
    } catch (error) {
      logger.error("Failed to reverse transfer", {
        transfer,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Clear undo stack (useful for cleanup)
   */
  clearUndoStack() {
    this.undoStack = [];
    logger.info("Undo stack cleared");
  }

  /**
   * Get undo statistics
   */
  getUndoStatistics() {
    const total = this.undoStack.length;
    const undoable = this.undoStack.filter(item => item.canUndo).length;
    const undone = total - undoable;

    return {
      total,
      undoable,
      undone,
      lastUndoable: undoable > 0 ? this.undoStack.find(item => item.canUndo) : null,
    };
  }

  /**
   * Enhanced export with undo data
   */
  exportDataWithUndoStack() {
    return {
      ...this.exportDataWithPatterns(),
      undoStack: this.undoStack,
    };
  }

  /**
   * Enhanced import with undo data
   */
  importDataWithUndoStack(data) {
    this.importDataWithPatterns(data);
    
    if (data.undoStack) {
      this.undoStack = data.undoStack;
    }

    logger.info("Auto-funding data with undo stack imported", {
      rulesCount: this.rules.size,
      patternsCount: this.incomePatterns.size,
      undoableCount: this.undoStack.filter(item => item.canUndo).length,
    });
  }
}

// Create singleton instance
export const autoFundingEngine = new AutoFundingEngine();

export default autoFundingEngine;
