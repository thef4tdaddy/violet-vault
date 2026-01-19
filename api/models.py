"""
Data Models for VioletVault Analytics Service
Mirrors the TypeScript/Zod schemas from the frontend
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Envelope(BaseModel):
    """
    Envelope entity representing budget categories
    Mirrors src/domain/schemas/envelope.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Envelope ID")
    name: str = Field(..., min_length=1, max_length=100, description="Envelope name")
    category: str = Field(..., min_length=1, description="Category")
    archived: bool = Field(default=False, description="Whether envelope is archived")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: int | None = Field(None, gt=0, description="Creation timestamp")
    currentBalance: float = Field(default=0.0, description="Current balance")
    description: str | None = Field(None, max_length=500, description="Description")

    # Discriminated Union Type
    type: Literal["standard", "goal", "liability", "supplemental"] = Field(
        default="standard", description="Envelope type"
    )

    # Goal specific
    targetAmount: float | None = Field(None, ge=0)
    targetDate: str | None = None
    priority: Literal["low", "medium", "high"] | None = None
    isPaused: bool | None = None
    isCompleted: bool | None = None
    monthlyContribution: float | None = None

    # Liability specific
    minimumPayment: float | None = None
    interestRate: float | None = None
    dueDateDay: int | None = Field(None, ge=1, le=31)

    # Supplemental specific
    accountType: Literal["FSA", "HSA", "529", "IRA", "401K", "other"] | None = None
    annualContribution: float | None = None
    expirationDate: str | None = None


