package marketing

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

// DevToArticle represents the minimized schema we send to frontend
type DevToArticle struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Url         string   `json:"url"`
	CoverImage  string   `json:"cover_image"`
	PublishedAt string   `json:"published_at"`
	TagList     []string `json:"tag_list"`
	ReadingTime int      `json:"reading_time_minutes"`
}

// Cache structure
type BlogCache struct {
	Articles  []DevToArticle
	LastFetch time.Time
	Mutex     sync.RWMutex
}

var (
	// Global cache instance
	blogCache = &BlogCache{}
	// Configurable upstream URL
	DevToAPI = "https://dev.to/api/articles?username=thef4tdaddy&per_page=6"
	// Cache TTL
	CacheTTL = 1 * time.Hour
)

// Handler serves the cached blog posts
func Handler(w http.ResponseWriter, r *http.Request) {
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

	articles, err := getArticles()
	if err != nil {
		// Log error internally in a real app
		http.Error(w, "Failed to fetch articles", http.StatusServiceUnavailable)
		return
	}

	json.NewEncoder(w).Encode(articles)
}

// getArticles manages the cache logic
func getArticles() ([]DevToArticle, error) {
	blogCache.Mutex.RLock()
	// If cache is valid, return it
	if time.Since(blogCache.LastFetch) < CacheTTL && len(blogCache.Articles) > 0 {
		defer blogCache.Mutex.RUnlock()
		return blogCache.Articles, nil
	}
	blogCache.Mutex.RUnlock()

	// Cache miss or stale - fetch upstream
	return fetchUpstream()
}

// fetchUpstream hits the Dev.to API
func fetchUpstream() ([]DevToArticle, error) {
	blogCache.Mutex.Lock()
	defer blogCache.Mutex.Unlock()

	// Double-check locking pattern to prevent stampede
	if time.Since(blogCache.LastFetch) < CacheTTL && len(blogCache.Articles) > 0 {
		return blogCache.Articles, nil
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(DevToAPI)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// If upstream fails, return stale cache if we have it
		if len(blogCache.Articles) > 0 {
			return blogCache.Articles, nil
		}
		return nil, http.ErrServerClosed
	}

	var rawArticles []DevToArticle
	if err := json.NewDecoder(resp.Body).Decode(&rawArticles); err != nil {
		return nil, err
	}

	// Update cache
	blogCache.Articles = rawArticles
	blogCache.LastFetch = time.Now()

	return blogCache.Articles, nil
}
