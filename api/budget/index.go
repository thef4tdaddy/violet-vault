package handler

import (
	"encoding/json"
	"net/http"

	"github.com/thef4tdaddy/violet-vault/api/_pkg/budget"
)

// Handler is the Vercel entry point
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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req budget.BudgetCalculationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(budget.BudgetCalculationResponse{Success: false, Error: "Invalid JSON: " + err.Error()})
		return
	}

	validation := budget.ValidateRequest(req)
	if !validation.Valid {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(budget.BudgetCalculationResponse{
			Success: false,
			Error:   "Validation failed",
		})
		return
	}

	envelopeData, totals := budget.Calculate(req.Envelopes, req.Transactions)

	resp := budget.BudgetCalculationResponse{
		Success: true,
		Data:    envelopeData,
		Totals:  totals,
	}

	_ = json.NewEncoder(w).Encode(resp)
}
