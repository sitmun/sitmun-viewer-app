export type HtmlGfiEmbedAction = 'reveal' | 'open-tab';

export const HTML_GFI_EMBED_TIMEOUT_MS = 8000;

export function classifyHtmlGfiIframe(iframe: HTMLIFrameElement): HtmlGfiEmbedAction {
  try {
    if (iframe.contentDocument === null) {
      return 'reveal';
    }
    const href = iframe.contentWindow?.location.href;
    if (!href || href === 'about:blank') {
      return 'open-tab';
    }
    return 'reveal';
  } catch {
    return 'reveal';
  }
}

export function htmlGfiIframes(root: ParentNode): HTMLIFrameElement[] {
  return Array.from(root.querySelectorAll('iframe')).filter((el) => {
    const src = el.getAttribute('src');
    return !!src && src !== 'about:blank';
  });
}

export function hidePendingHtmlGfiIframes(root: ParentNode): HTMLIFrameElement[] {
  const iframes = htmlGfiIframes(root);
  for (const iframe of iframes) {
    iframe.style.visibility = 'hidden';
  }
  return iframes;
}

function navigationSettled(iframe: HTMLIFrameElement): boolean {
  try {
    if (iframe.contentDocument === null) {
      return true;
    }
    return iframe.contentWindow?.location.href !== 'about:blank';
  } catch {
    return true;
  }
}

export function waitForIframeLoad(
  iframe: HTMLIFrameElement,
  timeoutMs: number
): Promise<'load' | 'timeout'> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (outcome: 'load' | 'timeout') => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      iframe.removeEventListener('load', onLoad);
      resolve(outcome);
    };
    const onLoad = () => finish('load');
    const timer = window.setTimeout(() => finish('timeout'), timeoutMs);
    iframe.addEventListener('load', onLoad, { once: true });
    if (navigationSettled(iframe)) {
      queueMicrotask(() => finish('load'));
    }
  });
}

export async function settleHtmlGfiIframes(
  root: ParentNode,
  openWindow: (url: string, target: string, features: string) => Window | null,
  timeoutMs = HTML_GFI_EMBED_TIMEOUT_MS
): Promise<void> {
  const iframes = hidePendingHtmlGfiIframes(root);
  await Promise.all(
    iframes.map(async (iframe) => {
      const outcome = await waitForIframeLoad(iframe, timeoutMs);
      const action: HtmlGfiEmbedAction =
        outcome === 'timeout' ? 'open-tab' : classifyHtmlGfiIframe(iframe);
      switch (action) {
        case 'open-tab':
          openWindow(iframe.src, '_blank', 'noopener,noreferrer');
          return;
        case 'reveal':
          iframe.style.visibility = 'visible';
          return;
        default: {
          const _exhaustive: never = action;
          return _exhaustive;
        }
      }
    })
  );
}
