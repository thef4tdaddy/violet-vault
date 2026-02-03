package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/analytics/utils"
)

// Handler processes health score calculation requests
func Handler(w http.ResponseWriter, r *http.Request) {
	// Ensure memory cleanup after request
	defer utils.CleanupMemory()

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST requests
	if r.Method != "POST" {
		sendError(w, "Method not allowed", http.StatusMethodNotAllowed, "")
		return
	}

	// Get encryption key
	key, err := utils.GetEncryptionKey()
	if err != nil {
		sendError(w, "Encryption key configuration error", http.StatusInternalServerError, err.Error())
		return
	}

	// Parse encrypted request
	var encryptedReq utils.EncryptedRequest
	if err := json.NewDecoder(r.Body).Decode(&encryptedReq); err != nil {
		sendError(w, "Invalid request format", http.StatusBadRequest, err.Error())
		return
	}

	// Decrypt request
	var req utils.HealthRequest
	req, err = utils.DecryptRequest[utils.HealthRequest](encryptedReq, key)
	if err != nil {
		sendError(w, "Decryption failed", http.StatusBadRequest, err.Error())
		return
	}

	// Calculate health score
	response := calculateHealthScore(req.Transactions)

	// Encrypt response
	encryptedResp, err := utils.EncryptResponse(response, key)
	if err != nil {
		sendError(w, "Encryption failed", http.StatusInternalServerError, err.Error())
		return
	}

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(encryptedResp)
}

// calculateHealthScore computes overall health and component scores in parallel
func calculateHealthScore(transactions []utils.AllocationTransaction) utils.HealthResponse {
	// Use parallel goroutines for each component
	var wg sync.WaitGroup
	components := make([]utils.HealthComponentScore, 5)

	wg.Add(5)
	go calculateConsistency(&components[0], transactions, &wg)
	go calculateBillCoverage(&components[1], transactions, &wg)
	go calculateSavingsRate(&components[2], transactions, &wg)
	go calculateEmergencyFund(&components[3], transactions, &wg)
	go calculateDiscretionary(&components[4], transactions, &wg)
	wg.Wait()

	// Calculate weighted composite score
	totalScore := 0.0
	for _, comp := range components {
		totalScore += comp.Score * comp.Weight
	}

	return utils.HealthResponse{
		Overall:    totalScore,
		Components: components,
	}
}

// calculateConsistency measures allocation regularity and timing
func calculateConsistency(result *utils.HealthComponentScore, transactions []utils.AllocationTransaction, wg *sync.WaitGroup) {
	defer wg.Done()

	result.Component = "consistency"
	result.Weight = 0.25
	result.Description = "Regularity of allocation timing and amounts"

	if len(transactions) < 2 {
		result.Score = 0
		return
	}

	// Group by date to find allocation intervals
	dateMap := make(map[string]bool)
	for _, tx := range transactions {
		dateStr := tx.Date.Format("2006-01-02")
		dateMap[dateStr] = true
	}

	// Convert to sorted slice
	dates := make([]time.Time, 0, len(dateMap))
	for dateStr := range dateMap {
		date, _ := time.Parse("2006-01-02", dateStr)
		dates = append(dates, date)
	}

	if len(dates) < 2 {
		result.Score = 0
		return
	}

	// Calculate intervals between allocations
	intervals := make([]float64, len(dates)-1)
	for i := 1; i < len(dates); i++ {
		intervals[i-1] = dates[i].Sub(dates[i-1]).Hours() / 24.0
	}

	// Calculate standard deviation of intervals
	meanInterval := 0.0
	for _, interval := range intervals {
		meanInterval += interval
	}
	meanInterval /= float64(len(intervals))

	variance := 0.0
	for _, interval := range intervals {
		diff := interval - meanInterval
		variance += diff * diff
	}
	variance /= float64(len(intervals))
	stdDev := math.Sqrt(variance)

	// Score: Lower std dev = more consistent = higher score
	// Perfect consistency (biweekly = 14 days) has ~0 std dev
	// Score decays with increasing variance
	coefficientOfVariation := stdDev / meanInterval
	score := math.Max(0, 100.0*(1.0-coefficientOfVariation))
	result.Score = math.Min(100, score)
}

// calculateBillCoverage measures percentage of bills covered by allocations
func calculateBillCoverage(result *utils.HealthComponentScore, transactions []utils.AllocationTransaction, wg *sync.WaitGroup) {
	defer wg.Done()

	result.Component = "billCoverage"
	result.Weight = 0.30
	result.Description = "Percentage of essential bills covered by allocations"

	if len(transactions) == 0 {
		result.Score = 0
		return
	}

	// Sum bill-related allocations
	billTotal := 0.0
	totalAllocated := 0.0

	for _, tx := range transactions {
		totalAllocated += tx.Amount

		// Consider categories that are bills
		if isBillCategory(tx.Category) {
			billTotal += tx.Amount
		}
	}

	if totalAllocated == 0 {
		result.Score = 0
		return
	}

	// Score: Higher bill coverage = better
	billPercentage := (billTotal / totalAllocated) * 100.0
	result.Score = math.Min(100, billPercentage)
}

