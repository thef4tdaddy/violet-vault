"""
Currency utilities for precise financial calculations
"""

from decimal import ROUND_HALF_UP, Decimal


def round_currency(amount: float) -> float:
    """
    Rounds a currency amount to 2 decimal places using standard rounding (round half up)

    Args:
        amount: The amount to round

    Returns:
        Rounded amount as float with 2 decimal precision

    Examples:
        >>> round_currency(10.555)
        10.56
        >>> round_currency(10.554)
        10.55
    """
    # Convert to Decimal for precise calculation
    decimal_amount = Decimal(str(amount))
    # Round to 2 decimal places using ROUND_HALF_UP (standard for currency)
    rounded = decimal_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    # Convert back to float
    return float(rounded)


def calculate_percentage_amount(base: float, percentage: float) -> float:
    """
    Calculate percentage of a base amount with proper currency rounding

    Args:
        base: Base amount
        percentage: Percentage to calculate (e.g., 30 for 30%)

    Returns:
        Calculated percentage amount rounded to 2 decimals

    Examples:
        >>> calculate_percentage_amount(1000, 30)
        300.00
        >>> calculate_percentage_amount(1000, 33.33)
        333.30
    """
    result = (base * percentage) / 100
    return round_currency(result)


def split_amount(total: float, num_parts: int) -> list:
    """
    Split an amount into equal parts with proper remainder handling

    Args:
        total: Total amount to split
        num_parts: Number of parts to split into

    Returns:
        List of amounts that sum exactly to total

    Examples:
        >>> split_amount(100, 3)
        [33.33, 33.33, 33.34]
        >>> split_amount(300, 2)
        [150.00, 150.00]
    """
    if num_parts <= 0:
        return []

    # Use Decimal for precise splitting
    total_decimal = Decimal(str(total))
    part_size = total_decimal / num_parts

    # Round each part
    parts = []
    remaining = total_decimal

    for _i in range(num_parts - 1):
        part = part_size.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        parts.append(float(part))
        remaining -= part

    # Last part gets the remainder to ensure exact total
    parts.append(float(remaining.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)))

    return parts
