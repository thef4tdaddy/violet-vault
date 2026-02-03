"""
ML-powered insights generation endpoint.
Uses pattern detection and analysis to generate personalized financial insights.
"""

import json
import os
import sys
from collections import defaultdict
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from typing import Any

import numpy as np

# Add parent directory to path for utils import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils


class Handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for insights generation"""

    def do_POST(self):
        """Handle POST request for insights generation"""
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

            # Generate insights
            insights = generate_insights(transactions)

            # Encrypt response
            encrypted_response = utils.encrypt_response({"insights": insights}, key)

            # Send response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(encrypted_response).encode("utf-8"))

        except Exception as e:
            error_response = utils.send_error("Insights generation failed", 500, str(e))
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


def generate_insights(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """
    Generate personalized insights using pattern detection and analysis.

    Insight types:
    - Savings trends (increasing/decreasing)
    - Spending patterns (lifestyle creep detection)
    - Seasonal variations
    - Goal progress
    - Budget efficiency recommendations

    Args:
        transactions: List of allocation transactions

    Returns:
        List of insights sorted by relevance
    """
    if len(transactions) < 5:
        return []

    insights = []

    # Detect various patterns
    insights.extend(detect_savings_trends(transactions))
    insights.extend(detect_lifestyle_creep(transactions))
    insights.extend(detect_seasonal_patterns(transactions))
    insights.extend(detect_goal_progress(transactions))
    insights.extend(detect_consistency_patterns(transactions))
    insights.extend(generate_recommendations(transactions))

    # Sort by actionability and severity
    insights.sort(
        key=lambda i: (
            not i["actionable"],  # Actionable first
            {"success": 0, "warning": 1, "info": 2}.get(i["severity"], 3),  # Then by severity
        )
    )

    return insights[:10]  # Return top 10 insights


def detect_savings_trends(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Detect trends in savings allocations"""
    insights = []

    # Filter savings transactions
    savings_txs = [
        tx
        for tx in transactions
        if tx.get("category", "").lower() in ["savings", "investment", "retirement"]
    ]

    if len(savings_txs) < 3:
        return insights

    # Group by time period
    monthly_savings = group_by_month(savings_txs)

    if len(monthly_savings) < 2:
        return insights

    # Calculate trend
    months = sorted(monthly_savings.keys())
    amounts = [monthly_savings[m] for m in months]

    # Calculate percentage change
    if len(amounts) >= 2:
        first_amount = amounts[0]
        last_amount = amounts[-1]
        if first_amount > 0:
            pct_change = ((last_amount - first_amount) / first_amount) * 100

            if pct_change > 15:
                insights.append(
                    utils.MLInsight(
                        type="trend",
                        title="Savings Rate Increasing",
                        description=f"Your savings have increased {pct_change:.0f}% over the last {len(months)} months. Keep up the excellent progress!",
                        severity="success",
                        actionable=False,
                    )
                )
            elif pct_change < -15:
                insights.append(
                    utils.MLInsight(
                        type="trend",
                        title="Savings Rate Declining",
                        description=f"Your savings have decreased {abs(pct_change):.0f}% over the last {len(months)} months. Consider reviewing your budget priorities.",
                        severity="warning",
                        actionable=True,
                    )
                )

    return insights


