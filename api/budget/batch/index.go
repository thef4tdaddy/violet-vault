package handler

import (
	"encoding/json"
	"net/http"

	"github.com/thef4tdaddy/violet-vault/api/_pkg/budget"
)

// Handler is the Vercel entry point for batch calculations
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	budget.AddSecurityHeaders(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(budget.BatchResponse{
			Success: false,
			Error:   "Method not allowed",
		})
		return
	}

	var req budget.BatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(budget.BatchResponse{
			Success: false,
			Error:   "Invalid JSON: " + err.Error(),
		})
		return
	}

	validation := budget.ValidateBatchRequest(req)
	if !validation.Valid {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(budget.BatchResponse{
			Success: false,
			Error:   "Validation failed",
		})
		return
	}

	results, summary := ProcessBatch(req.Requests)

	resp := budget.BatchResponse{
		Success: true,
		Results: results,
		Summary: summary,
	}

	_ = json.NewEncoder(w).Encode(resp)
}

// ProcessBatch processes multiple calculation requests
func ProcessBatch(requests []budget.BatchItem) ([]budget.BatchResultItem, budget.BatchSummary) {
	results := make([]budget.BatchResultItem, len(requests))
	summary := budget.BatchSummary{
		TotalRequests: len(requests),
	}

	for i, item := range requests {
		summary.TotalEnvelopes += len(item.Envelopes)
		summary.TotalTransactions += len(item.Transactions)

		envelopeData, totals := budget.Calculate(item.Envelopes, item.Transactions)
		result := budget.BatchResultItem{
			UserID:   item.UserID,
			Success:  true,
			Data:     envelopeData,
			Totals:   totals,
			Metadata: item.Metadata,
		}
		results[i] = result

		if result.Success {
			summary.SuccessfulCount++
		} else {
			summary.FailedCount++
		}
	}

	return results, summary
}
