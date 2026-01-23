"""
Budget Health Score Analytics
Calculates overall financial health indicators
"""

from api.models import BudgetHealthResult, HealthMetrics, HealthScoreBreakdown


def calculate_budget_health(metrics_data: dict) -> BudgetHealthResult:
    """
    Calculate overall budget health score

    Args:
        metrics_data: Anonymized budget health metrics

    Returns:
        Health score with detailed breakdown and recommendations
    """
    # Validate input
    metrics = HealthMetrics(**metrics_data)

    # Calculate individual component scores
    spending_pace_score = metrics.spendingVelocityScore

    # Bill preparedness: How well bills are covered
    bill_coverage = metrics.billCoverageRatio
    if bill_coverage >= 1.5:
        bill_preparedness_score = 100
    elif bill_coverage >= 1.0:
        bill_preparedness_score = 80 + int((bill_coverage - 1.0) * 40)
    elif bill_coverage >= 0.75:
        bill_preparedness_score = 60 + int((bill_coverage - 0.75) * 80)
    elif bill_coverage >= 0.5:
        bill_preparedness_score = 30 + int((bill_coverage - 0.5) * 120)
    else:
        bill_preparedness_score = int(bill_coverage * 60)

    # Savings health: Percentage of income saved
    savings_rate = metrics.savingsRate
    if savings_rate >= 0.20:  # 20%+ is excellent
        savings_health_score = 100
    elif savings_rate >= 0.10:  # 10-20% is good
        savings_health_score = 80 + int((savings_rate - 0.10) * 200)
    elif savings_rate >= 0.05:  # 5-10% is fair
        savings_health_score = 50 + int((savings_rate - 0.05) * 600)
    elif savings_rate >= 0:  # 0-5% is poor
        savings_health_score = int(savings_rate * 1000)
    else:  # Negative savings (debt)
        savings_health_score = 0

    # Budget utilization: Sweet spot is 70-90%
    utilization = metrics.envelopeUtilization
    if 0.70 <= utilization <= 0.90:
        utilization_score = 100
    elif utilization < 0.70:
        # Under-utilizing budget
        utilization_score = int(utilization / 0.70 * 100)
    else:
        # Over-utilizing budget (may indicate overspending)
        if utilization <= 1.0:
            utilization_score = 100 - int((utilization - 0.90) * 300)
        else:
            utilization_score = max(0, 70 - int((utilization - 1.0) * 100))

    # Calculate weighted overall score
    overall_score = int(
        spending_pace_score * 0.30
        + bill_preparedness_score * 0.30
        + savings_health_score * 0.25
        + utilization_score * 0.15
    )

    # Determine grade
    grade: str
    if overall_score >= 90:
        grade = "A"
    elif overall_score >= 80:
        grade = "B"
    elif overall_score >= 70:
        grade = "C"
    elif overall_score >= 60:
        grade = "D"
    else:
        grade = "F"

    # Generate strengths, concerns, and recommendations
    strengths: list[str] = []
    concerns: list[str] = []
    recommendations: list[str] = []

    # Analyze spending pace
    if spending_pace_score >= 80:
        strengths.append("Excellent spending control and pacing")
    elif spending_pace_score < 50:
        concerns.append("High spending velocity - risk of budget overrun")
        recommendations.append("Review and reduce discretionary spending categories")

    # Analyze bill preparedness
    if bill_preparedness_score >= 90:
        strengths.append("Strong bill coverage and preparedness")
    elif bill_preparedness_score < 60:
        concerns.append("Insufficient funds allocated for upcoming bills")
        recommendations.append("Increase bill envelope allocations to cover predicted expenses")

    # Analyze savings
    if savings_health_score >= 80:
        strengths.append("Healthy savings rate maintained")
    elif savings_health_score < 50:
        concerns.append("Low or negative savings rate")
        recommendations.append("Aim to save at least 10% of income each month")

    # Analyze utilization
    if 70 <= utilization_score <= 100:
        strengths.append("Optimal budget utilization")
    elif utilization_score < 50:
        concerns.append("Budget not being fully utilized")
        recommendations.append("Review budget allocations and adjust to match spending patterns")

    # Generate summary
    summary = _generate_summary(grade, overall_score)

    return BudgetHealthResult(
        overallScore=overall_score,
        breakdown=HealthScoreBreakdown(
            spendingPace=spending_pace_score,
            billPreparedness=bill_preparedness_score,
            savingsHealth=savings_health_score,
            budgetUtilization=utilization_score,
        ),
        grade=grade,
        summary=summary,
        recommendations=recommendations,
        strengths=strengths,
        concerns=concerns,
    )


def _generate_summary(grade: str, score: int) -> str:
    """Generate summary message based on grade and score"""
    summaries = {
        "A": f"Excellent financial health! Your budget is well-managed with a score of {score}/100.",
        "B": f"Good financial health. Your budget is solid with a score of {score}/100, with room for minor improvements.",
        "C": f"Fair financial health. Your budget score of {score}/100 indicates some areas need attention.",
        "D": f"Poor financial health. Your budget score of {score}/100 suggests significant improvements needed.",
        "F": f"Critical financial health. Your budget score of {score}/100 requires immediate attention.",
    }
    return summaries.get(grade, f"Budget health score: {score}/100")
