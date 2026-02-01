package allocate

import (
	"encoding/json"
	"net/http"
	"time"
)

// Handler processes allocation requests
// Vercel serverless function handler
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only accept POST
	if r.Method != http.MethodPost {
		sendError(w, http.StatusMethodNotAllowed, "Method not allowed", "Only POST requests are accepted")
		return
	}

	// Parse request body
	var req AllocationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, http.StatusBadRequest, "Invalid JSON", err.Error())
		return
	}

	// Validate request
	if err := validateRequest(&req); err != nil {
		sendError(w, http.StatusBadRequest, "Validation error", err.Error())
		return
	}

	// Execute allocation strategy
	startTime := time.Now()
	var allocations []AllocationItem

	switch req.Strategy {
	case "even_split":
		allocations = EvenSplitStrategy(req.PaycheckAmountCents, req.Envelopes, req.PaycheckFrequency)
	case "last_split":
		allocations = LastSplitStrategy(req.PaycheckAmountCents, req.Envelopes, req.PreviousAllocation)
	case "target_first":
		allocations = TargetFirstStrategy(req.PaycheckAmountCents, req.Envelopes)
	default:
		sendError(w, http.StatusBadRequest, "Invalid strategy", "Strategy must be one of: even_split, last_split, target_first")
		return
	}

	executionTime := time.Since(startTime).Seconds() * 1000 // Convert to milliseconds

	// Calculate totals
	var totalAllocated int64
	for _, alloc := range allocations {
		totalAllocated += alloc.AmountCents
	}

	remaining := req.PaycheckAmountCents - totalAllocated

	// Build response
	result := AllocationResult{
		Allocations:         allocations,
		TotalAllocatedCents: totalAllocated,
		RemainingCents:      remaining,
		Strategy:            req.Strategy,
		ExecutionTimeMs:     executionTime,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

// validateRequest validates the allocation request
func validateRequest(req *AllocationRequest) error {
	if req.Strategy == "" {
		return &ValidationError{Field: "strategy", Message: "Strategy is required"}
	}

	if req.PaycheckAmountCents <= 0 {
		return &ValidationError{Field: "paycheckAmountCents", Message: "Paycheck amount must be greater than 0"}
	}

	if req.PaycheckAmountCents > 10_000_000 {
		return &ValidationError{Field: "paycheckAmountCents", Message: "Paycheck amount exceeds maximum ($100,000)"}
	}

	if len(req.Envelopes) == 0 {
		return &ValidationError{Field: "envelopes", Message: "At least one envelope is required"}
	}

	if len(req.Envelopes) > 200 {
		return &ValidationError{Field: "envelopes", Message: "Maximum 200 envelopes allowed"}
	}

	// Validate paycheck frequency (if provided)
	if req.PaycheckFrequency != "" {
		validFrequencies := []string{"weekly", "biweekly", "monthly"}
		valid := false
		for _, f := range validFrequencies {
			if req.PaycheckFrequency == f {
				valid = true
				break
			}
		}
		if !valid {
			return &ValidationError{Field: "paycheckFrequency", Message: "Frequency must be one of: weekly, biweekly, monthly"}
		}
	}

	// Validate each envelope
	for i, env := range req.Envelopes {
		if env.ID == "" {
			return &ValidationError{Field: "envelopes", Message: "Envelope ID is required", Index: &i}
		}
		if env.MonthlyTargetCents < 0 {
			return &ValidationError{Field: "envelopes", Message: "Monthly target cannot be negative", Index: &i}
		}
		if env.CurrentBalanceCents < 0 {
			return &ValidationError{Field: "envelopes", Message: "Current balance cannot be negative", Index: &i}
		}
	}

	// Validate previous allocation if present
	if req.Strategy == "last_split" && (req.PreviousAllocation == nil || len(*req.PreviousAllocation) == 0) {
		// This is allowed - will fallback to even split
	}

	return nil
}

// sendError sends an error response
func sendError(w http.ResponseWriter, statusCode int, errorType, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	errResp := ErrorResponse{
		Error:   errorType,
		Message: message,
		Code:    statusCode,
	}

	json.NewEncoder(w).Encode(errResp)
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
	Index   *int
}

func (e *ValidationError) Error() string {
	if e.Index != nil {
		return e.Field + "[" + string(rune(*e.Index)) + "]: " + e.Message
	}
	return e.Field + ": " + e.Message
}
