#!/bin/bash

# Vercel Ignored Build Step Script
# Documentation: https://vercel.com/docs/concepts/projects/overview#ignored-build-step

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == "develop" ]]; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1
else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0
fi
