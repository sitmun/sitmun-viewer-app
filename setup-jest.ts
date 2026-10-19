import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

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

if (!document.body.style.transform) {
  try {
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

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: unknown) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

class MockIntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(
    _callback: IntersectionObserverCallback,
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

  observe(_target: Element): void {}

  unobserve(_target: Element): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver as typeof IntersectionObserver;

(globalThis as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
  '/assets/js/api-sitna/';
(window as { SITNA_BASE_URL?: string }).SITNA_BASE_URL =
  '/assets/js/api-sitna/';

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
