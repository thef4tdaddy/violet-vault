package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// Handler is the Vercel serverless function entry point for demo data generation
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	
	// Handle preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	
	// Only accept GET requests
	if r.Method != http.MethodGet {
		sendErrorResponse(w, "Method not allowed. Use GET.", http.StatusMethodNotAllowed)
		return
	}
	
	// Parse query parameters
	recordCount := 10000 // Default to 10k records
	if countStr := r.URL.Query().Get("count"); countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil && parsed > 0 && parsed <= 100000 {
			recordCount = parsed
		}
	}
	
	// Generate mock data
	response := GenerateMockData(recordCount)
	
	// Send response
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		sendErrorResponse(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   message,
	})
}
