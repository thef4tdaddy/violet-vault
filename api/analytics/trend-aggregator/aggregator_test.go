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

func TestBucketDate(t *testing.T) {
	testTime := time.Date(2023, 10, 15, 12, 0, 0, 0, time.UTC) // Sunday

	tests := []struct {
		name        string
		date        time.Time
		granularity string
		want        string
	}{
		{"Daily", testTime, "daily", "2023-10-15"},
		{"Weekly", testTime, "weekly", "2023-10-09"}, // Monday of the week (ISO week)
		{"Monthly", testTime, "monthly", "2023-10"},
		{"Default", testTime, "unknown", "2023-10-15"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := bucketDate(tt.date, tt.granularity); got != tt.want {
				t.Errorf("bucketDate() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestLinearRegression(t *testing.T) {
	tests := []struct {
		name          string
		x             []float64
		y             []float64
		wantSlope     float64
		wantIntercept float64
		wantR2        float64
	}{
		{
			"Perfect Line",
			[]float64{1, 2, 3},
			[]float64{2, 4, 6},
			2.0,
			0.0,
			1.0,
		},
		{
			"Flat Line",
			[]float64{1, 2, 3},
			[]float64{5, 5, 5},
			0.0,
			5.0,
			1.0, // Perfect fit to flat line, R2 is 1 (SSres=0) OR 0 if SS_tot is 0?
			// Wait, if y is constant, SStot is 0. Division by zero check?
			// Code: if ssTot == 0 { r2 = 0 }
			// So R2 should be 0.
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			slope, intercept, r2 := linearRegression(tt.x, tt.y)

			// Handle floating point precision
			if slope != tt.wantSlope && (tt.name != "Flat Line" || slope != 0) { // Special check
				if diff := slope - tt.wantSlope; diff < -0.001 || diff > 0.001 {
					t.Errorf("linearRegression() slope = %v, want %v", slope, tt.wantSlope)
				}
			}
			if intercept != tt.wantIntercept {
				if diff := intercept - tt.wantIntercept; diff < -0.001 || diff > 0.001 {
					t.Errorf("linearRegression() intercept = %v, want %v", intercept, tt.wantIntercept)
				}
			}

			// Check R2 specifically for Flat Line
			if tt.name == "Flat Line" {
				if r2 != 0 {
					t.Errorf("linearRegression() R2 for flat line = %v, want 0", r2)
				}
			} else {
				if r2 != tt.wantR2 {
					if diff := r2 - tt.wantR2; diff < -0.001 || diff > 0.001 {
						t.Errorf("linearRegression() R2 = %v, want %v", r2, tt.wantR2)
					}
				}
			}
		})
	}
}

func TestGenerateTrends(t *testing.T) {
	now := time.Now()
	testTx := []utils.AllocationTransaction{
		{Date: now, Amount: 100, EnvelopeID: "env1"},
		{Date: now.AddDate(0, 0, -1), Amount: 50, EnvelopeID: "env1"},
		{Date: now, Amount: 200, EnvelopeID: "env2"},
		{Date: now, Amount: 500, EnvelopeID: "env3"}, // Not in request
	}

	req := utils.TrendRequest{
		Transactions: testTx,
		EnvelopeIDs:  []string{"env1", "env2"},
		Granularity:  "daily",
	}

	resp, err := generateTrends(req)
	if err != nil {
		t.Fatalf("generateTrends() error = %v", err)
	}

	// Verify Data Length
	// Should have 2 data points (today and yesterday)
	if len(resp.Data) != 2 {
		t.Errorf("Expected 2 data points, got %d", len(resp.Data))
	}

	// Verify Metadata
	if len(resp.Metadata) != 2 {
		t.Errorf("Expected metadata for 2 envelopes, got %d", len(resp.Metadata))
	}

	if _, ok := resp.Metadata["env1"]; !ok {
		t.Error("Missing metadata for env1")
	}
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
		data := utils.TrendRequest{
			Transactions: []utils.AllocationTransaction{
				{Date: now, Amount: 100, EnvelopeID: "env1"},
			},
			EnvelopeIDs: []string{"env1"},
			Granularity: "daily",
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

		trendResp, err := utils.DecryptRequest[utils.TrendResponse](utils.EncryptedRequest{Encrypted: resp.Encrypted}, key)
		if err != nil {
			t.Fatalf("Failed to decrypt: %v", err)
		}

		if len(trendResp.Data) == 0 {
			t.Error("Expected trend data")
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

	t.Run("Decryption Failure", func(t *testing.T) {
		payload := utils.EncryptedRequest{
			Encrypted: utils.EncryptedPayload{
				Ciphertext: "invalid",
				IV:         "MTIzNDU2Nzg5MDEy",
				AuthTag:    "MTIzNDU2Nzg5MDEyMzQ1Ng==",
				Algorithm:  "AES-256-GCM",
			},
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusBadRequest {
			t.Errorf("wrong status: got %v want %v", status, http.StatusBadRequest)
		}
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/", bytes.NewBufferString("invalid"))
		rr := httptest.NewRecorder()
		Handler(rr, req)
		if status := rr.Code; status != http.StatusBadRequest {
			t.Errorf("wrong status: got %v want %v", status, http.StatusBadRequest)
		}
	})
}

func TestLinearRegressionEdgeCases(t *testing.T) {
	t.Run("Single Point", func(t *testing.T) {
		slope, intercept, r2 := linearRegression([]float64{1}, []float64{10})
		if slope != 0 || intercept != 10 || r2 != 0 {
			t.Errorf("Expected zeros for single point with meanY intercept, got %v, %v, %v", slope, intercept, r2)
		}
	})
}
