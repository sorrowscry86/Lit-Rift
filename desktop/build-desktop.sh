#!/bin/bash
set -e

# Lit-Rift Desktop Build Script
# This script builds the complete desktop application

echo "======================================"
echo "  Lit-Rift Desktop Build Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check for PyInstaller
if ! command -v pyinstaller &> /dev/null; then
    echo -e "${BLUE}Installing PyInstaller...${NC}"
    pip install pyinstaller
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

echo -e "${BLUE}[2/5]${NC} Building React frontend..."
cd "$PROJECT_ROOT/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build production React app
npm run build

echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

echo -e "${BLUE}[3/5]${NC} Bundling Flask backend with PyInstaller..."
cd "$PROJECT_ROOT/backend"

# Install backend dependencies if needed
if ! python3 -c "import flask" &> /dev/null; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Run PyInstaller
pyinstaller lit-rift.spec --clean

echo -e "${GREEN}✓ Backend bundled${NC}"
echo ""

echo -e "${BLUE}[4/5]${NC} Copying files to desktop directory..."

# Copy React build to desktop
rm -rf "$SCRIPT_DIR/build"
cp -r "$PROJECT_ROOT/frontend/build" "$SCRIPT_DIR/build"

# Copy backend dist to desktop
rm -rf "$SCRIPT_DIR/backend-dist"
cp -r "$PROJECT_ROOT/backend/dist/lit-rift-backend" "$SCRIPT_DIR/backend-dist"

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

echo -e "${BLUE}[5/5]${NC} Installing Electron dependencies..."
cd "$SCRIPT_DIR"

# Install Electron dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${GREEN}✓ Electron dependencies installed${NC}"
echo ""

echo -e "${GREEN}======================================"
echo "  Build Complete!"
echo "======================================${NC}"
echo ""
echo "To run the desktop app in development mode:"
echo -e "  ${BLUE}cd desktop && npm run dev${NC}"
echo ""
echo "To package for distribution:"
echo -e "  ${BLUE}cd desktop && npm run build${NC}"
echo ""
echo "Platform-specific builds:"
echo -e "  ${BLUE}npm run build:win${NC}   - Windows (NSIS, Portable, MSI)"
echo -e "  ${BLUE}npm run build:mac${NC}   - macOS (DMG, ZIP)"
echo -e "  ${BLUE}npm run build:linux${NC} - Linux (AppImage, DEB, RPM)"
echo ""
