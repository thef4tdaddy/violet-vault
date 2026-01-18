#!/bin/bash

# vercel-build-check.sh
# Usage: Set as "Ignored Build Step" command in Vercel Project Settings > Git
# Logic: Exit 1 (Error) -> Vercel PROCEEDS with build
#        Exit 0 (Success) -> Vercel IGNORES build

echo "🔍 Checking Vercel Build Rules for branch: '$VERCEL_GIT_COMMIT_REF'"

# List of branches allowed to deploy
ALLOWED_BRANCHES=("main" "master" "develop")

if [[ " ${ALLOWED_BRANCHES[*]} " =~ " ${VERCEL_GIT_COMMIT_REF} " ]]; then
  echo "✅ Branch '$VERCEL_GIT_COMMIT_REF' is allowed. Proceeding with build."
  # Vercel requires exit code 1 to PROCEED
  exit 1 
else
  echo "🛑 Branch '$VERCEL_GIT_COMMIT_REF' is ignored. Cancelling build."
  # Vercel requires exit code 0 to IGNORE
  exit 0
fi
