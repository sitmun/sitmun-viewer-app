#!/bin/bash
# clean.sh - Comprehensive cleaning script for sitmun-viewer-app
# Usage: ./scripts/clean.sh [OPTIONS]
#        or: npm run clean [-- OPTIONS]

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
FORCE_MODE=false
DRY_RUN=false
SKIP_MODULES=false
BUILD_ONLY=false
EMPTY_DIRS=false

# Counters
CLEANED_COUNT=0
FAILED_COUNT=0
declare -a FAILED_ITEMS
declare -a CLEANED_TARGETS

# Show help message
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Comprehensive cleaning script for sitmun-viewer-app Angular project"
  echo ""
  echo "Options:"
  echo "  -f, --force        Skip all confirmations (for CI/CD)"
  echo "  -d, --dry-run       Show what would be deleted without deleting"
  echo "  --skip-modules      Clean everything except node_modules"
  echo "  --build-only        Clean only build artifacts"
  echo "  --empty-dirs        Also remove empty directories (optional)"
  echo "  -h, --help          Show this help message"
  echo ""
  echo "What gets cleaned:"
  echo "  Build artifacts: dist, .angular, out-tsc, tmp, bazel-out, coverage"
  echo "  IDE artifacts: .idea, .project, .classpath, .c9/, .settings/, *.launch, *.sublime-workspace"
  echo "  Cache & logs: .sass-cache, connect.lock, *.log files, profiling JSON files"
  echo "  SonarQube: .scannerwork, reports"
  echo "  System files: .DS_Store, Thumbs.db, .directory"
  echo "  Dependencies: node_modules (with confirmation unless --force)"
  echo ""
  echo "Examples:"
  echo "  $0 --dry-run              # Preview what would be cleaned"
  echo "  $0 --build-only           # Clean only build artifacts"
  echo "  $0 --skip-modules         # Clean everything except node_modules"
  echo "  $0 --force                # Full clean without confirmations"
  echo "  $0 --empty-dirs           # Also remove empty directories"
  echo "  $0                        # Interactive full clean"
  echo ""
  echo "NPM usage:"
  echo "  npm run clean             # Interactive full clean"
  echo "  npm run clean:force       # Non-interactive full clean"
  echo "  npm run clean:build       # Build artifacts only"
  echo "  npm run clean -- --dry-run # Preview with dry-run"
}

# Detect CI environment
is_ci() {
  [[ -n "$CI" ]] || [[ -n "$GITHUB_ACTIONS" ]] || \
  [[ -n "$TRAVIS" ]] || [[ -n "$CIRCLECI" ]] || \
  [[ -n "$JENKINS_HOME" ]] || [[ -n "$GITLAB_CI" ]]
}

# Validate project root
validate_project_root() {
  echo -e "${BLUE}Validating project directory...${NC}"
  
  if [[ ! -f "package.json" ]]; then
    echo -e "${RED}ERROR: package.json not found${NC}"
    echo "This script must be run from the project root directory"
    exit 1
  fi
  
  if [[ ! -f "angular.json" ]]; then
    echo -e "${RED}ERROR: angular.json not found${NC}"
    echo "This doesn't appear to be an Angular project"
    exit 1
  fi
  
  if ! grep -q '"name"[[:space:]]*:[[:space:]]*"sitmun-viewer-app"' package.json; then
    echo -e "${RED}ERROR: Not the sitmun-viewer-app project${NC}"
    echo "Found package.json but it's not for sitmun-viewer-app"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Project validation passed${NC}"
}

# Confirm action (skip in CI or force mode)
confirm_action() {
  local message=$1
  
  # Skip confirmation in CI or force mode
  if is_ci || [[ "$FORCE_MODE" == "true" ]]; then
    return 0
  fi
  
  echo -n -e "${YELLOW}$message (y/N): ${NC}"
  read -r response
  [[ "$response" =~ ^[Yy]$ ]]
}

