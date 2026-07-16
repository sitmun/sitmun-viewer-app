import { beforeAll, describe, expect, it } from '@jest/globals';

interface SitmunProxyAuthPolicy {
  isMiddlewareRequest(requestUrl: string, middlewareUrl: string | null | undefined): boolean;
}

type PolicyHost = typeof globalThis & {
  SitmunProxyAuthPolicy?: SitmunProxyAuthPolicy;
  location: { origin: string };
};

// IIFE asset: attaches SitmunProxyAuthPolicy on self/globalThis (same as the SW).
require('./service-worker-auth-policy.js');

const host = globalThis as PolicyHost;
const policy =
  host.SitmunProxyAuthPolicy ??
  (globalThis as unknown as { self?: PolicyHost }).self?.SitmunProxyAuthPolicy;

if (!policy) {
  throw new Error('SitmunProxyAuthPolicy was not attached');
}

type MiddlewareCase = readonly [
  name: string,
  requestUrl: string,
  middlewareUrl: string | null,
  expected: boolean
];

const cases: MiddlewareCase[] = [
  [
    'rejects origin-only middleware base',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    'http://localhost:9000',
    false
  ],
  [
    'rejects root-path middleware base',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    'http://localhost:9000/',
    false
  ],
  [
    'matches stack middleware child proxy path',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    'http://localhost:9000/middleware',
    true
  ],
  [
    'rejects sibling path prefix',
    'http://localhost:9000/middleware-other/proxy/1/1/wms/123',
    'http://localhost:9000/middleware',
    false
  ],
  [
    'matches when middleware base has trailing slash',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    'http://localhost:9000/middleware/',
    true
  ],
  [
    'rejects cross-origin request',
    'http://other.example.com/middleware/proxy/1/1/wms/123',
    'http://localhost:9000/middleware',
    false
  ],
  [
    'matches https default port 443 against bare host',
    'https://maps.example.com/middleware/proxy/1/2/wms/3',
    'https://maps.example.com:443/middleware',
    true
  ],
  [
    'rejects non-default port mismatch',
    'https://maps.example.com/middleware/proxy/1/2/wms/3',
    'https://maps.example.com:8443/middleware',
    false
  ],
  [
    'rejects null middleware URL',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    null,
    false
  ],
  [
    'rejects invalid middleware URL',
    'http://localhost:9000/middleware/proxy/1/1/wms/123',
    'http://[',
    false
  ]
];

describe('SitmunProxyAuthPolicy.isMiddlewareRequest', () => {
  beforeAll(() => {
    Object.defineProperty(host, 'location', {
      configurable: true,
      value: { origin: 'http://localhost:9000' }
    });
  });

  it.each(cases)(
    '%s',
    (_name: string, requestUrl: string, middlewareUrl: string | null, expected: boolean) => {
      expect(policy.isMiddlewareRequest(requestUrl, middlewareUrl)).toBe(expected);
    }
  );
});
