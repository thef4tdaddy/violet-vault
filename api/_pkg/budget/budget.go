package budget

import (
	"fmt"
	"math"
	"net/http"
	"time"
)

// Constants
const (
	EnvelopeTypeStandard     = "standard"
	EnvelopeTypeGoal         = "goal"
	EnvelopeTypeLiability    = "liability"
	EnvelopeTypeSupplemental = "supplemental"

	BiweeklyMultiplier = 26.0 / 12.0
	BillLookaheadDays  = 30
)

// Request Limits
const (
	MaxEnvelopes    = 1000
	MaxTransactions = 10000
	MaxBatchSize    = 100
	MaxIDLength     = 100
	MaxNameLength   = 200
)

// Types

type Envelope struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Category       string  `json:"category"`
	Type           string  `json:"type"` // standard, goal, liability, supplemental
	Archived       bool    `json:"archived"`
	LastModified   int64   `json:"lastModified"`
	CurrentBalance float64 `json:"currentBalance"`
	Description    string  `json:"description,omitempty"`
	// Goal/Liability/Supplemental fields
	TargetAmount        float64 `json:"targetAmount,omitempty"`
	TargetDate          string  `json:"targetDate,omitempty"`
	MonthlyBudget       float64 `json:"monthlyBudget,omitempty"`
	BiweeklyAllocation  float64 `json:"biweeklyAllocation,omitempty"`
	MonthlyContribution float64 `json:"monthlyContribution,omitempty"`
	MinimumPayment      float64 `json:"minimumPayment,omitempty"`
	InterestRate        float64 `json:"interestRate,omitempty"`
	DueDateDay          int     `json:"dueDateDay,omitempty"`
	AccountType         string  `json:"accountType,omitempty"`
	AnnualContribution  float64 `json:"annualContribution,omitempty"`
}

type Transaction struct {
	ID                 string             `json:"id"`
	EnvelopeID         string             `json:"envelopeId"`
	Type               string             `json:"type"` // income, expense, transfer
	Amount             float64            `json:"amount"`
	Date               string             `json:"date"`
	Description        string             `json:"description,omitempty"`
	IsScheduled        bool               `json:"isScheduled"`
	RecurrenceRule     string             `json:"recurrenceRule,omitempty"`
	Allocations        map[string]float64 `json:"allocations,omitempty"`
	IsInternalTransfer bool               `json:"isInternalTransfer,omitempty"`
}

type EnvelopeData struct {
	Envelope
	TotalSpent      float64       `json:"totalSpent"`
	TotalUpcoming   float64       `json:"totalUpcoming"`
	TotalOverdue    float64       `json:"totalOverdue"`
	Available       float64       `json:"available"`
	Committed       float64       `json:"committed"`
	UtilizationRate float64       `json:"utilizationRate"`
	Status          string        `json:"status"`
	UpcomingBills   []Transaction `json:"upcomingBills"`
	OverdueBills    []Transaction `json:"overdueBills"`
	Transactions    []Transaction `json:"transactions"`
}

type GlobalTotals struct {
	TotalAllocated float64 `json:"totalAllocated"`
	TotalSpent     float64 `json:"totalSpent"`
	TotalBalance   float64 `json:"totalBalance"`
	TotalUpcoming  float64 `json:"totalUpcoming"`
	BillsDueCount  int     `json:"billsDueCount"`
	EnvelopeCount  int     `json:"envelopeCount"`
}

type BudgetCalculationRequest struct {
	Envelopes    []Envelope    `json:"envelopes"`
	Transactions []Transaction `json:"transactions"`
}

type BudgetCalculationResponse struct {
	Success bool           `json:"success"`
	Data    []EnvelopeData `json:"data"`
	Totals  GlobalTotals   `json:"totals"`
	Error   string         `json:"error,omitempty"`
}

type BatchRequest struct {
	Requests []BatchItem `json:"requests"`
}

