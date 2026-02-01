import random
import time
from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["marketing"])


@router.get("/")
def get_system_status() -> dict[str, Any]:
    """
    Returns the real-time system status for the marketing footer.
    Simulates checking various subsystems.
    """
    # Simulate a check latency
    # In a real scenario, this would check DB connection health
    # For now, we simulate "Hyperspeed" performance
    latency_ms = int(random.uniform(10, 45))

    return {
        "status": "operational",
        "latency_ms": latency_ms,
        "services": {"web": "online", "api": "online", "vault_core": "encrypted"},
        "timestamp": int(time.time() * 1000),
    }
