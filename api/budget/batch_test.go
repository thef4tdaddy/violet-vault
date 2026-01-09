package budget

import (
	"testing"
)

func TestProcessBatch(t *testing.T) {
	// Setup test data
	env1 := Envelope{
		ID:             "env1",
		Name:           "Groceries",
		CurrentBalance: 500,
		Type:           EnvelopeTypeStandard,
	}

	env2 := Envelope{
		ID:             "env2",
		Name:           "Rent",
		CurrentBalance: 1200,
		Type:           EnvelopeTypeLiability,
		MinimumPayment: 1200,
	}

	tx1 := Transaction{
		ID:         "tx1",
		EnvelopeID: "env1",
		Type:       "expense",
		Amount:     -50,
		Date:       date(-1),
	}

	tx2 := Transaction{
		ID:          "tx2",
		EnvelopeID:  "env2",
		Type:        "expense",
		Amount:      -1200,
		Date:        date(5),
		IsScheduled: true,
	}

	// Create batch request
	requests := []BatchItem{
		{
			UserID:       "user1",
			Envelopes:    []Envelope{env1},
			Transactions: []Transaction{tx1},
			Metadata: map[string]interface{}{
				"source": "test",
			},
		},
		{
			UserID:       "user2",
			Envelopes:    []Envelope{env2},
			Transactions: []Transaction{tx2},
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

	if summary.TotalEnvelopes != 2 {
		t.Errorf("Expected 2 total envelopes, got %d", summary.TotalEnvelopes)
	}

	if summary.TotalTransactions != 2 {
		t.Errorf("Expected 2 total transactions, got %d", summary.TotalTransactions)
	}

	// Result 1 Assertions
	result1 := results[0]
	if result1.UserID != "user1" {
		t.Errorf("Expected userID 'user1', got '%s'", result1.UserID)
	}

	// Result 2 Assertions
	result2 := results[1]
	if result2.Data[0].TotalUpcoming != 1200 {
		t.Errorf("Expected upcoming 1200, got %f", result2.Data[0].TotalUpcoming)
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
