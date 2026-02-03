"""
Financial Transaction Generator
Core logic for generating realistic financial transactions
"""

import random
import uuid
from datetime import date, datetime, timedelta
from typing import Any, cast

from faker import Faker

from .models import (
    GeneratedEnvelope,
    GeneratedTransaction,
    IncomeFrequency,
    LifeEvent,
    LifeEventType,
    SimulationConfig,
    SimulationResult,
    SimulationStats,
    SpendingStyle,
)

fake = Faker()
# Note: Seeding should only be done in tests for reproducibility


# Category mappings for realistic spending
CATEGORY_CONFIGS: dict[str, dict[str, Any]] = {
    "Groceries": {
        "budget_pct": 0.15,
        "variance": 0.3,
        "frequency": "high",  # 15-25 times/month
        "merchant_types": ["Grocery", "Supermarket", "Market"],
    },
    "Dining": {
        "budget_pct": 0.10,
        "variance": 0.5,
        "frequency": "high",
        "merchant_types": ["Restaurant", "Cafe", "Diner", "Pizza"],
    },
    "Transportation": {
        "budget_pct": 0.10,
        "variance": 0.2,
        "frequency": "medium",  # 8-12 times/month
        "merchant_types": ["Gas Station", "Fuel", "Transit"],
    },
    "Utilities": {
        "budget_pct": 0.12,
        "variance": 0.1,
        "frequency": "low",  # 1-2 times/month
        "merchant_types": ["Electric Co", "Water Utility", "Internet Provider"],
    },
    "Entertainment": {
        "budget_pct": 0.08,
        "variance": 0.6,
        "frequency": "medium",
        "merchant_types": ["Cinema", "Streaming", "Gaming", "Theater"],
    },
    "Shopping": {
        "budget_pct": 0.12,
        "variance": 0.7,
        "frequency": "medium",
        "merchant_types": ["Retail", "Store", "Shop", "Boutique"],
    },
    "Healthcare": {
        "budget_pct": 0.08,
        "variance": 0.4,
        "frequency": "low",
        "merchant_types": ["Pharmacy", "Medical", "Clinic", "Doctor"],
    },
    "Savings": {
        "budget_pct": 0.15,
        "variance": 0.0,
        "frequency": "low",
        "merchant_types": [],
    },
    "Miscellaneous": {
        "budget_pct": 0.10,
        "variance": 0.8,
        "frequency": "medium",
        "merchant_types": ["Services", "Misc"],
    },
}


def generate_financial_simulation(config: SimulationConfig) -> SimulationResult:
    """
    Generate a complete financial simulation with envelopes and transactions

    Args:
        config: Simulation configuration parameters

    Returns:
        SimulationResult with envelopes, transactions, and metadata
    """
    # Generate envelopes
    envelopes = _generate_envelopes(config)

    # Generate transactions
    transactions: list[GeneratedTransaction] = []
    life_events: list[LifeEvent] = []

    current_date = config.start_date
    end_date = current_date + timedelta(days=config.months * 30)

    # Track balance for math validation
    total_balance = 0.0

    while current_date < end_date:
        # Generate income transactions
        income_txns = _generate_income_transactions(current_date, config, envelopes)
        transactions.extend(income_txns)
        total_balance += sum(t.amount for t in income_txns)

        # Check for life events
        if config.enable_life_events and random.random() < config.life_event_probability / 30:
            event, event_txns = _generate_life_event(current_date, config, envelopes)
            if event:
                life_events.append(event)
                transactions.extend(event_txns)
                total_balance += sum(t.amount for t in event_txns)

        # Generate daily expenses
        expense_txns = _generate_daily_expenses(current_date, config, envelopes)
        transactions.extend(expense_txns)
        total_balance += sum(t.amount for t in expense_txns)  # Amounts are negative

        current_date += timedelta(days=1)

    # Update envelope balances
    envelope_balances = {e.id: 0.0 for e in envelopes}
    for txn in transactions:
        if txn.envelopeId in envelope_balances:
            envelope_balances[txn.envelopeId] += txn.amount

    for envelope in envelopes:
        envelope.currentBalance = max(0, envelope_balances[envelope.id])

    # Generate statistics
    stats = _calculate_stats(transactions, envelopes, life_events, total_balance)

    return SimulationResult(
        envelopes=envelopes,
        transactions=transactions,
        life_events=life_events,
        metadata={
            "config": config.model_dump(),
            "stats": stats.model_dump(),
            "generated_at": datetime.now().isoformat(),
        },
    )


