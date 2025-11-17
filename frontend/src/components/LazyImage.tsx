import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyImageProps {
  /**
   * Image source URL (jpg, png, etc.)
   */
  src: string;

  /**
   * WebP source URL (optional but recommended for better performance)
   */
  webpSrc?: string;

  /**
   * Alt text for accessibility
   */
  alt: string;

  /**
   * Image width
   */
  width?: number | string;

  /**
   * Image height
   */
  height?: number | string;

  /**
   * Object fit CSS property
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /**
   * Border radius
   */
  borderRadius?: number | string;

  /**
   * Loading priority (eager for above-the-fold images, lazy for below-the-fold)
   */
  loading?: 'eager' | 'lazy';

  /**
   * Placeholder component to show while loading
   */
  placeholder?: React.ReactNode;

  /**
   * Callback when image loads
   */
  onLoad?: () => void;

  /**
   * Callback when image fails to load
   */
  onError?: () => void;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Responsive srcSet for different screen sizes
   */
  srcSet?: string;

  /**
   * Sizes attribute for responsive images
   */
  sizes?: string;
}

/**
 * LazyImage Component
 *
 * Optimized image component with:
 * - Lazy loading (only loads when in viewport)
 * - WebP format support (fallback to original format)
 * - Responsive images (srcSet support)
 * - Loading skeleton
 * - Error handling
 * - Intersection Observer for better performance
 */
export default function LazyImage({
  src,
  webpSrc,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = 0,
  loading = 'lazy',
  placeholder,
  onLoad,
  onError,
  className,
  srcSet,
  sizes,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) {
      onError();
    }
  };

  // Check if browser supports WebP
  const supportsWebP = (() => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  })();

  // Determine which image source to use
  const imageSrc = webpSrc && supportsWebP ? webpSrc : src;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius,
      }}
      className={className}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {placeholder || (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
            />
          )}
        </Box>
      )}

      {/* Error fallback */}
      {hasError && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Failed to load image
        </Box>
      )}

      {/* Actual image (only render when in view) */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: isLoaded ? 'block' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}
    </Box>
  );
}

/**
 * Helper function to generate WebP URLs
 * Usage: const webpUrl = toWebP('/images/photo.jpg')
 */
export function toWebP(url: string): string {
  // Replace file extension with .webp
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Helper function to generate srcSet for responsive images
 * Usage: const srcSet = generateSrcSet('/images/photo.jpg', [400, 800, 1200])
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => {
      // Assuming your CDN/server supports width query parameters
      const url = `${baseUrl}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Helper function to generate sizes attribute
 * Usage: const sizes = generateSizes({ sm: 400, md: 800, lg: 1200 })
 */
export function generateSizes(breakpoints: Record<string, number>): string {
  const entries = Object.entries(breakpoints);
  const lastIndex = entries.length - 1;

  return entries
    .map(([key, value], index) => {
      if (index === lastIndex) {
        return `${value}px`;
      }
      // Material-UI breakpoints
      const mediaQuery = {
        xs: '(max-width: 600px)',
        sm: '(max-width: 900px)',
        md: '(max-width: 1200px)',
        lg: '(max-width: 1536px)',
        xl: '(min-width: 1536px)',
      }[key] || `(max-width: 600px)`;

      return `${mediaQuery} ${value}px`;
    })
    .join(', ');
}
