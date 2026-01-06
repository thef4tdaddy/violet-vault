package budget

import (
	"testing"
	"time"
)

func TestProcessBatch(t *testing.T) {
	// Setup test data
	env1 := Envelope{
		ID:             "env1",
		Name:           "Groceries",
		CurrentBalance: 500,
		MonthlyBudget:  600,
		EnvelopeType:   EnvelopeTypeVariable,
	}

	env2 := Envelope{
		ID:                 "env2",
		Name:               "Rent",
		CurrentBalance:     1200,
		BiweeklyAllocation: 600,
		EnvelopeType:       EnvelopeTypeBill,
	}

	tx1 := Transaction{
		ID:         "tx1",
		EnvelopeID: "env1",
		Type:       "expense",
		Amount:     -50,
		Date:       date(-1),
	}

	bill1 := Bill{
		ID:         "bill1",
		EnvelopeID: "env2",
		Amount:     -1200,
		DueDate:    date(5),
		IsPaid:     false,
		Name:       "Rent Due",
	}

	// Create batch request
	requests := []BatchItem{
		{
			UserID:       "user1",
			Envelopes:    []Envelope{env1},
			Transactions: []Transaction{tx1},
			Bills:        []Bill{},
			Metadata: map[string]interface{}{
				"source": "test",
			},
		},
		{
			UserID:       "user2",
			Envelopes:    []Envelope{env2},
			Transactions: []Transaction{},
			Bills:        []Bill{bill1},
		},
	}

	// Execute batch processing
	results, summary := ProcessBatch(requests)

	// Assertions: Summary
	if summary.TotalRequests != 2 {
		t.Errorf("Expected 2 total requests, got %d", summary.TotalRequests)
	}

	if summary.SuccessfulCount != 2 {
		t.Errorf("Expected 2 successful, got %d", summary.SuccessfulCount)
	}

	if summary.FailedCount != 0 {
		t.Errorf("Expected 0 failed, got %d", summary.FailedCount)
	}

	if summary.TotalEnvelopes != 2 {
		t.Errorf("Expected 2 total envelopes, got %d", summary.TotalEnvelopes)
	}

	if summary.TotalTransactions != 1 {
		t.Errorf("Expected 1 total transaction, got %d", summary.TotalTransactions)
	}

	if summary.TotalBills != 1 {
		t.Errorf("Expected 1 total bill, got %d", summary.TotalBills)
	}

	// Assertions: Result 1 (user1 - success)
	result1 := results[0]
	if result1.UserID != "user1" {
		t.Errorf("Expected result1 userID 'user1', got '%s'", result1.UserID)
	}

	if !result1.Success {
		t.Errorf("Expected result1 to succeed, got error: %s", result1.Error)
	}

	if len(result1.Data) != 1 {
		t.Errorf("Expected result1 to have 1 envelope, got %d", len(result1.Data))
	}

	if result1.Totals.EnvelopeCount != 1 {
		t.Errorf("Expected result1 envelope count 1, got %d", result1.Totals.EnvelopeCount)
	}

	// Check metadata echo
	if result1.Metadata == nil {
		t.Error("Expected result1 metadata to be present")
	} else if source, ok := result1.Metadata["source"].(string); !ok || source != "test" {
		t.Errorf("Expected metadata source 'test', got '%v'", result1.Metadata["source"])
	}

	// Assertions: Result 2 (user2 - success)
	result2 := results[1]
	if result2.UserID != "user2" {
		t.Errorf("Expected result2 userID 'user2', got '%s'", result2.UserID)
	}

	if !result2.Success {
		t.Errorf("Expected result2 to succeed, got error: %s", result2.Error)
	}

	if len(result2.Data) != 1 {
		t.Errorf("Expected result2 to have 1 envelope, got %d", len(result2.Data))
	}

	// Verify bill was processed
	if result2.Data[0].TotalUpcoming != 1200 {
		t.Errorf("Expected result2 upcoming bills 1200, got %f", result2.Data[0].TotalUpcoming)
	}
}

