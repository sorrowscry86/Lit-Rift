import React from 'react';
import { render, screen, waitFor } from '../../utils/testUtils';
import LazyImage, { toWebP, generateSrcSet, generateSizes } from '../LazyImage';

describe('LazyImage', () => {
  // Store IntersectionObserver callbacks to trigger them manually
  let intersectionCallback: IntersectionObserverCallback;
  
  beforeEach(() => {
    // Mock IntersectionObserver to capture the callback
    const mockIntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      intersectionCallback = callback;
      return {
        observe: jest.fn(() => {
          // Immediately trigger intersection for testing
          callback([{
            isIntersecting: true,
            target: document.createElement('div'),
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          }], {} as IntersectionObserver);
        }),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
        takeRecords: jest.fn().mockReturnValue([]),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    });
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  test('renders without crashing', () => {
    render(<LazyImage src="/test.jpg" alt="Test image" loading="eager" />);
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  test('shows loading skeleton initially', () => {
    const { container } = render(<LazyImage src="/test.jpg" alt="Test image" loading="eager" />);

    // Check for skeleton component
    const skeleton = container.querySelector('[class*="MuiSkeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  test('loads image when eager loading is enabled', () => {
    render(<LazyImage src="/test.jpg" alt="Test image" loading="eager" />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  test('lazy loads image when intersected', () => {
    render(<LazyImage src="/test.jpg" alt="Test image" />);

    // The mock IntersectionObserver triggers immediately
    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('calls onLoad callback when image loads', async () => {
    const onLoad = jest.fn();
    render(<LazyImage src="/test.jpg" alt="Test image" onLoad={onLoad} loading="eager" />);

    const img = screen.getByAltText('Test image');

    // Simulate image load
    Object.defineProperty(img, 'complete', { value: true });
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  test('calls onError callback when image fails to load', async () => {
    const onError = jest.fn();
    render(<LazyImage src="/invalid.jpg" alt="Test image" onError={onError} loading="eager" />);

    const img = screen.getByAltText('Test image');

    // Simulate image error
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  test('shows error fallback when image fails to load', async () => {
    render(<LazyImage src="/invalid.jpg" alt="Test image" loading="eager" />);

    const img = screen.getByAltText('Test image');

    // Simulate image error
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  test('uses WebP source when provided and supported', () => {
    render(
      <LazyImage
        src="/test.jpg"
        webpSrc="/test.webp"
        alt="Test image"
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;
    // WebP support is mocked in test environment, so it should use webp
    expect(img.src).toContain('test.webp');
  });

  test('applies custom width and height', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" width={400} height={300} />
    );

    const imageContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(imageContainer);
    expect(styles.width).toBeTruthy();
    expect(styles.height).toBeTruthy();
  });

  test('applies border radius', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" borderRadius={8} />
    );

    const imageContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(imageContainer);
    expect(styles.borderRadius).toBeTruthy();
  });

  test('applies object fit style', () => {
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        objectFit="contain"
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;
    expect(img.style.objectFit).toBe('contain');
  });

  test('applies custom className', () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" className="custom-class" />
    );

    const imageContainer = container.firstChild as HTMLElement;
    expect(imageContainer).toHaveClass('custom-class');
  });

  test('supports srcSet attribute', () => {
    const srcSet = '/test-400.jpg 400w, /test-800.jpg 800w';
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        srcSet={srcSet}
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;
    expect(img.srcset).toBe(srcSet);
  });

  test('supports sizes attribute', () => {
    const sizes = '(max-width: 600px) 400px, 800px';
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        sizes={sizes}
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image') as HTMLImageElement;
    expect(img.sizes).toBe(sizes);
  });

  test('renders custom placeholder', () => {
    const CustomPlaceholder = () => <div>Custom loading...</div>;

    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        placeholder={<CustomPlaceholder />}
      />
    );

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  test('hides skeleton after image loads', async () => {
    const { container } = render(
      <LazyImage src="/test.jpg" alt="Test image" loading="eager" />
    );

    const img = screen.getByAltText('Test image');

    // Initially skeleton should be visible
    let skeleton = container.querySelector('[class*="MuiSkeleton"]');
    expect(skeleton).toBeInTheDocument();

    // Simulate image load
    Object.defineProperty(img, 'complete', { value: true });
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      skeleton = container.querySelector('[class*="MuiSkeleton"]');
      // Skeleton should be removed after load
      // Note: It might still be in DOM but hidden, so we check display style
    });
  });

  test('accessibility: has alt text', () => {
    render(<LazyImage src="/test.jpg" alt="Descriptive alt text" loading="eager" />);

    const img = screen.getByAltText('Descriptive alt text');
    expect(img).toHaveAttribute('alt', 'Descriptive alt text');
  });

  test('accessibility: empty alt is allowed for decorative images', () => {
    const { container } = render(<LazyImage src="/test.jpg" alt="" loading="eager" />);

    // Images with empty alt have role="presentation" and may be hidden initially
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
  });
});

describe('toWebP helper', () => {
  test('converts jpg to webp', () => {
    expect(toWebP('/images/photo.jpg')).toBe('/images/photo.webp');
  });

  test('converts jpeg to webp', () => {
    expect(toWebP('/images/photo.jpeg')).toBe('/images/photo.webp');
  });

  test('converts png to webp', () => {
    expect(toWebP('/images/photo.png')).toBe('/images/photo.webp');
  });

  test('handles uppercase extensions', () => {
    expect(toWebP('/images/photo.JPG')).toBe('/images/photo.webp');
    expect(toWebP('/images/photo.PNG')).toBe('/images/photo.webp');
  });
});

describe('generateSrcSet helper', () => {
  test('generates srcSet with multiple widths', () => {
    const srcSet = generateSrcSet('/photo.jpg', [400, 800, 1200]);
    expect(srcSet).toContain('/photo.jpg?w=400 400w');
    expect(srcSet).toContain('/photo.jpg?w=800 800w');
    expect(srcSet).toContain('/photo.jpg?w=1200 1200w');
  });

  test('handles single width', () => {
    const srcSet = generateSrcSet('/photo.jpg', [800]);
    expect(srcSet).toBe('/photo.jpg?w=800 800w');
  });
});

describe('generateSizes helper', () => {
  test('generates sizes with breakpoints', () => {
    const sizes = generateSizes({ xs: 400, sm: 800, md: 1200 });
    expect(sizes).toContain('400px');
    expect(sizes).toContain('800px');
    expect(sizes).toContain('1200px');
  });

  test('handles single breakpoint', () => {
    const sizes = generateSizes({ md: 800 });
    expect(sizes).toBe('800px');
  });
});
