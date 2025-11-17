# Image Optimization Guide

The `LazyImage` component provides automatic image optimization with lazy loading, WebP support, and responsive images.

## Quick Start

```typescript
import LazyImage from '../components/LazyImage';

function MyComponent() {
  return (
    <LazyImage
      src="/images/photo.jpg"
      alt="Description of image"
      width={400}
      height={300}
    />
  );
}
```

## Features

### ✅ Lazy Loading
Images only load when they're about to enter the viewport (50px before). This dramatically improves initial page load time.

### ✅ WebP Support
Automatically serves WebP format (30% smaller than JPEG) to supported browsers, with fallback to original format.

### ✅ Responsive Images
Support for `srcSet` and `sizes` to serve appropriately sized images based on screen size.

### ✅ Loading Skeleton
Shows a Material-UI skeleton animation while image loads for better UX.

### ✅ Error Handling
Gracefully handles failed image loads with a fallback UI.

## Usage Examples

### Basic Usage
```typescript
<LazyImage
  src="/images/photo.jpg"
  alt="Beautiful landscape"
  width={800}
  height={600}
/>
```

### With WebP Format
```typescript
import LazyImage, { toWebP } from '../components/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  webpSrc={toWebP('/images/photo.jpg')}  // /images/photo.webp
  alt="Optimized image"
  width="100%"
  height={400}
/>
```

### Responsive Images
```typescript
import LazyImage, { generateSrcSet, generateSizes } from '../components/LazyImage';

<LazyImage
  src="/images/photo.jpg"
  srcSet={generateSrcSet('/images/photo.jpg', [400, 800, 1200])}
  sizes={generateSizes({ xs: 400, sm: 800, md: 1200 })}
  alt="Responsive image"
  width="100%"
  objectFit="cover"
/>
```

### Above-the-Fold Images (Priority Loading)
```typescript
<LazyImage
  src="/images/hero.jpg"
  alt="Hero image"
  loading="eager"  // Load immediately, don't wait for viewport
  width="100%"
  height={500}
/>
```

### Custom Placeholder
```typescript
<LazyImage
  src="/images/photo.jpg"
  alt="Custom placeholder"
  placeholder={
    <Box sx={{
      width: '100%',
      height: '100%',
      bgcolor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      Loading...
    </Box>
  }
/>
```

### With Callbacks
```typescript
<LazyImage
  src="/images/photo.jpg"
  alt="Image with callbacks"
  onLoad={() => console.log('Image loaded!')}
  onError={() => console.error('Failed to load image')}
  width={400}
  height={300}
/>
```

### Card Image Example
```typescript
<Card>
  <LazyImage
    src="/images/project-thumbnail.jpg"
    webpSrc={toWebP('/images/project-thumbnail.jpg')}
    alt="Project thumbnail"
    width="100%"
    height={200}
    objectFit="cover"
    borderRadius={1}
  />
  <CardContent>
    <Typography variant="h6">Project Title</Typography>
  </CardContent>
</Card>
```

## Converting Images to WebP

### Using Online Tools
1. [Squoosh](https://squoosh.app/) - Google's image converter
2. [CloudConvert](https://cloudconvert.com/jpg-to-webp)

### Using Command Line (ImageMagick)
```bash
# Convert single image
convert photo.jpg photo.webp

# Convert all JPGs in directory
for file in *.jpg; do
  convert "$file" "${file%.jpg}.webp"
done
```

### Using Node.js (sharp)
```javascript
const sharp = require('sharp');

sharp('photo.jpg')
  .webp({ quality: 80 })
  .toFile('photo.webp');
```

## Best Practices

### ✅ DO:
- Use `loading="eager"` for above-the-fold images (hero images, logos)
- Provide WebP versions for all images
- Use responsive images for content that scales across devices
- Set explicit `width` and `height` to prevent layout shift
- Compress images before uploading (use tools like TinyPNG)
- Use appropriate `objectFit` values:
  - `cover` for thumbnails (fills container, crops if needed)
  - `contain` for product images (shows full image, may have empty space)

### ❌ DON'T:
- Load all images eagerly (hurts performance)
- Serve unnecessarily large images
- Forget alt text (critical for accessibility)
- Use images for text (bad for SEO and accessibility)

## Performance Tips

### 1. Optimize Image Sizes
```
Small (400px): Thumbnails, mobile views
Medium (800px): Tablet, card images
Large (1200px): Desktop, hero images
XL (1920px): Full-screen backgrounds
```

### 2. Image Formats by Use Case
- **Photos**: WebP (first choice), JPEG (fallback)
- **Graphics/Logos**: WebP, PNG
- **Icons**: SVG (always)
- **Animations**: WebP animated, GIF (fallback)

### 3. Compression Guidelines
- **High Quality**: 80-90% (hero images, products)
- **Good Quality**: 70-80% (content images)
- **Acceptable Quality**: 60-70% (thumbnails, backgrounds)

## Measuring Impact

### Before Optimization:
- Large initial bundle
- Slow page load
- Poor Lighthouse score

### After Optimization:
- Smaller initial bundle (only visible images load)
- Fast initial render
- Better LCP (Largest Contentful Paint)
- Higher Lighthouse score

### Check with Lighthouse:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Check "Performance" and "Best Practices" scores

## Integration with Existing Components

### HomePage Project Cards
```typescript
// Before
<img src={project.thumbnailUrl} alt={project.title} />

// After
<LazyImage
  src={project.thumbnailUrl}
  webpSrc={toWebP(project.thumbnailUrl)}
  alt={project.title}
  width="100%"
  height={200}
  objectFit="cover"
/>
```

### EditorPage Scene Thumbnails
```typescript
<LazyImage
  src={scene.imageUrl}
  alt={`Scene ${scene.number}`}
  width={150}
  height={100}
  objectFit="cover"
  borderRadius={1}
  loading="lazy"
/>
```

## Future Enhancements

### Planned Features:
- [ ] Blur-up technique (show tiny blurred version while loading)
- [ ] AVIF format support (next-gen format, even better than WebP)
- [ ] Progressive JPEG loading
- [ ] Image CDN integration (Cloudinary, Imgix)
- [ ] Automatic image optimization on upload

### Advanced Usage:
- Dynamic image resizing based on viewport
- Art direction (different crops for mobile/desktop)
- Dark mode image variants
- Placeholder color extraction from image

## Resources

- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [WebP Documentation](https://developers.google.com/speed/webp)
- [Responsive Images MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Lighthouse Performance](https://developer.chrome.com/docs/lighthouse/performance/)
