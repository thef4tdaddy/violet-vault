#!/usr/bin/env bash

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# Verify you're on main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo -e "${RED}❌ You must be on 'main' to run this script. Current branch: '$current_branch'${NC}"
  exit 1
fi

# Check for any changes in working directory (staged, unstaged, or untracked)
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}❌ You have uncommitted changes. Please commit or stash them before running this script.${NC}"
  exit 1
fi

# Check for local commits ahead of origin/main
if ! git diff --quiet origin/main..HEAD; then
  echo -e "${YELLOW}🔍 Detected local commits not pushed to origin/main${NC}"

  # Store commit hash range
  first_commit=$(git rev-list origin/main..HEAD | tail -1)
  commit_range="$first_commit^..HEAD"

  # Save commit messages
  last_msg=$(git log -1 --pretty=%B)

  echo -e "${YELLOW}📦 Stashing local commits...${NC}"
  git checkout -b _temp_branch_with_commits
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to switch to _temp_branch_with_commits. Please resolve and re-run.${NC}"
    exit 1
  fi

  echo -e "${YELLOW}✨ Running Prettier and ESLint autofix...${NC}"
  npm run format
  npm run lint:fix

  git add .
  git commit --amend --no-edit

  # Squash all local commits into one
  echo -e "${YELLOW}🔧 Squashing commits...${NC}"
  git reset --soft "$first_commit^"
  git commit -m "$last_msg"
  echo -e "${YELLOW}💾 Saving commit messages...${NC}"
  git log "$commit_range" --pretty=format:"%s" > /tmp/saved_commit_messages.txt

  # Move back to main and reset
  git checkout main
  git fetch origin
  git reset --hard origin/main

  # Ask for new branch name
  echo -e "${YELLOW}🔹 Enter new branch name:${NC}"
  read branch

  if [ -z "$branch" ]; then
    echo -e "${RED}❌ No branch name provided.${NC}"
    git branch -D _temp_branch_with_commits
    exit 1
  fi

  # Create the new branch and rebase commits onto it
  git checkout -b "$branch"
  git cherry-pick --allow-empty --strategy=recursive -X theirs "$first_commit^.._temp_branch_with_commits"

  # Push the new branch
  git push -u origin "$branch"

  # Switch back to main and hard reset
  git checkout main
  git fetch origin
  git reset --hard origin/main
  echo -e "${GREEN}✅ Main hard reset to match origin/main.${NC}"

  # Switch to the new branch after pushing
  git checkout "$branch"

  echo -e "${GREEN}✅ Branch '$branch' created with local commits rebased and pushed.${NC}"

  # Show saved commit messages before cleanup
  echo -e "${GREEN}📝 Saved commit messages:${NC}"
  cat /tmp/saved_commit_messages.txt

  # Clean up temp branch
  git branch -D _temp_branch_with_commits

else
  echo -e "${GREEN}✅ No local commits to rebase.${NC}"

  # Ask for new branch name
  echo -e "${YELLOW}🔹 Enter new branch name:${NC}"
  read branch

  if [ -z "$branch" ]; then
    echo -e "${RED}❌ No branch name provided.${NC}"
    exit 1
  fi

  git checkout -b "$branch"
  git push -u origin "$branch"

  # Switch back to main and hard reset
  git checkout main
  git fetch origin
  git reset --hard origin/main
  echo -e "${GREEN}✅ Main hard reset to match origin/main.${NC}"

  # Switch to the new branch after pushing
  git checkout "$branch"

  echo -e "${GREEN}✅ Empty branch '$branch' created and pushed.${NC}"
fi