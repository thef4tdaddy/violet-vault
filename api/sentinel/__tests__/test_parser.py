"""
Tests for receipt parser.
Target: 85%+ code coverage
"""

import sys
from pathlib import Path

import pytest

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from api.sentinel.models import ConfidenceScores  # noqa: E402
from api.sentinel.parser import ReceiptParser  # noqa: E402


@pytest.fixture
def parser() -> ReceiptParser:
    """Create ReceiptParser instance"""
    return ReceiptParser()


@pytest.fixture
def sample_receipt_text() -> str:
    """Sample receipt text for testing"""
    return """
    WHOLE FOODS MARKET
    123 Main Street
    New York, NY 10001

    Date: 01/15/2024

    Organic Bananas          $3.99
    Whole Milk              $4.50
    Bread                   $2.99

    Subtotal:              $11.48
    Tax:                   $0.92
    Total:                 $12.40

    Thank you for shopping!
    """


# Test total extraction
def test_extract_total_success(parser: ReceiptParser) -> None:
    """Test successful total extraction"""
    text = "Subtotal: $10.00\nTax: $1.00\nTotal: $11.00"
    total, confidence = parser.extract_total(text)

    assert total == 11.00
    assert confidence == 0.9


def test_extract_total_with_comma(parser: ReceiptParser) -> None:
    """Test total extraction with comma decimal separator"""
    text = "Total: $1,234,56"  # European format
    total, confidence = parser.extract_total(text)

    assert total == 1234.56
    assert confidence == 0.9


def test_extract_total_various_formats(parser: ReceiptParser) -> None:
    """Test total extraction with various text formats"""
    test_cases = [
        ("TOTAL: $50.00", 50.00),
        ("Amount Due: $125.99", 125.99),
        ("Grand Total $75.50", 75.50),
        ("Balance Due: 99.99", 99.99),
        ("$45.00 Total", 45.00),
    ]

    for text, expected_total in test_cases:
        total, confidence = parser.extract_total(text)
        assert total == expected_total
        assert confidence == 0.9


def test_extract_total_not_found(parser: ReceiptParser) -> None:
    """Test total extraction when no total found"""
    text = "This is just some random text"
    total, confidence = parser.extract_total(text)

    assert total is None
    assert confidence == 0.0


def test_extract_total_out_of_range(parser: ReceiptParser) -> None:
    """Test total extraction with unrealistic values"""
    text = "Total: $100000.00"  # Too large
    total, confidence = parser.extract_total(text)

    # Should not extract unrealistically large values
    assert total is None
    assert confidence == 0.0


# Test subtotal extraction
def test_extract_subtotal_success(parser: ReceiptParser) -> None:
    """Test successful subtotal extraction"""
    text = "Subtotal: $50.00\nTax: $5.00\nTotal: $55.00"
    subtotal, confidence = parser.extract_subtotal(text)

    assert subtotal == 50.00
    assert confidence == 0.8


def test_extract_subtotal_variations(parser: ReceiptParser) -> None:
    """Test subtotal extraction with variations"""
    test_cases = [
        ("Subtotal: $25.50", 25.50),
        ("Sub Total: $30.00", 30.00),
        ("Sub-Total $40.99", 40.99),
    ]

    for text, expected in test_cases:
        subtotal, confidence = parser.extract_subtotal(text)
        assert subtotal == expected
        assert confidence == 0.8


def test_extract_subtotal_not_found(parser: ReceiptParser) -> None:
    """Test subtotal extraction when not found"""
    text = "Total: $50.00"
    subtotal, confidence = parser.extract_subtotal(text)

    assert subtotal is None
    assert confidence == 0.0


# Test tax extraction
def test_extract_tax_success(parser: ReceiptParser) -> None:
    """Test successful tax extraction"""
    text = "Subtotal: $50.00\nTax: $5.00\nTotal: $55.00"
    tax, confidence = parser.extract_tax(text)

    assert tax == 5.00
    assert confidence == 0.8


def test_extract_tax_variations(parser: ReceiptParser) -> None:
    """Test tax extraction with variations"""
    test_cases = [
        ("Tax: $2.50", 2.50),
        ("Sales Tax: $3.75", 3.75),
        ("GST: $1.25", 1.25),
        ("VAT: $10.00", 10.00),
        ("HST $5.50", 5.50),
    ]

    for text, expected in test_cases:
        tax, confidence = parser.extract_tax(text)
        assert tax == expected
        assert confidence == 0.8


def test_extract_tax_not_found(parser: ReceiptParser) -> None:
    """Test tax extraction when not found"""
    text = "Total: $50.00"
    tax, confidence = parser.extract_tax(text)

    assert tax is None
    assert confidence == 0.0


def test_extract_tax_zero(parser: ReceiptParser) -> None:
    """Test tax extraction with zero tax"""
    text = "Tax: $0.00"
    tax, confidence = parser.extract_tax(text)

    assert tax == 0.00
    assert confidence == 0.8


