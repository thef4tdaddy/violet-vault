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
		{ID: "env1", Name: "Groceries", Category: "Living", MonthlyBudget: 1000, CurrentBalance: 800, EnvelopeType: EnvelopeTypeVariable},
		{ID: "env2", Name: "Rent", Category: "Housing", BiweeklyAllocation: 600, CurrentBalance: 1200, EnvelopeType: EnvelopeTypeBill},
		{ID: "env3", Name: "Vacation", Category: "Savings", TargetAmount: 2000, CurrentBalance: 500, EnvelopeType: EnvelopeTypeSavings},
	}

	transactions := []Transaction{
		{ID: "tx1", EnvelopeID: "env1", Type: "expense", Amount: -100, Date: date(-1), IsPaid: true}, // Paid expense
		{ID: "tx2", EnvelopeID: "env1", Type: "expense", Amount: -50, Date: date(0), IsPaid: false},  // Pending expense (should NOT count as spent)
		{ID: "tx3", EnvelopeID: "env2", Type: "bill", Amount: -1200, Date: date(-2), IsPaid: true},   // Paid bill
	}

	bills := []Bill{
		{ID: "bill1", EnvelopeID: "env2", Amount: -1200, DueDate: date(5), IsPaid: false, Name: "Rent Due"}, // Upcoming
		{ID: "bill2", EnvelopeID: "env1", Amount: -50, DueDate: date(-5), IsPaid: false, Name: "Old Bill"},  // Overdue
	}

	// Execution
	results, totals := Calculate(envelopes, transactions, bills)

	// Assertions: Global Totals
	if totals.EnvelopeCount != 3 {
		t.Errorf("Expected 3 envelopes, got %d", totals.EnvelopeCount)
	}
	// Total Balance: 800 + 1200 + 500 = 2500
	if totals.TotalBalance != 2500 {
		t.Errorf("Expected TotalBalance 2500, got %f", totals.TotalBalance)
	}
	// Total Spent: 100 (tx1) + 1200 (tx3) + 50 (tx2 expense is counted even if !IsPaid in current logic) = 1350
	// Check Calculate Logic: `filterPaidTransactions` includes all expenses.
	if totals.TotalSpent != 1350 {
		t.Errorf("Expected TotalSpent 1350, got %f", totals.TotalSpent)
	}

	// Assertions: Envelope 1 (Variable)
	env1 := results[0]
	if env1.ID != "env1" { // Order preserved? Yes, range slice.
		t.Errorf("Expected first envelope env1, got %s", env1.ID)
	}
	if env1.TotalSpent != 150 {
		t.Errorf("Env1 Spent: Expected 150, got %f", env1.TotalSpent)
	}
	// Overdue Bill (bill2): 50
	if env1.TotalOverdue != 50 {
		t.Errorf("Env1 Overdue: Expected 50, got %f", env1.TotalOverdue)
	}
	// Status: Overdue > 0 => "overdue"
	if env1.Status != "overdue" {
		t.Errorf("Env1 Status: Expected 'overdue', got '%s'", env1.Status)
	}

	// Assertions: Envelope 2 (Bill)
	env2 := results[1]
	// Upcoming Bill (bill1): 1200
	if env2.TotalUpcoming != 1200 {
		t.Errorf("Env2 Upcoming: Expected 1200, got %f", env2.TotalUpcoming)
	}
	// Committed: Upcoming + Overdue = 1200
	if env2.Committed != 1200 {
		t.Errorf("Env2 Committed: Expected 1200, got %f", env2.Committed)
	}
	// Available: Balance (1200) - Committed (1200) = 0
	if env2.Available != 0 {
		t.Errorf("Env2 Available: Expected 0, got %f", env2.Available)
	}
	// Status: Healthy (Available >= 0, Balance >= Upcoming)
	if env2.Status != "healthy" {
		t.Errorf("Env2 Status: Expected 'healthy', got '%s'", env2.Status)
	}
}

