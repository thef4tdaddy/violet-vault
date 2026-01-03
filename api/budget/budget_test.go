package budget

import (
	"testing"
)

func TestCalculateUtilization(t *testing.T) {
	// Test Case 1: Variable Envelope
	env := Envelope{
		ID:             "1",
		EnvelopeType:   EnvelopeTypeVariable,
		MonthlyBudget:  1000.0,
		CurrentBalance: 500.0,
	}
	// Spend 200, Committed 0
	rate := calculateUtilizationRate(env, EnvelopeTypeVariable, nil, nil, 500.0, 200.0, 0)
	// (200 + 0) / 1000 = 0.2
	if rate != 0.2 {
		t.Errorf("Expected 0.2, got %f", rate)
	}

	// Test Case 2: Savings Envelope
	envSav := Envelope{
		ID:             "2",
		EnvelopeType:   EnvelopeTypeSavings,
		TargetAmount:   2000.0,
		CurrentBalance: 1000.0,
	}
	rateSav := calculateUtilizationRate(envSav, EnvelopeTypeSavings, nil, nil, 1000.0, 0, 0)
	// 1000 / 2000 = 0.5
	if rateSav != 0.5 {
		t.Errorf("Expected 0.5, got %f", rateSav)
	}
}

func TestBiweeklyNeed(t *testing.T) {
	// Monthly Budget 2600
	env := Envelope{
		ID:            "1",
		MonthlyBudget: 2600.0,
	}
	// 2600 / (26/12) = 2600 / 2.1666 = 1200
	need := calculateBiweeklyNeed(env, EnvelopeTypeVariable)
	if need != 1200.0 {
		t.Errorf("Expected 1200.0, got %f", need)
	}
}