# Safe removal function
remove_item() {
  local item=$1
  local description=$2
  
  if [[ -e "$item" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      echo -e "${BLUE}[DRY RUN] Would remove: $item${NC} ${YELLOW}($description)${NC}"
      ((CLEANED_COUNT++))
      CLEANED_TARGETS+=("$item")
      return 0
    fi
    
    echo -e "${BLUE}Removing: $item${NC} ${YELLOW}($description)${NC}"
    rm -rf "$item"
    
    if [[ $? -eq 0 ]]; then
      echo -e "${GREEN}  ✓ Successfully removed${NC}"
      ((CLEANED_COUNT++))
      CLEANED_TARGETS+=("$item")
      return 0
    else
      echo -e "${RED}  ✗ Failed to remove${NC}"
      ((FAILED_COUNT++))
      FAILED_ITEMS+=("$item")
      return 1
    fi
  else
    echo -e "${YELLOW}Skipping: $item${NC} ${YELLOW}(not found)${NC}"
    return 0
  fi
}

# Remove files matching pattern
remove_pattern() {
  local pattern=$1
  local description=$2
  
  if [[ "$DRY_RUN" == "true" ]]; then
    local found=false
    while IFS= read -r -d '' file; do
      echo -e "${BLUE}[DRY RUN] Would remove: $file${NC} ${YELLOW}($description)${NC}"
      found=true
      ((CLEANED_COUNT++))
      CLEANED_TARGETS+=("$file")
    done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    if [[ "$found" == "false" ]]; then
      echo -e "${YELLOW}Skipping pattern: $pattern${NC} ${YELLOW}(not found)${NC}"
    fi
  else
    local found=false
    while IFS= read -r -d '' file; do
      echo -e "${BLUE}Removing: $file${NC} ${YELLOW}($description)${NC}"
      rm -f "$file"
      if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}  ✓ Successfully removed${NC}"
        found=true
        ((CLEANED_COUNT++))
        CLEANED_TARGETS+=("$file")
      else
        echo -e "${RED}  ✗ Failed to remove${NC}"
        ((FAILED_COUNT++))
        FAILED_ITEMS+=("$file")
      fi
    done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    if [[ "$found" == "false" ]]; then
      echo -e "${YELLOW}Skipping pattern: $pattern${NC} ${YELLOW}(not found)${NC}"
    fi
  fi
}

# Remove directories matching pattern
remove_pattern_dir() {
  local pattern=$1
  local description=$2
  
  if [[ "$DRY_RUN" == "true" ]]; then
    local found=false
    while IFS= read -r -d '' dir; do
      echo -e "${BLUE}[DRY RUN] Would remove: $dir${NC} ${YELLOW}($description)${NC}"
      found=true
      ((CLEANED_COUNT++))
      CLEANED_TARGETS+=("$dir")
    done < <(find . -name "$pattern" -type d -print0 2>/dev/null)
    if [[ "$found" == "false" ]]; then
      echo -e "${YELLOW}Skipping pattern: $pattern${NC} ${YELLOW}(not found)${NC}"
    fi
  else
    local found=false
    while IFS= read -r -d '' dir; do
      echo -e "${BLUE}Removing: $dir${NC} ${YELLOW}($description)${NC}"
      rm -rf "$dir"
      if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}  ✓ Successfully removed${NC}"
        found=true
        ((CLEANED_COUNT++))
        CLEANED_TARGETS+=("$dir")
      else
        echo -e "${RED}  ✗ Failed to remove${NC}"
        ((FAILED_COUNT++))
        FAILED_ITEMS+=("$dir")
      fi
    done < <(find . -name "$pattern" -type d -print0 2>/dev/null)
    if [[ "$found" == "false" ]]; then
      echo -e "${YELLOW}Skipping pattern: $pattern${NC} ${YELLOW}(not found)${NC}"
    fi
  fi
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force)
      FORCE_MODE=true
      shift
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-modules)
      SKIP_MODULES=true
      shift
      ;;
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --empty-dirs)
      EMPTY_DIRS=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Validate project root
validate_project_root

# Detect CI environment
if is_ci; then
  echo -e "${BLUE}CI environment detected - auto-confirming actions${NC}"
  FORCE_MODE=true
fi

