package handler

import "time"

// Envelope represents a budget envelope (matches TypeScript EnvelopeSchema)
type Envelope struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Type           string   `json:"type"`
	Category       string   `json:"category"`
	CurrentBalance float64  `json:"currentBalance"`
	TargetAmount   *float64 `json:"targetAmount,omitempty"`
	Color          string   `json:"color"`
	Description    *string  `json:"description,omitempty"`
	AutoAllocate   bool     `json:"autoAllocate"`
	Archived       bool     `json:"archived"`
	LastModified   int64    `json:"lastModified"`
	CreatedAt      int64    `json:"createdAt"`

	// Standard envelope fields
	MonthlyBudget      *float64 `json:"monthlyBudget,omitempty"`
	BiweeklyAllocation *float64 `json:"biweeklyAllocation,omitempty"`

	// Goal envelope fields
	Priority            *string    `json:"priority,omitempty"`
	TargetDate          *time.Time `json:"targetDate,omitempty"`
	IsPaused            *bool      `json:"isPaused,omitempty"`
	IsCompleted         *bool      `json:"isCompleted,omitempty"`
	MonthlyContribution *float64   `json:"monthlyContribution,omitempty"`

	// Liability envelope fields
	Status          *string  `json:"status,omitempty"`
	InterestRate    *float64 `json:"interestRate,omitempty"`
	MinimumPayment  *float64 `json:"minimumPayment,omitempty"`
	DueDate         *int     `json:"dueDate,omitempty"`
	OriginalBalance *float64 `json:"originalBalance,omitempty"`
	Creditor        *string  `json:"creditor,omitempty"`
	IsPaid          *bool    `json:"isPaid,omitempty"`
}

// Transaction represents a financial transaction (matches TypeScript TransactionSchema)
type Transaction struct {
	ID           string  `json:"id"`
	Date         string  `json:"date"` // ISO 8601 date string
	Amount       float64 `json:"amount"`
	EnvelopeID   string  `json:"envelopeId"`
	Category     string  `json:"category"`
	Type         string  `json:"type"` // "income", "expense", "transfer"
	Description  *string `json:"description,omitempty"`
	Merchant     *string `json:"merchant,omitempty"`
	LastModified int64   `json:"lastModified"`
	CreatedAt    int64   `json:"createdAt"`

	// Optional fields
	ReceiptURL         *string `json:"receiptUrl,omitempty"`
	IsScheduled        bool    `json:"isScheduled"`
	RecurrenceRule     *string `json:"recurrenceRule,omitempty"`
	IsInternalTransfer *bool   `json:"isInternalTransfer,omitempty"`
}

// DemoDataResponse represents the complete mock data payload
type DemoDataResponse struct {
	Envelopes        []Envelope    `json:"envelopes"`
	Transactions     []Transaction `json:"transactions"`
	Bills            []Envelope    `json:"bills"` // Bills are liability-type envelopes
	GeneratedAt      string        `json:"generatedAt"`
	RecordCount      int           `json:"recordCount"`
	GenerationTimeMs int64         `json:"generationTimeMs"`
}
