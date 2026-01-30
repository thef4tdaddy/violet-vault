// Package allocate provides paycheck allocation strategies
// Issue #1786 - Go Paycheck Allocation Engine
// Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1
package allocate

// Envelope represents an envelope with allocation data
type Envelope struct {
	ID                  string `json:"id"`
	Name                string `json:"name,omitempty"`
	MonthlyTargetCents  int64  `json:"monthlyTargetCents"`
	CurrentBalanceCents int64  `json:"currentBalanceCents"`
	Category            string `json:"category,omitempty"` // "bills", "savings", "discretionary"
	Priority            int    `json:"priority,omitempty"` // Lower = higher priority
}

// AllocationRequest represents the request payload for allocation
type AllocationRequest struct {
	Strategy            string            `json:"strategy"` // "even_split", "last_split", "target_first"
	PaycheckAmountCents int64             `json:"paycheckAmountCents"`
	Envelopes           []Envelope        `json:"envelopes"`
	PreviousAllocation  *[]AllocationItem `json:"previousAllocation,omitempty"` // For last_split
}

// AllocationItem represents a single allocation to an envelope
type AllocationItem struct {
	EnvelopeID  string `json:"envelopeId"`
	AmountCents int64  `json:"amountCents"`
	Reason      string `json:"reason,omitempty"` // e.g., "Even split (30%)" or "Rule: Monthly Rent"
}

// AllocationResult represents the response with allocation details
type AllocationResult struct {
	Allocations         []AllocationItem `json:"allocations"`
	TotalAllocatedCents int64            `json:"totalAllocatedCents"`
	RemainingCents      int64            `json:"remainingCents"`
	Strategy            string           `json:"strategy"`
	ExecutionTimeMs     float64          `json:"executionTimeMs,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code,omitempty"`
}
