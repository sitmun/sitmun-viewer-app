import {
  classifyHtmlGfiIframe,
  hidePendingHtmlGfiIframes,
  settleHtmlGfiIframes
} from './html-gfi-embed.util';

function iframeWith(
  src: string,
  access: {
    contentDocument?: Document | null;
    href?: string;
    throwOnAccess?: boolean;
  }
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', src);
  Object.defineProperty(iframe, 'src', { configurable: true, value: src });
  Object.defineProperty(iframe, 'contentDocument', {
    configurable: true,
    get: () => {
      if (access.throwOnAccess) {
        throw new DOMException('Blocked a frame', 'SecurityError');
      }
      return access.contentDocument === undefined ? document : access.contentDocument;
    }
  });
  Object.defineProperty(iframe, 'contentWindow', {
    configurable: true,
    get: () => {
      if (access.throwOnAccess) {
        throw new DOMException('Blocked a frame', 'SecurityError');
      }
      return { location: { href: Object.prototype.hasOwnProperty.call(access, 'href') ? access.href : 'about:blank' } };
    }
  });
  return iframe;
}

describe('html-gfi-embed.util', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('reveals a cross-origin embed when location access throws SecurityError', async () => {
    const iframe = iframeWith('https://cadastre.example/gfi.html', { throwOnAccess: true });
    document.body.appendChild(iframe);
    const openWindow = jest.fn();
    const done = settleHtmlGfiIframes(document.body, openWindow, 1000);
    iframe.dispatchEvent(new Event('load'));
    await done;
    expect(iframe.style.visibility).toBe('visible');
    expect(openWindow).not.toHaveBeenCalled();
  });

  it('opens a tab and keeps the iframe hidden when load leaves about:blank', async () => {
    const iframe = iframeWith('https://cadastre.example/gfi.html', {
      contentDocument: document.implementation.createHTMLDocument(),
      href: 'about:blank'
    });
    document.body.appendChild(iframe);
    const openWindow = jest.fn();
    const done = settleHtmlGfiIframes(document.body, openWindow, 1000);
    iframe.dispatchEvent(new Event('load'));
    await done;
    expect(iframe.style.visibility).toBe('hidden');
    expect(openWindow).toHaveBeenCalledWith(
      'https://cadastre.example/gfi.html',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('opens a tab when load leaves an empty or about:blank nested document', () => {
    const blank = iframeWith('https://cadastre.example/gfi.html', {
      contentDocument: document.implementation.createHTMLDocument(),
      href: 'about:blank'
    });
    expect(classifyHtmlGfiIframe(blank)).toBe('open-tab');
    const empty = iframeWith('https://cadastre.example/gfi.html', {
      contentDocument: document.implementation.createHTMLDocument(),
      href: ''
    });
    expect(classifyHtmlGfiIframe(empty)).toBe('open-tab');
    const missing = iframeWith('https://cadastre.example/gfi.html', {
      contentDocument: document.implementation.createHTMLDocument(),
      href: undefined
    });
    expect(classifyHtmlGfiIframe(missing)).toBe('open-tab');
  });

  it('reveals when contentDocument is null', () => {
    const iframe = iframeWith('https://cadastre.example/gfi.html', { contentDocument: null });
    expect(classifyHtmlGfiIframe(iframe)).toBe('reveal');
  });

  it('is a no-op when the root has no HTML GFI iframe', async () => {
    const openWindow = jest.fn();
    await settleHtmlGfiIframes(document.body, openWindow, 50);
    expect(openWindow).not.toHaveBeenCalled();
  });

  it('hides pending iframes before the load probe', () => {
    const iframe = iframeWith('https://cadastre.example/gfi.html', { href: 'about:blank' });
    document.body.appendChild(iframe);
    const hidden = hidePendingHtmlGfiIframes(document.body);
    expect(hidden).toEqual([iframe]);
    expect(iframe.style.visibility).toBe('hidden');
  });
});
