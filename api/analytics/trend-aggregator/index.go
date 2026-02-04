package handler

import (
	"encoding/json"
	"net/http"
	"sort"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/analytics/utils"
)

// Handler processes trend aggregation requests
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
	var req utils.TrendRequest
	req, err = utils.DecryptRequest[utils.TrendRequest](encryptedReq, key)
	if err != nil {
		sendError(w, "Decryption failed", http.StatusBadRequest, err.Error())
		return
	}

	// Generate trends
	response, err := generateTrends(req)
	if err != nil {
		sendError(w, "Trend generation failed", http.StatusInternalServerError, err.Error())
		return
	}

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

// generateTrends creates trend data from transactions
func generateTrends(req utils.TrendRequest) (utils.TrendResponse, error) {
	// Group transactions by date and envelope
	type bucketKey struct {
		date       string
		envelopeID string
	}
	buckets := make(map[bucketKey]float64)

	// Filter transactions by requested envelopes
	envelopeSet := make(map[string]bool)
	for _, id := range req.EnvelopeIDs {
		envelopeSet[id] = true
	}

	for _, tx := range req.Transactions {
		// Skip if not in requested envelopes
		if !envelopeSet[tx.EnvelopeID] {
			continue
		}

		// Bucket by granularity
		dateStr := bucketDate(tx.Date, req.Granularity)

		key := bucketKey{
			date:       dateStr,
			envelopeID: tx.EnvelopeID,
		}

		buckets[key] += tx.Amount
	}

	// Group by date
	dateMap := make(map[string]map[string]float64)
	for key, amount := range buckets {
		if _, exists := dateMap[key.date]; !exists {
			dateMap[key.date] = make(map[string]float64)
		}
		dateMap[key.date][key.envelopeID] = amount
	}

	// Convert to slice
	data := make([]utils.TrendDataPoint, 0, len(dateMap))
	for date, envelopes := range dateMap {
		data = append(data, utils.TrendDataPoint{
			Date:      date,
			Envelopes: envelopes,
		})
	}

	// Sort by date
	sort.Slice(data, func(i, j int) bool {
		return data[i].Date < data[j].Date
	})

	// Calculate metadata (trend direction, linear regression)
	metadata := make(map[string]utils.TrendMetadata)
	for _, envelopeID := range req.EnvelopeIDs {
		meta := calculateTrendMetadata(data, envelopeID)
		metadata[envelopeID] = meta
	}

	return utils.TrendResponse{
		Data:     data,
		Metadata: metadata,
	}, nil
}

// bucketDate converts a date to the appropriate bucket based on granularity
func bucketDate(date time.Time, granularity string) string {
	switch granularity {
	case "daily":
		return date.Format("2006-01-02")
	case "weekly":
		// Get Monday of the current week
		// weekday: Sun=0, Mon=1, ... Sat=6
		// We want Mon=0, ... Sun=6
		daysSinceMonday := (int(date.Weekday()) + 6) % 7
		monday := date.AddDate(0, 0, -daysSinceMonday)
		return monday.Format("2006-01-02")
	case "monthly":
		return date.Format("2006-01")
	default:
		return date.Format("2006-01-02")
	}
}

// calculateTrendMetadata performs linear regression and calculates trend direction
func calculateTrendMetadata(data []utils.TrendDataPoint, envelopeID string) utils.TrendMetadata {
	// Extract values for this envelope
	var x []float64
	var y []float64

	for i, point := range data {
		if amount, exists := point.Envelopes[envelopeID]; exists {
			x = append(x, float64(i))
			y = append(y, amount)
		}
	}

	if len(x) < 2 {
		return utils.TrendMetadata{
			Direction: "flat",
			Slope:     0,
			R2:        0,
		}
	}

	// Calculate linear regression
	slope, _, r2 := linearRegression(x, y)

	// Determine direction
	direction := "flat"
	if slope > 0.01 {
		direction = "up"
	} else if slope < -0.01 {
		direction = "down"
	}

	return utils.TrendMetadata{
		Direction: direction,
		Slope:     slope,
		R2:        r2,
	}
}

// linearRegression calculates slope, intercept, and R² for linear regression
func linearRegression(x, y []float64) (slope, intercept, r2 float64) {
	n := float64(len(x))
	if n == 0 {
		return 0, 0, 0
	}

	// Calculate means
	var sumX, sumY float64
	for i := range x {
		sumX += x[i]
		sumY += y[i]
	}
	meanX := sumX / n
	meanY := sumY / n

	// Calculate slope and intercept
	var numerator, denominator float64
	for i := range x {
		numerator += (x[i] - meanX) * (y[i] - meanY)
		denominator += (x[i] - meanX) * (x[i] - meanX)
	}

	if denominator == 0 {
		return 0, meanY, 0
	}

	slope = numerator / denominator
	intercept = meanY - slope*meanX

	// Calculate R² (coefficient of determination)
	var ssRes, ssTot float64
	for i := range x {
		predicted := slope*x[i] + intercept
		ssRes += (y[i] - predicted) * (y[i] - predicted)
		ssTot += (y[i] - meanY) * (y[i] - meanY)
	}

	if ssTot == 0 {
		r2 = 0
	} else {
		r2 = 1 - (ssRes / ssTot)
	}

	// Clamp R² to [0, 1]
	if r2 < 0 {
		r2 = 0
	} else if r2 > 1 {
		r2 = 1
	}

	return slope, intercept, r2
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