class Transaction(BaseModel):
    """
    Transaction entity representing financial operations
    Mirrors src/domain/schemas/transaction.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Transaction ID")
    date: str = Field(..., description="Transaction date (ISO format)")
    amount: float = Field(..., description="Amount (negative for expenses, positive for income)")
    envelopeId: str = Field(..., min_length=1, description="Envelope ID")
    category: str = Field(..., min_length=1, description="Category")
    type: Literal["income", "expense", "transfer"] = Field(
        default="expense", description="Transaction type"
    )
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    createdAt: int | None = Field(None, gt=0, description="Creation timestamp")
    description: str | None = Field(None, max_length=500, description="Description")
    merchant: str | None = Field(None, max_length=200, description="Merchant name")
    receiptUrl: str | None = None

    # Scheduled Transaction support
    isScheduled: bool = Field(default=False)
    recurrenceRule: str | None = None  # iCal RRule string

    # Paycheck support
    allocations: dict[str, float] | None = None  # envelopeId -> amount

    # Connection properties
    isInternalTransfer: bool | None = None
    paycheckId: str | None = None
    fromEnvelopeId: str | None = None
    toEnvelopeId: str | None = None


class BudgetMetadata(BaseModel):
    """
    Budget metadata containing high-level balance information
    Mirrors src/domain/schemas/budget-record.ts
    """

    model_config = ConfigDict(extra="allow")

    id: str = Field(..., min_length=1, description="Budget record ID")
    lastModified: int = Field(..., gt=0, description="Last modified timestamp")
    version: int | None = Field(None, gt=0, description="Version number")
    actualBalance: float | None = Field(None, description="Actual account balance")
    unassignedCash: float | None = Field(None, description="Unassigned cash balance")
    totalEnvelopeBalance: float | None = Field(None, description="Sum of all envelope balances")


class AuditSnapshot(BaseModel):
    """
    Complete snapshot of budget data for integrity audit
    Contains all envelopes, transactions, and metadata needed for analysis
    """

    envelopes: list[Envelope] = Field(..., description="All envelopes in the budget")
    transactions: list[Transaction] = Field(..., description="All transactions")
    metadata: BudgetMetadata = Field(..., description="Budget metadata")


class IntegrityViolation(BaseModel):
    """
    Represents a single integrity violation found during audit
    """

    severity: Literal["error", "warning", "info"] = Field(..., description="Violation severity")
    type: str = Field(
        ..., description="Type of violation (e.g., 'orphaned_transaction', 'negative_balance')"
    )
    message: str = Field(..., description="Human-readable description of the violation")
    entityId: str | None = Field(
        None, description="ID of the entity involved (envelope or transaction)"
    )
    entityType: Literal["envelope", "transaction", "budget"] | None = Field(
        None, description="Type of entity"
    )
    details: dict | None = Field(
        default_factory=lambda: {}, description="Additional details about the violation"
    )


class IntegrityAuditResult(BaseModel):
    """
    Result of an integrity audit operation
    Contains all violations found and summary statistics
    """

    violations: list[IntegrityViolation] = Field(..., description="List of all violations found")
    summary: dict[str, Any] = Field(
        ..., description="Summary statistics (counts by severity and type)"
    )
    timestamp: str = Field(..., description="When the audit was performed (ISO format)")
    snapshotSize: dict[str, int] = Field(
        ..., description="Size of the data snapshot analyzed"
    )


# ============================================================================
# Analytics Models - For Dashboard Predictions and Insights
# ============================================================================


class SpendingStats(BaseModel):
    """Input statistics for spending velocity calculation"""

    totalSpent: float = Field(..., description="Total amount spent in period")
    budgetAllocated: float = Field(..., description="Total budget allocated for period")
    daysElapsed: int = Field(..., gt=0, description="Days elapsed in period")
    daysRemaining: int = Field(..., ge=0, description="Days remaining in period")


class HistoricalBill(BaseModel):
    """Historical bill data point"""

    amount: float = Field(..., gt=0, description="Bill amount")
    dueDate: str = Field(..., description="Bill due date (ISO format)")
    category: str = Field(..., min_length=1, description="Bill category")


class HealthMetrics(BaseModel):
    """Input metrics for health score calculation"""

    spendingVelocityScore: int = Field(..., ge=0, le=100, description="Velocity score (0-100)")
    billCoverageRatio: float = Field(..., ge=0, description="Budget/bills ratio")
    savingsRate: float = Field(..., description="Savings as % of income")
    envelopeUtilization: float = Field(..., ge=0, description="Budget utilization ratio")


class AnalyticsRequest(BaseModel):
    """
    Request for analytics predictions
    Contains anonymized statistics only - no E2EE data
    """

    spendingStats: SpendingStats | None = Field(None, description="Spending velocity stats")
    historicalBills: list[HistoricalBill] | None = Field(None, description="Bill history")
    healthMetrics: HealthMetrics | None = Field(None, description="Health metrics")


class SpendingVelocityResult(BaseModel):
    """Result of spending velocity calculation"""

    velocityScore: int = Field(..., ge=0, le=100, description="Velocity score (0-100)")
    dailyRate: float = Field(..., description="Average daily spending rate")
    projectedTotal: float = Field(..., description="Projected total spending")
    budgetAllocated: float = Field(..., description="Budget allocated")
    willExceedBudget: bool = Field(..., description="Whether budget will be exceeded")
    daysUntilExceeded: int | None = Field(None, description="Days until budget exceeded")
    recommendation: str = Field(..., description="Spending recommendation")
    severity: str = Field(..., description="Severity level (success/warning/error)")


class BillFrequency(BaseModel):
    """Detected frequency pattern for a bill"""

    intervalDays: int = Field(..., description="Days between bills")
    confidence: int = Field(..., ge=0, le=100, description="Confidence level (0-100)")
    pattern: str = Field(..., description="Pattern name (monthly, weekly, etc)")


class PredictedBill(BaseModel):
    """Predicted upcoming bill"""

    category: str = Field(..., description="Bill category")
    predictedAmount: float = Field(..., description="Predicted bill amount")
    predictedDate: str = Field(..., description="Predicted due date (ISO format)")
    confidence: int = Field(..., ge=0, le=100, description="Prediction confidence (0-100)")
    frequency: BillFrequency | None = Field(None, description="Detected frequency pattern")


class BillPredictionResult(BaseModel):
    """Result of bill prediction analysis"""

    predictedBills: list[PredictedBill] = Field(..., description="Predicted upcoming bills")
    totalPredictedAmount: float = Field(..., description="Total predicted amount")
    nextBillDate: str | None = Field(None, description="Next bill due date")
    message: str = Field(..., description="Summary message")


class HealthScoreBreakdown(BaseModel):
    """Detailed breakdown of health score components"""

    spendingPace: int = Field(..., ge=0, le=100, description="Spending pace score")
    billPreparedness: int = Field(..., ge=0, le=100, description="Bill preparedness score")
    savingsHealth: int = Field(..., ge=0, le=100, description="Savings health score")
    budgetUtilization: int = Field(..., ge=0, le=100, description="Budget utilization score")


class BudgetHealthResult(BaseModel):
    """Result of budget health analysis"""

    overallScore: int = Field(..., ge=0, le=100, description="Overall health score (0-100)")
    breakdown: HealthScoreBreakdown = Field(..., description="Score breakdown")
    grade: str = Field(..., description="Letter grade (A-F)")
    summary: str = Field(..., description="Summary message")
    recommendations: list[str] = Field(..., description="Improvement recommendations")
    strengths: list[str] = Field(..., description="Financial strengths")
    concerns: list[str] = Field(..., description="Areas of concern")


class AnalyticsResponse(BaseModel):
    """
    Response from analytics endpoint
    Contains predictions and insights
    """

    success: bool = Field(..., description="Whether request was successful")
    spendingVelocity: SpendingVelocityResult | None = Field(
        None, description="Spending velocity analysis"
    )
    billPredictions: BillPredictionResult | None = Field(None, description="Bill predictions")
    budgetHealth: BudgetHealthResult | None = Field(None, description="Budget health score")
    error: str | None = Field(None, description="Error message if failed")
