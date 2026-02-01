package marketing

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

type GoStatusResponse struct {
	Service    string `json:"service"`
	Status     string `json:"status"`
	Version    string `json:"version"`
	Goroutines int    `json:"goroutines"`
	Timestamp  int64  `json:"timestamp"`
}

// StatusHandler serves the Go backend health
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	status := GoStatusResponse{
		Service:    "VioletVault Go Engine",
		Status:     "operational",
		Version:    "1.22", // Matches TechStackBar
		Goroutines: runtime.NumGoroutine(),
		Timestamp:  time.Now().UnixMilli(),
	}

	json.NewEncoder(w).Encode(status)
}
