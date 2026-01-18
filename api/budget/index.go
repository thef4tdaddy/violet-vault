package budget

import (
	"encoding/json"
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

// Structs matching TypeScript interfaces

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

// Request Payload
type BudgetCalculationRequest struct {
	Envelopes    []Envelope    `json:"envelopes"`
	Transactions []Transaction `json:"transactions"`
}

// Response Payload
type BudgetCalculationResponse struct {
	Success bool           `json:"success"`
	Data    []EnvelopeData `json:"data"`
	Totals  GlobalTotals   `json:"totals"`
	Error   string         `json:"error,omitempty"`
}

type GlobalTotals struct {
	TotalAllocated float64 `json:"totalAllocated"`
	TotalSpent     float64 `json:"totalSpent"`
	TotalBalance   float64 `json:"totalBalance"`
	TotalUpcoming  float64 `json:"totalUpcoming"`
	BillsDueCount  int     `json:"billsDueCount"`
	EnvelopeCount  int     `json:"envelopeCount"`
}

// Handler is the Vercel entry point
func Handler(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req BudgetCalculationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(BudgetCalculationResponse{Success: false, Error: "Invalid JSON: " + err.Error()})
		return
	}

	validation := ValidateRequest(req)
	if !validation.Valid {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(BudgetCalculationResponse{
			Success: false,
			Error:   fmt.Sprintf("Validation failed: %d errors", len(validation.Errors)),
		})
		return
	}

	envelopeData, totals := Calculate(req.Envelopes, req.Transactions)

	resp := BudgetCalculationResponse{
		Success: true,
		Data:    envelopeData,
		Totals:  totals,
	}

	_ = json.NewEncoder(w).Encode(resp)
}

// Core Logic

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

// Logic Helpers

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

// Filtering & Collection Helpers

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
	// Try ISO
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
