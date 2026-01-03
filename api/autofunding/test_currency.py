"""
Unit tests for currency utilities
Tests precise financial calculations using Decimal
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from autofunding.currency import round_currency, calculate_percentage_amount, split_amount


def test_round_currency_standard_cases():
    """Test standard rounding cases"""
    assert round_currency(10.555) == 10.56
    assert round_currency(10.554) == 10.55
    assert round_currency(10.545) == 10.55
    assert round_currency(100.999) == 101.0
    assert round_currency(100.001) == 100.0
    print("✓ test_round_currency_standard_cases passed")


def test_round_currency_edge_cases():
    """Test edge cases for rounding"""
    assert round_currency(0.0) == 0.0
    assert round_currency(0.005) == 0.01
    assert round_currency(0.004) == 0.0
    assert round_currency(-10.555) == -10.56
    assert round_currency(-10.554) == -10.55
    print("✓ test_round_currency_edge_cases passed")


def test_round_currency_large_numbers():
    """Test rounding with large numbers"""
    assert round_currency(1000000.555) == 1000000.56
    assert round_currency(999999.994) == 999999.99
    assert round_currency(999999.995) == 1000000.0
    print("✓ test_round_currency_large_numbers passed")


def test_calculate_percentage_amount_basic():
    """Test basic percentage calculations"""
    assert calculate_percentage_amount(1000, 30) == 300.0
    assert calculate_percentage_amount(1000, 33.33) == 333.30
    assert calculate_percentage_amount(1000, 10) == 100.0
    assert calculate_percentage_amount(1500, 20) == 300.0
    print("✓ test_calculate_percentage_amount_basic passed")


def test_calculate_percentage_amount_precision():
    """Test percentage calculations with precision requirements"""
    # Test that results are properly rounded
    assert calculate_percentage_amount(100, 33.33) == 33.33
    assert calculate_percentage_amount(1000, 3.14) == 31.40
    assert calculate_percentage_amount(999.99, 10) == 100.0
    print("✓ test_calculate_percentage_amount_precision passed")


def test_calculate_percentage_amount_edge_cases():
    """Test edge cases for percentage calculations"""
    assert calculate_percentage_amount(0, 50) == 0.0
    assert calculate_percentage_amount(1000, 0) == 0.0
    assert calculate_percentage_amount(1000, 100) == 1000.0
    assert calculate_percentage_amount(123.45, 50) == 61.73
    print("✓ test_calculate_percentage_amount_edge_cases passed")


def test_split_amount_equal_parts():
    """Test splitting amounts into equal parts"""
    result = split_amount(100, 3)
    assert len(result) == 3
    assert sum(result) == 100
    assert result[0] == 33.33
    assert result[1] == 33.33
    assert result[2] == 33.34
    print("✓ test_split_amount_equal_parts passed")


def test_split_amount_two_parts():
    """Test splitting into two parts"""
    result = split_amount(300, 2)
    assert len(result) == 2
    assert sum(result) == 300
    assert result[0] == 150.0
    assert result[1] == 150.0
    print("✓ test_split_amount_two_parts passed")


def test_split_amount_uneven():
    """Test splitting amounts that don't divide evenly"""
    result = split_amount(101, 3)
    assert len(result) == 3
    assert abs(sum(result) - 101) < 0.01  # Allow for tiny floating point errors
    # Check that amounts are reasonable
    assert all(33 <= amount <= 34 for amount in result)
    print("✓ test_split_amount_uneven passed")


def test_split_amount_single_part():
    """Test splitting into a single part"""
    result = split_amount(123.45, 1)
    assert len(result) == 1
    assert result[0] == 123.45
    print("✓ test_split_amount_single_part passed")


def test_split_amount_many_parts():
    """Test splitting into many parts"""
    result = split_amount(1000, 7)
    assert len(result) == 7
    assert abs(sum(result) - 1000) < 0.01
    # All parts should be close to each other
    assert all(142 <= amount <= 143 for amount in result)
    print("✓ test_split_amount_many_parts passed")


def test_split_amount_edge_cases():
    """Test edge cases for split_amount"""
    # Zero parts
    result = split_amount(100, 0)
    assert result == []
    
    # Negative parts
    result = split_amount(100, -1)
    assert result == []
    
    # Zero amount
    result = split_amount(0, 3)
    assert len(result) == 3
    assert all(amount == 0.0 for amount in result)
    print("✓ test_split_amount_edge_cases passed")


def test_split_amount_precision():
    """Test that split amounts maintain precision"""
    # Test with an amount that requires careful rounding
    result = split_amount(99.99, 3)
    assert len(result) == 3
    # Sum should be exactly 99.99 (within floating point tolerance)
    assert abs(sum(result) - 99.99) < 0.01
    print("✓ test_split_amount_precision passed")


if __name__ == "__main__":
    print("\nRunning Currency Utility Tests...\n")
    test_round_currency_standard_cases()
    test_round_currency_edge_cases()
    test_round_currency_large_numbers()
    test_calculate_percentage_amount_basic()
    test_calculate_percentage_amount_precision()
    test_calculate_percentage_amount_edge_cases()
    test_split_amount_equal_parts()
    test_split_amount_two_parts()
    test_split_amount_uneven()
    test_split_amount_single_part()
    test_split_amount_many_parts()
    test_split_amount_edge_cases()
    test_split_amount_precision()
    print("\n✅ All currency utility tests passed!\n")
