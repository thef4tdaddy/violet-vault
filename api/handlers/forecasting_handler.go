package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/services"
)

// CalculateCoverageHandler handles bill coverage calculation requests
func CalculateCoverageHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var req services.CoverageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate request
	if len(req.Bills) == 0 {
		response := services.CoverageResponse{
			Bills:         []services.BillCoverageResult{},
			TotalShortage: 0,
			CriticalCount: 0,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Calculate coverage
	startTime := time.Now()
	response := services.CalculateBillCoverage(req)
	executionTime := time.Since(startTime).Microseconds() // Microseconds for <1ms accuracy

	// Add execution time to response (for performance monitoring)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Execution-Time-Us", string(rune(executionTime)))
	json.NewEncoder(w).Encode(response)
}
