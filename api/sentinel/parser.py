"""
Receipt data extraction from raw OCR text.
Uses regex patterns to extract structured data from unstructured text.
"""

import logging
import re
from datetime import datetime

from api.sentinel.models import ConfidenceScores, ExtractedReceiptData, LineItem

logger = logging.getLogger(__name__)


class ReceiptParser:
    """
    Parser for extracting structured receipt data from OCR text.
    Handles common receipt formats and edge cases.
    """

    # Regex patterns for common receipt fields
    TOTAL_PATTERNS = [
        r"\b(?:total|amount due|balance due|grand total|total amount)\s*:?\s*\$?\s*([\d.,]+\d{2})",
        r"\btotal\b.*?\$?\s*([\d.,]+\d{2})",
        r"(?:^|\n)\s*\$?\s*([\d.,]+\d{2})\s*(?:\btotal\b|ttl)",
    ]

    SUBTOTAL_PATTERNS = [
        r"(?:subtotal|sub total|sub-total)\s*:?\s*\$?\s*(\d+[.,]\d{2})",
        r"\bsubtotal\b.*?\$?\s*(\d+[.,]\d{2})",
    ]

    TAX_PATTERNS = [
        r"(?:tax|sales tax|gst|vat|hst)\s*:?\s*\$?\s*(\d+[.,]\d{2})",
        r"\btax\b.*?\$?\s*(\d+[.,]\d{2})",
    ]

    DATE_PATTERNS = [
        # MM/DD/YYYY or MM-DD-YYYY
        r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b",
        # YYYY-MM-DD
        r"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b",
        # Month DD, YYYY
        r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b",
    ]

    MERCHANT_INDICATORS = [
        "store",
        "shop",
        "market",
        "grocery",
        "restaurant",
        "cafe",
        "coffee",
        "retail",
        "outlet",
        "inc",
        "llc",
        "corp",
        "ltd",
    ]

    def __init__(self) -> None:
        """Initialize parser with compiled regex patterns"""
        self.total_regex = [re.compile(p, re.IGNORECASE) for p in self.TOTAL_PATTERNS]
        self.subtotal_regex = [re.compile(p, re.IGNORECASE) for p in self.SUBTOTAL_PATTERNS]
        self.tax_regex = [re.compile(p, re.IGNORECASE) for p in self.TAX_PATTERNS]
        self.date_regex = [re.compile(p, re.IGNORECASE) for p in self.DATE_PATTERNS]

    def extract_total(self, text: str) -> tuple[float | None, float]:
        """
        Extract total amount from text.

        Args:
            text: Raw OCR text

        Returns:
            Tuple of (total amount, confidence score)
        """
        for pattern in self.total_regex:
            match = pattern.search(text)
            if match:
                try:
                    raw_amount = match.group(1)
                    # Handle multiple separators
                    # If both . and , exist:
                    if "." in raw_amount and "," in raw_amount:
                        if raw_amount.rfind(".") > raw_amount.rfind(","):
                            # 1,234.56 -> 1234.56
                            amount_str = raw_amount.replace(",", "")
                        else:
                            # 1.234,56 -> 1234.56
                            amount_str = raw_amount.replace(".", "").replace(",", ".")
                    elif "," in raw_amount:
                        # 1,234,56 or 1,234
                        parts = raw_amount.split(",")
                        if len(parts[-1]) == 2:
                            # 1,234,56 -> 1234.56
                            amount_str = "".join(parts[:-1]) + "." + parts[-1]
                        else:
                            # 1,234 -> 1234
                            amount_str = raw_amount.replace(",", "")
                    elif "." in raw_amount:
                        # 1.234.56 or 1.234
                        parts = raw_amount.split(".")
                        if len(parts[-1]) == 2:
                            # 1.234.56 -> 1234.56
                            amount_str = "".join(parts[:-1]) + "." + parts[-1]
                        else:
                            # 1.234 -> 1234
                            amount_str = raw_amount.replace(".", "")
                    else:
                        amount_str = raw_amount

                    amount = float(amount_str)
                    # Sanity check: receipt totals are typically between $0.01 and $10,000
                    if 0.01 <= amount <= 10000:
                        return amount, 0.9
                except (ValueError, IndexError):
                    continue

        return None, 0.0

    def extract_subtotal(self, text: str) -> tuple[float | None, float]:
        """
        Extract subtotal amount from text.

        Args:
            text: Raw OCR text

        Returns:
            Tuple of (subtotal amount, confidence score)
        """
        for pattern in self.subtotal_regex:
            match = pattern.search(text)
            if match:
                try:
                    amount_str = match.group(1).replace(",", ".")
                    amount = float(amount_str)
                    if 0.01 <= amount <= 10000:
                        return amount, 0.8
                except (ValueError, IndexError):
                    continue

        return None, 0.0

    def extract_tax(self, text: str) -> tuple[float | None, float]:
        """
        Extract tax amount from text.

        Args:
            text: Raw OCR text

        Returns:
            Tuple of (tax amount, confidence score)
        """
        for pattern in self.tax_regex:
            match = pattern.search(text)
            if match:
                try:
                    amount_str = match.group(1).replace(",", ".")
                    amount = float(amount_str)
                    if 0.0 <= amount <= 1000:
                        return amount, 0.8
                except (ValueError, IndexError):
                    continue

        return None, 0.0

    def extract_date(self, text: str) -> tuple[str | None, float]:
        """
        Extract date from text and convert to ISO 8601 format.

        Args:
            text: Raw OCR text

        Returns:
            Tuple of (ISO date string, confidence score)
        """
        for pattern in self.date_regex:
            match = pattern.search(text)
            if match:
                try:
                    groups = match.groups()

                    # Handle different date formats
                    if len(groups) == 3:
                        # Try MM/DD/YYYY format
                        if groups[0].isdigit() and len(groups[0]) <= 2:
                            month, day, year = groups
                            month = int(month)
                            day = int(day)
                        # Try YYYY-MM-DD format
                        elif groups[0].isdigit() and len(groups[0]) == 4:
                            year, month, day = groups
                            month = int(month)
                            day = int(day)
                        # Try Month DD, YYYY format
                        else:
                            month_name, day, year = groups
                            month = datetime.strptime(month_name[:3], "%b").month
                            day = int(day)

                        # Handle 2-digit years
                        year_int = int(year)
                        if year_int < 100:
                            year_int += 2000 if year_int < 50 else 1900

                        # Validate date
                        parsed_date = datetime(year_int, month, day)
                        iso_date = parsed_date.date().isoformat()

                        return iso_date, 0.85

                except (ValueError, IndexError):
                    continue

        return None, 0.0

    def extract_merchant(self, text: str) -> tuple[str | None, float]:
        """
        Extract merchant name from text.
        Heuristic: First 1-3 lines often contain merchant name.

        Args:
            text: Raw OCR text

        Returns:
            Tuple of (merchant name, confidence score)
        """
        lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
        if not lines:
            return None, 0.0

        # Check first 3 lines for merchant indicators
        for i, line in enumerate(lines[:3]):
            line = line.strip()
            if not line or len(line) < 3:
                continue

            # Skip lines that look like addresses or dates
            if re.search(r"\d{3,}", line) or re.search(r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}", line):
                continue

            # Check for merchant indicators
            line_lower = line.lower()
            for indicator in self.MERCHANT_INDICATORS:
                if indicator in line_lower:
                    return line, 0.75

            # If first line is all caps and reasonable length, likely merchant
            if i == 0 and line.isupper() and 3 <= len(line) <= 50:
                return line, 0.7

        # Fallback: return first non-empty line
        return lines[0].strip(), 0.5

    def extract_line_items(self, text: str) -> list[LineItem]:
        """
        Extract individual line items from receipt text.
        Pattern: Description followed by price.

        Args:
            text: Raw OCR text

        Returns:
            List of LineItem objects
        """
        line_items: list[LineItem] = []
        lines = text.strip().split("\n")

        # Pattern: text followed by price (with optional quantity)
        item_pattern = re.compile(r"^(.+?)\s+(\d+)?\s*x?\s*\$?\s*(\d+[.,]\d{2})$", re.IGNORECASE)

        for line in lines:
            line = line.strip()
            match = item_pattern.match(line)
            if match:
                try:
                    description = match.group(1).strip()
                    quantity_str = match.group(2)
                    price_str = match.group(3).replace(",", ".")

                    quantity = float(quantity_str) if quantity_str else None
                    price = float(price_str)

                    # Skip if description is too short or looks like a total
                    if len(description) < 2 or "total" in description.lower():
                        continue

                    line_items.append(
                        LineItem(
                            description=description,
                            quantity=quantity,
                            unit_price=price if not quantity else price / quantity,
                            total_price=price,
                            confidence=0.7,
                        )
                    )
                except (ValueError, IndexError):
                    continue

        return line_items

    def calculate_overall_confidence(self, confidence_scores: ConfidenceScores) -> float:
        """
        Calculate overall confidence as weighted average.

        Args:
            confidence_scores: Individual field confidence scores

        Returns:
            Overall confidence score (0.0 - 1.0)
        """
        weights = {"merchant": 0.2, "total": 0.5, "date": 0.3}

        weighted_sum = (
            confidence_scores.merchant * weights["merchant"]
            + confidence_scores.total * weights["total"]
            + confidence_scores.date * weights["date"]
        )

        return round(weighted_sum, 2)

    def parse(self, raw_text: str) -> ExtractedReceiptData:
        """
        Parse raw OCR text into structured receipt data.

        Args:
            raw_text: Raw text from OCR engine

        Returns:
            ExtractedReceiptData object with parsed fields
        """
        # Extract fields
        merchant, merchant_conf = self.extract_merchant(raw_text)
        total, total_conf = self.extract_total(raw_text)
        subtotal, subtotal_conf = self.extract_subtotal(raw_text)
        tax, tax_conf = self.extract_tax(raw_text)
        date, date_conf = self.extract_date(raw_text)
        line_items = self.extract_line_items(raw_text)

        # Build confidence scores
        confidence_scores = ConfidenceScores(
            merchant=merchant_conf, total=total_conf, date=date_conf
        )
        confidence_scores.overall = self.calculate_overall_confidence(confidence_scores)

        return ExtractedReceiptData(
            merchant=merchant,
            total=total,
            subtotal=subtotal,
            tax=tax,
            date=date,
            currency="USD",
            line_items=line_items,
            raw_text=raw_text,
            confidence_scores=confidence_scores,
        )
