package handler

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/thef4tdaddy/violet-vault/api/analytics/utils"
)

func TestGenerateHeatmap(t *testing.T) {
	// Use UTC for consistent date parsing/formatting in tests
	now := time.Now().UTC()
	todayStr := now.Format("2006-01-02")
	yesterdayStr := now.AddDate(0, 0, -1).Format("2006-01-02")

	// Range needs to encompass the whole day, handler's time.Parse(endDate)
	// results in midnight of that day, so tx.Date.After(endDate) would be true for today's txs.
	// We set endDate to tomorrow to be safe.
	startDate := now.AddDate(0, 0, -10).Format("2006-01-02")
	endDate := now.AddDate(0, 0, 1).Format("2006-01-02")

	transactions := []utils.AllocationTransaction{
		{Date: now, Amount: 100, EnvelopeID: "env1"},
		{Date: now, Amount: 200, EnvelopeID: "env2"},
		{Date: now.AddDate(0, 0, -1), Amount: 150, EnvelopeID: "env1"},
	}

	req := utils.HeatmapRequest{
		DateRange: utils.DateRange{
			Start: startDate,
			End:   endDate,
		},
		Transactions: transactions,
	}

	t.Run("Sequential heatmap generation", func(t *testing.T) {
		heatmap, err := generateHeatmap(req)
		if err != nil {
			t.Fatalf("generateHeatmap failed: %v", err)
		}

		// Check points
		foundToday := false
		foundYesterday := false
		for _, p := range heatmap {
			if p.Date == todayStr {
				foundToday = true
				if p.Amount != 300 {
					t.Errorf("Today amount = %v, want 300", p.Amount)
				}
				if p.Count != 2 {
					t.Errorf("Today count = %v, want 2", p.Count)
				}
			}
			if p.Date == yesterdayStr {
				foundYesterday = true
				if p.Amount != 150 {
					t.Errorf("Yesterday amount = %v, want 150", p.Amount)
				}
			}
		}

		if !foundToday || !foundYesterday {
			t.Errorf("Heatmap missing points: today=%v, yesterday=%v", foundToday, foundYesterday)
		}
	})

	t.Run("Parallel heatmap generation", func(t *testing.T) {
		// Mock large dataset
		largeTxs := make([]utils.AllocationTransaction, 1500)
		for i := 0; i < 1500; i++ {
			largeTxs[i] = utils.AllocationTransaction{
				Date:   now,
				Amount: 1,
			}
		}

		reqLarge := utils.HeatmapRequest{
			DateRange:    req.DateRange,
			Transactions: largeTxs,
		}

		heatmap, err := generateHeatmap(reqLarge)
		if err != nil {
			t.Fatalf("generateHeatmap failed: %v", err)
		}

		found := false
		for _, p := range heatmap {
			if p.Date == todayStr {
				found = true
				if p.Amount != 1500 {
					t.Errorf("Parallel amount = %v, want 1500", p.Amount)
				}
			}
		}
		if !found {
			t.Error("Parallel heatmap missing today's point")
		}
	})

	t.Run("Invalid date range", func(t *testing.T) {
		reqInvalid := utils.HeatmapRequest{
			DateRange: utils.DateRange{
				Start: "invalid",
				End:   endDate,
			},
		}
		_, err := generateHeatmap(reqInvalid)
		if err == nil {
			t.Error("Expected error for invalid start date")
		}

		reqInvalid2 := utils.HeatmapRequest{
			DateRange: utils.DateRange{
				Start: startDate,
				End:   "invalid",
			},
		}
		_, err = generateHeatmap(reqInvalid2)
		if err == nil {
			t.Error("Expected error for invalid end date")
		}
	})
}

func TestHandler(t *testing.T) {
	// Setup test key
	key := []byte("12345678901234567890123456789012")
	keyHex := hex.EncodeToString(key)
	t.Setenv("ANALYTICS_ENCRYPTION_KEY", keyHex)
	t.Setenv("VERCEL_ENV", "development")

	t.Run("OPTIONS Request", func(t *testing.T) {
		req, _ := http.NewRequest("OPTIONS", "/", nil)
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusOK {
			t.Errorf("wrong status: got %v want %v", status, http.StatusOK)
		}
	})

	t.Run("Method Not Allowed", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/", nil)
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusMethodNotAllowed {
			t.Errorf("wrong status: got %v want %v", status, http.StatusMethodNotAllowed)
		}
	})

	t.Run("Successful Processing", func(t *testing.T) {
		now := time.Now().UTC()
		data := utils.HeatmapRequest{
			Transactions: []utils.AllocationTransaction{
				{Date: now, Amount: 100, EnvelopeID: "env1"},
			},
			DateRange: utils.DateRange{
				Start: now.AddDate(0, 0, -1).Format("2006-01-02"),
				End:   now.AddDate(0, 0, 1).Format("2006-01-02"),
			},
		}
		encrypted, _ := utils.EncryptData(data, key)
		reqBody, _ := json.Marshal(utils.EncryptedRequest{Encrypted: encrypted})

		req, _ := http.NewRequest("POST", "/", bytes.NewBuffer(reqBody))
		rr := httptest.NewRecorder()
		Handler(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("wrong status: got %v want %v", status, http.StatusOK)
		}

		var resp utils.EncryptedResponse
		json.NewDecoder(rr.Body).Decode(&resp)

		heatmap, err := utils.DecryptRequest[[]utils.HeatmapDataPoint](utils.EncryptedRequest{Encrypted: resp.Encrypted}, key)
		if err != nil {
			t.Fatalf("Failed to decrypt: %v", err)
		}

		if len(heatmap) == 0 {
			t.Error("Expected heatmap data")
		}
	})

	t.Run("Encryption Key Failure", func(t *testing.T) {
		t.Setenv("ANALYTICS_ENCRYPTION_KEY", "invalid")
		req, _ := http.NewRequest("POST", "/", bytes.NewBufferString("{}"))
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusInternalServerError {
			t.Errorf("wrong status: got %v want %v", status, http.StatusInternalServerError)
		}
	})

	t.Run("Invalid JSON Body", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/", bytes.NewBufferString("invalid"))
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusBadRequest {
			t.Errorf("wrong status: got %v want %v", status, http.StatusBadRequest)
		}
	})
}
