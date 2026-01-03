"""
Analytics Intelligence Engine - v2.0 Polyglot Backend
Shared types and utilities for analytics endpoints
"""

from typing import Any, TypedDict


class PaycheckEntry(TypedDict, total=False):
    """Paycheck entry structure"""

    date: str
    processedAt: str
    amount: float


class PaydayPrediction(TypedDict):
    """Payday prediction result"""

    nextPayday: str | None
    confidence: int
    pattern: str | None
    intervalDays: int | None
    message: str


class MerchantSuggestion(TypedDict):
    """Merchant pattern suggestion"""

    category: str
    amount: float
    count: int
    suggestedBudget: float
    monthlyAverage: float


class ErrorResponse(TypedDict):
    """Standard error response structure"""

    error: str


class AnalyticsRequest(TypedDict):
    """Analytics API request structure"""

    operation: str
    transactions: list[dict[str, Any]]
    paychecks: list[PaycheckEntry]
    monthsOfData: int | None
