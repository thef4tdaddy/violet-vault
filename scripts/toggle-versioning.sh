#!/bin/bash

# scripts/toggle-versioning.sh - Toggle between alpha, beta, and off versioning modes

MODE=$1

if [[ "$MODE" != "alpha" && "$MODE" != "beta" && "$MODE" != "off" ]]; then
  echo "Usage: $0 [alpha|beta|off]"
  exit 1
fi

HOOK_FILE=".husky/pre-commit"
PACKAGE_FILE="package.json"

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_ARGS="-i ''"
else
  SED_ARGS="-i"
fi

update_hook() {
  local target_mode=$1
  if [[ "$target_mode" == "off" ]]; then
    echo "⏸️  Disabling auto-bumping in pre-commit hook..."
    eval "sed $SED_ARGS 's/^npm version prerelease/# npm version prerelease/' $HOOK_FILE"
    eval "sed $SED_ARGS 's/^echo \"🔖 Auto-bumping/ # echo \"🔖 Auto-bumping/' $HOOK_FILE"
  else
    echo "🚀 Setting versioning mode to: $target_mode"
    # Ensure lines are uncommented
    eval "sed $SED_ARGS 's/^[#[:space:]]*npm version prerelease/npm version prerelease/' $HOOK_FILE"
    eval "sed $SED_ARGS 's/^[#[:space:]]*echo \"🔖 Auto-bumping/echo \"🔖 Auto-bumping/' $HOOK_FILE"
    
    # Update preid and labels
    eval "sed $SED_ARGS 's/--preid=[a-z]*/--preid=$target_mode/' $HOOK_FILE"
    eval "sed $SED_ARGS 's/Auto-bump [a-z]*/Auto-bump $target_mode/' $HOOK_FILE"
    eval "sed $SED_ARGS 's/bumping [a-z]*/bumping $target_mode/' $HOOK_FILE"
  fi
}

update_package_json() {
  local target_mode=$1
  if [[ "$target_mode" == "off" ]]; then
    return
  fi

  # Get current version parts
  CURRENT_VERSION=$(grep '"version":' "$PACKAGE_FILE" | head -1 | sed -E 's/.*"version": "(.*)".*/\1/')
  BASE_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+).*/\1/')
  
  NEW_VERSION="${BASE_VERSION}-${target_mode}.0"
  
  if [[ "$CURRENT_VERSION" != "$NEW_VERSION" ]]; then
    echo "🔖 Updating package.json version: $CURRENT_VERSION -> $NEW_VERSION"
    eval "sed $SED_ARGS 's/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/' $PACKAGE_FILE"
  fi
}

update_hook "$MODE"
update_package_json "$MODE"

echo "✅ Done. Versioning mode set to '$MODE'."