def _generate_envelopes(config: SimulationConfig) -> list[GeneratedEnvelope]:
    """Generate budget envelopes based on categories"""
    envelopes = []
    now_ms = int(datetime.now().timestamp() * 1000)

    # Select categories based on num_envelopes
    all_categories = list(CATEGORY_CONFIGS.keys())
    categories = all_categories[: config.num_envelopes]

    # Calculate total budget percentage for selected categories
    selected_configs = [CATEGORY_CONFIGS[cat] for cat in categories]
    total_selected_pct = sum(cast(float, cfg["budget_pct"]) for cfg in selected_configs)

    # Normalize to use full income (scale up if needed)
    normalization_factor = 1.0 / total_selected_pct if total_selected_pct > 0 else 1.0

    for i, category in enumerate(categories):
        category_config = CATEGORY_CONFIGS[category]
        # Normalize budget allocation to use full income
        monthly_budget = (
            config.monthly_income
            * cast(float, category_config["budget_pct"])
            * normalization_factor
        )

        envelope = GeneratedEnvelope(
            id=f"env-{uuid.uuid4().hex[:8]}",
            name=category,
            category=category,
            archived=False,
            lastModified=now_ms,
            createdAt=now_ms - (i * 1000),
            currentBalance=0.0,
            description=f"Budget for {category.lower()}",
            type="standard",
            monthlyBudget=monthly_budget,
        )
        envelopes.append(envelope)

    return envelopes


def _generate_income_transactions(
    income_date: date,
    config: SimulationConfig,
    envelopes: list[GeneratedEnvelope],
) -> list[GeneratedTransaction]:
    """Generate income transactions based on frequency"""
    transactions = []

    # Determine if income should be generated today
    should_generate = False
    income_amount = 0.0

    if config.income_frequency == IncomeFrequency.WEEKLY:
        # Every Friday
        if income_date.weekday() == 4:
            should_generate = True
            income_amount = config.monthly_income / 4.33
    elif config.income_frequency == IncomeFrequency.BIWEEKLY:
        # Every other Friday starting from start date
        days_since_start = (income_date - config.start_date).days
        # Check if it's Friday and on a biweekly schedule
        if income_date.weekday() == 4 and (days_since_start % 14 < 7):
            should_generate = True
            income_amount = config.monthly_income / 2.17
    elif config.income_frequency == IncomeFrequency.MONTHLY:
        # First of the month
        if income_date.day == 1:
            should_generate = True
            income_amount = config.monthly_income

    if should_generate and income_amount > 0:
        # Create income transaction for a random envelope (or first one)
        target_envelope = envelopes[0] if envelopes else None
        if target_envelope:
            txn = GeneratedTransaction(
                id=f"txn-{uuid.uuid4().hex[:12]}",
                date=income_date.isoformat(),
                amount=income_amount,
                envelopeId=target_envelope.id,
                category="Income",
                type="income",
                lastModified=int(datetime.now().timestamp() * 1000),
                createdAt=int(
                    datetime.combine(income_date, datetime.min.time()).timestamp() * 1000
                ),
                description="Paycheck",
                merchant="Employer",
                isScheduled=False,
            )
            transactions.append(txn)

    return transactions


def _generate_life_event(
    event_date: date,
    config: SimulationConfig,
    envelopes: list[GeneratedEnvelope],
) -> tuple[LifeEvent | None, list[GeneratedTransaction]]:
    """Generate a random life event (emergency or windfall)"""
    transactions = []

    # Weighted random event type
    event_weights = {
        LifeEventType.CAR_REPAIR: 0.3,
        LifeEventType.MEDICAL_EMERGENCY: 0.2,
        LifeEventType.HOME_REPAIR: 0.2,
        LifeEventType.BONUS: 0.15,
        LifeEventType.TAX_REFUND: 0.10,
        LifeEventType.GIFT: 0.05,
    }

    event_type = random.choices(
        list(event_weights.keys()),
        weights=list(event_weights.values()),
    )[0]

    # Determine amount and category
    amount = 0.0
    description = ""
    merchant = ""
    category = "Miscellaneous"
    txn_type: str = "expense"

    if event_type == LifeEventType.CAR_REPAIR:
        amount = -random.uniform(300, 1500)
        description = random.choice(
            [
                "Transmission repair",
                "Brake replacement",
                "Engine diagnostics",
                "Tire replacement",
            ]
        )
        merchant = fake.company() + " Auto Repair"
        category = "Transportation"
    elif event_type == LifeEventType.MEDICAL_EMERGENCY:
        amount = -random.uniform(200, 2000)
        description = random.choice(
            [
                "Emergency room visit",
                "Urgent care",
                "Dental emergency",
                "Prescription medication",
            ]
        )
        merchant = fake.company() + " Medical Center"
        category = "Healthcare"
    elif event_type == LifeEventType.HOME_REPAIR:
        amount = -random.uniform(400, 2500)
        description = random.choice(
            [
                "Plumbing repair",
                "HVAC maintenance",
                "Roof repair",
                "Appliance replacement",
            ]
        )
        merchant = fake.company() + " Home Services"
        category = "Miscellaneous"
    elif event_type == LifeEventType.BONUS:
        amount = random.uniform(500, 3000)
        description = "Work bonus"
        merchant = "Employer"
        category = "Income"
        txn_type = "income"
    elif event_type == LifeEventType.TAX_REFUND:
        amount = random.uniform(800, 2500)
        description = "Tax refund"
        merchant = "IRS"
        category = "Income"
        txn_type = "income"
    elif event_type == LifeEventType.GIFT:
        amount = random.uniform(100, 500)
        description = "Gift money"
        merchant = "Gift"
        category = "Income"
        txn_type = "income"

    # Find appropriate envelope
    envelope = next(
        (e for e in envelopes if e.category == category),
        envelopes[0] if envelopes else None,
    )

    if envelope:
        txn = GeneratedTransaction(
            id=f"txn-{uuid.uuid4().hex[:12]}",
            date=event_date.isoformat(),
            amount=amount,
            envelopeId=envelope.id,
            category=category,
            type=txn_type,  # type: ignore
            lastModified=int(datetime.now().timestamp() * 1000),
            createdAt=int(datetime.combine(event_date, datetime.min.time()).timestamp() * 1000),
            description=description,
            merchant=merchant,
            isScheduled=False,
        )
        transactions.append(txn)

        event = LifeEvent(
            date=event_date.isoformat(),
            type=event_type,
            amount=amount,
            description=description,
        )
        return event, transactions

    return None, []


