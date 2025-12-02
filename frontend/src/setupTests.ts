// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required by Firebase and other libraries)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill for ReadableStream (required by Firebase and undici)
import { ReadableStream } from 'stream/web';
(global as any).ReadableStream = ReadableStream;

// Mock Firebase to avoid initialization in tests
jest.mock('./config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
  isOfflineMode: false,
}));

// Mock Sentry to avoid initialization in tests
jest.mock('./config/sentry', () => ({
  initSentry: jest.fn(),
  setSentryUser: jest.fn(),
  clearSentryUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
};

// Mock HTMLCanvasElement.prototype.getContext for WebP detection
HTMLCanvasElement.prototype.getContext = function(contextId: string) {
  if (contextId === '2d') {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn().mockReturnValue({ data: [] }),
      putImageData: jest.fn(),
      createImageData: jest.fn().mockReturnValue([]),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 0 }),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
} as any;

// Mock canvas.toDataURL for WebP support check
HTMLCanvasElement.prototype.toDataURL = function(type?: string) {
  if (type === 'image/webp') {
    return 'data:image/webp;base64,mock';
  }
  return 'data:image/png;base64,mock';
};
