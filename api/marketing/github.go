package marketing

import (
	"encoding/json"
	"net/http"
	"time"
)

// GitHubStats represents the subset of fields we need
type GitHubStats struct {
	StargazersCount int `json:"stargazers_count"`
	ForksCount      int `json:"forks_count"`
}

// GitHubHandler serves cached repo stats
func GitHubHandler(w http.ResponseWriter, r *http.Request) {
	// CORS
	origin := r.Header.Get("Origin")
	if origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	stats, err := fetchGitHubStats()
	if err != nil {
		http.Error(w, "Failed to fetch stats", http.StatusServiceUnavailable)
		return
	}

	// Cache for 1 hour
	w.Header().Set("Cache-Control", "public, max-age=3600")
	json.NewEncoder(w).Encode(stats)
}

// Simple in-memory cache
var (
	cachedStats *GitHubStats
	lastFetch   time.Time
)

func fetchGitHubStats() (*GitHubStats, error) {
	if cachedStats != nil && time.Since(lastFetch) < time.Hour {
		return cachedStats, nil
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get("https://api.github.com/repos/thef4tdaddy/violet-vault")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var stats GitHubStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, err
	}

	cachedStats = &stats
	lastFetch = time.Now()
	return cachedStats, nil
}