type BatchItem struct {
	UserID       string                 `json:"userId"`
	Envelopes    []Envelope             `json:"envelopes"`
	Transactions []Transaction          `json:"transactions"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

type BatchResponse struct {
	Success bool              `json:"success"`
	Results []BatchResultItem `json:"results"`
	Summary BatchSummary      `json:"summary"`
	Error   string            `json:"error,omitempty"`
}

type BatchResultItem struct {
	UserID   string                 `json:"userId"`
	Success  bool                   `json:"success"`
	Data     []EnvelopeData         `json:"data,omitempty"`
	Totals   GlobalTotals           `json:"totals,omitempty"`
	Error    string                 `json:"error,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

type BatchSummary struct {
	TotalRequests     int `json:"totalRequests"`
	SuccessfulCount   int `json:"successfulCount"`
	FailedCount       int `json:"failedCount"`
	TotalEnvelopes    int `json:"totalEnvelopes"`
	TotalTransactions int `json:"totalTransactions"`
}

// Validation

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationResult struct {
	Valid  bool              `json:"valid"`
	Errors []ValidationError `json:"errors,omitempty"`
}

func ValidateRequest(req BudgetCalculationRequest) ValidationResult {
	result := ValidationResult{Valid: true}
	if len(req.Envelopes) > MaxEnvelopes {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{Field: "envelopes", Message: fmt.Sprintf("exceeds maximum of %d envelopes", MaxEnvelopes)})
	}
	if len(req.Transactions) > MaxTransactions {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{Field: "transactions", Message: fmt.Sprintf("exceeds maximum of %d transactions", MaxTransactions)})
	}
	for i, env := range req.Envelopes {
		if errs := validateEnvelope(env, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}
	for i, tx := range req.Transactions {
		if errs := validateTransaction(tx, i); len(errs) > 0 {
			result.Valid = false
			result.Errors = append(result.Errors, errs...)
		}
	}
	return result
}

func validateEnvelope(env Envelope, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("envelopes[%d]", index)
	if env.ID == "" {
		errors = append(errors, ValidationError{Field: prefix + ".id", Message: "id is required"})
	} else if len(env.ID) > MaxIDLength {
		errors = append(errors, ValidationError{Field: prefix + ".id", Message: fmt.Sprintf("id exceeds maximum length of %d", MaxIDLength)})
	}
	if len(env.Name) > MaxNameLength {
		errors = append(errors, ValidationError{Field: prefix + ".name", Message: fmt.Sprintf("name exceeds maximum length of %d", MaxNameLength)})
	}
	return errors
}

func validateTransaction(tx Transaction, index int) []ValidationError {
	var errors []ValidationError
	prefix := fmt.Sprintf("transactions[%d]", index)
	if tx.ID == "" {
		errors = append(errors, ValidationError{Field: prefix + ".id", Message: "id is required"})
	}
	if tx.EnvelopeID == "" {
		errors = append(errors, ValidationError{Field: prefix + ".envelopeId", Message: "envelopeId is required"})
	}
	return errors
}

func ValidateBatchRequest(req BatchRequest) ValidationResult {
	result := ValidationResult{Valid: true}
	if len(req.Requests) == 0 {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{Field: "requests", Message: "batch must contain at least one request"})
		return result
	}
	if len(req.Requests) > MaxBatchSize {
		result.Valid = false
		result.Errors = append(result.Errors, ValidationError{Field: "requests", Message: fmt.Sprintf("exceeds maximum batch size of %d", MaxBatchSize)})
		return result
	}
	return result
}

// Core Calculation

