#!/bin/bash
# deploy.sh - Deploy sitmun-viewer-app to GitHub Pages
# Usage: ./scripts/deploy.sh
# Requires: GITHUB_API_KEY, USERNAME, GITHUB_WORKSPACE environment variables

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
  local exit_code=$?
  if [ -d "tmp" ]; then
    echo -e "${YELLOW}Cleaning up temporary directory...${NC}"
    rm -rf tmp
  fi
  if [ $exit_code -ne 0 ]; then
    echo -e "${RED}Deployment failed with exit code $exit_code${NC}"
  fi
  exit $exit_code
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Validate required environment variables
if [ -z "${GITHUB_API_KEY:-}" ]; then
  echo -e "${RED}ERROR: GITHUB_API_KEY environment variable is not set${NC}"
  exit 1
fi

if [ -z "${USERNAME:-}" ]; then
  echo -e "${RED}ERROR: USERNAME environment variable is not set${NC}"
  exit 1
fi

if [ -z "${GITHUB_WORKSPACE:-}" ]; then
  echo -e "${YELLOW}WARNING: GITHUB_WORKSPACE not set, using current directory${NC}"
  export GITHUB_WORKSPACE=${PWD}
fi

# Validate build artifacts exist
BUILD_DIR="${GITHUB_WORKSPACE}/dist/viewer-app"
if [ ! -d "$BUILD_DIR" ]; then
  echo -e "${RED}ERROR: Build artifacts not found at $BUILD_DIR${NC}"
  echo "Please run 'npm run build' first"
  exit 1
fi

if [ -z "$(ls -A "$BUILD_DIR" 2>/dev/null)" ]; then
  echo -e "${RED}ERROR: Build directory is empty${NC}"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Deploying to GitHub Pages${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Get deployment metadata
DEPLOY_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DEPLOY_COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DEPLOY_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

# Detect default branch
DEFAULT_BRANCH="master"
if git ls-remote --heads origin main >/dev/null 2>&1; then
  DEFAULT_BRANCH="main"
fi

echo -e "${BLUE}Deployment Info:${NC}"
echo -e "  Version: ${GREEN}${DEPLOY_VERSION}${NC}"
echo -e "  Commit: ${GREEN}${DEPLOY_COMMIT_SHA}${NC}"
echo -e "  Branch: ${GREEN}${DEFAULT_BRANCH}${NC}"
echo -e "  Timestamp: ${GREEN}${DEPLOY_TIMESTAMP}${NC}"
echo ""

# Create temporary directory
mkdir -p tmp
cd tmp

# Clone the GitHub Pages repository
echo -e "${BLUE}Cloning GitHub Pages repository...${NC}"
if ! git clone https://github.com/sitmun/sitmun.github.io.git; then
  echo -e "${RED}ERROR: Failed to clone repository${NC}"
  exit 1
fi

cd sitmun.github.io

# Configure git user for CI environment
if [ -n "${CI:-}" ]; then
  git config user.name "GitHub Actions Bot"
  git config user.email "actions@github.com"
fi

# Copy build artifacts to docs directory
echo -e "${BLUE}Copying build artifacts...${NC}"
cp -r "$BUILD_DIR" ./docs

# Stage changes
echo -e "${BLUE}Staging changes...${NC}"
git add docs/viewer-app/*

# Check if there are changes to commit
if ! git diff --staged --quiet; then
  # Create commit message with deployment metadata
  COMMIT_MSG="Deploy sitmun-viewer-app v${DEPLOY_VERSION}

- Commit: ${DEPLOY_COMMIT_SHA}
- Timestamp: ${DEPLOY_TIMESTAMP}
- Build: ${BUILD_DIR}"

  git commit -m "$COMMIT_MSG"

  # Push to repository using credential helper approach
  echo -e "${BLUE}Pushing to GitHub Pages...${NC}"
  # Use git credential helper to avoid exposing token in URL
  git config credential.helper store
  echo "https://${USERNAME}:${GITHUB_API_KEY}@github.com" > ~/.git-credentials
  
  if git push -q origin "${DEFAULT_BRANCH}" 2>&1; then
    echo -e "${GREEN}✓ Successfully deployed to GitHub Pages${NC}"
  else
    echo -e "${RED}ERROR: Failed to push to repository${NC}"
    # Clean up credentials
    rm -f ~/.git-credentials
    exit 1
  fi
  
  # Clean up credentials
  rm -f ~/.git-credentials
  git config --unset credential.helper
else
  echo -e "${YELLOW}No changes to deploy${NC}"
fi

cd ../..
echo -e "${GREEN}Deployment completed successfully${NC}"