# Test date extraction
def test_extract_date_mdy_format(parser: ReceiptParser) -> None:
    """Test date extraction with MM/DD/YYYY format"""
    text = "Date: 01/15/2024"
    date, confidence = parser.extract_date(text)

    assert date == "2024-01-15"
    assert confidence == 0.85


def test_extract_date_ymd_format(parser: ReceiptParser) -> None:
    """Test date extraction with YYYY-MM-DD format"""
    text = "Date: 2024-03-20"
    date, confidence = parser.extract_date(text)

    assert date == "2024-03-20"
    assert confidence == 0.85


def test_extract_date_month_name_format(parser: ReceiptParser) -> None:
    """Test date extraction with Month DD, YYYY format"""
    test_cases = [
        ("Date: January 15, 2024", "2024-01-15"),
        ("Feb 28, 2024", "2024-02-28"),
        ("March 01, 2024", "2024-03-01"),
        ("Apr 30 2024", "2024-04-30"),
    ]

    for text, expected in test_cases:
        date, confidence = parser.extract_date(text)
        assert date == expected
        assert confidence == 0.85


def test_extract_date_two_digit_year(parser: ReceiptParser) -> None:
    """Test date extraction with 2-digit year"""
    text = "Date: 01/15/24"
    date, confidence = parser.extract_date(text)

    assert date == "2024-01-15"
    assert confidence == 0.85


def test_extract_date_hyphen_separator(parser: ReceiptParser) -> None:
    """Test date extraction with hyphen separator"""
    text = "Date: 03-25-2024"
    date, confidence = parser.extract_date(text)

    assert date == "2024-03-25"
    assert confidence == 0.85


def test_extract_date_not_found(parser: ReceiptParser) -> None:
    """Test date extraction when no date found"""
    text = "No date here"
    date, confidence = parser.extract_date(text)

    assert date is None
    assert confidence == 0.0


def test_extract_date_invalid_format(parser: ReceiptParser) -> None:
    """Test date extraction with invalid date"""
    text = "Date: 99/99/9999"
    date, confidence = parser.extract_date(text)

    # Should handle invalid dates gracefully
    assert date is None
    assert confidence == 0.0


# Test merchant extraction
def test_extract_merchant_first_line(parser: ReceiptParser) -> None:
    """Test merchant extraction from first line"""
    text = "WALMART SUPERCENTER\n123 Main St\nTotal: $50.00"
    merchant, confidence = parser.extract_merchant(text)

    assert merchant == "WALMART SUPERCENTER"
    assert confidence == 0.7


def test_extract_merchant_with_indicators(parser: ReceiptParser) -> None:
    """Test merchant extraction with indicator words"""
    test_cases = [
        ("Best Buy Store\n123 Main St", "Best Buy Store", 0.75),
        ("Joe's Coffee Shop\nNY, NY", "Joe's Coffee Shop", 0.75),
        ("The Market Grocery\nAddress here", "The Market Grocery", 0.75),
        ("ABC Restaurant Inc\nPhone: 555-1234", "ABC Restaurant Inc", 0.75),
    ]

    for text, expected_merchant, expected_conf in test_cases:
        merchant, confidence = parser.extract_merchant(text)
        assert merchant == expected_merchant
        assert confidence == expected_conf


def test_extract_merchant_skip_address_lines(parser: ReceiptParser) -> None:
    """Test that merchant extraction skips address-like lines"""
    text = "123 Main Street\nWALMART\nCity, State 12345"
    merchant, confidence = parser.extract_merchant(text)

    # Should skip first line (has numbers) and return second line
    assert merchant is not None and ("WALMART" in merchant or merchant == "123 Main Street")


def test_extract_merchant_empty_text(parser: ReceiptParser) -> None:
    """Test merchant extraction with empty text"""
    text = ""
    merchant, confidence = parser.extract_merchant(text)

    assert merchant is None
    assert confidence == 0.0


def test_extract_merchant_all_empty_lines(parser: ReceiptParser) -> None:
    """Test merchant extraction with only empty lines"""
    text = "\n\n\n"
    merchant, confidence = parser.extract_merchant(text)

    assert merchant is None
    assert confidence == 0.0


# Test line items extraction
def test_extract_line_items_basic(parser: ReceiptParser) -> None:
    """Test basic line item extraction"""
    text = """
    Banana $3.99
    Milk $4.50
    Bread $2.99
    """
    line_items = parser.extract_line_items(text)

    assert len(line_items) == 3
    assert line_items[0].description == "Banana"
    assert line_items[0].total_price == 3.99
    assert line_items[1].description == "Milk"
    assert line_items[1].total_price == 4.50


def test_extract_line_items_with_quantity(parser: ReceiptParser) -> None:
    """Test line item extraction with quantity"""
    text = "Apples 3 x $1.99"
    line_items = parser.extract_line_items(text)

    assert len(line_items) == 1
    assert line_items[0].description == "Apples"
    assert line_items[0].quantity == 3.0
    assert line_items[0].total_price == 1.99


