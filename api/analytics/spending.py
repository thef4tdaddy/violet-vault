"""
Spending Velocity Analytics
Calculates daily/weekly spending rates and predicts budget overruns
"""

from api.models import SpendingStats, SpendingVelocityResult


def calculate_spending_velocity(stats: dict) -> SpendingVelocityResult:
    """
    Calculate spending velocity and predict budget overruns

    Args:
        stats: Anonymized spending statistics from client

    Returns:
        Velocity analysis with predictions and recommendations
    """
    # Parse input into Pydantic model for validation
    stats_model = SpendingStats(**stats)

    total_spent = stats_model.totalSpent
    budget_allocated = stats_model.budgetAllocated
    days_elapsed = stats_model.daysElapsed
    days_remaining = stats_model.daysRemaining

    # Avoid division by zero
    if days_elapsed <= 0:
        return SpendingVelocityResult(
            velocityScore=100,
            dailyRate=0.0,
            projectedTotal=0.0,
            budgetAllocated=budget_allocated,
            willExceedBudget=False,
            daysUntilExceeded=None,
            recommendation="No spending data available yet",
            severity="success",
        )

    # Calculate daily spending rate
    daily_rate = total_spent / days_elapsed

    # Project total spending for the entire period
    total_days = days_elapsed + days_remaining
    projected_total = daily_rate * total_days

    # Calculate velocity score (0-100)
    # Score represents how well spending is paced
    if budget_allocated <= 0:
        velocity_score = 0
    else:
        ideal_spent = budget_allocated * (days_elapsed / total_days)
        if ideal_spent <= 0:
            velocity_score = 100 if total_spent <= 0 else 0
        else:
            # Score decreases as we exceed ideal pacing
            ratio = total_spent / ideal_spent
            if ratio <= 1.0:
                # Under or on pace - good score
                velocity_score = 100
            else:
                # Over pace - score decreases
                velocity_score = max(0, int(100 - ((ratio - 1.0) * 100)))

    # Determine if budget will be exceeded
    will_exceed_budget = projected_total > budget_allocated

    # Calculate days until budget exceeded (if applicable)
    days_until_exceeded: int | None = None
    if will_exceed_budget and daily_rate > 0:
        remaining_budget = budget_allocated - total_spent
        if remaining_budget > 0:
            days_until_exceeded = int(remaining_budget / daily_rate)
        else:
            days_until_exceeded = 0

    # Generate recommendation based on velocity
    recommendation: str
    severity: str
    if velocity_score >= 80:
        recommendation = "Excellent pacing! You're on track with your budget."
        severity = "success"
    elif velocity_score >= 60:
        recommendation = "Good pacing, but watch your spending to stay within budget."
        severity = "success"
    elif velocity_score >= 40:
        recommendation = (
            "Warning: You're spending faster than ideal. Consider reducing expenses."
        )
        severity = "warning"
    else:
        recommendation = (
            "Critical: High spending velocity detected. Immediate action recommended."
        )
        severity = "error"

    return SpendingVelocityResult(
        velocityScore=velocity_score,
        dailyRate=round(daily_rate, 2),
        projectedTotal=round(projected_total, 2),
        budgetAllocated=budget_allocated,
        willExceedBudget=will_exceed_budget,
        daysUntilExceeded=days_until_exceeded,
        recommendation=recommendation,
        severity=severity,
    )
