#!/bin/bash
# Icon Generation Script for Lit-Rift Desktop
# Requires: ImageMagick (convert), librsvg2-bin (rsvg-convert), icnsutils (png2icns), icoutils (icotool)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ASSETS_DIR="$SCRIPT_DIR"
BUILD_DIR="$SCRIPT_DIR/../build"
TEMP_DIR="$SCRIPT_DIR/temp"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "  Lit-Rift Icon Generator"
echo "======================================"
echo ""

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        echo "Install with: $2"
        return 1
    fi
    return 0
}

echo -e "${BLUE}Checking prerequisites...${NC}"
MISSING=0

if ! check_command "rsvg-convert" "sudo apt-get install librsvg2-bin (Linux) or brew install librsvg (macOS)"; then
    ((MISSING++))
fi

if ! check_command "convert" "sudo apt-get install imagemagick (Linux) or brew install imagemagick (macOS)"; then
    ((MISSING++))
fi

if [ $MISSING -gt 0 ]; then
    echo ""
    echo -e "${RED}Missing required tools. Please install them and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$TEMP_DIR"

# Generate PNG files from SVG
echo -e "${BLUE}[1/4] Generating PNG files from SVG...${NC}"

# Main app icon - various sizes
SIZES=(16 24 32 48 64 128 256 512 1024)

for SIZE in "${SIZES[@]}"; do
    echo "  - Generating ${SIZE}x${SIZE}..."
    rsvg-convert -w $SIZE -h $SIZE "$ASSETS_DIR/icon.svg" -o "$TEMP_DIR/icon-${SIZE}.png"
done

# Tray icon sizes
echo "  - Generating tray icon..."
rsvg-convert -w 16 -h 16 "$ASSETS_DIR/tray-icon.svg" -o "$BUILD_DIR/tray-icon.png"
rsvg-convert -w 32 -h 32 "$ASSETS_DIR/tray-icon.svg" -o "$BUILD_DIR/tray-icon@2x.png"

echo -e "${GREEN}✓ PNG files generated${NC}"
echo ""

# Generate Windows .ico file
echo -e "${BLUE}[2/4] Generating Windows .ico file...${NC}"

if command -v icotool &> /dev/null; then
    # Using icotool (preferred)
    icotool -c -o "$BUILD_DIR/icon.ico" \
        "$TEMP_DIR/icon-16.png" \
        "$TEMP_DIR/icon-24.png" \
        "$TEMP_DIR/icon-32.png" \
        "$TEMP_DIR/icon-48.png" \
        "$TEMP_DIR/icon-64.png" \
        "$TEMP_DIR/icon-128.png" \
        "$TEMP_DIR/icon-256.png"
    echo -e "${GREEN}✓ Windows icon created with icotool${NC}"
elif command -v convert &> /dev/null; then
    # Fallback to ImageMagick
    convert "$TEMP_DIR/icon-256.png" \
        "$TEMP_DIR/icon-128.png" \
        "$TEMP_DIR/icon-64.png" \
        "$TEMP_DIR/icon-48.png" \
        "$TEMP_DIR/icon-32.png" \
        "$TEMP_DIR/icon-16.png" \
        "$BUILD_DIR/icon.ico"
    echo -e "${GREEN}✓ Windows icon created with ImageMagick${NC}"
else
    echo -e "${RED}✗ Could not create .ico file (install icotool or imagemagick)${NC}"
fi

echo ""

# Generate macOS .icns file
echo -e "${BLUE}[3/4] Generating macOS .icns file...${NC}"

if command -v png2icns &> /dev/null; then
    # Using png2icns (simple method)
    png2icns "$BUILD_DIR/icon.icns" "$TEMP_DIR/icon-1024.png"
    echo -e "${GREEN}✓ macOS icon created with png2icns${NC}"
elif [ "$(uname)" = "Darwin" ]; then
    # Manual method for macOS
    ICONSET_DIR="$TEMP_DIR/icon.iconset"
    mkdir -p "$ICONSET_DIR"

    # Copy files with proper naming for iconutil
    cp "$TEMP_DIR/icon-16.png" "$ICONSET_DIR/icon_16x16.png"
    cp "$TEMP_DIR/icon-32.png" "$ICONSET_DIR/icon_16x16@2x.png"
    cp "$TEMP_DIR/icon-32.png" "$ICONSET_DIR/icon_32x32.png"
    cp "$TEMP_DIR/icon-64.png" "$ICONSET_DIR/icon_32x32@2x.png"
    cp "$TEMP_DIR/icon-128.png" "$ICONSET_DIR/icon_128x128.png"
    cp "$TEMP_DIR/icon-256.png" "$ICONSET_DIR/icon_128x128@2x.png"
    cp "$TEMP_DIR/icon-256.png" "$ICONSET_DIR/icon_256x256.png"
    cp "$TEMP_DIR/icon-512.png" "$ICONSET_DIR/icon_256x256@2x.png"
    cp "$TEMP_DIR/icon-512.png" "$ICONSET_DIR/icon_512x512.png"
    cp "$TEMP_DIR/icon-1024.png" "$ICONSET_DIR/icon_512x512@2x.png"

    # Convert to icns
    iconutil -c icns "$ICONSET_DIR" -o "$BUILD_DIR/icon.icns"
    echo -e "${GREEN}✓ macOS icon created with iconutil${NC}"
else
    echo -e "${RED}✗ macOS .icns creation only available on macOS or with png2icns${NC}"
    echo "  You can create it later on a Mac, or install png2icns"
fi

echo ""

# Copy Linux PNG icon
echo -e "${BLUE}[4/4] Creating Linux icon...${NC}"
cp "$TEMP_DIR/icon-512.png" "$BUILD_DIR/icon.png"
echo -e "${GREEN}✓ Linux PNG icon created${NC}"
echo ""

# Cleanup
echo -e "${BLUE}Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo "======================================"
echo "  Icon Generation Complete!"
echo "======================================"
echo ""
echo "Generated files in $BUILD_DIR:"
echo "  - icon.ico (Windows)"
echo "  - icon.icns (macOS)"
echo "  - icon.png (Linux - 512x512)"
echo "  - tray-icon.png (System tray - 16x16)"
echo "  - tray-icon@2x.png (System tray - 32x32)"
echo ""
echo "You can now build your desktop app with:"
echo "  cd ../desktop && npm run build"
echo ""
