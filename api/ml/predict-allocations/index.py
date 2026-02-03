"""
ML-powered allocation prediction endpoint.
Uses RandomForest to predict next paycheck allocations based on historical patterns.
"""

import json
import os
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from typing import Any

import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Add parent directory to path for utils import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils


class Handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for allocation predictions"""

    def do_POST(self):
        """Handle POST request for allocation predictions"""
        try:
            # Parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data = json.loads(body.decode("utf-8"))

            # Get encryption key
            key = utils.get_encryption_key()

            # Decrypt request
            decrypted = utils.decrypt_request(request_data, key)

            # Extract parameters
            history = decrypted.get("history", [])
            paycheck_amount = decrypted.get("paycheckAmount", 0)
            num_predictions = decrypted.get("numPredictions", 5)

            # Generate predictions
            predictions = predict_allocations(history, paycheck_amount, num_predictions)

            # Encrypt response
            encrypted_response = utils.encrypt_response({"predictions": predictions}, key)

            # Send response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(encrypted_response).encode("utf-8"))

        except Exception as e:
            error_response = utils.send_error("Prediction failed", 500, str(e))
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode("utf-8"))

        finally:
            # Cleanup sensitive data
            utils.cleanup_memory()

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def predict_allocations(
    history: list[dict[str, Any]], paycheck_amount: float, num_predictions: int = 5
) -> list[utils.AllocationPrediction]:
    """
    Predict next paycheck allocations using RandomForest.

    Features:
    - Day of week (0-6)
    - Month (1-12)
    - Paycheck amount
    - Envelope category (encoded)
    - Previous allocation amounts (rolling averages)

    Args:
        history: List of historical allocation transactions
        paycheck_amount: Current paycheck amount in cents
        num_predictions: Number of top predictions to return

    Returns:
        List of allocation predictions sorted by confidence
    """
    if len(history) < 5:
        # Not enough history for ML predictions
        return []

    # Group transactions by envelope
    envelope_data = group_by_envelope(history)

    # Train model for each envelope
    predictions = []

    for envelope_id, transactions in envelope_data.items():
        if len(transactions) < 3:
            # Skip envelopes with insufficient data
            continue

        try:
            # Extract features and target
            X, y = extract_features(transactions, paycheck_amount)

            if len(X) < 2:
                continue

            # Train RandomForest model
            model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
            model.fit(X, y)

            # Predict for current paycheck
            current_features = build_current_features(transactions[-1], paycheck_amount)
            predicted_amount = model.predict([current_features])[0]

            # Calculate confidence (based on R² score)
            confidence = calculate_confidence(model, X, y)

            # Generate rationale
            rationale = generate_rationale(transactions, predicted_amount)

            # Get envelope name
            envelope_name = transactions[-1].get("envelopeName", envelope_id)

            predictions.append(
                utils.AllocationPrediction(
                    envelopeId=envelope_id,
                    envelopeName=envelope_name,
                    predictedAmount=max(0, predicted_amount),  # Ensure non-negative
                    confidence=round(confidence, 2),
                    rationale=rationale,
                )
            )

        except Exception:
            # Skip envelopes that fail to train
            continue

    # Sort by confidence and return top N
    predictions.sort(key=lambda p: p["confidence"], reverse=True)
    return predictions[:num_predictions]


def group_by_envelope(transactions: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Group transactions by envelope ID"""
    grouped: dict[str, list[dict[str, Any]]] = {}

    for tx in transactions:
        envelope_id = tx.get("envelopeId", "")
        if envelope_id:
            if envelope_id not in grouped:
                grouped[envelope_id] = []
            grouped[envelope_id].append(tx)

    return grouped


def extract_features(transactions: list[dict[str, Any]], paycheck_amount: float) -> tuple:
    """
    Extract features and target from transaction history.

    Returns:
        X (features), y (target amounts)
    """
    X = []
    y = []

    for i, tx in enumerate(transactions):
        # Parse date
        date_str = tx.get("date", "")
        try:
            date = utils.parse_iso_date(date_str)
        except Exception:
            continue

        # Features
        features = [
            date.weekday(),  # Day of week (0-6)
            date.month,  # Month (1-12)
            paycheck_amount,  # Current paycheck amount
            calculate_rolling_avg(transactions[:i], 3),  # 3-transaction moving avg
            calculate_rolling_avg(transactions[:i], 6),  # 6-transaction moving avg
        ]

        # Target
        amount = tx.get("amount", 0)

        X.append(features)
        y.append(amount)

    return np.array(X), np.array(y)


def build_current_features(last_transaction: dict[str, Any], paycheck_amount: float) -> list[float]:
    """Build feature vector for current paycheck prediction"""
    now = datetime.now()

    return [
        now.weekday(),
        now.month,
        paycheck_amount,
        last_transaction.get("amount", 0),  # Use last amount as rolling avg
        last_transaction.get("amount", 0),
    ]


def calculate_rolling_avg(transactions: list[dict[str, Any]], window: int) -> float:
    """Calculate rolling average of last N transaction amounts"""
    if not transactions:
        return 0.0

    recent = transactions[-window:] if len(transactions) >= window else transactions
    amounts = [tx.get("amount", 0) for tx in recent]
    return sum(amounts) / len(amounts) if amounts else 0.0


def calculate_confidence(model: RandomForestRegressor, X: np.ndarray, y: np.ndarray) -> float:
    """
    Calculate prediction confidence based on R² score.
    Returns value between 0 and 1.
    """
    try:
        r2_score = model.score(X, y)
        # Clamp to [0, 1]
        confidence = max(0.0, min(1.0, r2_score))
        return confidence
    except Exception:
        return 0.5  # Neutral confidence


def generate_rationale(transactions: list[dict[str, Any]], predicted_amount: float) -> str:
    """Generate human-readable explanation for prediction"""
    if len(transactions) < 2:
        return "Insufficient history"

    # Calculate average of recent allocations
    recent = transactions[-6:]  # Last 6 allocations
    amounts = [tx.get("amount", 0) for tx in recent]
    avg_amount = sum(amounts) / len(amounts)

    # Calculate variance
    variance = sum((amt - avg_amount) ** 2 for amt in amounts) / len(amounts)
    std_dev = variance**0.5

    # Determine consistency
    coefficient_of_variation = std_dev / avg_amount if avg_amount > 0 else 0

    if coefficient_of_variation < 0.1:
        return f"Consistently allocated {utils.format_currency(avg_amount)} over last {len(recent)} paychecks"
    elif coefficient_of_variation < 0.3:
        return f"Average allocation {utils.format_currency(avg_amount)} with moderate variance"
    else:
        return f"Variable allocation pattern, average {utils.format_currency(avg_amount)}"
