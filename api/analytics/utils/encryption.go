package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"runtime"
)

// DecryptPayload decrypts an AES-256-GCM encrypted payload
//
// The payload should contain:
// - Ciphertext (base64 encoded)
// - IV (base64 encoded initialization vector)
// - AuthTag (base64 encoded authentication tag)
// - Algorithm (should be "AES-256-GCM")
//
// Returns the decrypted data as a byte slice that can be unmarshaled into the desired type.
func DecryptPayload(encrypted EncryptedPayload, key []byte) ([]byte, error) {
	// Verify algorithm
	if encrypted.Algorithm != "AES-256-GCM" {
		return nil, fmt.Errorf("unsupported algorithm: %s", encrypted.Algorithm)
	}

	// Decode base64 strings
	ciphertext, err := base64.StdEncoding.DecodeString(encrypted.Ciphertext)
	if err != nil {
		return nil, fmt.Errorf("failed to decode ciphertext: %w", err)
	}

	iv, err := base64.StdEncoding.DecodeString(encrypted.IV)
	if err != nil {
		return nil, fmt.Errorf("failed to decode IV: %w", err)
	}

	authTag, err := base64.StdEncoding.DecodeString(encrypted.AuthTag)
	if err != nil {
		return nil, fmt.Errorf("failed to decode auth tag: %w", err)
	}

	// Create AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	// Combine ciphertext and auth tag (GCM expects them concatenated)
	ciphertextWithTag := append(ciphertext, authTag...)

	// Decrypt
	plaintext, err := gcm.Open(nil, iv, ciphertextWithTag, nil)
	if err != nil {
		return nil, fmt.Errorf("decryption failed (authentication failed or corrupted data): %w", err)
	}

	return plaintext, nil
}

// EncryptData encrypts data using AES-256-GCM
//
// Returns an EncryptedPayload containing the ciphertext, IV, and auth tag.
func EncryptData(data interface{}, key []byte) (EncryptedPayload, error) {
	// Serialize data to JSON
	plaintext, err := json.Marshal(data)
	if err != nil {
		return EncryptedPayload{}, fmt.Errorf("failed to marshal data: %w", err)
	}

	// Create AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return EncryptedPayload{}, fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return EncryptedPayload{}, fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generate random IV
	iv := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(iv); err != nil {
		return EncryptedPayload{}, fmt.Errorf("failed to generate IV: %w", err)
	}

	// Encrypt
	ciphertextWithTag := gcm.Seal(nil, iv, plaintext, nil)

	// GCM appends the auth tag to the ciphertext
	// Split them for separate base64 encoding
	tagSize := gcm.Overhead() // 16 bytes for GCM
	ciphertext := ciphertextWithTag[:len(ciphertextWithTag)-tagSize]
	authTag := ciphertextWithTag[len(ciphertextWithTag)-tagSize:]

	return EncryptedPayload{
		Ciphertext: base64.StdEncoding.EncodeToString(ciphertext),
		IV:         base64.StdEncoding.EncodeToString(iv),
		AuthTag:    base64.StdEncoding.EncodeToString(authTag),
		Algorithm:  "AES-256-GCM",
	}, nil
}

// DecryptRequest decrypts an encrypted API request into the target type
//
// This is a convenience wrapper around DecryptPayload that also handles unmarshaling.
func DecryptRequest[T any](req EncryptedRequest, key []byte) (T, error) {
	var result T

	plaintext, err := DecryptPayload(req.Encrypted, key)
	if err != nil {
		return result, err
	}

	if err := json.Unmarshal(plaintext, &result); err != nil {
		return result, fmt.Errorf("failed to unmarshal decrypted data: %w", err)
	}

	return result, nil
}

// EncryptResponse encrypts a response for the client
//
// This is a convenience wrapper around EncryptData.
func EncryptResponse(data interface{}, key []byte) (EncryptedResponse, error) {
	encrypted, err := EncryptData(data, key)
	if err != nil {
		return EncryptedResponse{}, err
	}

	return EncryptedResponse{
		Encrypted: encrypted,
	}, nil
}

// CleanupMemory forces garbage collection and clears sensitive data
//
// Call this after processing each request to ensure ephemeral processing.
func CleanupMemory() {
	runtime.GC()
}

// GetEncryptionKey retrieves the encryption key from environment variables
//
// In production, this should be set via Vercel environment variables.
// For development, a default key is used (INSECURE - do not use in production).
func GetEncryptionKey() ([]byte, error) {
	// Try to get from environment variable
	keyHex := os.Getenv("ANALYTICS_ENCRYPTION_KEY")

	if keyHex == "" {
		// Development mode: use a fixed key (INSECURE)
		// In production, this should NEVER be used
		if os.Getenv("VERCEL_ENV") == "production" {
			return nil, errors.New("ANALYTICS_ENCRYPTION_KEY must be set in production")
		}

		// 32-byte (256-bit) key for development only
		return []byte("dev-key-32-bytes-do-not-use!"), nil
	}

	// Decode hex key
	key, err := hex.DecodeString(keyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid encryption key format: %w", err)
	}

	// Verify key length (256 bits = 32 bytes)
	if len(key) != 32 {
		return nil, fmt.Errorf("invalid key length: expected 32 bytes, got %d", len(key))
	}

	return key, nil
}
