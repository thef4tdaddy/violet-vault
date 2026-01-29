#!/bin/bash
# Wrapper for the optimized Python version
# Full Salvo - Multi-language verification

# Ensure python3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required but not installed."
    exit 1
fi

# Forward all arguments to the python script
exec python3 "$(dirname "$0")/full_salvo.py" "$@"
