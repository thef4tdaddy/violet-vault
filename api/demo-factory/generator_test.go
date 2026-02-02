package handler

import (
	"testing"
)

// TestGenerateMockData_Basic tests basic data generation
func TestGenerateMockData_Basic(t *testing.T) {
	result := GenerateMockData(100)

	if result == nil {
		t.Fatal("Expected non-nil result")
	}

	if len(result.Envelopes) == 0 {
		t.Error("Expected at least one envelope")
	}

	if len(result.Transactions) == 0 {
		t.Error("Expected at least one transaction")
	}

	if len(result.Bills) == 0 {
		t.Error("Expected at least one bill")
	}

	if result.RecordCount != len(result.Envelopes)+len(result.Transactions)+len(result.Bills) {
		t.Errorf("RecordCount mismatch: expected %d, got %d",
			len(result.Envelopes)+len(result.Transactions)+len(result.Bills),
			result.RecordCount)
	}

	if result.GeneratedAt == "" {
		t.Error("Expected non-empty GeneratedAt timestamp")
	}
}

// TestGenerateMockData_RelationshipMapping tests that transaction envelopeIds reference valid envelopes
func TestGenerateMockData_RelationshipMapping(t *testing.T) {
	result := GenerateMockData(1000)

	// Build envelope ID map
	envelopeIDs := make(map[string]bool)
	for _, env := range result.Envelopes {
		envelopeIDs[env.ID] = true
	}
	for _, bill := range result.Bills {
		envelopeIDs[bill.ID] = true
	}

	// Verify all transactions reference valid envelopes
	for _, txn := range result.Transactions {
		if !envelopeIDs[txn.EnvelopeID] {
			t.Errorf("Transaction %s references non-existent envelope %s", txn.ID, txn.EnvelopeID)
		}
	}
}

// TestGenerateMockData_BalancedMath tests that total income exceeds total expenses
func TestGenerateMockData_BalancedMath(t *testing.T) {
	result := GenerateMockData(5000)

	totalIncome := 0.0
	totalExpenses := 0.0

	for _, txn := range result.Transactions {
		if txn.Type == "income" {
			totalIncome += txn.Amount
		} else if txn.Type == "expense" {
			totalExpenses += -txn.Amount // Expenses are negative
		}
	}

	if totalIncome <= 0 {
		t.Error("Expected positive total income")
	}

	if totalExpenses <= 0 {
		t.Error("Expected positive total expenses")
	}

	if totalIncome <= totalExpenses {
		t.Errorf("Income (%f) should exceed expenses (%f) for balanced budget", totalIncome, totalExpenses)
	}

	// Verify at least 10% surplus
	surplus := totalIncome - totalExpenses
	if surplus < totalIncome*0.1 {
		t.Errorf("Expected at least 10%% surplus, got %.2f%%", (surplus/totalIncome)*100)
	}
}

// TestGenerateMockData_TransactionTypes tests correct transaction amount signs
func TestGenerateMockData_TransactionTypes(t *testing.T) {
	result := GenerateMockData(500)

	for _, txn := range result.Transactions {
		switch txn.Type {
		case "income":
			if txn.Amount <= 0 {
				t.Errorf("Income transaction %s has negative/zero amount: %f", txn.ID, txn.Amount)
			}
		case "expense":
			if txn.Amount >= 0 {
				t.Errorf("Expense transaction %s has positive/zero amount: %f", txn.ID, txn.Amount)
			}
		}
	}
}

// TestGenerateMockData_EnvelopeTypes tests envelope type distribution
func TestGenerateMockData_EnvelopeTypes(t *testing.T) {
	result := GenerateMockData(1000)

	typeCount := make(map[string]int)
	for _, env := range result.Envelopes {
		typeCount[env.Type]++
	}

	if typeCount["standard"] == 0 {
		t.Error("Expected at least one standard envelope")
	}

	if typeCount["goal"] == 0 {
		t.Error("Expected at least one goal envelope")
	}

	// Verify bills are liability type
	for _, bill := range result.Bills {
		if bill.Type != "liability" {
			t.Errorf("Bill %s has incorrect type: %s (expected 'liability')", bill.ID, bill.Type)
		}
	}
}

// TestGenerateMockData_RealisticMerchants tests that merchants are assigned
func TestGenerateMockData_RealisticMerchants(t *testing.T) {
	result := GenerateMockData(200)

	merchantCount := 0
	for _, txn := range result.Transactions {
		if txn.Merchant != nil && *txn.Merchant != "" {
			merchantCount++
		}
	}

	// Most transactions should have merchants
	if merchantCount < int(float64(len(result.Transactions))*0.8) {
		t.Errorf("Expected at least 80%% of transactions to have merchants, got %.2f%%",
			float64(merchantCount)/float64(len(result.Transactions))*100)
	}
}

// BenchmarkGenerateMockData_10k benchmarks generation of 10,000+ records
func BenchmarkGenerateMockData_10k(b *testing.B) {
	for i := 0; i < b.N; i++ {
		result := GenerateMockData(10000)
		if result.RecordCount < 10000 {
			b.Fatalf("Expected at least 10000 records, got %d", result.RecordCount)
		}
	}
}

// BenchmarkGenerateMockData_50k benchmarks generation of 50,000+ records
func BenchmarkGenerateMockData_50k(b *testing.B) {
	for i := 0; i < b.N; i++ {
		result := GenerateMockData(50000)
		if result.RecordCount < 50000 {
			b.Fatalf("Expected at least 50000 records, got %d", result.RecordCount)
		}
	}
}

// TestGenerateMockData_PerformanceRequirement tests the <100ms requirement for 10k records
func TestGenerateMockData_PerformanceRequirement(t *testing.T) {
	result := GenerateMockData(10000)

	if result.GenerationTimeMs >= 100 {
		t.Errorf("Generation took %dms, expected < 100ms", result.GenerationTimeMs)
	}

	if result.RecordCount < 10000 {
		t.Errorf("Expected at least 10000 records, got %d", result.RecordCount)
	}

	t.Logf("✅ Generated %d records in %dms", result.RecordCount, result.GenerationTimeMs)
}
