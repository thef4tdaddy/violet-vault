package models

// Rule represents an autofunding rule
type Rule struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	Description    string     `json:"description,omitempty"`
	Type           string     `json:"type"`
	Trigger        string     `json:"trigger"`
	Priority       int        `json:"priority"`
	Enabled        bool       `json:"enabled"`
	Config         RuleConfig `json:"config"`
	CreatedAt      string     `json:"createdAt,omitempty"`
	LastExecuted   *string    `json:"lastExecuted,omitempty"`
	ExecutionCount int        `json:"executionCount,omitempty"`
}

// RuleConfig contains the configuration for a rule
type RuleConfig struct {
	SourceType     string       `json:"sourceType"`
	SourceID       *string      `json:"sourceId,omitempty"`
	TargetType     string       `json:"targetType"`
	TargetID       *string      `json:"targetId,omitempty"`
	TargetIDs      []string     `json:"targetIds,omitempty"`
	Amount         int64        `json:"amount,omitempty"`
	Percentage     float64      `json:"percentage,omitempty"`
	Conditions     []Condition  `json:"conditions,omitempty"`
	ScheduleConfig *interface{} `json:"scheduleConfig,omitempty"`
}

// Condition represents a conditional check for a rule
type Condition struct {
	Type       string  `json:"type"`
	EnvelopeID *string `json:"envelopeId,omitempty"`
	Value      int64   `json:"value,omitempty"`
	Operator   *string `json:"operator,omitempty"`
}

// Envelope represents an envelope with balance and target
type Envelope struct {
	ID             string `json:"id"`
	Name           string `json:"name,omitempty"`
	CurrentBalance int64  `json:"currentBalance"`
	MonthlyTarget  int64  `json:"monthlyTarget,omitempty"`
	Category       string `json:"category,omitempty"`
}

// AllocationContext provides context for rule execution
type AllocationContext struct {
	UnassignedCash  int64      `json:"unassignedCash"`
	NewIncomeAmount int64      `json:"newIncomeAmount,omitempty"`
	Envelopes       []Envelope `json:"envelopes"`
}

// Allocation represents a fund allocation result
type Allocation struct {
	EnvelopeID  string  `json:"envelopeId"`
	AmountCents int64   `json:"amountCents"`
	Reason      string  `json:"reason,omitempty"`
	RuleID      *string `json:"ruleId,omitempty"`
}

// AutofundingRequest is the request payload for rule execution
type AutofundingRequest struct {
	RuleIDs []string          `json:"ruleIds,omitempty"`
	Trigger string            `json:"trigger"`
	Context AllocationContext `json:"context"`
}

// AutofundingResponse is the response from rule execution
type AutofundingResponse struct {
	Allocations         []Allocation `json:"allocations"`
	TotalAllocatedCents int64        `json:"totalAllocatedCents"`
	RemainingCents      int64        `json:"remainingCents"`
	ExecutionTimeMs     float64      `json:"executionTimeMs"`
	RulesExecuted       int          `json:"rulesExecuted"`
}