func Calculate(envelopes []Envelope, transactions []Transaction) ([]EnvelopeData, GlobalTotals) {
	windowStart := time.Now()
	windowEnd := windowStart.Add(time.Duration(BillLookaheadDays) * 24 * time.Hour)
	var results []EnvelopeData
	globalTotals := GlobalTotals{}

	for _, env := range envelopes {
		envTransactions := filterTransactions(env.ID, transactions)
		paidTx := filterPaidTransactions(envTransactions)
		scheduledTx := filterScheduledTransactions(envTransactions)
		upcomingBills, overdueBills := partitionTransactions(scheduledTx, time.Now())
		totalSpent := sumAmounts(paidTx)
		totalUpcoming := sumAmounts(upcomingBills)
		totalOverdue := sumAmounts(overdueBills)
		committed := totalUpcoming + totalOverdue
		available := env.CurrentBalance - committed
		utilRate := calculateUtilizationRate(env, upcomingBills, paidTx, env.CurrentBalance, totalSpent, committed)
		status := determineStatus(totalOverdue, available, env, upcomingBills)

		data := EnvelopeData{
			Envelope:        env,
			TotalSpent:      totalSpent,
			TotalUpcoming:   totalUpcoming,
			TotalOverdue:    totalOverdue,
			Available:       available,
			Committed:       committed,
			UtilizationRate: utilRate,
			Status:          status,
			UpcomingBills:   upcomingBills,
			OverdueBills:    overdueBills,
			Transactions:    envTransactions,
		}
		results = append(results, data)
		globalTotals.TotalAllocated += env.CurrentBalance
		globalTotals.TotalSpent += totalSpent
		globalTotals.TotalBalance += env.CurrentBalance
		globalTotals.TotalUpcoming += totalUpcoming
		globalTotals.EnvelopeCount++
		globalTotals.BillsDueCount += countTransactionsDue(upcomingBills, windowStart, windowEnd)
	}
	return results, globalTotals
}

func calculateUtilizationRate(env Envelope, upcoming []Transaction, paid []Transaction, balance, spent, committed float64) float64 {
	if env.Type == EnvelopeTypeLiability && env.MinimumPayment != 0 {
		nextBill := math.Abs(env.MinimumPayment)
		if len(upcoming) > 0 {
			nextBill = math.Abs(upcoming[0].Amount)
		}
		if nextBill <= 0 {
			return 0
		}
		return balance / nextBill
	}
	if env.Type == EnvelopeTypeGoal && env.TargetAmount > 0 {
		return balance / env.TargetAmount
	}
	target := env.TargetAmount
	if target <= 0 {
		target = env.MonthlyBudget
	}
	if target <= 0 {
		return 0
	}
	return (spent + committed) / target
}

func determineStatus(overdue, available float64, env Envelope, upcoming []Transaction) string {
	if overdue > 0 {
		return "overdue"
	}
	if available < 0 {
		return "overspent"
	}
	if env.Type == EnvelopeTypeLiability {
		upcomingSum := sumAmounts(upcoming)
		if env.CurrentBalance < upcomingSum {
			return "underfunded"
		}
	}
	return "healthy"
}

func filterTransactions(envID string, txs []Transaction) []Transaction {
	var out []Transaction
	for _, t := range txs {
		if t.EnvelopeID == envID {
			out = append(out, t)
		}
	}
	return out
}

func filterPaidTransactions(txs []Transaction) []Transaction {
	var out []Transaction
	for _, t := range txs {
		if !t.IsScheduled {
			out = append(out, t)
		}
	}
	return out
}

func filterScheduledTransactions(txs []Transaction) []Transaction {
	var out []Transaction
	for _, t := range txs {
		if t.IsScheduled {
			out = append(out, t)
		}
	}
	return out
}

func partitionTransactions(txs []Transaction, refDate time.Time) (upcoming, overdue []Transaction) {
	for _, t := range txs {
		d := parseDate(t.Date)
		if d.IsZero() {
			continue
		}
		if d.After(refDate) {
			upcoming = append(upcoming, t)
		} else if d.Before(refDate) {
			overdue = append(overdue, t)
		}
	}
	return
}

func countTransactionsDue(txs []Transaction, start, end time.Time) int {
	count := 0
	for _, t := range txs {
		d := parseDate(t.Date)
		if !d.IsZero() && (d.Equal(start) || d.After(start)) && (d.Equal(end) || d.Before(end)) {
			count++
		}
	}
	return count
}

func sumAmounts(txs []Transaction) float64 {
	sum := 0.0
	for _, t := range txs {
		sum += math.Abs(t.Amount)
	}
	return sum
}

func parseDate(s string) time.Time {
	if s == "" {
		return time.Time{}
	}
	t, err := time.Parse(time.RFC3339, s)
	if err == nil {
		return t
	}
	t, err = time.Parse("2006-01-02", s)
	if err == nil {
		return t
	}
	return time.Time{}
}

// Security

func AddSecurityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("X-XSS-Protection", "1; mode=block")
	w.Header().Set("Referrer-Policy", "no-referrer")
	w.Header().Set("Content-Security-Policy", "default-src 'none'")
}