def detect_lifestyle_creep(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Detect lifestyle creep (increasing discretionary spending)"""
    insights = []

    # Filter discretionary transactions
    discretionary_categories = ["entertainment", "dining", "shopping", "hobbies", "personal"]
    discretionary_txs = [
        tx for tx in transactions if tx.get("category", "").lower() in discretionary_categories
    ]

    if len(discretionary_txs) < 6:
        return insights

    # Group by time period
    monthly_discretionary = group_by_month(discretionary_txs)

    if len(monthly_discretionary) < 3:
        return insights

    # Calculate trend
    months = sorted(monthly_discretionary.keys())
    amounts = [monthly_discretionary[m] for m in months]

    # Check for increasing trend
    if len(amounts) >= 3:
        recent_avg = sum(amounts[-3:]) / 3
        earlier_avg = sum(amounts[:3]) / 3

        if earlier_avg > 0:
            pct_increase = ((recent_avg - earlier_avg) / earlier_avg) * 100

            if pct_increase > 20:
                insights.append(
                    utils.MLInsight(
                        type="pattern",
                        title="Lifestyle Creep Detected",
                        description=f"Discretionary spending has increased {pct_increase:.0f}% recently. Consider reviewing subscriptions and recurring expenses.",
                        severity="warning",
                        actionable=True,
                    )
                )

    return insights


def detect_seasonal_patterns(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Detect seasonal spending patterns"""
    insights = []

    # Group by month of year
    monthly_totals = defaultdict(list)

    for tx in transactions:
        date_str = tx.get("date", "")
        try:
            date = utils.parse_iso_date(date_str)
            month = date.month
            monthly_totals[month].append(tx.get("amount", 0))
        except Exception:
            continue

    # Find months with significantly higher spending
    month_averages = {
        month: sum(amounts) / len(amounts)
        for month, amounts in monthly_totals.items()
        if len(amounts) > 0
    }

    if len(month_averages) < 3:
        return insights

    overall_avg = sum(month_averages.values()) / len(month_averages)

    for month, avg in month_averages.items():
        if avg > overall_avg * 1.3:  # 30% higher than average
            pct_higher = ((avg - overall_avg) / overall_avg) * 100
            month_name = get_month_name(month)

            insights.append(
                utils.MLInsight(
                    type="pattern",
                    title=f"Higher Spending in {month_name}",
                    description=f"You typically spend {pct_higher:.0f}% more in {month_name}. Plan ahead for next year!",
                    severity="info",
                    actionable=True,
                )
            )

    return insights


def detect_goal_progress(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Detect progress toward financial goals"""
    insights = []

    # Check emergency fund progress
    emergency_txs = [tx for tx in transactions if "emergency" in tx.get("category", "").lower()]

    if len(emergency_txs) >= 3:
        total_emergency = sum(tx.get("amount", 0) for tx in emergency_txs)

        # Estimate monthly expenses
        monthly_expenses = estimate_monthly_expenses(transactions)

        if monthly_expenses > 0:
            months_covered = total_emergency / monthly_expenses

            if months_covered >= 5:
                insights.append(
                    utils.MLInsight(
                        type="goal",
                        title="Emergency Fund Goal Nearly Achieved",
                        description=f"You have {months_covered:.1f} months of expenses saved. Just {6 - months_covered:.1f} more months to reach the 6-month goal!",
                        severity="success",
                        actionable=False,
                    )
                )
            elif months_covered >= 2:
                insights.append(
                    utils.MLInsight(
                        type="goal",
                        title="Emergency Fund Building Well",
                        description=f"You have {months_covered:.1f} months of expenses saved. Continue building toward the 6-month goal.",
                        severity="info",
                        actionable=False,
                    )
                )

    return insights


def detect_consistency_patterns(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Detect allocation consistency patterns"""
    insights = []

    # Group by date to find allocation frequency
    dates = set()
    for tx in transactions:
        date_str = tx.get("date", "")
        try:
            date = utils.parse_iso_date(date_str)
            dates.add(date.strftime("%Y-%m-%d"))
        except Exception:
            continue

    if len(dates) < 3:
        return insights

    # Check for consistent allocation pattern
    sorted_dates = sorted([datetime.fromisoformat(d) for d in dates])
    intervals = [(sorted_dates[i + 1] - sorted_dates[i]).days for i in range(len(sorted_dates) - 1)]

    if intervals:
        avg_interval = sum(intervals) / len(intervals)
        std_interval = (sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)) ** 0.5

        # Consistent pattern (low variance)
        if std_interval < 3 and avg_interval >= 10:  # Within 3 days variance
            if 13 <= avg_interval <= 15:
                insights.append(
                    utils.MLInsight(
                        type="pattern",
                        title="Biweekly Allocation Consistency",
                        description="Your allocation timing is highly consistent. This discipline is excellent for financial planning!",
                        severity="success",
                        actionable=False,
                    )
                )

    return insights


def generate_recommendations(transactions: list[dict[str, Any]]) -> list[utils.MLInsight]:
    """Generate actionable recommendations"""
    insights = []

    # Calculate allocation distribution
    category_totals = defaultdict(float)
    total_allocated = 0

    for tx in transactions:
        category = tx.get("category", "Other")
        amount = tx.get("amount", 0)
        category_totals[category] += amount
        total_allocated += amount

    if total_allocated == 0:
        return insights

    # Check savings rate
    savings_categories = ["savings", "investment", "retirement"]
    savings_total = sum(
        category_totals[cat]
        for cat in savings_categories
        if cat.lower() in [c.lower() for c in category_totals.keys()]
    )
    savings_rate = (savings_total / total_allocated) * 100

    if savings_rate < 10:
        insights.append(
            utils.MLInsight(
                type="recommendation",
                title="Increase Savings Rate",
                description=f"Your current savings rate is {savings_rate:.1f}%. Consider aiming for at least 20% to build long-term wealth.",
                severity="warning",
                actionable=True,
            )
        )
    elif savings_rate >= 20:
        insights.append(
            utils.MLInsight(
                type="recommendation",
                title="Excellent Savings Rate",
                description=f"Your {savings_rate:.1f}% savings rate exceeds the recommended 20%. You're building wealth effectively!",
                severity="success",
                actionable=False,
            )
        )

    return insights


# Helper Functions


def group_by_month(transactions: list[dict[str, Any]]) -> dict[str, float]:
    """Group transactions by month and sum amounts"""
    monthly = defaultdict(float)

    for tx in transactions:
        date_str = tx.get("date", "")
        try:
            date = utils.parse_iso_date(date_str)
            month_key = date.strftime("%Y-%m")
            monthly[month_key] += tx.get("amount", 0)
        except Exception:
            continue

    return dict(monthly)


def calculate_trend_slope(amounts: list[float]) -> float:
    """Calculate linear regression slope for trend detection"""
    if len(amounts) < 2:
        return 0.0

    x = np.arange(len(amounts))
    y = np.array(amounts)

    # Simple linear regression
    x_mean = np.mean(x)
    y_mean = np.mean(y)

    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)

    if denominator == 0:
        return 0.0

    slope = numerator / denominator
    return slope


def estimate_monthly_expenses(transactions: list[dict[str, Any]]) -> float:
    """Estimate average monthly expenses from transactions"""
    monthly_totals = group_by_month(transactions)

    if not monthly_totals:
        return 0.0

    return sum(monthly_totals.values()) / len(monthly_totals)


def get_month_name(month: int) -> str:
    """Get month name from month number"""
    months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    return months[month - 1] if 1 <= month <= 12 else "Unknown"
