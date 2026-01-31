package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"violet-vault/api/models"
	"violet-vault/api/services"
)

// ExecuteAutofundingHandler handles autofunding rule execution requests
func ExecuteAutofundingHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request
	var req models.AutofundingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Fetch rules (for now, rules must be provided in request)
	// TODO: In production, fetch rules from database by IDs
	var rules []models.Rule
	if len(req.RuleIDs) > 0 {
		// For now, return error if rule IDs are provided (database integration needed)
		http.Error(w, "Rule fetching from database not yet implemented", http.StatusNotImplemented)
		return
	}

	// If no rule IDs provided, expect rules to be embedded in context
	// This is a temporary workaround for testing
	if len(rules) == 0 {
		// Return empty response
		response := models.AutofundingResponse{
			Allocations:         []models.Allocation{},
			TotalAllocatedCents: 0,
			RemainingCents:      req.Context.UnassignedCash,
			ExecutionTimeMs:     0,
			RulesExecuted:       0,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Execute rules
	startTime := time.Now()
	allocations := services.ExecuteRules(rules, req.Context)
	executionTime := time.Since(startTime).Milliseconds()

	// Calculate totals
	totalAllocated := int64(0)
	for _, alloc := range allocations {
		totalAllocated += alloc.AmountCents
	}

	// Build response
	response := models.AutofundingResponse{
		Allocations:         allocations,
		TotalAllocatedCents: totalAllocated,
		RemainingCents:      req.Context.UnassignedCash - totalAllocated,
		ExecutionTimeMs:     float64(executionTime),
		RulesExecuted:       len(rules),
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ExecuteAutofundingWithRulesHandler handles execution with rules provided in request body
// This is useful for testing without database integration
func ExecuteAutofundingWithRulesHandler(w http.ResponseWriter, r *http.Request) {
	// Parse request with rules embedded
	var req struct {
		Rules   []models.Rule              `json:"rules"`
		Trigger string                     `json:"trigger"`
		Context models.AllocationContext   `json:"context"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Execute rules
	startTime := time.Now()
	allocations := services.ExecuteRules(req.Rules, req.Context)
	executionTime := time.Since(startTime).Milliseconds()

	// Calculate totals
	totalAllocated := int64(0)
	for _, alloc := range allocations {
		totalAllocated += alloc.AmountCents
	}

	// Build response
	response := models.AutofundingResponse{
		Allocations:         allocations,
		TotalAllocatedCents: totalAllocated,
		RemainingCents:      req.Context.UnassignedCash - totalAllocated,
		ExecutionTimeMs:     float64(executionTime),
		RulesExecuted:       len(req.Rules),
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
