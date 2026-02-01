package marketing

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestStatusHandler_Returns200(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/marketing/go_status", nil)
	w := httptest.NewRecorder()

	StatusHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}

	var resp GoStatusResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Errorf("Failed to decode response: %v", err)
	}

	if resp.Status != "operational" {
		t.Errorf("Expected status 'operational', got '%s'", resp.Status)
	}

	if resp.Service != "VioletVault Go Engine" {
		t.Errorf("Unexpected service name: %s", resp.Service)
	}

	if resp.Goroutines <= 0 {
		t.Errorf("Expected some goroutines, got %d", resp.Goroutines)
	}
}
