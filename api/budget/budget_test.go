package budget

import (
	"testing"
	"time"
)

// Helper to create date strings
func date(daysFromNow int) string {
	t := time.Now().Add(time.Duration(daysFromNow) * 24 * time.Hour)
	return t.Format("2006-01-02")
}

func TestCalculate(t *testing.T) {
	// Setup Data
	envelopes := []Envelope{
		{ID: "env1", Name: "Groceries", Category: "Living", Type: EnvelopeTypeStandard, CurrentBalance: 800},
		{ID: "env2", Name: "Rent", Category: "Housing", Type: EnvelopeTypeLiability, CurrentBalance: 1200, MinimumPayment: 1200},
		{ID: "env3", Name: "Vacation", Category: "Savings", Type: EnvelopeTypeGoal, TargetAmount: 2000, CurrentBalance: 500},
	}

	transactions := []Transaction{
		{ID: "tx1", EnvelopeID: "env1", Type: "expense", Amount: -100, Date: date(-1), IsScheduled: false},
		{ID: "tx2", EnvelopeID: "env2", Type: "expense", Amount: -1200, Date: date(5), IsScheduled: true}, // Upcoming scheduled
		{ID: "tx3", EnvelopeID: "env1", Type: "expense", Amount: -50, Date: date(-5), IsScheduled: true},  // Overdue scheduled
	}

	// Execution
	results, totals := Calculate(envelopes, transactions)

	// Assertions: Global Totals
	if totals.EnvelopeCount != 3 {
		t.Errorf("Expected 3 envelopes, got %d", totals.EnvelopeCount)
	}
	if totals.TotalBalance != 2500 {
		t.Errorf("Expected TotalBalance 2500, got %f", totals.TotalBalance)
	}

	// Assertions: Envelope 1
	env1 := results[0]
	if env1.TotalSpent != 100 { // Only tx1 is NOT scheduled
		t.Errorf("Env1 Spent: Expected 100, got %f", env1.TotalSpent)
	}
	if env1.TotalOverdue != 50 {
		t.Errorf("Env1 Overdue: Expected 50, got %f", env1.TotalOverdue)
	}

	// Assertions: Envelope 2
	env2 := results[1]
	if env2.TotalUpcoming != 1200 {
		t.Errorf("Env2 Upcoming: Expected 1200, got %f", env2.TotalUpcoming)
	}
}

func TestParseDate(t *testing.T) {
	if d := parseDate("2023-01-01"); d.IsZero() {
		t.Error("Failed to parse 2023-01-01")
	}
	if d := parseDate("2023-01-01T10:00:00Z"); d.IsZero() {
		t.Error("Failed to parse ISO")
	}
	if d := parseDate("invalid"); !d.IsZero() {
		t.Error("Should return zero for invalid date")
	}
}

func TestDetermineStatus(t *testing.T) {
	// Overdue
	if s := determineStatus(100, 500, Envelope{}, nil); s != "overdue" {
		t.Errorf("Expected overdue, got %s", s)
	}
	// Overspent
	if s := determineStatus(0, -100, Envelope{}, nil); s != "overspent" {
		t.Errorf("Expected overspent, got %s", s)
	}
}
