"""
Tests for analytics.py
"""

import json
import unittest
from datetime import datetime, timedelta
from typing import Any, Dict, List

# Import the functions to test
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')

from analytics import (
    predict_next_payday,
    analyze_merchant_patterns,
    MERCHANT_PATTERNS,
    Transaction,
    PaydayPrediction,
    MerchantSuggestion
)


class TestPaydayPrediction(unittest.TestCase):
    """Test payday prediction functionality"""
    
    def test_predict_with_insufficient_data(self) -> None:
        """Test prediction with less than 2 paychecks"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": 1000.0, "description": "Paycheck", "category": None, "envelopeId": None}
        ]
        
        result = predict_next_payday(transactions)
        
        self.assertIsNone(result["nextPayday"])
        self.assertEqual(result["confidence"], 0)
        self.assertIn("at least 2 paychecks", result["message"])
    
    def test_predict_biweekly_pattern(self) -> None:
        """Test prediction with biweekly paycheck pattern"""
        base_date = datetime(2024, 1, 1)
        transactions: List[Transaction] = []
        
        # Create 6 biweekly paychecks (14 days apart)
        for i in range(6):
            date = base_date + timedelta(days=i * 14)
            transactions.append({
                "date": date.isoformat(),
                "amount": 1500.0,
                "description": "Paycheck",
                "category": None,
                "envelopeId": None
            })
        
        result = predict_next_payday(transactions)
        
        self.assertIsNotNone(result["nextPayday"])
        self.assertEqual(result["pattern"], "biweekly")
        self.assertGreater(result["confidence"], 70)
        self.assertEqual(result["intervalDays"], 14)
    
    def test_predict_weekly_pattern(self) -> None:
        """Test prediction with weekly paycheck pattern"""
        base_date = datetime(2024, 1, 1)
        transactions: List[Transaction] = []
        
        # Create 8 weekly paychecks (7 days apart)
        for i in range(8):
            date = base_date + timedelta(days=i * 7)
            transactions.append({
                "date": date.isoformat(),
                "amount": 750.0,
                "description": "Paycheck",
                "category": None,
                "envelopeId": None
            })
        
        result = predict_next_payday(transactions)
        
        self.assertIsNotNone(result["nextPayday"])
        self.assertEqual(result["pattern"], "weekly")
        self.assertGreater(result["confidence"], 70)
        self.assertEqual(result["intervalDays"], 7)
    
    def test_predict_monthly_pattern(self) -> None:
        """Test prediction with monthly paycheck pattern"""
        base_date = datetime(2024, 1, 1)
        transactions: List[Transaction] = []
        
        # Create 4 monthly paychecks (30 days apart)
        for i in range(4):
            date = base_date + timedelta(days=i * 30)
            transactions.append({
                "date": date.isoformat(),
                "amount": 3000.0,
                "description": "Salary",
                "category": None,
                "envelopeId": None
            })
        
        result = predict_next_payday(transactions)
        
        self.assertIsNotNone(result["nextPayday"])
        self.assertEqual(result["pattern"], "monthly")
        self.assertGreater(result["confidence"], 70)
        self.assertIn(result["intervalDays"], [28, 35])  # Rounded to nearest week
    
    def test_predict_filters_negative_transactions(self) -> None:
        """Test that prediction only considers positive (income) transactions"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": 1000.0, "description": "Paycheck", "category": None, "envelopeId": None},
            {"date": "2024-01-05T00:00:00Z", "amount": -50.0, "description": "Expense", "category": None, "envelopeId": None},
            {"date": "2024-01-15T00:00:00Z", "amount": 1000.0, "description": "Paycheck", "category": None, "envelopeId": None},
            {"date": "2024-01-20T00:00:00Z", "amount": -75.0, "description": "Expense", "category": None, "envelopeId": None},
        ]
        
        result = predict_next_payday(transactions)
        
        self.assertIsNotNone(result["nextPayday"])
        self.assertEqual(result["intervalDays"], 14)