// calculateSavingsRate measures allocation to savings envelopes
func calculateSavingsRate(result *utils.HealthComponentScore, transactions []utils.AllocationTransaction, wg *sync.WaitGroup) {
	defer wg.Done()

	result.Component = "savingsRate"
	result.Weight = 0.20
	result.Description = "Percentage of income allocated to savings"

	if len(transactions) == 0 {
		result.Score = 0
		return
	}

	// Sum savings allocations
	savingsTotal := 0.0
	totalAllocated := 0.0

	for _, tx := range transactions {
		totalAllocated += tx.Amount

		if isSavingsCategory(tx.Category) {
			savingsTotal += tx.Amount
		}
	}

	if totalAllocated == 0 {
		result.Score = 0
		return
	}

	// Score: 20% savings = 100 score (financial best practice)
	savingsPercentage := (savingsTotal / totalAllocated) * 100.0
	score := (savingsPercentage / 20.0) * 100.0
	result.Score = math.Min(100, score)
}

// calculateEmergencyFund measures progress toward emergency fund goals
func calculateEmergencyFund(result *utils.HealthComponentScore, transactions []utils.AllocationTransaction, wg *sync.WaitGroup) {
	defer wg.Done()

	result.Component = "emergencyFund"
	result.Weight = 0.15
	result.Description = "Emergency fund allocation progress"

	if len(transactions) == 0 {
		result.Score = 0
		return
	}

	// Sum emergency fund allocations
	emergencyTotal := 0.0

	for _, tx := range transactions {
		if isEmergencyCategory(tx.Category) {
			emergencyTotal += tx.Amount
		}
	}

	// Estimate monthly expenses (use average allocation)
	totalAllocated := 0.0
	for _, tx := range transactions {
		totalAllocated += tx.Amount
	}

	// Group by month
	monthMap := make(map[string]float64)
	for _, tx := range transactions {
		monthKey := tx.Date.Format("2006-01")
		monthMap[monthKey] += tx.Amount
	}

	avgMonthlyExpenses := 0.0
	if len(monthMap) > 0 {
		for _, amount := range monthMap {
			avgMonthlyExpenses += amount
		}
		avgMonthlyExpenses /= float64(len(monthMap))
	}

	if avgMonthlyExpenses == 0 {
		result.Score = 50 // Neutral score if can't estimate
		return
	}

	// Score: 3-6 months expenses = 100 score
	monthsCovered := emergencyTotal / avgMonthlyExpenses
	score := (monthsCovered / 6.0) * 100.0
	result.Score = math.Min(100, score)
}

// calculateDiscretionary measures balance of discretionary spending
func calculateDiscretionary(result *utils.HealthComponentScore, transactions []utils.AllocationTransaction, wg *sync.WaitGroup) {
	defer wg.Done()

	result.Component = "discretionary"
	result.Weight = 0.10
	result.Description = "Balance of discretionary vs essential spending"

	if len(transactions) == 0 {
		result.Score = 0
		return
	}

	// Sum discretionary allocations
	discretionaryTotal := 0.0
	totalAllocated := 0.0

	for _, tx := range transactions {
		totalAllocated += tx.Amount

		if isDiscretionaryCategory(tx.Category) {
			discretionaryTotal += tx.Amount
		}
	}

	if totalAllocated == 0 {
		result.Score = 0
		return
	}

	// Score: 20-30% discretionary = balanced = 100 score
	discretionaryPercentage := (discretionaryTotal / totalAllocated) * 100.0

	var score float64
	if discretionaryPercentage >= 20 && discretionaryPercentage <= 30 {
		score = 100.0
	} else if discretionaryPercentage < 20 {
		// Too little discretionary (too strict)
		score = (discretionaryPercentage / 20.0) * 100.0
	} else {
		// Too much discretionary (lifestyle creep)
		excess := discretionaryPercentage - 30.0
		score = math.Max(0, 100.0-(excess*2.0))
	}

	result.Score = math.Min(100, score)
}

// Helper functions for category classification

func isBillCategory(category string) bool {
	billCategories := map[string]bool{
		"Housing":       true,
		"Utilities":     true,
		"Insurance":     true,
		"Debt":          true,
		"Subscriptions": true,
		"Healthcare":    true,
	}
	return billCategories[category]
}

func isSavingsCategory(category string) bool {
	savingsCategories := map[string]bool{
		"Savings":    true,
		"Investment": true,
		"Retirement": true,
	}
	return savingsCategories[category]
}

func isEmergencyCategory(category string) bool {
	return category == "Emergency Fund"
}

func isDiscretionaryCategory(category string) bool {
	discretionaryCategories := map[string]bool{
		"Entertainment": true,
		"Dining":        true,
		"Shopping":      true,
		"Hobbies":       true,
		"Travel":        true,
		"Personal":      true,
	}
	return discretionaryCategories[category]
}

// sendError sends an error response
func sendError(w http.ResponseWriter, message string, code int, details string) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(utils.ErrorResponse{
		Error:   message,
		Code:    code,
		Details: details,
	})
}