func TestProcessBatchEmpty(t *testing.T) {
	requests := []BatchItem{}
	results, summary := ProcessBatch(requests)

	if summary.TotalRequests != 0 {
		t.Errorf("Expected 0 total requests, got %d", summary.TotalRequests)
	}

	if len(results) != 0 {
		t.Errorf("Expected 0 results, got %d", len(results))
	}
}

func TestProcessBatchIsolation(t *testing.T) {
	// Test that each batch item is processed independently
	// and modifications don't affect other items

	env1 := Envelope{
		ID:             "shared-id", // Same ID across requests
		CurrentBalance: 1000,
		MonthlyBudget:  500,
	}

	env2 := Envelope{
		ID:             "shared-id", // Same ID
		CurrentBalance: 2000,
		MonthlyBudget:  800,
	}

	requests := []BatchItem{
		{
			UserID:    "user1",
			Envelopes: []Envelope{env1},
		},
		{
			UserID:    "user2",
			Envelopes: []Envelope{env2},
		},
	}

	results, _ := ProcessBatch(requests)

	// Verify isolation: each result should reflect its own input
	if results[0].Data[0].CurrentBalance != 1000 {
		t.Errorf("Result1 balance should be 1000, got %f", results[0].Data[0].CurrentBalance)
	}

	if results[1].Data[0].CurrentBalance != 2000 {
		t.Errorf("Result2 balance should be 2000, got %f", results[1].Data[0].CurrentBalance)
	}

	if results[0].Data[0].MonthlyBudget != 500 {
		t.Errorf("Result1 budget should be 500, got %f", results[0].Data[0].MonthlyBudget)
	}

	if results[1].Data[0].MonthlyBudget != 800 {
		t.Errorf("Result2 budget should be 800, got %f", results[1].Data[0].MonthlyBudget)
	}
}

func TestProcessBatchLargeDataset(t *testing.T) {
	// Test with larger dataset to ensure performance
	requests := make([]BatchItem, 50)

	for i := 0; i < 50; i++ {
		envelopes := make([]Envelope, 10)
		transactions := make([]Transaction, 20)

		for j := 0; j < 10; j++ {
			envelopes[j] = Envelope{
				ID:             formatID("env", i, j),
				CurrentBalance: float64(1000 + j),
				MonthlyBudget:  float64(500 + j),
			}
		}

		for j := 0; j < 20; j++ {
			transactions[j] = Transaction{
				ID:         formatID("tx", i, j),
				EnvelopeID: formatID("env", i, j%10),
				Type:       "expense",
				Amount:     -50,
				Date:       time.Now().Format("2006-01-02"),
			}
		}

		requests[i] = BatchItem{
			UserID:       formatID("user", i, 0),
			Envelopes:    envelopes,
			Transactions: transactions,
			Bills:        []Bill{},
		}
	}

	// Process batch
	startTime := time.Now()
	results, summary := ProcessBatch(requests)
	duration := time.Since(startTime)

	// Assertions
	if summary.TotalRequests != 50 {
		t.Errorf("Expected 50 requests, got %d", summary.TotalRequests)
	}

	if summary.SuccessfulCount != 50 {
		t.Errorf("Expected 50 successful, got %d", summary.SuccessfulCount)
	}

	if len(results) != 50 {
		t.Errorf("Expected 50 results, got %d", len(results))
	}

	// Performance check: should complete in reasonable time (< 1 second for this dataset)
	if duration.Seconds() > 1.0 {
		t.Logf("Warning: Batch processing took %v, which may be slow", duration)
	} else {
		t.Logf("Batch processing completed in %v", duration)
	}
}

// Helper function to format IDs
func formatID(prefix string, i, j int) string {
	return prefix + "-" + string(rune(i+'0')) + "-" + string(rune(j+'0'))
}