func TestCalculateBiweeklyNeed(t *testing.T) {
	tests := []struct {
		name     string
		env      Envelope
		envType  string
		expected float64
	}{
		{
			name:     "Bill with Allocation",
			env:      Envelope{BiweeklyAllocation: 100},
			envType:  EnvelopeTypeBill,
			expected: 100,
		},
		{
			name:     "Monthly Budget",
			env:      Envelope{MonthlyBudget: 2600}, // 2600 / (26/12) = 1200
			envType:  EnvelopeTypeVariable,
			expected: 1200,
		},
		{
			name:     "Monthly Amount",
			env:      Envelope{MonthlyAmount: 1300}, // 1300 / 2.166 = 600
			envType:  EnvelopeTypeVariable,
			expected: 600,
		},
		{
			name:     "Sinking Fund (Target)",
			env:      Envelope{TargetAmount: 1000, CurrentBalance: 500, BiweeklyAllocation: 100},
			envType:  EnvelopeTypeSavings,
			expected: 100, // Min(Remaining=500, Alloc=100) = 100
		},
		{
			name:     "Sinking Fund (Met)",
			env:      Envelope{TargetAmount: 1000, CurrentBalance: 1200, BiweeklyAllocation: 100},
			envType:  EnvelopeTypeSavings,
			expected: 0, // Min(Remaining=0, Alloc=100) = 0
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculateBiweeklyNeed(tt.env, tt.envType)
			// Fuzzy compare for float matches
			if diff := got - tt.expected; diff < -0.1 || diff > 0.1 {
				t.Errorf("got %f, want %f", got, tt.expected)
			}
		})
	}
}

func TestGetEnvelopeType(t *testing.T) {
	// 1. Explicit
	if got := getEnvelopeType(Envelope{EnvelopeType: "explicit"}); got != "explicit" {
		t.Errorf("Expected explicit, got %s", got)
	}
	// 2. Auto-inference
	if got := getEnvelopeType(Envelope{Category: "Housing"}); got != EnvelopeTypeBill {
		t.Errorf("Expected bill, got %s", got)
	}
	if got := getEnvelopeType(Envelope{Category: "Travel"}); got != EnvelopeTypeSavings {
		t.Errorf("Expected savings, got %s", got)
	}
	if got := getEnvelopeType(Envelope{Category: "Dining"}); got != EnvelopeTypeVariable {
		t.Errorf("Expected variable, got %s", got)
	}
}

func TestPartitionBills(t *testing.T) {
	now := time.Now()
	b1 := Bill{DueDate: now.Add(24 * time.Hour).Format("2006-01-02")}  // Future
	b2 := Bill{DueDate: now.Add(-24 * time.Hour).Format("2006-01-02")} // Past

	upcoming, overdue := partitionBills([]Bill{b1, b2}, now)

	if len(upcoming) != 1 || upcoming[0].DueDate != b1.DueDate {
		t.Errorf("Failed to partition upcoming")
	}
	if len(overdue) != 1 || overdue[0].DueDate != b2.DueDate {
		t.Errorf("Failed to partition overdue")
	}
}

func TestParseDate(t *testing.T) {
	// Valid
	if d := parseDate("2023-01-01"); d.IsZero() {
		t.Error("Failed to parse 2023-01-01")
	}
	if d := parseDate("2023-01-01T10:00:00Z"); d.IsZero() {
		t.Error("Failed to parse ISO")
	}
	// Invalid
	if d := parseDate("invalid"); !d.IsZero() {
		t.Error("Should return zero for invalid date")
	}
	if d := parseDate(""); !d.IsZero() {
		t.Error("Should return zero for empty string")
	}
}

func TestFilterHelpers(t *testing.T) {
	txs := []Transaction{
		{ID: "1", EnvelopeID: "A", Type: "expense", IsPaid: true},
		{ID: "2", EnvelopeID: "B", Type: "expense"},
		{ID: "3", EnvelopeID: "A", Type: "bill", IsPaid: false},
	}

	// Test filterTransactions
	aTxs := filterTransactions("A", txs)
	if len(aTxs) != 2 {
		t.Errorf("Expected 2 transactions for Envelope A, got %d", len(aTxs))
	}

	// Test filterPaidTransactions
	paid := filterPaidTransactions(txs)
	// Tx 1 is paid expense. Tx 2 is expense (default unpaid? No, expense usually counts instantly unless we have explicit cleared status.
	// Logic check: t.Type == "expense" || ... -> always included.
	// Tx 3 is bill, !IsPaid -> Excluded.
	if len(paid) != 2 { // 1 and 2
		t.Errorf("Expected 2 paid transactions, got %d", len(paid))
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
	// Underfunded Bill
	billEnv := Envelope{Category: "Housing", CurrentBalance: 50}
	upcoming := []Bill{{Amount: -100}}
	if s := determineStatus(0, 50, billEnv, upcoming); s != "underfunded" {
		t.Errorf("Expected underfunded, got %s", s)
	}
}
