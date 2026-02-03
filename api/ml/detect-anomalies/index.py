"""
Anomaly detection endpoint using Isolation Forest.
Identifies unusual spending patterns and allocation anomalies.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Any

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# Add parent directory to path for utils import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils


class Handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for anomaly detection"""

    def do_POST(self):
        """Handle POST request for anomaly detection"""
        try:
            # Parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data = json.loads(body.decode("utf-8"))

            # Get encryption key
            key = utils.get_encryption_key()

            # Decrypt request
            decrypted = utils.decrypt_request(request_data, key)

            # Extract transactions
            transactions = decrypted.get("transactions", [])

            # Detect anomalies
            anomalies = detect_anomalies(transactions)

            # Encrypt response
            encrypted_response = utils.encrypt_response({"anomalies": anomalies}, key)

            # Send response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(encrypted_response).encode("utf-8"))

        except Exception as e:
            error_response = utils.send_error("Anomaly detection failed", 500, str(e))
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


def detect_anomalies(transactions: list[dict[str, Any]]) -> list[utils.AnomalyResult]:
    """
    Detect anomalies using Isolation Forest and statistical methods.

    Args:
        transactions: List of allocation transactions

    Returns:
        List of detected anomalies sorted by severity
    """
    if len(transactions) < 10:
        # Not enough data for meaningful anomaly detection
        return []

    # Group by envelope for context-aware detection
    envelope_groups = group_by_envelope(transactions)

    all_anomalies = []

    for envelope_id, tx_list in envelope_groups.items():
        if len(tx_list) < 5:
            # Skip envelopes with insufficient data
            continue

        # Detect anomalies for this envelope
        envelope_anomalies = detect_envelope_anomalies(envelope_id, tx_list)
        all_anomalies.extend(envelope_anomalies)

    # Sort by severity (high -> medium -> low)
    severity_order = {"high": 0, "medium": 1, "low": 2}
    all_anomalies.sort(key=lambda a: severity_order.get(a["severity"], 3))

    return all_anomalies


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


def detect_envelope_anomalies(
    envelope_id: str, transactions: list[dict[str, Any]]
) -> list[utils.AnomalyResult]:
    """
    Detect anomalies within a single envelope using multiple methods:
    1. Isolation Forest (ML-based)
    2. Z-score (statistical)
    3. IQR (interquartile range)
    """
    anomalies = []

    # Extract amounts
    amounts = np.array([tx.get("amount", 0) for tx in transactions]).reshape(-1, 1)

    if len(amounts) < 5:
        return []

    # Calculate statistics
    mean_amount = np.mean(amounts)
    std_amount = np.std(amounts)
    median_amount = np.median(amounts)

    # Method 1: Isolation Forest
    iso_forest = IsolationForest(
        contamination=0.1,  # Expect ~10% anomalies
        random_state=42,
        n_estimators=100,
    )

    # Standardize features for better detection
    scaler = StandardScaler()
    amounts_scaled = scaler.fit_transform(amounts)

    # Predict anomalies (-1 = anomaly, 1 = normal)
    predictions = iso_forest.fit_predict(amounts_scaled)
    anomaly_scores = iso_forest.score_samples(amounts_scaled)

    # Method 2: Z-score (statistical outlier detection)
    z_scores = (
        np.abs((amounts.flatten() - mean_amount) / std_amount)
        if std_amount > 0
        else np.zeros(len(amounts))
    )

    # Method 3: IQR method
    q1 = np.percentile(amounts, 25)
    q3 = np.percentile(amounts, 75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    # Identify anomalies
    for i, tx in enumerate(transactions):
        amount = tx.get("amount", 0)
        is_anomaly = False
        severity = "low"
        methods_detected = []

        # Check Isolation Forest
        if predictions[i] == -1:
            is_anomaly = True
            methods_detected.append("ML")
            # Higher negative score = more anomalous
            if anomaly_scores[i] < -0.5:
                severity = "high"
            elif anomaly_scores[i] < -0.3:
                severity = "medium"

        # Check Z-score
        if z_scores[i] > 3:
            is_anomaly = True
            methods_detected.append("Z-score")
            severity = "high"
        elif z_scores[i] > 2:
            is_anomaly = True
            methods_detected.append("Z-score")
            severity = max(severity, "medium") if severity != "high" else severity

        # Check IQR
        if amount < lower_bound or amount > upper_bound:
            is_anomaly = True
            methods_detected.append("IQR")

        if is_anomaly:
            # Calculate deviation percentage
            deviation = ((amount - mean_amount) / mean_amount * 100) if mean_amount > 0 else 0

            # Generate explanation
            explanation = generate_anomaly_explanation(
                amount, mean_amount, median_amount, deviation, methods_detected
            )

            # Determine possible causes
            possible_causes = infer_possible_causes(tx, amount, mean_amount, envelope_id)

            anomalies.append(
                utils.AnomalyResult(
                    date=tx.get("date", ""),
                    envelope=tx.get("envelopeName", envelope_id),
                    amount=amount,
                    expectedAmount=mean_amount,
                    severity=severity,
                    explanation=explanation,
                    possibleCauses=possible_causes,
                )
            )

    return anomalies


def generate_anomaly_explanation(
    amount: float, mean_amount: float, median_amount: float, deviation: float, methods: list[str]
) -> str:
    """Generate human-readable explanation for anomaly"""
    if amount > mean_amount:
        direction = "above"
        comparison = "higher"
    else:
        direction = "below"
        comparison = "lower"

    deviation_pct = abs(deviation)

    # Format explanation based on deviation magnitude
    if deviation_pct > 200:
        magnitude = "extremely"
    elif deviation_pct > 100:
        magnitude = "significantly"
    elif deviation_pct > 50:
        magnitude = "moderately"
    else:
        magnitude = "slightly"

    explanation = (
        f"{magnitude.capitalize()} {direction} average allocation "
        f"({abs(deviation):.0f}% {comparison} than typical "
        f"{utils.format_currency(mean_amount)})"
    )

    return explanation


def infer_possible_causes(
    transaction: dict[str, Any], amount: float, mean_amount: float, envelope_id: str
) -> list[str]:
    """Infer possible causes for anomaly based on context"""
    causes = []

    # High allocation causes
    if amount > mean_amount:
        if "emergency" in envelope_id.lower():
            causes.append("Emergency fund boost")
        elif "savings" in envelope_id.lower():
            causes.append("Extra savings contribution")
        elif "debt" in envelope_id.lower():
            causes.append("Extra debt payment")
        else:
            causes.append("Special occasion or unexpected expense")
            causes.append("Budget adjustment")

    # Low allocation causes
    else:
        causes.append("Reduced income period")
        causes.append("Competing financial priorities")
        if "discretionary" in envelope_id.lower() or "entertainment" in envelope_id.lower():
            causes.append("Tightening budget")

    # Check for seasonal patterns
    date_str = transaction.get("date", "")
    try:
        date = utils.parse_iso_date(date_str)
        month = date.month

        # Holiday months
        if month in [11, 12]:
            causes.append("Holiday spending adjustment")
        # Tax season
        elif month in [3, 4]:
            causes.append("Tax payment impact")
        # Summer
        elif month in [6, 7, 8]:
            causes.append("Vacation season")
    except Exception:
        pass

    return causes[:3]  # Return top 3 causes