# Show header
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Cleaning Viewer App${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "Mode: $([ "$DRY_RUN" == "true" ] && echo -e "${YELLOW}DRY RUN${NC}" || echo -e "${GREEN}ACTIVE${NC}")"
if [[ "$BUILD_ONLY" == "true" ]]; then
  echo "Scope: Build artifacts only"
elif [[ "$SKIP_MODULES" == "true" ]]; then
  echo "Scope: Full clean (excluding node_modules)"
else
  echo "Scope: Full clean"
fi
echo ""

# Clean build artifacts
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Cleaning Build Artifacts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

remove_item "dist/viewer-app" "Angular build output"
remove_item ".angular" "Angular CLI cache"
remove_item "out-tsc" "TypeScript compilation"
remove_item "tmp" "Temporary files"
remove_item "bazel-out" "Bazel output"
remove_item "coverage" "Test coverage reports"

# Clean additional items if not build-only
if [[ "$BUILD_ONLY" != "true" ]]; then
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Cleaning Cache & Logs${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  remove_item ".sass-cache" "Sass compiler cache"
  remove_item "connect.lock" "Browser sync lock"
  
  # Clean Python cache
  remove_pattern_dir "__pycache__" "Python bytecode cache directory"
  remove_pattern "*.pyc" "Python compiled bytecode"
  remove_pattern "*.pyo" "Python optimized bytecode"
  remove_pattern "*.pyd" "Python extension module (Windows)"
  
  remove_pattern "npm-debug.log" "npm error log"
  remove_pattern "yarn-error.log" "Yarn error log"
  remove_pattern "testem.log" "Test runner log"
  remove_pattern "libpeerconnection.log" "WebRTC log"
  remove_pattern "chrome-profiler-events*.json" "Chrome profiler data"
  remove_pattern "speed-measure-plugin*.json" "Webpack speed measurements"
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Cleaning IDE Artifacts${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  remove_item ".idea" "IntelliJ/WebStorm IDE settings"
  remove_item ".project" "Eclipse project file"
  remove_item ".classpath" "Eclipse classpath file"
  remove_item ".c9" "Cloud9 IDE settings"
  remove_item ".settings" "Eclipse settings directory"
  remove_pattern "*.launch" "Eclipse launch configurations"
  remove_pattern "*.sublime-workspace" "Sublime Text workspace"
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Cleaning SonarQube Artifacts${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  remove_item ".scannerwork" "SonarQube scanner cache"
  remove_item "reports" "Analysis reports"
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Cleaning System Files${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  remove_pattern ".DS_Store" "macOS folder metadata"
  remove_pattern "Thumbs.db" "Windows thumbnail cache"
  remove_pattern ".directory" "KDE directory metadata"
  
  # Clean empty directories if flag set
  if [[ "$EMPTY_DIRS" == "true" ]]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Cleaning Empty Directories${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    empty_dirs_removed=0
    while IFS= read -r -d '' dir; do
      if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}[DRY RUN] Would remove empty directory: $dir${NC}"
        ((empty_dirs_removed++))
      else
        if rmdir "$dir" 2>/dev/null; then
          echo -e "${GREEN}Removed empty directory: $dir${NC}"
          ((empty_dirs_removed++))
          ((CLEANED_COUNT++))
        fi
      fi
    done < <(find . -type d -empty -not -path "./.git/*" -not -path "./node_modules/*" \
      -not -path "./src/*" -not -path "./scripts/*" \
      -not -path "./docs/*" -not -path "./.github/*" -print0 2>/dev/null)
    
    if [[ $empty_dirs_removed -eq 0 ]]; then
      echo -e "${YELLOW}No empty directories found${NC}"
    fi
  fi
  
  # Clean node_modules if applicable
  if [[ "$SKIP_MODULES" != "true" ]]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Cleaning Dependencies${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [[ -d "node_modules" ]]; then
      if confirm_action "⚠ The following will permanently delete your dependencies:
  - node_modules/

Remove node_modules? This will require running 'npm install' again."; then
        remove_item "node_modules" "Dependencies"
      else
        echo -e "${YELLOW}Skipping: node_modules${NC} ${YELLOW}(user cancelled)${NC}"
      fi
    else
      echo -e "${YELLOW}Skipping: node_modules${NC} ${YELLOW}(not found)${NC}"
    fi
  fi
fi

# Generate summary report
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Cleaning Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Successfully cleaned: $CLEANED_COUNT items${NC}"

if [[ $FAILED_COUNT -gt 0 ]]; then
  echo -e "${RED}✗ Failed to clean: $FAILED_COUNT items${NC}"
  for item in "${FAILED_ITEMS[@]}"; do
    echo -e "${RED}  - $item${NC}"
  done
fi

# Show next steps if needed
if [[ " ${CLEANED_TARGETS[@]} " =~ " node_modules " ]] && [[ "$DRY_RUN" != "true" ]]; then
  echo ""
  echo -e "${YELLOW}⚠ node_modules was removed${NC}"
  echo "Run 'npm install' to reinstall dependencies"
fi

# Exit with appropriate code
if [[ $FAILED_COUNT -gt 0 ]]; then
  exit 1
else
  exit 0
fi
