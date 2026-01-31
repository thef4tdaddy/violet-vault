package services

import (
	"testing"

	"github.com/thef4tdaddy/violet-vault/api/models"
)

func TestExecuteRules_Comprehensive(t *testing.T) {
	ctx := models.AllocationContext{
		UnassignedCash:  5000,
		NewIncomeAmount: 5000,
		Envelopes: []models.Envelope{
			{ID: "env1", Name: "Standard", CurrentBalance: 500, MonthlyTarget: 1000},
			{ID: "env2", Name: "Rent", CurrentBalance: 0, MonthlyTarget: 1500},
		},
	}

	rules := []models.Rule{
		{
			ID:      "percentage",
			Enabled: true,
			Type:    "percentage",
			Config: models.RuleConfig{
				Percentage: 10.0,
				SourceType: "income",
				TargetID:   stringPtr("env1"),
			},
			Priority: 1,
		},
		{
			ID:      "priority_fill",
			Enabled: true,
			Type:    "priority_fill",
			Config: models.RuleConfig{
				TargetID: stringPtr("env2"),
			},
			Priority: 2,
		},
		{
			ID:      "conditional_pass",
			Enabled: true,
			Type:    "conditional",
			Config: models.RuleConfig{
				Amount:   100,
				TargetID: stringPtr("env1"),
				Conditions: []models.Condition{
					{Type: "unassigned_greater_than", Value: 100},
				},
			},
			Priority: 3,
		},
		{
			ID:      "conditional_trigger_always",
			Enabled: true,
			Type:    "conditional",
			Config: models.RuleConfig{
				Amount:   500,
				TargetID: stringPtr("env1"),
				Conditions: []models.Condition{
					{Type: "unassigned_greater_than", Value: 1},
				},
			},
			Priority: 4,
		},
		{
			ID:      "disabled_rule",
			Enabled: false,
			Type:    "fixed_amount",
			Config: models.RuleConfig{
				Amount:   1000,
				TargetID: stringPtr("env1"),
			},
			Priority: 5,
		},
	}

	allocations := ExecuteRules(rules, ctx)

	// Expected Allocations:
	// 1. Percentage: 10% of 5000 (NewIncome) = 500
	// 2. Priority Fill: Needs 1500 for env2 (Target 1500 - Balance 0) = 1500
	// 3. Conditional Pass: (Unassigned 5000 > 100) = True. Allocates 100.
	// 4. Conditional Trigger Always: (Unassigned 5000 > 1) = True. Allocates 500.

	expectedCount := 4
	if len(allocations) != expectedCount {
		t.Logf("Allocations received:")
		for _, a := range allocations {
			t.Logf("- Rule: %s, Amount: %d", *a.RuleID, a.AmountCents)
		}
		t.Fatalf("Expected %d allocations, got %d", expectedCount, len(allocations))
	}

	if allocations[0].AmountCents != 500 {
		t.Errorf("Percentage Rule: Expected 500, got %d", allocations[0].AmountCents)
	}

	if allocations[1].AmountCents != 1500 {
		t.Errorf("Priority Fill: Expected 1500, got %d", allocations[1].AmountCents)
	}

	if allocations[2].AmountCents != 100 {
		t.Errorf("Conditional Pass: Expected 100, got %d", allocations[2].AmountCents)
	}

	if allocations[3].AmountCents != 500 {
		t.Errorf("Conditional Trigger Always: Expected 500, got %d", allocations[3].AmountCents)
	}

	// Test getBaseAmount edge cases
	unassigned := getBaseAmount("unassigned", ctx)
	if unassigned != ctx.UnassignedCash {
		t.Errorf("getBaseAmount unassigned: Expected %d, got %d", ctx.UnassignedCash, unassigned)
	}
	defaultSource := getBaseAmount("anything_else", ctx)
	if defaultSource != ctx.UnassignedCash {
		t.Errorf("getBaseAmount default: Expected %d, got %d", ctx.UnassignedCash, defaultSource)
	}
}

func TestExecuteSplitRemainder(t *testing.T) {
	ctx := models.AllocationContext{
		UnassignedCash: 10,
	}

	rule := models.Rule{
		ID:      "split",
		Enabled: true,
		Type:    "split_remainder",
		Config: models.RuleConfig{
			TargetIDs: []string{"env1", "env2", "env3"},
		},
	}

	allocations := ExecuteSplitRemainder(rule, ctx)

	if len(allocations) != 3 {
		t.Fatalf("Expected 3 allocations, got %d", len(allocations))
	}

	// 10 / 3 = 3 remainder 1. First gets 4, others get 3.
	if allocations[0].AmountCents != 4 {
		t.Errorf("First split: Expected 4, got %d", allocations[0].AmountCents)
	}
	if allocations[1].AmountCents != 3 {
		t.Errorf("Second split: Expected 3, got %d", allocations[1].AmountCents)
	}
}

func TestConditions(t *testing.T) {
	ctx := models.AllocationContext{
		UnassignedCash: 1000,
		Envelopes: []models.Envelope{
			{ID: "env1", CurrentBalance: 500},
		},
	}

	tests := []struct {
		name      string
		condition models.Condition
		expected  bool
	}{
		{"BalanceLT_True", models.Condition{Type: "balance_less_than", EnvelopeID: stringPtr("env1"), Value: 1000}, true},
		{"BalanceLT_False", models.Condition{Type: "balance_less_than", EnvelopeID: stringPtr("env1"), Value: 100}, false},
		{"BalanceGT_True", models.Condition{Type: "balance_greater_than", EnvelopeID: stringPtr("env1"), Value: 100}, true},
		{"BalanceGT_False", models.Condition{Type: "balance_greater_than", EnvelopeID: stringPtr("env1"), Value: 1000}, false},
		{"UnassignedGT_True", models.Condition{Type: "unassigned_greater_than", Value: 500}, true},
		{"UnassignedGT_False", models.Condition{Type: "unassigned_greater_than", Value: 2000}, false},
		{"UnassignedLT_True", models.Condition{Type: "unassigned_less_than", Value: 2000}, true},
		{"UnassignedLT_False", models.Condition{Type: "unassigned_less_than", Value: 500}, false},
		{"MissingEnvLT", models.Condition{Type: "balance_less_than", EnvelopeID: stringPtr("missing"), Value: 1000}, false},
		{"MissingEnvGT", models.Condition{Type: "balance_greater_than", EnvelopeID: stringPtr("missing"), Value: 10}, false},
		{"NilEnvLT", models.Condition{Type: "balance_less_than", Value: 10}, false},
		{"NilEnvGT", models.Condition{Type: "balance_greater_than", Value: 10}, false},
		{"UnknownCondition", models.Condition{Type: "magic_rule"}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := evaluateCondition(tt.condition, ctx); got != tt.expected {
				t.Errorf("evaluateCondition(%s) = %v, want %v", tt.name, got, tt.expected)
			}
		})
	}
}

func TestMinMaxCap(t *testing.T) {
	if min(10, 20) != 10 {
		t.Error("min failed")
	}
	if min(20, 10) != 10 {
		t.Error("min failed reverse")
	}
	if max(10, 20) != 20 {
		t.Error("max failed")
	}
	if max(20, 10) != 20 {
		t.Error("max failed reverse")
	}
}

func stringPtr(s string) *string {
	return &s
}
