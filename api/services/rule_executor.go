package services

import (
	"fmt"
	"sort"

	"github.com/thef4tdaddy/violet-vault/api/models"
)

// ExecuteRules executes all enabled rules in priority order
func ExecuteRules(rules []models.Rule, ctx models.AllocationContext) []models.Allocation {
	// Sort by priority (lower = higher priority)
	sort.Slice(rules, func(i, j int) bool {
		return rules[i].Priority < rules[j].Priority
	})

	allocations := []models.Allocation{}
	remainingCash := ctx.UnassignedCash

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}

		// Update context with remaining cash
		ctx.UnassignedCash = remainingCash

		// Execute rule based on type
		var ruleAllocations []models.Allocation
		switch rule.Type {
		case "fixed_amount":
			ruleAllocations = []models.Allocation{ExecuteFixedAmount(rule, ctx)}
		case "percentage":
			ruleAllocations = []models.Allocation{ExecutePercentage(rule, ctx)}
		case "priority_fill":
			ruleAllocations = []models.Allocation{ExecutePriorityFill(rule, ctx)}
		case "split_remainder":
			ruleAllocations = ExecuteSplitRemainder(rule, ctx)
		case "conditional":
			if alloc, ok := ExecuteConditional(rule, ctx); ok {
				ruleAllocations = []models.Allocation{alloc}
			}
		}

		// Deduct from remaining cash and add to results
		for _, alloc := range ruleAllocations {
			remainingCash -= alloc.AmountCents
			allocations = append(allocations, alloc)
		}
	}

	return allocations
}

// ExecuteFixedAmount executes a fixed amount rule
func ExecuteFixedAmount(rule models.Rule, ctx models.AllocationContext) models.Allocation {
	amount := min(rule.Config.Amount, ctx.UnassignedCash)

	targetID := ""
	if rule.Config.TargetID != nil {
		targetID = *rule.Config.TargetID
	}

	return models.Allocation{
		EnvelopeID:  targetID,
		AmountCents: max(0, amount),
		Reason:      fmt.Sprintf("Fixed: $%.2f", float64(amount)/100),
		RuleID:      &rule.ID,
	}
}

// ExecutePercentage executes a percentage-based rule
func ExecutePercentage(rule models.Rule, ctx models.AllocationContext) models.Allocation {
	baseAmount := getBaseAmount(rule.Config.SourceType, ctx)
	amount := int64(float64(baseAmount) * rule.Config.Percentage / 100)
	amount = min(amount, ctx.UnassignedCash)

	targetID := ""
	if rule.Config.TargetID != nil {
		targetID = *rule.Config.TargetID
	}

	return models.Allocation{
		EnvelopeID:  targetID,
		AmountCents: max(0, amount),
		Reason:      fmt.Sprintf("%.1f%% of source", rule.Config.Percentage),
		RuleID:      &rule.ID,
	}
}

// ExecutePriorityFill executes a priority fill rule (fill to monthly target)
func ExecutePriorityFill(rule models.Rule, ctx models.AllocationContext) models.Allocation {
	targetID := ""
	if rule.Config.TargetID != nil {
		targetID = *rule.Config.TargetID
	}

	envelope := getEnvelopeByID(ctx.Envelopes, targetID)
	if envelope == nil {
		return models.Allocation{
			EnvelopeID:  targetID,
			AmountCents: 0,
			Reason:      "Envelope not found",
			RuleID:      &rule.ID,
		}
	}

	needed := envelope.MonthlyTarget - envelope.CurrentBalance
	amount := min(needed, ctx.UnassignedCash)

	return models.Allocation{
		EnvelopeID:  targetID,
		AmountCents: max(0, amount),
		Reason:      "Priority fill to monthly target",
		RuleID:      &rule.ID,
	}
}

// ExecuteSplitRemainder executes a split remainder rule (evenly split among targets)
func ExecuteSplitRemainder(rule models.Rule, ctx models.AllocationContext) []models.Allocation {
	numTargets := int64(len(rule.Config.TargetIDs))
	if numTargets == 0 {
		return []models.Allocation{}
	}

	perEnvelope := ctx.UnassignedCash / numTargets
	remainder := ctx.UnassignedCash % numTargets

	allocations := []models.Allocation{}
	for i, targetID := range rule.Config.TargetIDs {
		amount := perEnvelope
		if int64(i) == 0 {
			amount += remainder // Give remainder to first envelope
		}

		allocations = append(allocations, models.Allocation{
			EnvelopeID:  targetID,
			AmountCents: amount,
			Reason:      "Even split of remainder",
			RuleID:      &rule.ID,
		})
	}

	return allocations
}

// ExecuteConditional executes a conditional rule (only if conditions are met)
func ExecuteConditional(rule models.Rule, ctx models.AllocationContext) (models.Allocation, bool) {
	// Check all conditions
	for _, condition := range rule.Config.Conditions {
		if !evaluateCondition(condition, ctx) {
			return models.Allocation{}, false // Condition not met
		}
	}

	// All conditions met, execute allocation
	amount := min(rule.Config.Amount, ctx.UnassignedCash)
	targetID := ""
	if rule.Config.TargetID != nil {
		targetID = *rule.Config.TargetID
	}

	return models.Allocation{
		EnvelopeID:  targetID,
		AmountCents: max(0, amount),
		Reason:      "Conditional rule triggered",
		RuleID:      &rule.ID,
	}, true
}

// Helper Functions

func getBaseAmount(sourceType string, ctx models.AllocationContext) int64 {
	switch sourceType {
	case "unassigned":
		return ctx.UnassignedCash
	case "income":
		return ctx.NewIncomeAmount
	default:
		return ctx.UnassignedCash
	}
}

func getEnvelopeByID(envelopes []models.Envelope, id string) *models.Envelope {
	for i := range envelopes {
		if envelopes[i].ID == id {
			return &envelopes[i]
		}
	}
	return nil
}

func evaluateCondition(condition models.Condition, ctx models.AllocationContext) bool {
	switch condition.Type {
	case "balance_less_than":
		if condition.EnvelopeID == nil {
			return false
		}
		envelope := getEnvelopeByID(ctx.Envelopes, *condition.EnvelopeID)
		if envelope == nil {
			return false
		}
		return envelope.CurrentBalance < condition.Value

	case "balance_greater_than":
		if condition.EnvelopeID == nil {
			return false
		}
		envelope := getEnvelopeByID(ctx.Envelopes, *condition.EnvelopeID)
		if envelope == nil {
			return false
		}
		return envelope.CurrentBalance > condition.Value

	case "unassigned_greater_than":
		return ctx.UnassignedCash > condition.Value

	case "unassigned_less_than":
		return ctx.UnassignedCash < condition.Value

	default:
		return true // Unknown conditions pass by default
	}
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
