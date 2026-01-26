import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize TestBed for all tests
try {
  getTestBed().resetTestEnvironment();
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {
  console.log('TestBed already initialized, skipping initialization');
}

// Global mocks for jsdom
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {})
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance']
});

// Only define transform property if it doesn't already exist
if (!document.body.style.transform) {
  try {
    // Use Object.defineProperty carefully to avoid redefining issues
    Object.defineProperty(document.body.style, 'transform', {
      configurable: true,
      enumerable: true,
      value: () => ({
        enumerable: true,
        configurable: true
      })
    });
  } catch (e) {
    console.log(
      'Cannot define transform property, it may already be defined:',
      e
    );
  }
}

// Angular material mocks
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

// Polyfill structuredClone for older Node.js versions
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    if (options?.threshold !== undefined) {
      if (Array.isArray(options.threshold)) {
        this.thresholds = options.threshold;
      } else {
        this.thresholds = [options.threshold];
      }
    } else {
      this.thresholds = [0];
    }
  }

  observe(target: Element): void {
    // Mock implementation - do nothing
  }

  unobserve(target: Element): void {
    // Mock implementation - do nothing
  }

  disconnect(): void {
    // Mock implementation - do nothing
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Add to global
global.IntersectionObserver = MockIntersectionObserver as any;

// Mock SITNA_BASE_URL for api-sitna library
(globalThis as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
  '/assets/js/api-sitna/';
(window as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
  '/assets/js/api-sitna/';

// Mock WebGL and Canvas APIs that may be required by api-sitna
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function (contextType: string) {
    if (
      contextType === 'webgl' ||
      contextType === 'webgl2' ||
      contextType === '2d'
    ) {
      return {
        canvas: this,
        drawingBufferWidth: 800,
        drawingBufferHeight: 600,
        getParameter: () => null,
        getExtension: () => null,
        createShader: () => null,
        shaderSource: () => {},
        compileShader: () => {},
        getShaderParameter: () => true,
        createProgram: () => null,
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        getUniformLocation: () => null,
        uniformMatrix4fv: () => {},
        createBuffer: () => null,
        bindBuffer: () => {},
        bufferData: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        drawArrays: () => {},
        clear: () => {},
        clearColor: () => {},
        viewport: () => {}
      };
    }
    return null;
  }
});
