package budget

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"

	"time"
)

// Constants
const (
	EnvelopeTypeBill         = "bill"
	EnvelopeTypeVariable     = "variable"
	EnvelopeTypeSavings      = "savings"
	EnvelopeTypeSinkingFund  = "sinking_fund"
	EnvelopeTypeSupplemental = "supplemental"

	BiweeklyMultiplier = 26.0 / 12.0
	BillLookaheadDays  = 30
)

// Structs matching TypeScript interfaces

type Envelope struct {
	ID                 string  `json:"id"`
	Budget             float64 `json:"budget,omitempty"`
	Allocated          float64 `json:"allocated,omitempty"`
	CurrentBalance     float64 `json:"currentBalance,omitempty"`
	EnvelopeType       string  `json:"envelopeType,omitempty"`
	Category           string  `json:"category,omitempty"`
	BiweeklyAllocation float64 `json:"biweeklyAllocation,omitempty"`
	TargetAmount       float64 `json:"targetAmount,omitempty"`
	MonthlyBudget      float64 `json:"monthlyBudget,omitempty"`
	MonthlyAmount      float64 `json:"monthlyAmount,omitempty"`
	Name               string  `json:"name,omitempty"`
}

type Transaction struct {
	ID          string  `json:"id"`
	EnvelopeID  string  `json:"envelopeId"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	IsPaid      bool    `json:"isPaid,omitempty"`
	Date        string  `json:"date,omitempty"`
	DueDate     string  `json:"dueDate,omitempty"`
	Provider    string  `json:"provider,omitempty"`
	Description string  `json:"description,omitempty"`
}

type Bill struct {
	ID          string  `json:"id"`
	EnvelopeID  string  `json:"envelopeId,omitempty"`
	IsPaid      bool    `json:"isPaid,omitempty"`
	Amount      float64 `json:"amount"`
	DueDate     string  `json:"dueDate,omitempty"`
	Name        string  `json:"name,omitempty"`
	Type        string  `json:"type,omitempty"`
	Frequency   string  `json:"frequency,omitempty"`
	Provider    string  `json:"provider,omitempty"`
	Description string  `json:"description,omitempty"`
	Date        string  `json:"date,omitempty"`
}

type EnvelopeData struct {
	Envelope
	TotalSpent      float64       `json:"totalSpent"`
	TotalUpcoming   float64       `json:"totalUpcoming"`
	TotalOverdue    float64       `json:"totalOverdue"`
	Allocated       float64       `json:"allocated"` // Override/Detail
	Available       float64       `json:"available"`
	Committed       float64       `json:"committed"`
	UtilizationRate float64       `json:"utilizationRate"`
	Status          string        `json:"status"`
	UpcomingBills   []Bill        `json:"upcomingBills"`
	OverdueBills    []Bill        `json:"overdueBills"`
	Transactions    []Transaction `json:"transactions"`
	Bills           []Bill        `json:"bills"`
	BiweeklyNeed    float64       `json:"biweeklyNeed"` // Calculated field
}

// Request Payload
type BudgetCalculationRequest struct {
	Envelopes    []Envelope    `json:"envelopes"`
	Transactions []Transaction `json:"transactions"`
	Bills        []Bill        `json:"bills"`
}

// Response Payload
type BudgetCalculationResponse struct {
	Success bool           `json:"success"`
	Data    []EnvelopeData `json:"data"`
	Totals  GlobalTotals   `json:"totals"`
	Error   string         `json:"error,omitempty"`
}

type GlobalTotals struct {
	TotalAllocated    float64 `json:"totalAllocated"`
	TotalSpent        float64 `json:"totalSpent"`
	TotalBalance      float64 `json:"totalBalance"`
	TotalUpcoming     float64 `json:"totalUpcoming"`
	TotalBiweeklyNeed float64 `json:"totalBiweeklyNeed"`
	BillsDueCount     int     `json:"billsDueCount"`
	EnvelopeCount     int     `json:"envelopeCount"`
}

// Handler is the Vercel entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Security Headers
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

	// Validate request
	validation := ValidateRequest(req)
	if !validation.Valid {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(BudgetCalculationResponse{
			Success: false,
			Error:   fmt.Sprintf("Validation failed: %d errors", len(validation.Errors)),
		})
		return
	}

	// Calculate
	envelopeData, totals := Calculate(req.Envelopes, req.Transactions, req.Bills)

	resp := BudgetCalculationResponse{
		Success: true,
		Data:    envelopeData,
		Totals:  totals,
	}

	_ = json.NewEncoder(w).Encode(resp)
}

// Core Logic

func Calculate(envelopes []Envelope, transactions []Transaction, bills []Bill) ([]EnvelopeData, GlobalTotals) {
	windowStart := time.Now()
	windowEnd := windowStart.Add(time.Duration(BillLookaheadDays) * 24 * time.Hour)

	var results []EnvelopeData
	globalTotals := GlobalTotals{}

	for _, env := range envelopes {
		// Filter relevant items
		envTransactions := filterTransactions(env.ID, transactions)
		envBills := filterBills(env.ID, bills)

		// Derived collections
		paidTx := filterPaidTransactions(envTransactions)
		unpaidBills := collectUnpaidBills(envTransactions, envBills)
		upcomingBills, overdueBills := partitionBills(unpaidBills, time.Now())

		// Calculate Totals for this envelope
		totalSpent := sumAmounts(paidTx)
		totalUpcoming := sumBillAmounts(upcomingBills)
		totalOverdue := sumBillAmounts(overdueBills)
		committed := totalUpcoming + totalOverdue
		available := env.CurrentBalance - committed

		// Biweekly Need
		envType := getEnvelopeType(env)
		biweeklyNeed := calculateBiweeklyNeed(env, envType)

		// Utils Rate
		utilRate := calculateUtilizationRate(env, envType, upcomingBills, paidTx, env.CurrentBalance, totalSpent, committed)

		// Status
		status := determineStatus(totalOverdue, available, env, upcomingBills)

		data := EnvelopeData{
			Envelope:        env,
			TotalSpent:      totalSpent,
			TotalUpcoming:   totalUpcoming,
			TotalOverdue:    totalOverdue,
			Allocated:       env.Budget, // Default to Budget if Allocated specific field missing logic? TS uses budget || 0
			Available:       available,
			Committed:       committed,
			UtilizationRate: utilRate,
			Status:          status,
			UpcomingBills:   upcomingBills,
			OverdueBills:    overdueBills,
			Transactions:    envTransactions,
			Bills:           envBills,
			BiweeklyNeed:    biweeklyNeed,
		}
		results = append(results, data)

		// Aggregates
		globalTotals.TotalAllocated += env.CurrentBalance
		globalTotals.TotalSpent += totalSpent
		globalTotals.TotalBalance += env.CurrentBalance
		globalTotals.TotalUpcoming += totalUpcoming
		globalTotals.TotalBiweeklyNeed += biweeklyNeed
		globalTotals.EnvelopeCount++
		globalTotals.BillsDueCount += countBillsDue(upcomingBills, windowStart, windowEnd)
	}

	return results, globalTotals
}

// Logic Helpers

func getEnvelopeType(env Envelope) string {
	if env.EnvelopeType != "" {
		return env.EnvelopeType
	}
	// Simplified auto-classify match from TS
	cat := env.Category
	switch cat {
	case "Housing", "Bills & Utilities", "Insurance":
		return EnvelopeTypeBill
	case "Savings", "Emergency", "Travel":
		return EnvelopeTypeSavings
	default:
		return EnvelopeTypeVariable
	}
}

func calculateBiweeklyNeed(env Envelope, envType string) float64 {
	if envType == EnvelopeTypeBill && env.BiweeklyAllocation != 0 {
		return env.BiweeklyAllocation
	}
	if env.MonthlyBudget != 0 {
		return env.MonthlyBudget / BiweeklyMultiplier
	}
	if env.MonthlyAmount != 0 {
		return env.MonthlyAmount / BiweeklyMultiplier
	}
	if env.TargetAmount != 0 {
		remaining := math.Max(0, env.TargetAmount-env.CurrentBalance)
		// Logic from TS: return Math.min(remainingToTarget, envelope.biweeklyAllocation || 0);
		// Wait, if biweeklyAllocation is 0, this returns 0.
		alloc := env.BiweeklyAllocation
		return math.Min(remaining, alloc)
	}
	return 0
}

func calculateUtilizationRate(env Envelope, envType string, upcoming []Bill, paid []Transaction, balance, spent, committed float64) float64 {
	if envType == EnvelopeTypeBill && env.BiweeklyAllocation != 0 {
		nextBill := 0.0
		if len(upcoming) > 0 {
			nextBill = math.Abs(upcoming[0].Amount)
		} else if len(paid) > 0 {
			// Find most recent paid (assume sorted or sort needed? TS sorts by date)
			// For simplicity/perf in this V1, let's take the first if not sorted.
			// Ideally we need sorting. Let's do a simple sort if needed or assume caller sent sorted?
			// TS logic sorts: sort((a, b) => getEntryTimestamp(a) - getEntryTimestamp(b)) -> ASCENDING. "Most recent" implies last?
			// TS code: const [mostRecent] = [...historicalEntries].sort(...)
			// Wait, sort ascending means [0] is OLDEST.
			// TS Code: `const [mostRecent] = [...historicalEntries].sort(...)` -> This destructures the FIRST element (Oldest).
			// This seems like a BUG in the TS code if it wants "Most Recent", OR it means "Next Expected".
			// Actually `sort((a,b) => ...)` is ascending. [0] is oldest.
			// Re-reading TS: `getEntryTimestamp` returns time. `a - b`. Ascending.
			// `const [mostRecent] = ...` takes the first one. So it takes the OLDEST transaction.
			// Is that intentional? Maybe. I will replicate strict behavior: take "First after sort".
			// But for Go V1 without heavy sorting overhead, let's fall back to BiweeklyAllocation * 2 if list empty.
			// Let's implement sorting to be safe.

			// Sorting paidTx by date
			sortedPaid := make([]Transaction, len(paid))
			copy(sortedPaid, paid)
			sort.Slice(sortedPaid, func(i, j int) bool {
				return parseDate(sortedPaid[i].Date).Before(parseDate(sortedPaid[j].Date))
			})
			if len(sortedPaid) > 0 {
				nextBill = math.Abs(sortedPaid[0].Amount) // "Oldest" logic replica
			}
		} else {
			nextBill = env.BiweeklyAllocation * 2
		}

		if nextBill <= 0 {
			return 0
		}
		return balance / nextBill
	}

	if envType == EnvelopeTypeSavings && env.TargetAmount > 0 {
		return balance / env.TargetAmount
	}

	budget := env.MonthlyBudget
	if budget == 0 {
		budget = env.Budget
	}
	if budget == 0 {
		budget = env.MonthlyAmount
	}

	if budget <= 0 {
		return 0
	}
	return (spent + committed) / budget
}

func determineStatus(overdue, available float64, env Envelope, upcoming []Bill) string {
	if overdue > 0 {
		return "overdue"
	}
	if available < 0 {
		return "overspent"
	}
	if getEnvelopeType(env) == EnvelopeTypeBill {
		upcomingSum := sumBillAmounts(upcoming)
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

func filterBills(envID string, bills []Bill) []Bill {
	var out []Bill
	for _, b := range bills {
		if b.EnvelopeID == envID {
			out = append(out, b)
		}
	}
	return out
}

func filterPaidTransactions(txs []Transaction) []Transaction {
	var out []Transaction
	for _, t := range txs {
		if t.Type == "expense" || t.Type == "income" || t.Type == "transfer" {
			out = append(out, t)
		} else if (t.Type == "bill" || t.Type == "recurring_bill") && t.IsPaid {
			out = append(out, t)
		}
	}
	return out
}

func collectUnpaidBills(txs []Transaction, bills []Bill) []Bill {
	dedup := make(map[string]Bill)

	// Bills from Transactions
	for _, t := range txs {
		if (t.Type == "bill" || t.Type == "recurring_bill") && !t.IsPaid {
			// Convert to Bill
			b := Bill{
				ID:          t.ID,
				EnvelopeID:  t.EnvelopeID,
				IsPaid:      t.IsPaid,
				Amount:      t.Amount,
				DueDate:     coalesce(t.DueDate, t.Date),
				Name:        t.Description,
				Type:        t.Type,
				Provider:    t.Provider,
				Description: t.Description,
			}
			key := fmt.Sprintf("%s-%s", b.Description, b.DueDate) // Simplified key logic
			dedup[key] = b
		}
	}

	// Direct Bills
	for _, b := range bills {
		if !b.IsPaid {
			key := fmt.Sprintf("%s-%s", b.Description, b.DueDate)
			if _, exists := dedup[key]; !exists {
				dedup[key] = b
			}
		}
	}

	var result []Bill
	for _, b := range dedup {
		result = append(result, b)
	}

	// Sort by DueDate
	sort.Slice(result, func(i, j int) bool {
		return parseDate(result[i].DueDate).Before(parseDate(result[j].DueDate))
	})

	return result
}

func partitionBills(bills []Bill, refDate time.Time) (upcoming, overdue []Bill) {
	for _, b := range bills {
		d := parseDate(b.DueDate)
		if d.IsZero() {
			continue
		}
		// TS: if (dueDate > referenceDate) upcoming else if (dueDate < referenceDate) overdue
		// Note: strictly greater/less. Equals is ignored in TS?
		// TS code:
		// if (dueDate > referenceDate) upcoming
		// else if (dueDate < referenceDate) overdue
		// So Equal is indeed dropped. I'll maintain that quirk.
		if d.After(refDate) {
			upcoming = append(upcoming, b)
		} else if d.Before(refDate) {
			overdue = append(overdue, b)
		}
	}
	return
}

func countBillsDue(bills []Bill, start, end time.Time) int {
	count := 0
	for _, b := range bills {
		d := parseDate(b.DueDate)
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

func sumBillAmounts(bills []Bill) float64 {
	sum := 0.0
	for _, b := range bills {
		sum += math.Abs(b.Amount)
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

func coalesce(a, b string) string {
	if a != "" {
		return a
	}
	return b
}
