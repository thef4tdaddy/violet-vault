"""
Shared utilities for Python ML endpoints.
Provides encryption/decryption and common type definitions.
"""

import base64
import gc
import json
import os
from datetime import datetime
from typing import Any, TypedDict

from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # type: ignore

# Type Definitions (matching TypeScript/Go types)


class EncryptedPayload(TypedDict):
    """Encrypted data payload"""

    ciphertext: str  # Base64 encoded
    iv: str  # Base64 encoded initialization vector
    authTag: str  # Base64 encoded authentication tag
    algorithm: str  # Should be "AES-256-GCM"


class EncryptedRequest(TypedDict):
    """Encrypted API request wrapper"""

    encrypted: EncryptedPayload


class EncryptedResponse(TypedDict):
    """Encrypted API response wrapper"""

    encrypted: EncryptedPayload


class AllocationTransaction(TypedDict):
    """Budget allocation transaction"""

    id: str
    amount: float
    envelopeId: str
    envelopeName: str | None
    date: str  # ISO date string
    category: str | None
    strategy: str | None
    frequency: str | None


class AllocationPrediction(TypedDict):
    """ML prediction for envelope allocation"""

    envelopeId: str
    envelopeName: str
    predictedAmount: float
    confidence: float
    rationale: str


class AnomalyResult(TypedDict):
    """Anomaly detection result"""

    date: str
    envelope: str
    amount: float
    expectedAmount: float
    severity: str  # "low" | "medium" | "high"
    explanation: str
    possibleCauses: list[str]


class MLInsight(TypedDict):
    """Machine learning generated insight"""

    type: str  # "trend" | "pattern" | "goal" | "recommendation"
    title: str
    description: str
    severity: str  # "info" | "warning" | "success"
    actionable: bool


class ErrorResponse(TypedDict):
    """API error response"""

    error: str
    code: int
    details: str | None


# Encryption Utilities


def get_encryption_key() -> bytes:
    """
    Retrieve encryption key from environment variables.
    Returns 32-byte (256-bit) key for AES-256.
    """
    key_hex = os.getenv("ANALYTICS_ENCRYPTION_KEY")

    if not key_hex:
        # Development mode: use fixed key (INSECURE)
        if os.getenv("VERCEL_ENV") == "production":
            raise ValueError("ANALYTICS_ENCRYPTION_KEY must be set in production")

        # 32-byte key for development only
        return b"dev-key-32-bytes-do-not-use!"

    # Decode hex key
    key = bytes.fromhex(key_hex)

    # Verify key length (256 bits = 32 bytes)
    if len(key) != 32:
        raise ValueError(f"Invalid key length: expected 32 bytes, got {len(key)}")

    return key


def decrypt_payload(encrypted: EncryptedPayload, key: bytes) -> bytes:
    """
    Decrypt AES-256-GCM encrypted payload.
    Returns decrypted plaintext as bytes.
    """
    # Verify algorithm
    if encrypted["algorithm"] != "AES-256-GCM":
        raise ValueError(f"Unsupported algorithm: {encrypted['algorithm']}")

    # Decode base64 strings
    ciphertext = base64.b64decode(encrypted["ciphertext"])
    iv = base64.b64decode(encrypted["iv"])
    auth_tag = base64.b64decode(encrypted["authTag"])

    # Create AESGCM cipher
    cipher = AESGCM(key)

    # Combine ciphertext and auth tag (AESGCM expects them concatenated)
    ciphertext_with_tag = ciphertext + auth_tag

    # Decrypt
    try:
        plaintext = cipher.decrypt(iv, ciphertext_with_tag, None)
        return plaintext
    except Exception as e:
        raise ValueError(f"Decryption failed (authentication failed or corrupted data): {e}") from e


def encrypt_data(data: Any, key: bytes) -> EncryptedPayload:
    """
    Encrypt data using AES-256-GCM.
    Returns encrypted payload with ciphertext, IV, and auth tag.
    """
    # Serialize data to JSON
    plaintext = json.dumps(data).encode("utf-8")

    # Create AESGCM cipher
    cipher = AESGCM(key)

    # Generate random IV (12 bytes for GCM)
    iv = os.urandom(12)

    # Encrypt
    ciphertext_with_tag = cipher.encrypt(iv, plaintext, None)

    # AESGCM appends auth tag to ciphertext
    # Split them for separate base64 encoding
    tag_size = 16  # 16 bytes for GCM
    ciphertext = ciphertext_with_tag[:-tag_size]
    auth_tag = ciphertext_with_tag[-tag_size:]

    return EncryptedPayload(
        ciphertext=base64.b64encode(ciphertext).decode("utf-8"),
        iv=base64.b64encode(iv).decode("utf-8"),
        authTag=base64.b64encode(auth_tag).decode("utf-8"),
        algorithm="AES-256-GCM",
    )


def decrypt_request(encrypted_req: EncryptedRequest, key: bytes) -> dict[str, Any]:
    """
    Decrypt encrypted API request and parse JSON.
    Returns deserialized data as dictionary.
    """
    plaintext = decrypt_payload(encrypted_req["encrypted"], key)
    return json.loads(plaintext.decode("utf-8"))


def encrypt_response(data: Any, key: bytes) -> EncryptedResponse:
    """
    Encrypt response data for client.
    Returns encrypted response wrapper.
    """
    encrypted = encrypt_data(data, key)
    return EncryptedResponse(encrypted=encrypted)


def cleanup_memory():
    """
    Force garbage collection to clear sensitive data from memory.
    Call after processing each request.
    """
    gc.collect()


# Helper Functions


def parse_iso_date(date_str: str) -> datetime:
    """Parse ISO date string to datetime object"""
    return datetime.fromisoformat(date_str.replace("Z", "+00:00"))


def format_currency(amount_cents: float) -> str:
    """Format amount in cents to currency string"""
    return f"${amount_cents / 100:.2f}"


def send_error(error_msg: str, code: int, details: str | None = None) -> dict[str, Any]:
    """Create error response"""
    return {"error": error_msg, "code": code, "details": details or ""}
