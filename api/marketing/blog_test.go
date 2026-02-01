package marketing

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/marketing/blog", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", w.Code)
	}
}

func TestHandler_CacheLogic(t *testing.T) {
	// Mock Upstream server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		articles := []DevToArticle{
			{ID: 1, Title: "Test Article"},
		}
		json.NewEncoder(w).Encode(articles)
	}))
	defer ts.Close()

	// Point to mock server
	oldAPI := DevToAPI
	DevToAPI = ts.URL
	defer func() { DevToAPI = oldAPI }()

	// Clear cache
	blogCache.Articles = nil
	blogCache.LastFetch = time.Time{}

	// First Request (Cache Miss)
	req1 := httptest.NewRequest(http.MethodGet, "/api/marketing/blog", nil)
	w1 := httptest.NewRecorder()

	start := time.Now()
	Handler(w1, req1)
	duration1 := time.Since(start)

	if w1.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w1.Code)
	}

	// Validate Body
	var resp1 []DevToArticle
	json.NewDecoder(w1.Body).Decode(&resp1)
	if len(resp1) != 1 || resp1[0].Title != "Test Article" {
		t.Errorf("Unexpected body: %v", resp1)
	}

	// Second Request (Cache Hit)
	// Theoretically faster, mainly checking logic doesn't crash or refetch
	req2 := httptest.NewRequest(http.MethodGet, "/api/marketing/blog", nil)
	w2 := httptest.NewRecorder()

	start2 := time.Now()
	Handler(w2, req2)
	duration2 := time.Since(start2)

	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w2.Code)
	}

	// Just ensuring it works; timing assertions are flaky in CI
	t.Logf("First fetch: %v, Second fetch: %v", duration1, duration2)
}

func TestHandler_UpstreamFailure(t *testing.T) {
	// Mock Upstream server returning 500
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer ts.Close()

	// Point to mock server
	oldAPI := DevToAPI
	DevToAPI = ts.URL
	defer func() { DevToAPI = oldAPI }()

	// Ensure cache is empty
	blogCache.Mutex.Lock()
	blogCache.Articles = nil
	blogCache.LastFetch = time.Time{}
	blogCache.Mutex.Unlock()

	req := httptest.NewRequest(http.MethodGet, "/api/marketing/blog", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503 Service Unavailable, got %d", w.Code)
	}
}

func TestHandler_UpstreamInvalidJSON(t *testing.T) {
	// Mock Upstream server returning garbage
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Not JSON"))
	}))
	defer ts.Close()

	// Point to mock server
	oldAPI := DevToAPI
	DevToAPI = ts.URL
	defer func() { DevToAPI = oldAPI }()

	// Ensure cache is empty
	blogCache.Mutex.Lock()
	blogCache.Articles = nil
	blogCache.LastFetch = time.Time{}
	blogCache.Mutex.Unlock()

	req := httptest.NewRequest(http.MethodGet, "/api/marketing/blog", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503 Service Unavailable (due to JSON error), got %d", w.Code)
	}
}

func TestHandler_Options(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/api/marketing/blog", nil)
	w := httptest.NewRecorder()

	Handler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 for OPTIONS, got %d", w.Code)
	}
}
