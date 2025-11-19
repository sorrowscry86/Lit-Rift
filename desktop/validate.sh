#!/bin/bash
# Quick Validation Script for Lit-Rift Desktop Architecture

echo "======================================"
echo "  Lit-Rift Desktop Validation"
echo "======================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAIL++))
    fi
}

echo "Checking file structure..."
echo ""

# Check Electron files
test -f "$SCRIPT_DIR/main.js"
check $? "Electron main.js exists"

test -f "$SCRIPT_DIR/preload.js"
check $? "Electron preload.js exists"

test -f "$SCRIPT_DIR/package.json"
check $? "Electron package.json exists"

# Check PyInstaller spec
test -f "$PROJECT_ROOT/backend/lit-rift.spec"
check $? "PyInstaller spec file exists"

# Check build script
test -f "$SCRIPT_DIR/build-desktop.sh"
check $? "Build script exists"

test -x "$SCRIPT_DIR/build-desktop.sh"
check $? "Build script is executable"

# Check documentation
test -f "$SCRIPT_DIR/README.md"
check $? "Desktop README exists"

# Check source directories
test -d "$PROJECT_ROOT/frontend"
check $? "Frontend directory exists"

test -d "$PROJECT_ROOT/backend"
check $? "Backend directory exists"

test -f "$PROJECT_ROOT/backend/app.py"
check $? "Flask app.py exists"

test -f "$PROJECT_ROOT/frontend/package.json"
check $? "Frontend package.json exists"

echo ""
echo "Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check 0 "Node.js installed ($NODE_VERSION)"
else
    check 1 "Node.js installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check 0 "npm installed ($NPM_VERSION)"
else
    check 1 "npm installed"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check 0 "Python 3 installed ($PYTHON_VERSION)"
else
    check 1 "Python 3 installed"
fi

# Check pip
if command -v pip &> /dev/null || command -v pip3 &> /dev/null; then
    check 0 "pip installed"
else
    check 1 "pip installed"
fi

# Check PyInstaller
if command -v pyinstaller &> /dev/null; then
    PYINSTALLER_VERSION=$(pyinstaller --version 2>&1)
    check 0 "PyInstaller installed ($PYINSTALLER_VERSION)"
else
    check 1 "PyInstaller installed (run: pip install pyinstaller)"
fi

echo ""
echo "Validating configuration files..."
echo ""

# Validate package.json syntax
if command -v node &> /dev/null; then
    if node -e "require('$SCRIPT_DIR/package.json')" 2>/dev/null; then
        check 0 "Electron package.json is valid JSON"
    else
        check 1 "Electron package.json is valid JSON"
    fi
fi

# Check for required npm scripts
if grep -q '"start"' "$SCRIPT_DIR/package.json"; then
    check 0 "Start script configured"
else
    check 1 "Start script configured"
fi

if grep -q '"build".*"electron-builder"' "$SCRIPT_DIR/package.json"; then
    check 0 "Build script configured"
else
    check 1 "Build script configured"
fi

# Validate main.js syntax
if command -v node &> /dev/null; then
    if node --check "$SCRIPT_DIR/main.js" 2>/dev/null; then
        check 0 "main.js syntax is valid"
    else
        check 1 "main.js syntax is valid"
    fi
fi

# Validate preload.js syntax
if command -v node &> /dev/null; then
    if node --check "$SCRIPT_DIR/preload.js" 2>/dev/null; then
        check 0 "preload.js syntax is valid"
    else
        check 1 "preload.js syntax is valid"
    fi
fi

echo ""
echo "======================================"
echo "  Validation Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All validation checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./build-desktop.sh"
    echo "  2. Then: cd desktop && npm run dev"
    echo ""
    exit 0
else
    echo -e "${RED}⚠ Some validation checks failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    echo ""
    exit 1
fi
