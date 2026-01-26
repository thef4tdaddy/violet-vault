package handler

import (
	"encoding/json"
	"net/http"
)

// WarmResponse represents the warm-up response
type WarmResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
}

// Handler handles the /api/warm request for Go services
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	response := WarmResponse{
		Status:  "warmed",
		Service: "VioletVault Go Sentinel",
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
