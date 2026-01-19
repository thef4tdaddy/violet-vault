package handler

import (
	"testing"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/_pkg/budget"
)

// Helper to create date strings
func date(daysFromNow int) string {
	t := time.Now().Add(time.Duration(daysFromNow) * 24 * time.Hour)
	return t.Format("2006-01-02")
}

func TestProcessBatch(t *testing.T) {
	// Setup test data
	env1 := budget.Envelope{
		ID:             "env1",
		Name:           "Groceries",
		CurrentBalance: 500,
		Type:           budget.EnvelopeTypeStandard,
	}

	env2 := budget.Envelope{
		ID:             "env2",
		Name:           "Rent",
		CurrentBalance: 1200,
		Type:           budget.EnvelopeTypeLiability,
		MinimumPayment: 1200,
	}

	tx1 := budget.Transaction{
		ID:         "tx1",
		EnvelopeID: "env1",
		Type:       "expense",
		Amount:     -50,
		Date:       date(-1),
	}

	tx2 := budget.Transaction{
		ID:          "tx2",
		EnvelopeID:  "env2",
		Type:        "expense",
		Amount:      -1200,
		Date:        date(5),
		IsScheduled: true,
	}

	// Create batch request
	requests := []budget.BatchItem{
		{
			UserID:       "user1",
			Envelopes:    []budget.Envelope{env1},
			Transactions: []budget.Transaction{tx1},
			Metadata: map[string]interface{}{
				"source": "test",
			},
		},
		{
			UserID:       "user2",
			Envelopes:    []budget.Envelope{env2},
			Transactions: []budget.Transaction{tx2},
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
	requests := []budget.BatchItem{}
	results, summary := ProcessBatch(requests)

	if summary.TotalRequests != 0 {
		t.Errorf("Expected 0 total requests, got %d", summary.TotalRequests)
	}

	if len(results) != 0 {
		t.Errorf("Expected 0 results, got %d", len(results))
	}
}
