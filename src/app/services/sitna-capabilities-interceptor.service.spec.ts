import { TestBed } from '@angular/core/testing';

import type { AppCfg } from '@api/model/app-cfg';

import { ConfigLookupService } from './config-lookup.service';
import { RasterLayerService } from './raster-layer.service';
import { SitnaApiService } from './sitna-api.service';
import { SitnaCapabilitiesInterceptor } from './sitna-capabilities-interceptor.service';
import { VirtualWmsCapabilitiesService } from './virtual-wms-capabilities.service';
import { WMSCapabilities } from '../types/wms-capabilities';

interface FakeLayer {
  url?: string;
  getCapabilitiesUrl?: () => string;
  getCapabilitiesOnline: (url?: string) => Promise<unknown> | unknown;
}

function buildAppCfg(): AppCfg {
  return {
    application: {
      id: 1,
      title: 't',
      type: 't',
      theme: 't',
      srs: 'EPSG:25831',
      initialExtent: [0, 0, 1, 1]
    },
    backgrounds: [],
    groups: [],
    layers: [],
    services: [],
    tasks: [],
    trees: []
  };
}

describe('SitnaCapabilitiesInterceptor', () => {
  let interceptor: SitnaCapabilitiesInterceptor;
  let originalGetCapabilities: jest.Mock;
  let layerProto: { getCapabilitiesOnline: (url?: string) => unknown };
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockVirtualWms: jest.Mocked<VirtualWmsCapabilitiesService>;
  let mockRaster: jest.Mocked<RasterLayerService>;
  let mockConfigLookup: jest.Mocked<ConfigLookupService>;

  beforeEach(() => {
    originalGetCapabilities = jest
      .fn()
      .mockResolvedValue({ Service: { Title: 'real' } } as WMSCapabilities);
    layerProto = { getCapabilitiesOnline: originalGetCapabilities };

    const sitnaNamespace = {
      Map: function () {},
      layer: { Layer: { prototype: layerProto } }
    };

    const appGlobals = new Map<string, unknown>();
    mockSitnaApi = {
      getSITNA: jest.fn().mockReturnValue(sitnaNamespace as any),
      getGlobal: jest.fn((k: string) => appGlobals.get(k)),
      setGlobal: jest.fn((k: string, v: unknown) => {
        if (v === undefined) appGlobals.delete(k);
        else appGlobals.set(k, v);
      })
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    mockVirtualWms = {
      isVirtualServiceUrl: jest.fn(),
      extractNodeIdFromUrl: jest.fn(),
      generateCapabilities: jest.fn()
    } as Partial<
      jest.Mocked<VirtualWmsCapabilitiesService>
    > as jest.Mocked<VirtualWmsCapabilitiesService>;

    mockRaster = {
      applyVirtualCatalogProfileScaleDenominators: jest.fn(
        (capabilities: unknown, _appCfg: AppCfg) => capabilities
      ),
      processWmtCapabilitiesResult: jest.fn(
        (
          _layer: unknown,
          _url: unknown,
          result: unknown,
          _appCfg?: AppCfg
        ) => result
      )
    } as unknown as jest.Mocked<RasterLayerService>;

    mockConfigLookup = {
      initialize: jest.fn()
    } as Partial<
      jest.Mocked<ConfigLookupService>
    > as jest.Mocked<ConfigLookupService>;

    TestBed.configureTestingModule({
      providers: [
        SitnaCapabilitiesInterceptor,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: VirtualWmsCapabilitiesService, useValue: mockVirtualWms },
        { provide: RasterLayerService, useValue: mockRaster },
        { provide: ConfigLookupService, useValue: mockConfigLookup }
      ]
    });

    interceptor = TestBed.inject(SitnaCapabilitiesInterceptor);
  });

  afterEach(() => {
    interceptor.restore();
    jest.restoreAllMocks();
  });

  it('initializes ConfigLookupService and refreshes AppCfg on each call', async () => {
    const ctxA = buildAppCfg();
    const ctxB = { ...buildAppCfg(), tasks: [{ 'ui-control': 'x' } as any] };

    await interceptor.ensurePatched(ctxA);
    await interceptor.ensurePatched(ctxB);

    expect(mockConfigLookup.initialize).toHaveBeenCalledTimes(2);
    expect(mockConfigLookup.initialize).toHaveBeenNthCalledWith(1, ctxA);
    expect(mockConfigLookup.initialize).toHaveBeenNthCalledWith(2, ctxB);
  });

  it('installs the around-advice exactly once across concurrent calls', async () => {
    const ctx = buildAppCfg();

    await Promise.all([
      interceptor.ensurePatched(ctx),
      interceptor.ensurePatched(ctx),
      interceptor.ensurePatched(ctx)
    ]);

    // Calling the patched method should still work and only wrap once.
    const layer = layerProto as unknown as FakeLayer;
    mockVirtualWms.isVirtualServiceUrl.mockReturnValue(false);
    await (layer.getCapabilitiesOnline as (u?: string) => Promise<unknown>)(
      'https://real.example/wms?REQUEST=GetCapabilities'
    );
    expect(originalGetCapabilities).toHaveBeenCalledTimes(1);
  });

  it('virtual URL returns generated capabilities and skips upstream fetch', async () => {
    const ctx = buildAppCfg();
    await interceptor.ensurePatched(ctx);

    const synthetic = { Capability: { Layer: { Title: 'virtual' } } };
    mockVirtualWms.isVirtualServiceUrl.mockImplementation((url: string) =>
      url.startsWith('virtual://')
    );
    mockVirtualWms.extractNodeIdFromUrl.mockReturnValue('node/42');
    mockVirtualWms.generateCapabilities.mockReturnValue(synthetic as never);

    const layer = layerProto as unknown as FakeLayer;
    const out = await (
      layer.getCapabilitiesOnline as (u?: string) => Promise<unknown>
    )('virtual://sitmun-layer-catalog/node/42');

    expect(out).toBe(synthetic);
    expect(mockVirtualWms.generateCapabilities).toHaveBeenCalledWith(
      'node/42',
      ctx
    );
    expect(
      mockRaster.applyVirtualCatalogProfileScaleDenominators
    ).toHaveBeenCalledWith(synthetic, ctx);
    expect(originalGetCapabilities).not.toHaveBeenCalled();
    expect(mockRaster.processWmtCapabilitiesResult).not.toHaveBeenCalled();
  });

  it('real URL proceeds and post-processes via processWmtCapabilitiesResult', async () => {
    const ctx = buildAppCfg();
    await interceptor.ensurePatched(ctx);

    mockVirtualWms.isVirtualServiceUrl.mockReturnValue(false);
    const upstream = { Service: { Title: 'real' } } as WMSCapabilities;
    originalGetCapabilities.mockResolvedValueOnce(upstream);

    const layer = layerProto as unknown as FakeLayer;
    const url = 'https://real.example/wms?REQUEST=GetCapabilities';
    await (layer.getCapabilitiesOnline as (u?: string) => Promise<unknown>)(
      url
    );

    expect(originalGetCapabilities).toHaveBeenCalledWith(url);
    expect(mockRaster.processWmtCapabilitiesResult).toHaveBeenCalledTimes(1);
    const args = mockRaster.processWmtCapabilitiesResult.mock.calls[0];
    expect(args[1]).toBe(url);
    expect(args[2]).toBe(upstream);
    expect(args[3]).toBe(ctx);
  });

  it('falls back to real fetch when virtual generation throws', async () => {
    const ctx = buildAppCfg();
    await interceptor.ensurePatched(ctx);

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockVirtualWms.isVirtualServiceUrl.mockReturnValue(true);
    mockVirtualWms.extractNodeIdFromUrl.mockReturnValue('node/oops');
    mockVirtualWms.generateCapabilities.mockImplementation(() => {
      throw new Error('boom');
    });
    const upstream = { Service: { Title: 'real' } } as WMSCapabilities;
    originalGetCapabilities.mockResolvedValueOnce(upstream);

    const layer = layerProto as unknown as FakeLayer;
    await (layer.getCapabilitiesOnline as (u?: string) => Promise<unknown>)(
      'virtual://sitmun-layer-catalog/node/oops'
    );

    expect(originalGetCapabilities).toHaveBeenCalledTimes(1);
    expect(mockRaster.processWmtCapabilitiesResult).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it('prefers global currentAppCfg over the last ensurePatched value', async () => {
    const ctx = buildAppCfg();
    const newer = { ...buildAppCfg(), tasks: [{ id: 'newer' } as any] };
    await interceptor.ensurePatched(ctx);
    mockSitnaApi.setGlobal('currentAppCfg', newer);

    mockVirtualWms.isVirtualServiceUrl.mockReturnValue(false);
    const layer = layerProto as unknown as FakeLayer;
    await (layer.getCapabilitiesOnline as (u?: string) => Promise<unknown>)(
      'https://real.example/wms'
    );

    const callArgs = mockRaster.processWmtCapabilitiesResult.mock.calls[0];
    expect(callArgs[3]).toBe(newer);
  });
});