class TestMerchantPatterns(unittest.TestCase):
    """Test merchant pattern analysis"""
    
    def test_analyze_with_no_transactions(self) -> None:
        """Test analysis with no transactions"""
        transactions: List[Transaction] = []
        envelopes: List[Dict[str, Any]] = []
        
        result = analyze_merchant_patterns(transactions, envelopes, 1)
        
        self.assertEqual(len(result), 0)
    
    def test_analyze_coffee_pattern(self) -> None:
        """Test detection of coffee shop pattern"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": -5.50, "description": "Starbucks", "category": None, "envelopeId": None},
            {"date": "2024-01-03T00:00:00Z", "amount": -6.00, "description": "Starbucks Coffee", "category": None, "envelopeId": None},
            {"date": "2024-01-05T00:00:00Z", "amount": -5.75, "description": "STARBUCKS", "category": None, "envelopeId": None},
            {"date": "2024-01-07T00:00:00Z", "amount": -5.25, "description": "Starbucks #1234", "category": None, "envelopeId": None},
        ]
        envelopes: List[Dict[str, Any]] = []
        
        result = analyze_merchant_patterns(transactions, envelopes, 1, min_amount=20, min_transactions=3)
        
        self.assertGreater(len(result), 0)
        coffee_suggestion = next((s for s in result if "Coffee" in s["title"]), None)
        self.assertIsNotNone(coffee_suggestion)
        self.assertEqual(coffee_suggestion["type"], "merchant_pattern")
        self.assertIn("coffee", coffee_suggestion["title"].lower())
    
    def test_analyze_gas_station_pattern(self) -> None:
        """Test detection of gas station pattern"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": -45.00, "description": "Shell Gas Station", "category": None, "envelopeId": None},
            {"date": "2024-01-08T00:00:00Z", "amount": -50.00, "description": "Chevron", "category": None, "envelopeId": None},
            {"date": "2024-01-15T00:00:00Z", "amount": -48.00, "description": "Exxon Mobil", "category": None, "envelopeId": None},
        ]
        envelopes: List[Dict[str, Any]] = []
        
        result = analyze_merchant_patterns(transactions, envelopes, 1, min_amount=50, min_transactions=3)
        
        gas_suggestion = next((s for s in result if "Gas" in s["title"]), None)
        self.assertIsNotNone(gas_suggestion)
        self.assertGreater(gas_suggestion["suggestedAmount"], 0)
    
    def test_analyze_skips_existing_envelope(self) -> None:
        """Test that analysis skips categories with existing envelopes"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": -25.00, "description": "Amazon Purchase", "category": None, "envelopeId": None},
            {"date": "2024-01-05T00:00:00Z", "amount": -30.00, "description": "Amazon.com", "category": None, "envelopeId": None},
            {"date": "2024-01-10T00:00:00Z", "amount": -20.00, "description": "AMZN", "category": None, "envelopeId": None},
        ]
        envelopes: List[Dict[str, Any]] = [
            {"id": "1", "name": "Online Shopping", "category": "Shopping", "monthlyAmount": 100}
        ]
        
        result = analyze_merchant_patterns(transactions, envelopes, 1, min_amount=50, min_transactions=3)
        
        # Should not suggest "Online Shopping" since it already exists
        shopping_suggestion = next((s for s in result if "Online Shopping" in s["title"]), None)
        self.assertIsNone(shopping_suggestion)
    
    def test_analyze_filters_assigned_transactions(self) -> None:
        """Test that analysis only considers unassigned transactions"""
        transactions: List[Transaction] = [
            {"date": "2024-01-01T00:00:00Z", "amount": -25.00, "description": "Netflix", "category": None, "envelopeId": None},
            {"date": "2024-01-05T00:00:00Z", "amount": -30.00, "description": "Netflix", "category": None, "envelopeId": "assigned-123"},
            {"date": "2024-01-10T00:00:00Z", "amount": -20.00, "description": "Netflix", "category": None, "envelopeId": None},
        ]
        envelopes: List[Dict[str, Any]] = []
        
        result = analyze_merchant_patterns(transactions, envelopes, 1, min_amount=40, min_transactions=2)
        
        # Should only count the 2 unassigned transactions ($45 total)
        subscription_suggestion = next((s for s in result if "Subscription" in s["title"]), None)
        self.assertIsNotNone(subscription_suggestion)
    
    def test_merchant_patterns_regex(self) -> None:
        """Test that merchant patterns match correctly"""
        test_cases = [
            ("amazon", "Online Shopping"),
            ("STARBUCKS COFFEE", "Coffee & Drinks"),
            ("Shell Gas", "Gas Stations"),
            ("Netflix Subscription", "Subscriptions"),
            ("Uber Ride", "Rideshare"),
            ("CVS Pharmacy", "Pharmacy"),
            ("McDonald's", "Fast Food"),
            ("Instacart Delivery", "Grocery Delivery"),
            ("Planet Fitness", "Fitness"),
        ]
        
        for description, expected_category in test_cases:
            matched = False
            for category, pattern in MERCHANT_PATTERNS.items():
                if pattern.search(description):
                    self.assertEqual(category, expected_category, 
                                   f"Expected '{description}' to match '{expected_category}', got '{category}'")
                    matched = True
                    break
            self.assertTrue(matched, f"No pattern matched for '{description}'")


if __name__ == "__main__":
    unittest.main()
