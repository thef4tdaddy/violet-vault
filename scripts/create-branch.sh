#!/usr/bin/env bash

# VioletVault Branch Creation Script
# Updated for new branch protection workflow: feature branches → develop → main

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🌿 VioletVault Branch Creation${NC}"
echo -e "${BLUE}==============================${NC}"

# Check if we're on develop (recommended) or main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "develop" ] && [ "$current_branch" != "main" ]; then
  echo -e "${YELLOW}⚠️  Creating branch from: '$current_branch'${NC}"
  echo -e "${YELLOW}💡 Recommended: Create feature branches from 'develop'${NC}"
  read -p "🔹 Continue anyway? (y/n): " continue_anyway
  if [ "$continue_anyway" != "y" ]; then
    echo -e "${RED}❌ Branch creation canceled${NC}"
    exit 1
  fi
elif [ "$current_branch" == "main" ]; then
  echo -e "${YELLOW}⚠️  Creating branch from 'main' - consider using 'develop' instead${NC}"
  echo -e "${YELLOW}💡 New workflow: develop → main (PRs only)${NC}"
fi

echo -e "${GREEN}✅ Source branch: $current_branch${NC}"

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

  # Ask for branch type and name
  echo -e "${YELLOW}🔹 Branch type (feat/fix/style/perf/docs/chore):${NC}"
  read branch_type
  echo -e "${YELLOW}🔹 Enter branch description (kebab-case):${NC}"
  read branch_desc

  if [ -z "$branch_type" ] || [ -z "$branch_desc" ]; then
    echo -e "${RED}❌ Branch type and description required.${NC}"
    git branch -D _temp_branch_with_commits
    exit 1
  fi

  branch="${branch_type}/${branch_desc}"
  echo -e "${BLUE}📝 Creating branch: $branch${NC}"

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

  # Ask for branch type and name  
  echo -e "${YELLOW}🔹 Branch type (feat/fix/style/perf/docs/chore):${NC}"
  read branch_type
  echo -e "${YELLOW}🔹 Enter branch description (kebab-case):${NC}"
  read branch_desc

  if [ -z "$branch_type" ] || [ -z "$branch_desc" ]; then
    echo -e "${RED}❌ Branch type and description required.${NC}"
    exit 1
  fi

  branch="${branch_type}/${branch_desc}"
  echo -e "${BLUE}📝 Creating branch: $branch${NC}"

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

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Work on your feature in branch: $branch${NC}"
echo -e "${YELLOW}2. When ready, create PR: $branch → develop${NC}"
echo -e "${YELLOW}3. After review and merge to develop${NC}"
echo -e "${YELLOW}4. For release: create PR: develop → main${NC}"
echo ""
echo -e "${BLUE}💡 Remember: Only develop can PR to main!${NC}"