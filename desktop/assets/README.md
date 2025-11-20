# Lit-Rift Desktop Icons & Assets

This directory contains source assets for the Lit-Rift desktop application.

## Files

- **icon.svg** - Main application icon (512x512 source)
- **tray-icon.svg** - System tray icon (64x64 source, simplified monochrome)
- **generate-icons.sh** - Automated icon generation script

## Quick Start

### Automatic Generation (Recommended)

```bash
./generate-icons.sh
```

This will generate all required platform-specific icons:
- `icon.ico` - Windows icon (multi-size: 16, 24, 32, 48, 64, 128, 256)
- `icon.icns` - macOS icon (multi-resolution: 16-1024px with retina)
- `icon.png` - Linux icon (512x512)
- `tray-icon.png` - System tray (16x16)
- `tray-icon@2x.png` - System tray retina (32x32)

### Prerequisites

**Linux:**
```bash
sudo apt-get install librsvg2-bin imagemagick icoutils
```

**macOS:**
```bash
brew install librsvg imagemagick
# iconutil is built-in on macOS
```

**Windows:**
Install Git Bash or WSL2 with the above Linux packages.

## Manual Generation

If you prefer to use your own tools:

### From SVG to PNG
```bash
# Install Inkscape or use online converters
inkscape icon.svg -w 512 -h 512 -o icon-512.png
```

### Create .ico (Windows)
Use online tools like:
- https://convertio.co/png-ico/
- https://icoconvert.com/

Recommended sizes: 16, 32, 48, 64, 128, 256

### Create .icns (macOS)
On macOS only:
```bash
# Create iconset directory
mkdir icon.iconset

# Add all sizes (see generate-icons.sh for naming convention)
# Then convert
iconutil -c icns icon.iconset -o icon.icns
```

Or use online tools:
- https://cloudconvert.com/png-to-icns

## Customizing Icons

Edit the SVG files in any vector editor:
- Adobe Illustrator
- Inkscape (free)
- Figma (web-based)
- Sketch (macOS)

**Design Guidelines:**
- Keep it simple and recognizable at small sizes (16x16)
- Use high contrast for the tray icon
- Test at multiple sizes
- Maintain square aspect ratio
- Use padding (safe area: 10% margin)

## Icon Specifications

### Main App Icon
- **Windows:** .ico with sizes: 16, 32, 48, 64, 128, 256px
- **macOS:** .icns with sizes: 16-1024px (retina variants)
- **Linux:** .png at 512x512px (also useful: 256, 128, 64, 32)

### Tray Icon
- **Size:** 16x16px (and 32x32 for retina)
- **Style:** Monochrome or simple color
- **Format:** PNG with transparency
- **Note:** System tray renders small, keep design minimal

## Testing Icons

After generation, test icons by building the app:

```bash
cd ../desktop
npm run build
```

Check the generated installers:
- Windows: Look for icon in installer and installed app
- macOS: Check DMG and Applications folder
- Linux: AppImage icon should appear in launcher

## Troubleshooting

**Icons appear blurry**
- Ensure you're generating from SVG at full resolution
- Check that .ico/.icns files contain multiple sizes

**Tray icon too dark/invisible**
- System tray adapts to dark/light mode
- Test both modes: macOS (dark/light), Windows (light/dark themes)
- Consider providing separate light/dark variants

**macOS icon has white background**
- Ensure your PNG has transparency
- Check SVG doesn't have background rect

**Icon not updating after rebuild**
- Clear Electron cache: `rm -rf ~/Library/Caches/lit-rift-desktop`
- On Windows: Delete app and reinstall

## Resources

- [Electron Icon Guide](https://www.electron.build/icons)
- [macOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows Icon Standards](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design)

## License

Icons are part of the Lit-Rift project and share the same license.
