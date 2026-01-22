"""
Bill Prediction Analytics
Analyzes historical bill patterns and predicts upcoming bills
"""

from datetime import UTC, datetime, timedelta

from api.models import (
    BillFrequency,
    BillPredictionResult,
    HistoricalBill,
    PredictedBill,
)


def predict_bills(historical_bills_data: list[dict]) -> BillPredictionResult:
    """
    Predict upcoming bills based on historical patterns

    Args:
        historical_bills_data: List of historical bill payments (anonymized)

    Returns:
        Predictions for upcoming bills with confidence scores
    """
    if not historical_bills_data:
        return BillPredictionResult(
            predictedBills=[],
            totalPredictedAmount=0.0,
            nextBillDate=None,
            message="No historical bill data available for predictions",
        )

    # Validate inputs
    historical_bills = [HistoricalBill(**b) for b in historical_bills_data]

    # Group bills by category
    bills_by_category: dict[str, list[HistoricalBill]] = {}
    for bill in historical_bills:
        category = bill.category
        if category not in bills_by_category:
            bills_by_category[category] = []
        bills_by_category[category].append(bill)

    # Analyze each category
    predicted_bills: list[PredictedBill] = []

    for category, bills in bills_by_category.items():
        if len(bills) < 2:
            # Not enough data to predict
            continue

        # Sort bills by date
        sorted_bills = sorted(bills, key=lambda b: b.dueDate)

        # Calculate intervals between bills
        intervals: list[int] = []
        for i in range(len(sorted_bills) - 1):
            try:
                date1 = datetime.fromisoformat(sorted_bills[i].dueDate.replace("Z", "+00:00"))
                date2 = datetime.fromisoformat(sorted_bills[i + 1].dueDate.replace("Z", "+00:00"))
                interval = (date2 - date1).days
                if interval > 0:
                    intervals.append(interval)
            except (ValueError, AttributeError):
                continue

        if not intervals:
            continue

        # Detect frequency pattern
        frequency = _detect_frequency(intervals)

        # Calculate average amount
        amounts = [b.amount for b in sorted_bills]
        avg_amount = sum(amounts) / len(amounts)

        # Predict next bill date
        try:
            last_date = datetime.fromisoformat(sorted_bills[-1].dueDate.replace("Z", "+00:00"))
            next_date = last_date + timedelta(days=frequency.intervalDays)

            # Only predict bills that are in the future
            now = datetime.now()
            # Making now offset-aware if next_date is offset-aware
            if next_date.tzinfo is not None and now.tzinfo is None:
                now = now.replace(tzinfo=UTC)

            if next_date > now:
                predicted_bills.append(
                    PredictedBill(
                        category=category,
                        predictedAmount=round(avg_amount, 2),
                        predictedDate=next_date.isoformat(),
                        confidence=frequency.confidence,
                        frequency=frequency,
                    )
                )
        except (ValueError, AttributeError):
            continue

    # Sort by predicted date
    predicted_bills.sort(key=lambda b: b.predictedDate)

    # Calculate totals
    total_predicted_amount = sum(b.predictedAmount for b in predicted_bills)
    next_bill_date = predicted_bills[0].predictedDate if predicted_bills else None

    # Generate message
    if predicted_bills:
        message = f"Predicted {len(predicted_bills)} upcoming bills"
    else:
        message = "No upcoming bills predicted based on available data"

    return BillPredictionResult(
        predictedBills=predicted_bills,
        totalPredictedAmount=round(total_predicted_amount, 2),
        nextBillDate=next_bill_date,
        message=message,
    )


def _detect_frequency(intervals: list[int]) -> BillFrequency:
    """
    Detect billing frequency pattern from intervals

    Args:
        intervals: List of day intervals between bills

    Returns:
        Detected frequency with confidence score
    """
    if not intervals:
        return BillFrequency(intervalDays=30, confidence=0, pattern="unknown")

    # Calculate average interval
    avg_interval = sum(intervals) / len(intervals)

    # Calculate standard deviation for confidence
    variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)
    std_dev = variance**0.5

    # Confidence decreases with higher variance
    # Perfect consistency = 100% confidence
    if avg_interval <= 0:
        confidence = 0
    else:
        coefficient_of_variation = std_dev / avg_interval
        confidence = max(0, min(100, int((1 - coefficient_of_variation) * 100)))

    # Round to nearest common pattern
    interval_days = round(avg_interval)

    # Determine pattern type
    pattern: str
    if 6 <= interval_days <= 8:
        pattern = "weekly"
        interval_days = 7
    elif 13 <= interval_days <= 15:
        pattern = "biweekly"
        interval_days = 14
    elif 27 <= interval_days <= 33:
        pattern = "monthly"
        interval_days = 30
    elif 88 <= interval_days <= 95:
        pattern = "quarterly"
        interval_days = 90
    elif 175 <= interval_days <= 185:
        pattern = "semi-annual"
        interval_days = 180
    elif 355 <= interval_days <= 375:
        pattern = "annual"
        interval_days = 365
    else:
        pattern = f"{interval_days}-day cycle"

    return BillFrequency(intervalDays=interval_days, confidence=confidence, pattern=pattern)