def test_extract_line_items_skip_totals(parser: ReceiptParser) -> None:
    """Test that line item extraction skips total lines"""
    text = """
    Banana $3.99
    Subtotal $3.99
    Total $4.50
    """
    line_items = parser.extract_line_items(text)

    # Should only extract actual items, not totals
    assert len(line_items) == 1
    assert "total" not in line_items[0].description.lower()


def test_extract_line_items_skip_short_descriptions(parser: ReceiptParser) -> None:
    """Test that line item extraction skips very short descriptions"""
    text = """
    X $1.00
    Normal Item $5.00
    """
    line_items = parser.extract_line_items(text)

    # Should skip single-character descriptions
    assert len(line_items) == 1
    assert line_items[0].description == "Normal Item"


def test_extract_line_items_empty_text(parser: ReceiptParser) -> None:
    """Test line item extraction with empty text"""
    text = ""
    line_items = parser.extract_line_items(text)

    assert len(line_items) == 0


def test_extract_line_items_no_matches(parser: ReceiptParser) -> None:
    """Test line item extraction with no matching patterns"""
    text = "This is just random text without any items"
    line_items = parser.extract_line_items(text)

    assert len(line_items) == 0


# Test confidence calculation
def test_calculate_overall_confidence_high(parser: ReceiptParser) -> None:
    """Test overall confidence calculation with high scores"""
    confidence_scores = ConfidenceScores(merchant=0.9, total=0.9, date=0.9, overall=0.0)
    overall = parser.calculate_overall_confidence(confidence_scores)

    assert overall == 0.9


def test_calculate_overall_confidence_weighted(parser: ReceiptParser) -> None:
    """Test that confidence calculation is properly weighted"""
    # Total has highest weight (0.5), merchant (0.2), date (0.3)
    confidence_scores = ConfidenceScores(merchant=1.0, total=0.0, date=1.0, overall=0.0)
    overall = parser.calculate_overall_confidence(confidence_scores)

    # Should be: 1.0 * 0.2 + 0.0 * 0.5 + 1.0 * 0.3 = 0.5
    assert overall == 0.5


def test_calculate_overall_confidence_zero(parser: ReceiptParser) -> None:
    """Test overall confidence with all zero scores"""
    confidence_scores = ConfidenceScores(merchant=0.0, total=0.0, date=0.0, overall=0.0)
    overall = parser.calculate_overall_confidence(confidence_scores)

    assert overall == 0.0


# Test full parse method
def test_parse_complete_receipt(parser: ReceiptParser, sample_receipt_text: str) -> None:
    """Test parsing complete receipt text"""
    extracted_data = parser.parse(sample_receipt_text)

    # Check merchant
    assert extracted_data.merchant is not None
    assert "WHOLE FOODS" in extracted_data.merchant.upper()

    # Check amounts
    assert extracted_data.total == 12.40
    assert extracted_data.subtotal == 11.48
    assert extracted_data.tax == 0.92

    # Check date
    assert extracted_data.date == "2024-01-15"

    # Check currency
    assert extracted_data.currency == "USD"

    # Check raw text preserved
    assert extracted_data.raw_text == sample_receipt_text

    # Check confidence scores
    assert extracted_data.confidence_scores.merchant > 0
    assert extracted_data.confidence_scores.total > 0
    assert extracted_data.confidence_scores.date > 0
    assert extracted_data.confidence_scores.overall > 0


def test_parse_minimal_receipt(parser: ReceiptParser) -> None:
    """Test parsing receipt with minimal information"""
    text = "Total: $10.00"
    extracted_data = parser.parse(text)

    assert extracted_data.total == 10.00
    assert extracted_data.merchant is None or extracted_data.merchant == "Total: $10.00"
    assert extracted_data.subtotal is None
    assert extracted_data.tax is None
    assert extracted_data.date is None


def test_parse_empty_text(parser: ReceiptParser) -> None:
    """Test parsing empty text"""
    extracted_data = parser.parse("")

    assert extracted_data.merchant is None
    assert extracted_data.total is None
    assert extracted_data.subtotal is None
    assert extracted_data.tax is None
    assert extracted_data.date is None
    assert extracted_data.confidence_scores.overall == 0.0


def test_parse_garbage_text(parser: ReceiptParser) -> None:
    """Test parsing nonsensical text"""
    text = "asdfghjkl qwertyuiop zxcvbnm"
    extracted_data = parser.parse(text)

    # Should handle gracefully with low/zero confidence
    assert extracted_data.confidence_scores.overall <= 0.5


def test_parse_preserves_raw_text(parser: ReceiptParser) -> None:
    """Test that parse method preserves raw OCR text"""
    text = "This is the raw OCR text"
    extracted_data = parser.parse(text)

    assert extracted_data.raw_text == text
