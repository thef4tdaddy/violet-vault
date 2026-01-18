package budget

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// BatchRequest represents a batch calculation request for multiple users
type BatchRequest struct {
	Requests []BatchItem `json:"requests"`
}

// BatchItem represents a single calculation request in a batch
type BatchItem struct {
	UserID       string                 `json:"userId"`
	Envelopes    []Envelope             `json:"envelopes"`
	Transactions []Transaction          `json:"transactions"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// BatchResponse represents the response for a batch calculation request
type BatchResponse struct {
	Success bool              `json:"success"`
	Results []BatchResultItem `json:"results"`
	Summary BatchSummary      `json:"summary"`
	Error   string            `json:"error,omitempty"`
}

// BatchResultItem represents a single calculation result in a batch
type BatchResultItem struct {
	UserID   string                 `json:"userId"`
	Success  bool                   `json:"success"`
	Data     []EnvelopeData         `json:"data,omitempty"`
	Totals   GlobalTotals           `json:"totals,omitempty"`
	Error    string                 `json:"error,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// BatchSummary provides aggregate statistics for the batch
type BatchSummary struct {
	TotalRequests     int `json:"totalRequests"`
	SuccessfulCount   int `json:"successfulCount"`
	FailedCount       int `json:"failedCount"`
	TotalEnvelopes    int `json:"totalEnvelopes"`
	TotalTransactions int `json:"totalTransactions"`
}

// BatchHandler is the Vercel entry point for batch calculations
func BatchHandler(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	AddSecurityHeaders(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(BatchResponse{
			Success: false,
			Error:   "Method not allowed",
		})
		return
	}

	var req BatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(BatchResponse{
			Success: false,
			Error:   "Invalid JSON: " + err.Error(),
		})
		return
	}

	validation := ValidateBatchRequest(req)
	if !validation.Valid {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(BatchResponse{
			Success: false,
			Error:   fmt.Sprintf("Validation failed (%d errors): %v", len(validation.Errors), validation.Errors),
		})
		return
	}

	results, summary := ProcessBatch(req.Requests)

	resp := BatchResponse{
		Success: true,
		Results: results,
		Summary: summary,
	}

	_ = json.NewEncoder(w).Encode(resp)
}

// ProcessBatch processes multiple calculation requests
func ProcessBatch(requests []BatchItem) ([]BatchResultItem, BatchSummary) {
	results := make([]BatchResultItem, len(requests))
	summary := BatchSummary{
		TotalRequests: len(requests),
	}

	for i, item := range requests {
		summary.TotalEnvelopes += len(item.Envelopes)
		summary.TotalTransactions += len(item.Transactions)

		result := processBatchItem(item)
		results[i] = result

		if result.Success {
			summary.SuccessfulCount++
		} else {
			summary.FailedCount++
		}
	}

	return results, summary
}

// processBatchItem processes a single batch item
func processBatchItem(item BatchItem) BatchResultItem {
	envelopeData, totals := Calculate(item.Envelopes, item.Transactions)

	return BatchResultItem{
		UserID:   item.UserID,
		Success:  true,
		Data:     envelopeData,
		Totals:   totals,
		Metadata: item.Metadata,
	}
}
