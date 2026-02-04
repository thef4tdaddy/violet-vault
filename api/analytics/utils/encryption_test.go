package utils

import (
	"encoding/base64"
	"encoding/json"
	"os"
	"testing"
)

type TestData struct {
	Message string `json:"message"`
	Amount  int    `json:"amount"`
}

func TestEncryptionRoundTrip(t *testing.T) {
	key := []byte("12345678901234567890123456789012") // 32 bytes
	data := TestData{
		Message: "Sensitive Financial Data",
		Amount:  1000,
	}

	// Encrypt
	encrypted, err := EncryptData(data, key)
	if err != nil {
		t.Fatalf("Failed to encrypt data: %v", err)
	}

	if encrypted.Algorithm != "AES-256-GCM" {
		t.Errorf("Expected algorithm AES-256-GCM, got %s", encrypted.Algorithm)
	}

	// Decrypt
	result, err := DecryptPayload(encrypted, key)
	if err != nil {
		t.Fatalf("Failed to decrypt payload: %v", err)
	}

	var decryptedData TestData
	if err := json.Unmarshal(result, &decryptedData); err != nil {
		t.Fatalf("Failed to unmarshal decrypted data: %v", err)
	}

	if decryptedData != data {
		t.Errorf("Decrypted data mismatch. Expected %+v, got %+v", data, decryptedData)
	}
}

func TestDecryptRequest(t *testing.T) {
	key := []byte("12345678901234567890123456789012")
	data := TestData{Message: "Request Data", Amount: 500}

	encryptedPayload, _ := EncryptData(data, key)
	req := EncryptedRequest{Encrypted: encryptedPayload}

	decrypted, err := DecryptRequest[TestData](req, key)
	if err != nil {
		t.Fatalf("DecryptRequest failed: %v", err)
	}

	if decrypted != data {
		t.Errorf("DecryptRequest mismatch. Expected %+v, got %+v", data, decrypted)
	}
}

func TestEncryptResponse(t *testing.T) {
	key := []byte("12345678901234567890123456789012")
	data := TestData{Message: "Response Data", Amount: 200}

	resp, err := EncryptResponse(data, key)
	if err != nil {
		t.Fatalf("EncryptResponse failed: %v", err)
	}

	decryptedBytes, err := DecryptPayload(resp.Encrypted, key)
	if err != nil {
		t.Fatalf("Failed to decrypt response: %v", err)
	}

	var decryptedData TestData
	json.Unmarshal(decryptedBytes, &decryptedData)

	if decryptedData != data {
		t.Errorf("Response mismatch. Expected %+v, got %+v", data, decryptedData)
	}
}

func TestGetEncryptionKey(t *testing.T) {
	// Test Default Dev Key
	os.Unsetenv("ANALYTICS_ENCRYPTION_KEY")
	os.Unsetenv("VERCEL_ENV")

	key, err := GetEncryptionKey()
	if err != nil {
		t.Errorf("GetEncryptionKey failed in dev mode: %v", err)
	}

	if string(key) != "dev-key-32-bytes-do-not-use!" {
		t.Errorf("Expected dev key, got %s", string(key))
	}

	// Test Production Error without Key
	os.Setenv("VERCEL_ENV", "production")
	_, err = GetEncryptionKey()
	if err == nil {
		t.Error("Expected error in production without key, got nil")
	}

	// Test Valid Key from Env
	validKeyHex := "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"
	os.Setenv("ANALYTICS_ENCRYPTION_KEY", validKeyHex)
	key, err = GetEncryptionKey()
	if err != nil {
		t.Errorf("Failed to get key from env: %v", err)
	}
	if len(key) != 32 {
		t.Errorf("Expected 32 bytes key, got %d", len(key))
	}

	// Cleanup
	os.Unsetenv("ANALYTICS_ENCRYPTION_KEY")
	os.Unsetenv("VERCEL_ENV")
}

func TestDecryptionErrors(t *testing.T) {
	key := []byte("12345678901234567890123456789012")

	// Test Invalid Ciphertext
	invalidPayload := EncryptedPayload{
		Ciphertext: "invalid-base64",
		IV:         base64.StdEncoding.EncodeToString(make([]byte, 12)),
		AuthTag:    base64.StdEncoding.EncodeToString(make([]byte, 16)),
		Algorithm:  "AES-256-GCM",
	}
	_, err := DecryptPayload(invalidPayload, key)
	if err == nil {
		t.Error("Expected error for invalid ciphertext, got nil")
	}

	// Test Wrong Key
	data := TestData{Message: "Secret", Amount: 10}
	encrypted, _ := EncryptData(data, key)
	wrongKey := []byte("98765432109876543210987654321098")

	_, err = DecryptPayload(encrypted, wrongKey)
	if err == nil {
		t.Error("Expected error for wrong key decryption, got nil")
	}
}
