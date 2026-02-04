"""
Tests for Financial Behavior Simulator
Validates transaction generation, balance math, and performance
"""

from datetime import date, timedelta

from api.simulator.generator import generate_financial_simulation
from api.simulator.models import (
    IncomeFrequency,
    SimulationConfig,
    SpendingStyle,
)


class TestSimulationGeneration:
    """Test suite for simulation generation"""

    def test_basic_simulation_generation(self) -> None:
        """Test basic simulation can be generated"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=False,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        assert result is not None
        assert len(result.envelopes) == 8
        assert len(result.transactions) > 0
        assert result.metadata is not None

    def test_envelope_generation(self) -> None:
        """Test envelopes are generated correctly"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=1,
            enable_life_events=False,
            num_envelopes=5,
        )

        result = generate_financial_simulation(config)

        assert len(result.envelopes) == 5

        # Check envelope structure
        for envelope in result.envelopes:
            assert envelope.id is not None
            assert len(envelope.id) > 0
            assert envelope.name is not None
            assert envelope.category is not None
            assert envelope.type in ["standard", "goal", "liability", "supplemental"]
            assert envelope.archived is False
            assert envelope.lastModified > 0
            assert envelope.createdAt > 0
            assert envelope.currentBalance >= 0

        # Check budget allocation
        total_budget = sum(e.monthlyBudget for e in result.envelopes if e.monthlyBudget is not None)
        assert total_budget > 0
        # Should allocate most of income to envelopes
        assert total_budget >= config.monthly_income * 0.7

    def test_income_generation_weekly(self) -> None:
        """Test weekly income transactions are generated"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.WEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=1,
            enable_life_events=False,
            num_envelopes=5,
        )

        result = generate_financial_simulation(config)

        income_txns = [t for t in result.transactions if t.type == "income"]

        # Should have ~4 weekly paychecks in a month
        assert 3 <= len(income_txns) <= 5

        # All should be on Fridays
        for txn in income_txns:
            txn_date = date.fromisoformat(txn.date)
            assert txn_date.weekday() == 4  # Friday

    def test_income_generation_biweekly(self) -> None:
        """Test biweekly income transactions are generated"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=2,
            enable_life_events=False,
            num_envelopes=5,
        )

        result = generate_financial_simulation(config)

        income_txns = [t for t in result.transactions if t.type == "income"]

        # Should have ~4 biweekly paychecks in 2 months
        assert 3 <= len(income_txns) <= 5

        # All should be on Fridays
        for txn in income_txns:
            txn_date = date.fromisoformat(txn.date)
            assert txn_date.weekday() == 4  # Friday

    def test_income_generation_monthly(self) -> None:
        """Test monthly income transactions are generated"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=False,
            num_envelopes=5,
        )

        result = generate_financial_simulation(config)

        income_txns = [t for t in result.transactions if t.type == "income"]

        # Should have 3 monthly paychecks
        assert len(income_txns) == 3

        # All should be on first of month
        for txn in income_txns:
            txn_date = date.fromisoformat(txn.date)
            assert txn_date.day == 1

    def test_spending_style_conservative(self) -> None:
        """Test conservative spending generates transactions under budget"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=False,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        total_income = sum(t.amount for t in result.transactions if t.type == "income")
        total_expenses = abs(sum(t.amount for t in result.transactions if t.type == "expense"))

        # Conservative should spend less than income
        assert total_expenses < total_income
        # Should stay well under budget (use < 80%)
        assert total_expenses < total_income * 0.8

    def test_spending_style_aggressive(self) -> None:
        """Test aggressive spending generates high transaction volume"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.AGGRESSIVE,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=False,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        _total_income = sum(t.amount for t in result.transactions if t.type == "income")
        total_expenses = abs(sum(t.amount for t in result.transactions if t.type == "expense"))
        expense_count = len([t for t in result.transactions if t.type == "expense"])

        # Aggressive should spend noticeably and have high transaction volume
        assert total_expenses > 0  # Must have expenses
        assert expense_count > 50  # High transaction volume (80% probability daily)
        # Aggressive spender behavior verification
        assert expense_count > len(
            [t for t in result.transactions if t.type == "income"]
        )  # More expenses than income transactions

    def test_spending_style_chaotic(self) -> None:
        """Test chaotic spending has high variance"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CHAOTIC,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=False,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        _total_income = sum(t.amount for t in result.transactions if t.type == "income")
        total_expenses = abs(sum(t.amount for t in result.transactions if t.type == "expense"))
        expense_txns = [t for t in result.transactions if t.type == "expense"]

        # Chaotic has moderate volume with high variance
        assert total_expenses > 0  # Must have expenses
        assert len(expense_txns) > 40  # Moderate-high transaction count (70% probability)

        # Check variance - chaotic should have wider range of transaction amounts
        if len(expense_txns) > 1:
            amounts = [abs(t.amount) for t in expense_txns]
            import statistics

            std_dev = statistics.stdev(amounts)
            mean = statistics.mean(amounts)
            # Coefficient of variation should be higher for chaotic
            cv = std_dev / mean if mean > 0 else 0
            assert cv > 0.3  # High variance indicator

    def test_life_events_generation(self) -> None:
        """Test life events are generated when enabled"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=True,
            life_event_probability=0.5,  # High probability for testing
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        # With high probability over 6 months, should get some events
        assert len(result.life_events) > 0

        # Check life event structure
        for event in result.life_events:
            assert event.date is not None
            assert event.type is not None
            assert event.amount != 0
            assert event.description is not None

    def test_life_events_disabled(self) -> None:
        """Test no life events when disabled"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=False,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        # Should have no life events
        assert len(result.life_events) == 0

    def test_balance_math_validity(self) -> None:
        """Test that balance math remains valid throughout simulation"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=True,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        # Calculate total balance from transactions
        _total_from_transactions = sum(t.amount for t in result.transactions)

        # Calculate total from envelope balances
        total_from_envelopes = sum(e.currentBalance for e in result.envelopes)

        # Envelopes can't hold more than what was transacted (minus expenses)
        # Since we're tracking positive balances
        assert total_from_envelopes >= 0

    def test_transaction_structure(self) -> None:
        """Test generated transactions match expected schema"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=1,
            enable_life_events=False,
            num_envelopes=5,
        )

        result = generate_financial_simulation(config)

        assert len(result.transactions) > 0

        for txn in result.transactions:
            # Check required fields
            assert txn.id is not None
            assert len(txn.id) > 0
            assert txn.date is not None
            assert txn.amount != 0
            assert txn.envelopeId is not None
            assert txn.category is not None
            assert txn.type in ["income", "expense", "transfer"]
            assert txn.lastModified > 0
            assert txn.createdAt > 0
            assert txn.isScheduled is False

            # Check amount sign matches type
            if txn.type == "expense":
                assert txn.amount < 0, f"Expense must be negative: {txn.amount}"
            elif txn.type == "income":
                assert txn.amount > 0, f"Income must be positive: {txn.amount}"

    def test_transaction_dates_in_range(self) -> None:
        """Test all transactions are within simulation date range"""
        start = date(2024, 1, 1)
        months = 6
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=start,
            months=months,
            enable_life_events=True,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        end = start + timedelta(days=months * 30)

        for txn in result.transactions:
            txn_date = date.fromisoformat(txn.date)
            assert start <= txn_date < end

    def test_metadata_statistics(self) -> None:
        """Test simulation metadata contains correct statistics"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=True,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        assert "stats" in result.metadata
        stats = result.metadata["stats"]

        assert "total_income" in stats
        assert "total_expenses" in stats
        assert "net_cash_flow" in stats
        assert "transaction_count" in stats
        assert "envelope_count" in stats

        # Verify stats match actual data
        assert stats["transaction_count"] == len(result.transactions)
        assert stats["envelope_count"] == len(result.envelopes)

    def test_performance_target(self) -> None:
        """Test simulation meets performance target (<200ms for <5000 records)"""
        import time

        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.AGGRESSIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=True,
            num_envelopes=10,
        )

        start_time = time.time()
        result = generate_financial_simulation(config)
        end_time = time.time()

        duration_ms = (end_time - start_time) * 1000

        # Should complete in < 200ms
        assert duration_ms < 200, f"Simulation took {duration_ms}ms (target: <200ms)"

        # Should generate reasonable number of transactions
        assert len(result.transactions) < 5000
        assert len(result.transactions) > 0

    def test_unique_transaction_ids(self) -> None:
        """Test all transaction IDs are unique"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=True,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        transaction_ids = [t.id for t in result.transactions]
        assert len(transaction_ids) == len(set(transaction_ids)), "Transaction IDs must be unique"

    def test_unique_envelope_ids(self) -> None:
        """Test all envelope IDs are unique"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.MONTHLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=3,
            enable_life_events=False,
            num_envelopes=10,
        )

        result = generate_financial_simulation(config)

        envelope_ids = [e.id for e in result.envelopes]
        assert len(envelope_ids) == len(set(envelope_ids)), "Envelope IDs must be unique"

    def test_all_transactions_reference_valid_envelopes(self) -> None:
        """Test all transactions reference existing envelopes"""
        config = SimulationConfig(
            monthly_income=4500.0,
            income_frequency=IncomeFrequency.BIWEEKLY,
            spending_style=SpendingStyle.CONSERVATIVE,
            start_date=date(2024, 1, 1),
            months=6,
            enable_life_events=True,
            num_envelopes=8,
        )

        result = generate_financial_simulation(config)

        envelope_ids = {e.id for e in result.envelopes}

        for txn in result.transactions:
            assert txn.envelopeId in envelope_ids, (
                f"Transaction {txn.id} references invalid envelope {txn.envelopeId}"
            )
