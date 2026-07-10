interface ProxyAuthPolicy {
  getMessageType(status: number): string | null;
  isMiddlewareRequest(requestUrl: string, middlewareUrl: string): boolean;
  isRetryableMethod(method: string): boolean;
  shouldRetry(status: number, method: string, retryCount: number): boolean;
  createAuthFetchOrchestrator(options: {
    readInitialToken: () => Promise<string | null>;
    readToken: () => Promise<string | null>;
    notify: (clientId: string, message: { type: string }) => Promise<void>;
    sleep: () => Promise<void>;
    refreshAttempts?: number;
  }): {
    handle(request: {
      clientId: string;
      method: string;
      execute: (token: string | null) => Promise<{ status: number }>;
    }): Promise<{ status: number }>;
  };
}

describe('service worker proxy auth policy', () => {
  let policy: ProxyAuthPolicy;

  beforeAll(() => {
    // The production worker loads this classic script with importScripts.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../../service-worker-auth-policy.js');
    policy = (
      globalThis as typeof globalThis & {
        SitmunProxyAuthPolicy: ProxyAuthPolicy;
      }
    ).SitmunProxyAuthPolicy;
  });

  it('distinguishes proxy authentication from access denial', () => {
    expect(policy.getMessageType(401)).toBe('PROXY_AUTH_REQUIRED');
    expect(policy.getMessageType(403)).toBe('PROXY_ACCESS_DENIED');
    expect(policy.getMessageType(500)).toBeNull();
  });

  it('retries only idempotent map request methods', () => {
    expect(policy.isRetryableMethod('GET')).toBe(true);
    expect(policy.isRetryableMethod('head')).toBe(true);
    expect(policy.isRetryableMethod('POST')).toBe(false);
  });

  it('allows one retry only for a 401 on an idempotent request', () => {
    expect(policy.shouldRetry(401, 'GET', 0)).toBe(true);
    expect(policy.shouldRetry(401, 'HEAD', 0)).toBe(true);
    expect(policy.shouldRetry(401, 'POST', 0)).toBe(false);
    expect(policy.shouldRetry(401, 'GET', 1)).toBe(false);
    expect(policy.shouldRetry(403, 'GET', 0)).toBe(false);
  });

  it('matches only the configured middleware origin and path boundary', () => {
    const middlewareUrl = 'https://maps.example/middleware/proxy';

    expect(
      policy.isMiddlewareRequest(
        'https://maps.example/middleware/proxy/1/2/WMS/3',
        middlewareUrl
      )
    ).toBe(true);
    expect(
      policy.isMiddlewareRequest(
        'https://maps.example/middleware/proxy-lookalike/1',
        middlewareUrl
      )
    ).toBe(false);
    expect(
      policy.isMiddlewareRequest(
        'https://maps.example.attacker.test/middleware/proxy/1',
        middlewareUrl
      )
    ).toBe(false);
    expect(
      policy.isMiddlewareRequest(
        '/middleware/proxy/1',
        '/middleware/proxy'
      )
    ).toBe(true);
  });

  describe('auth fetch orchestration', () => {
    const response = (status: number): { status: number } => ({ status });

    it('targets only the requesting client without posting tokens', async () => {
      const notify = jest.fn().mockResolvedValue(undefined);
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue('expired-token'),
        readToken: jest.fn().mockResolvedValue(null),
        notify,
        sleep: jest.fn().mockResolvedValue(undefined),
        refreshAttempts: 1
      });

      await orchestrator.handle({
        clientId: 'requesting-client',
        method: 'GET',
        execute: jest.fn().mockResolvedValue(response(401))
      });

      expect(notify).toHaveBeenCalledWith('requesting-client', {
        type: 'PROXY_AUTH_REQUIRED'
      });
      expect(JSON.stringify(notify.mock.calls)).not.toContain('expired-token');
    });

    it('executes without authorization when the token is absent', async () => {
      const execute = jest.fn().mockResolvedValue(response(200));
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue(null),
        readToken: jest.fn().mockResolvedValue(null),
        notify: jest.fn().mockResolvedValue(undefined),
        sleep: jest.fn().mockResolvedValue(undefined)
      });

      await expect(
        orchestrator.handle({ clientId: 'client', method: 'GET', execute })
      ).resolves.toEqual(response(200));
      expect(execute).toHaveBeenCalledWith(null);
    });

    it('shares one refresh wait across concurrent unauthorized requests', async () => {
      let releaseRefresh!: () => void;
      const refreshReleased = new Promise<void>((resolve) => {
        releaseRefresh = resolve;
      });
      const readToken = jest
        .fn()
        .mockImplementationOnce(async () => {
          await refreshReleased;
          return 'renewed-token';
        })
        .mockResolvedValue('renewed-token');
      const execute = jest
        .fn()
        .mockResolvedValueOnce(response(401))
        .mockResolvedValueOnce(response(401))
        .mockResolvedValue(response(200));
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue('expired-token'),
        readToken,
        notify: jest.fn().mockResolvedValue(undefined),
        sleep: jest.fn().mockResolvedValue(undefined)
      });

      const first = orchestrator.handle({
        clientId: 'one',
        method: 'GET',
        execute
      });
      const second = orchestrator.handle({
        clientId: 'two',
        method: 'HEAD',
        execute
      });
      await Promise.resolve();
      releaseRefresh();

      await expect(Promise.all([first, second])).resolves.toEqual([
        response(200),
        response(200)
      ]);
      expect(readToken).toHaveBeenCalledTimes(3);
    });

    it.each(['GET', 'HEAD'])(
      'retries one successful %s request with the refreshed token',
      async (method) => {
        const execute = jest
          .fn()
          .mockResolvedValueOnce(response(401))
          .mockResolvedValueOnce(response(200));
        const orchestrator = policy.createAuthFetchOrchestrator({
          readInitialToken: jest.fn().mockResolvedValue('expired-token'),
          readToken: jest.fn().mockResolvedValue('renewed-token'),
          notify: jest.fn().mockResolvedValue(undefined),
          sleep: jest.fn().mockResolvedValue(undefined)
        });

        await expect(
          orchestrator.handle({ clientId: 'client', method, execute })
        ).resolves.toEqual(response(200));
        expect(execute.mock.calls).toEqual([
          ['expired-token'],
          ['renewed-token']
        ]);
      }
    );

    it('does not retry POST after an unauthorized response', async () => {
      const execute = jest.fn().mockResolvedValue(response(401));
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue('expired-token'),
        readToken: jest.fn().mockResolvedValue('renewed-token'),
        notify: jest.fn().mockResolvedValue(undefined),
        sleep: jest.fn().mockResolvedValue(undefined)
      });

      await expect(
        orchestrator.handle({ clientId: 'client', method: 'POST', execute })
      ).resolves.toEqual(response(401));
      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('returns the second 401 without retrying again', async () => {
      const execute = jest.fn().mockResolvedValue(response(401));
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue('expired-token'),
        readToken: jest.fn().mockResolvedValue('renewed-token'),
        notify: jest.fn().mockResolvedValue(undefined),
        sleep: jest.fn().mockResolvedValue(undefined)
      });

      await expect(
        orchestrator.handle({ clientId: 'client', method: 'GET', execute })
      ).resolves.toEqual(response(401));
      expect(execute).toHaveBeenCalledTimes(2);
    });

    it('does not retry when logout removes the refreshed token', async () => {
      const execute = jest.fn().mockResolvedValue(response(401));
      const readToken = jest
        .fn()
        .mockResolvedValueOnce('renewed-token')
        .mockResolvedValueOnce(null);
      const orchestrator = policy.createAuthFetchOrchestrator({
        readInitialToken: jest.fn().mockResolvedValue('expired-token'),
        readToken,
        notify: jest.fn().mockResolvedValue(undefined),
        sleep: jest.fn().mockResolvedValue(undefined)
      });

      await expect(
        orchestrator.handle({ clientId: 'client', method: 'GET', execute })
      ).resolves.toEqual(response(401));
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });
});
