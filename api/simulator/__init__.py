"""
Financial Behavior Simulator Package
Generates realistic financial data for the Demo Sandbox
Issue #172
"""

from .generator import generate_financial_simulation
from .models import SimulationConfig, SimulationResult

__all__ = ["generate_financial_simulation", "SimulationConfig", "SimulationResult"]
