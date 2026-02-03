package handler

import (
	"encoding/json"
	"net/http"
	"runtime"
	"sort"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/analytics/utils"
)

// Handler processes heatmap generation requests
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
	var req utils.HeatmapRequest
	req, err = utils.DecryptRequest[utils.HeatmapRequest](encryptedReq, key)
	if err != nil {
		sendError(w, "Decryption failed", http.StatusBadRequest, err.Error())
		return
	}

	// Generate heatmap
	heatmap, err := generateHeatmap(req)
	if err != nil {
		sendError(w, "Heatmap generation failed", http.StatusInternalServerError, err.Error())
		return
	}

	// Encrypt response
	encryptedResp, err := utils.EncryptResponse(heatmap, key)
	if err != nil {
		sendError(w, "Encryption failed", http.StatusInternalServerError, err.Error())
		return
	}

	// Send response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(encryptedResp)
}

// generateHeatmap creates heatmap data from transactions
func generateHeatmap(req utils.HeatmapRequest) ([]utils.HeatmapDataPoint, error) {
	// Parse date range
	startDate, err := time.Parse("2006-01-02", req.DateRange.Start)
	if err != nil {
		return nil, err
	}

	endDate, err := time.Parse("2006-01-02", req.DateRange.End)
	if err != nil {
		return nil, err
	}

	// Group transactions by date
	dateMap := make(map[string]*utils.HeatmapDataPoint)

	// Use goroutines for parallel processing on large datasets
	if len(req.Transactions) > 1000 {
		return generateHeatmapParallel(req.Transactions, startDate, endDate)
	}

	// Sequential processing for smaller datasets
	for _, tx := range req.Transactions {
		dateStr := tx.Date.Format("2006-01-02")

		// Skip transactions outside date range
		if tx.Date.Before(startDate) || tx.Date.After(endDate) {
			continue
		}

		if point, exists := dateMap[dateStr]; exists {
			point.Amount += tx.Amount
			point.Count++
		} else {
			dateMap[dateStr] = &utils.HeatmapDataPoint{
				Date:   dateStr,
				Amount: tx.Amount,
				Count:  1,
			}
		}
	}

	// Calculate intensity (0-100 scale)
	maxAmount := 0.0
	for _, point := range dateMap {
		if point.Amount > maxAmount {
			maxAmount = point.Amount
		}
	}

	for _, point := range dateMap {
		if maxAmount > 0 {
			point.Intensity = (point.Amount / maxAmount) * 100.0
		}
	}

	// Convert map to slice
	result := make([]utils.HeatmapDataPoint, 0, len(dateMap))
	for _, point := range dateMap {
		result = append(result, *point)
	}

	// Sort by date
	sort.Slice(result, func(i, j int) bool {
		return result[i].Date < result[j].Date
	})

	return result, nil
}

// generateHeatmapParallel uses goroutines for parallel date bucketing
func generateHeatmapParallel(transactions []utils.AllocationTransaction, startDate, endDate time.Time) ([]utils.HeatmapDataPoint, error) {
	// Number of workers (use number of CPUs)
	numWorkers := runtime.NumCPU()
	chunkSize := (len(transactions) + numWorkers - 1) / numWorkers

	// Channel for partial results
	type partialResult struct {
		dateMap map[string]*utils.HeatmapDataPoint
		err     error
	}
	resultChan := make(chan partialResult, numWorkers)

	// Launch workers
	for i := 0; i < numWorkers; i++ {
		start := i * chunkSize
		end := start + chunkSize
		if end > len(transactions) {
			end = len(transactions)
		}

		go func(chunk []utils.AllocationTransaction) {
			dateMap := make(map[string]*utils.HeatmapDataPoint)

			for _, tx := range chunk {
				dateStr := tx.Date.Format("2006-01-02")

				// Skip transactions outside date range
				if tx.Date.Before(startDate) || tx.Date.After(endDate) {
					continue
				}

				if point, exists := dateMap[dateStr]; exists {
					point.Amount += tx.Amount
					point.Count++
				} else {
					dateMap[dateStr] = &utils.HeatmapDataPoint{
						Date:   dateStr,
						Amount: tx.Amount,
						Count:  1,
					}
				}
			}

			resultChan <- partialResult{dateMap: dateMap}
		}(transactions[start:end])
	}

	// Merge results from all workers
	mergedMap := make(map[string]*utils.HeatmapDataPoint)
	for i := 0; i < numWorkers; i++ {
		partial := <-resultChan
		if partial.err != nil {
			return nil, partial.err
		}

		for date, point := range partial.dateMap {
			if existing, exists := mergedMap[date]; exists {
				existing.Amount += point.Amount
				existing.Count += point.Count
			} else {
				mergedMap[date] = point
			}
		}
	}

	// Calculate intensity
	maxAmount := 0.0
	for _, point := range mergedMap {
		if point.Amount > maxAmount {
			maxAmount = point.Amount
		}
	}

	for _, point := range mergedMap {
		if maxAmount > 0 {
			point.Intensity = (point.Amount / maxAmount) * 100.0
		}
	}

	// Convert to slice
	result := make([]utils.HeatmapDataPoint, 0, len(mergedMap))
	for _, point := range mergedMap {
		result = append(result, *point)
	}

	// Sort by date
	sort.Slice(result, func(i, j int) bool {
		return result[i].Date < result[j].Date
	})

	return result, nil
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