def _generate_daily_expenses(
    expense_date: date,
    config: SimulationConfig,
    envelopes: list[GeneratedEnvelope],
) -> list[GeneratedTransaction]:
    """Generate realistic daily expenses based on spending style"""
    transactions = []

    # Spending style modifiers
    style_config = {
        SpendingStyle.CONSERVATIVE: {
            "daily_txn_prob": 0.5,  # 50% chance of spending each day
            "budget_utilization": 0.75,  # Uses 75% of budget
            "variance_multiplier": 0.8,
        },
        SpendingStyle.AGGRESSIVE: {
            "daily_txn_prob": 0.8,  # 80% chance of spending
            "budget_utilization": 0.95,  # Uses 95% of budget
            "variance_multiplier": 1.2,
        },
        SpendingStyle.CHAOTIC: {
            "daily_txn_prob": 0.7,  # 70% chance
            "budget_utilization": 1.1,  # Overspends by 10%
            "variance_multiplier": 1.8,  # High variance
        },
    }

    style = style_config[config.spending_style]

    # Generate 0-3 transactions per day based on style
    num_txns = 0
    if random.random() < style["daily_txn_prob"]:
        num_txns = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]

    for _ in range(num_txns):
        # Select random expense category
        expense_categories = [
            cat for cat in CATEGORY_CONFIGS.keys() if cat not in ["Savings", "Income"]
        ]
        category = random.choice(expense_categories)
        cat_config = CATEGORY_CONFIGS[category]

        # Find matching envelope
        envelope = next(
            (e for e in envelopes if e.category == category),
            None,
        )
        if not envelope or not envelope.monthlyBudget:
            continue

        # Calculate transaction amount
        daily_budget = (envelope.monthlyBudget / 30) * style["budget_utilization"]
        variance = cast(float, cat_config["variance"]) * style["variance_multiplier"]

        base_amount = daily_budget * random.uniform(0.5, 1.8)
        variance_factor = random.uniform(1 - variance, 1 + variance)
        amount = -(base_amount * variance_factor)

        # Generate merchant name
        merchant_types = cast(list[str], cat_config["merchant_types"])
        if merchant_types:
            merchant = fake.company() + " " + random.choice(merchant_types)
        else:
            merchant = fake.company()

        # Generate description
        descriptions = {
            "Groceries": ["Weekly groceries", "Quick shopping", "Food supplies"],
            "Dining": ["Lunch", "Dinner", "Coffee", "Takeout"],
            "Transportation": ["Fuel", "Gas", "Transit fare"],
            "Utilities": ["Electric bill", "Water bill", "Internet"],
            "Entertainment": ["Movie tickets", "Subscription", "Event"],
            "Shopping": ["Clothing", "Electronics", "Home goods"],
            "Healthcare": ["Prescription", "Co-pay", "Medical supplies"],
        }
        description = random.choice(descriptions.get(category, ["Purchase"]))

        txn = GeneratedTransaction(
            id=f"txn-{uuid.uuid4().hex[:12]}",
            date=expense_date.isoformat(),
            amount=amount,
            envelopeId=envelope.id,
            category=category,
            type="expense",
            lastModified=int(datetime.now().timestamp() * 1000),
            createdAt=int(datetime.combine(expense_date, datetime.min.time()).timestamp() * 1000),
            description=description,
            merchant=merchant,
            isScheduled=False,
        )
        transactions.append(txn)

    return transactions


def _calculate_stats(
    transactions: list[GeneratedTransaction],
    envelopes: list[GeneratedEnvelope],
    life_events: list[LifeEvent],
    final_balance: float,
) -> SimulationStats:
    """Calculate simulation statistics"""
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    net_cash_flow = total_income + total_expenses  # Expenses are negative

    # Calculate average daily spending
    expense_days = len({t.date for t in transactions if t.type == "expense"})
    avg_daily_spending = abs(total_expenses / expense_days) if expense_days > 0 else 0

    return SimulationStats(
        total_income=total_income,
        total_expenses=total_expenses,
        net_cash_flow=net_cash_flow,
        transaction_count=len(transactions),
        envelope_count=len(envelopes),
        life_event_count=len(life_events),
        final_balance=final_balance,
        average_daily_spending=avg_daily_spending,
    )
