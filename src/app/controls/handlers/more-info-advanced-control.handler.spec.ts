import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppCfg } from '@api/model/app-cfg';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, of, Subject } from 'rxjs';

import {
  MoreInfoAdvancedControlHandler,
  resolveMiaGfiTarget,
  sanitizeMiaRenderedHtml
} from './more-info-advanced-control.handler';
import { AppConfigService } from '../../services/app-config.service';
import {
  MiaTask,
  MoreInfoAdvancedService
} from '../../services/more-info-advanced.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('sanitizeMiaRenderedHtml', () => {
  it('keeps iframe tags for MIA rendered html', () => {
    const html =
      '<p>before</p><iframe src="https://example.org/doc.pdf" srcdoc="<script>alert(1)</script>" width="100%" height="360" title="PDF" allow="scripts" allowfullscreen></iframe><p>after</p>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<iframe');
    expect(sanitized).toContain('src="https://example.org/doc.pdf"');
    expect(sanitized).toContain('width="100%"');
    expect(sanitized).toContain('height="360"');
    expect(sanitized).toContain('sandbox=""');
    expect(sanitized).not.toContain('allow=');
    expect(sanitized).not.toContain('allowfullscreen');
    expect(sanitized).not.toContain('srcdoc');
  });

  it('removes unsafe script tags from MIA rendered html', () => {
    const html = '<p>safe</p><script>alert(1)</script>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<p>safe</p>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('keeps MIA export attributes needed for download buttons', () => {
    const html = '<div data-mia-export-template="true" data-mia-template-task-id="201">'
      + '<p class="sitmun-pdf-header" data-sitmun-pdf-template-scope="root">Plantilla</p></div>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('data-mia-export-template="true"');
    expect(sanitized).toContain('data-mia-template-task-id="201"');
    expect(sanitized).toContain('data-sitmun-pdf-template-scope="root"');
  });

  it('uses the provided empty fallback html when content is blank', () => {
    const sanitized = sanitizeMiaRenderedHtml(
      '',
      '<div class="sitmun-mia-empty">No data</div>'
    );
    expect(sanitized).toContain('No data');
  });
});

describe('MoreInfoAdvancedControlHandler export dropdown', () => {
  it('uses export task label as visible button text when provided', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;

    expect((handler as any).getExportButtonDescriptor('pdf', 'PDF A3 horitzontal')).toEqual({
      label: 'PDF A3 horitzontal',
      ariaLabel: 'Exportar plantilla en PDF (PDF A3 horitzontal)',
      icon: 'pdf',
      loadingLabel: 'Generant PDF...'
    });
  });

  it('renders one dropdown menu with all export actions', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    const triggerSpy = jest.fn();
    (handler as any).triggerMiaExport = triggerSpy;

    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true"><p>Plantilla</p></div>';
    const wrapper = container.querySelector('[data-mia-export-template]') as HTMLElement;

    (handler as any).injectDownloadButtons(container, [
      { taskId: 11, output: 'pdf', label: 'PDF A4 vertical' },
      { taskId: 12, output: 'pdf', label: 'PDF A3 horitzontal' }
    ]);

    const menu = wrapper.querySelector('.sitmun-mia-download-menu');
    const options = wrapper.querySelectorAll('.sitmun-mia-download-options .sitmun-mia-download-btn');

    expect(menu).not.toBeNull();
    expect(wrapper.querySelectorAll('.sitmun-mia-download-toggle')).toHaveLength(1);
    expect(options).toHaveLength(2);
    expect(wrapper.textContent).toContain('PDF A4 vertical');
    expect(wrapper.textContent).toContain('PDF A3 horitzontal');

    (options[1] as HTMLButtonElement).click();

    expect(triggerSpy).toHaveBeenCalledTimes(1);
    expect(triggerSpy.mock.calls[0][0]).toBe(wrapper);
    expect(triggerSpy.mock.calls[0][1]).toEqual({ taskId: 12, output: 'pdf', label: 'PDF A3 horitzontal' });
  });

  it('builds profile viewer context when clicked layer has no geometries', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).appConfig = { application: { id: 7, territoryId: 11 } };

    expect((handler as any).buildMiaViewerContext({ name: 'or007tur_estades' })).toEqual({
      featureBbox: null,
      applicationId: 7,
      territoryId: 11
    });
  });

  it('builds featureBbox from clicked feature geometries', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).appConfig = { application: { id: 7, territoryId: 11 } };

    expect((handler as any).buildMiaViewerContext({
      name: 'or007tur_estades',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [10, 20]
          }
        },
        {
          geometry: {
            type: 'Polygon',
            coordinates: [[[12, 18], [16, 18], [16, 24], [12, 24], [12, 18]]]
          }
        }
      ]
    })).toEqual({
      featureBbox: [10, 18, 16, 24],
      applicationId: 7,
      territoryId: 11
    });
  });

  it('preserves a point feature as a zero-area featureBbox', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).appConfig = { application: { id: 7, territoryId: 11 } };

    expect((handler as any).buildMiaViewerContext({
      features: [{ geometry: { type: 'Point', coordinates: [10, 20] } }]
    })).toEqual({
      featureBbox: [10, 20, 10, 20],
      applicationId: 7,
      territoryId: 11
    });
  });

  it('returns no viewer context when profile coordinates are unavailable', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;

    expect((handler as any).buildMiaViewerContext({})).toBeNull();
  });

  it('forwards active profile coordinates to template export', () => {
    const exportTemplate = jest.fn().mockReturnValue(NEVER);
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).miaService = { exportTemplate };
    (handler as any).appConfig = { application: { id: 7, territoryId: 11 } };
    const wrapper = document.createElement('div');
    wrapper.dataset['miaTemplateTaskId'] = '301';
    wrapper.innerHTML = '<div class="sitmun-mia-download-bar">Actions</div><p>Report</p>';
    const button = document.createElement('button');
    button.innerHTML = '<span class="sitmun-mia-download-btn-label">PDF</span>';

    (handler as any).triggerMiaExport(
      wrapper,
      { taskId: 201, output: 'pdf', label: 'PDF' },
      button,
      { label: 'PDF', loadingLabel: 'Generating' },
    );

    expect(exportTemplate).toHaveBeenCalledWith(expect.objectContaining({
      taskId: 201,
      templateTaskId: 301,
      applicationId: 7,
      territoryId: 11,
    }));
  });

  it('does not inject duplicate download menus', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true"><p>Plantilla</p></div>';

    (handler as any).injectDownloadButtons(container, [
      { taskId: 11, output: 'pdf', label: 'PDF' }
    ]);
    (handler as any).injectDownloadButtons(container, [
      { taskId: 11, output: 'pdf', label: 'PDF' }
    ]);

    expect(container.querySelectorAll('.sitmun-mia-download-menu')).toHaveLength(1);
  });

  it('does nothing when there are no export actions', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true"><p>Plantilla</p></div>';

    (handler as any).injectDownloadButtons(container, []);

    expect(container.querySelector('.sitmun-mia-download-menu')).toBeNull();
  });
});

describe('resolveMiaGfiTarget', () => {
  const miaTasks: MiaTask[] = [
    {
      id: 'task/42',
      name: 'MIA',
      cartographyId: '6',
      visualizationMode: 'tabs',
      includedTasks: []
    }
  ];

  const deps = {
    getCartographyIdFromLayerName: (name: string) => {
      if (name === '34_TOPO_TX') return '6';
      if (name === 'OTHER_LAYER') return '99';
      return null;
    },
    getTasksForCartography: (id: string) => (id === '6' ? miaTasks : [])
  };

  it('skips a non-MIA cartography layer and uses the first feature of the MIA layer', () => {
    const target = resolveMiaGfiTarget(
      {
        services: [
          {
            layers: [
              {
                name: 'OTHER_LAYER',
                features: [{ getData: () => ({ id: 'wrong' }) }]
              },
              {
                name: '34_TOPO_TX',
                features: [{ getData: () => ({ id: 'mia-hit' }) }]
              }
            ]
          }
        ]
      },
      deps
    );

    expect(target?.featureData).toEqual({ id: 'mia-hit' });
    expect(target?.miaTasks).toEqual(miaTasks);
    expect(target?.layerName).toBe('34_TOPO_TX');
  });

  it('prefers currentFeature when it belongs to a MIA-capable layer', () => {
    const featureA = { getData: () => ({ id: 'a', marker: 'first' }) };
    const featureB = { getData: () => ({ id: 'b', marker: 'second' }) };

    const target = resolveMiaGfiTarget(
      {
        services: [
          {
            layers: [
              {
                name: '34_TOPO_TX',
                features: [featureA, featureB]
              }
            ]
          }
        ]
      },
      deps,
      featureB
    );

    expect(target?.featureData).toEqual({ id: 'b', marker: 'second' });
  });

  it('falls back to first MIA-capable feature when currentFeature is on a non-MIA layer', () => {
    const otherFeature = { getData: () => ({ id: 'other' }) };
    const miaFeature = { getData: () => ({ id: 'mia' }) };

    const target = resolveMiaGfiTarget(
      {
        services: [
          {
            layers: [
              { name: 'OTHER_LAYER', features: [otherFeature] },
              { name: '34_TOPO_TX', features: [miaFeature] }
            ]
          }
        ]
      },
      deps,
      otherFeature
    );

    expect(target?.featureData).toEqual({ id: 'mia' });
  });
});

describe('MoreInfoAdvancedControlHandler GFI targeting', () => {
  let handler: MoreInfoAdvancedControlHandler;
  let miaService: {
    initialize: jest.Mock;
    hasMiaTasks: jest.Mock;
    getTasksForCartography: jest.Mock;
    getExportActionsForCartography: jest.Mock;
    renderMiaTasks: jest.Mock;
  };
  let mockSitnaApi: jest.Mocked<SitnaApiService>;
  let mockTC: any;

  const miaTasks: MiaTask[] = [
    {
      id: 'task/42',
      name: 'MIA',
      cartographyId: '6',
      visualizationMode: 'tabs',
      includedTasks: []
    }
  ];

  const appCfg = {
    application: { id: 7, territoryId: 11 },
    layers: [
      {
        id: 'layer/6',
        layers: ['34_TOPO_TX']
      },
      {
        id: 'layer/99',
        layers: ['OTHER_LAYER']
      }
    ],
    tasks: []
  } as unknown as AppCfg;

  beforeEach(() => {
    mockTC = {
      Map: { prototype: {} },
      control: {
        FeatureInfo: {
          prototype: {
            responseCallback: jest.fn()
          }
        }
      }
    };

    mockSitnaApi = {
      getTC: jest.fn().mockReturnValue(mockTC),
      getSITNA: jest.fn().mockReturnValue({} as any),
      getTCProperty: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as Partial<jest.Mocked<SitnaApiService>> as jest.Mocked<SitnaApiService>;

    miaService = {
      initialize: jest.fn(),
      hasMiaTasks: jest.fn().mockReturnValue(true),
      getTasksForCartography: jest.fn((id: string) =>
        id === '6' ? miaTasks : []
      ),
      getExportActionsForCartography: jest.fn().mockReturnValue([]),
      renderMiaTasks: jest.fn().mockReturnValue(
        of([{ taskId: 42, title: 'MIA', html: '<p>ok</p>' }])
      )
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MoreInfoAdvancedControlHandler,
        { provide: SitnaApiService, useValue: mockSitnaApi },
        { provide: MoreInfoAdvancedService, useValue: miaService },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) =>
              ({
                'mia.popup.title': 'Advanced information',
                'mia.popup.close': 'Close',
                'mia.popup.loading': 'Loading...',
                'mia.empty': 'No data'
              }[key] ?? key)
          }
        },
        {
          provide: AppConfigService,
          useValue: { getControlDefault: jest.fn() }
        }
      ]
    });

    handler = TestBed.inject(MoreInfoAdvancedControlHandler);
    handler.buildConfiguration({} as any, appCfg);
  });

  afterEach(() => {
    handler.cleanup();
    document.querySelectorAll('.sitmun-mia-popup-overlay').forEach((el) => el.remove());
  });

  it('opens MIA with currentFeature attrs when provided', () => {
    const featureA = { getData: () => ({ id: 'a' }) };
    const featureB = { getData: () => ({ id: 'b' }) };

    handler.openMiaFromGfiOptionsForTest(
      {
        services: [
          {
            layers: [
              { name: '34_TOPO_TX', features: [featureA, featureB] }
            ]
          }
        ]
      },
      featureB
    );

    expect(miaService.renderMiaTasks).toHaveBeenCalledWith(
      miaTasks,
      { id: 'b' },
      { featureBbox: null, applicationId: 7, territoryId: 11 }
    );
  });

  it('localizes overlay chrome through TranslateService keys', () => {
    miaService.renderMiaTasks.mockReturnValue(new Subject());

    handler.openMiaFromGfiOptionsForTest({
      services: [
        {
          layers: [
            {
              name: '34_TOPO_TX',
              features: [{ getData: () => ({ id: 1 }) }]
            }
          ]
        }
      ]
    });

    const overlay = document.querySelector('.sitmun-mia-popup-overlay');
    expect(
      overlay?.querySelector('.sitmun-mia-popup-toolbar-title')?.textContent
    ).toBe('Advanced information');
    const close = overlay?.querySelector('.sitmun-mia-popup-close');
    expect(close?.classList.contains('tc-ctl-popup-close')).toBe(true);
    expect(close?.getAttribute('aria-label')).toBe('Close');
    expect(close?.getAttribute('title')).toBe('Close');
    expect(close?.textContent).toBe('Close');
    expect(overlay?.innerHTML).toContain('Loading...');
  });

  it('does not start toolbar drag from sitna-button close (keeps pointerup for close)', () => {
    const customElementsGet = jest
      .spyOn(customElements, 'get')
      .mockImplementation((name: string) =>
        name === 'sitna-button'
          ? (class extends HTMLElement {} as unknown as CustomElementConstructor)
          : undefined
      );
    miaService.renderMiaTasks.mockReturnValue(new Subject());

    handler.openMiaFromGfiOptionsForTest({
      services: [
        {
          layers: [
            {
              name: '34_TOPO_TX',
              features: [{ getData: () => ({ id: 1 }) }]
            }
          ]
        }
      ]
    });

    const overlay = document.querySelector('.sitmun-mia-popup-overlay') as HTMLElement;
    const close = overlay?.querySelector('sitna-button.sitmun-mia-popup-close');
    expect(close).toBeTruthy();

    const setPointerCapture = jest.fn();
    Object.defineProperty(overlay, 'setPointerCapture', {
      value: setPointerCapture,
      configurable: true
    });
    close?.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 })
    );
    expect(setPointerCapture).not.toHaveBeenCalled();

    close?.dispatchEvent(new Event('pointerup'));
    expect(overlay.classList.contains('sitmun-mia-popup-visible')).toBe(false);
    customElementsGet.mockRestore();
  });

  it('skips non-MIA layer ahead of MIA layer when opening from GFI options', () => {
    handler.openMiaFromGfiOptionsForTest({
      services: [
        {
          layers: [
            {
              name: 'OTHER_LAYER',
              features: [{ getData: () => ({ id: 'wrong' }) }]
            },
            {
              name: '34_TOPO_TX',
              features: [{ getData: () => ({ id: 'mia-hit' }) }]
            }
          ]
        }
      ]
    });

    expect(miaService.renderMiaTasks).toHaveBeenCalledWith(
      miaTasks,
      { id: 'mia-hit' },
      { featureBbox: null, applicationId: 7, territoryId: 11 }
    );
  });

  it('cancelMiaRender ignores a late render for a previous feature', () => {
    const first$ = new Subject<any>();
    const second$ = new Subject<any>();
    miaService.renderMiaTasks
      .mockReturnValueOnce(first$)
      .mockReturnValueOnce(second$);

    const featureA = { getData: () => ({ id: 'a' }) };
    const featureB = { getData: () => ({ id: 'b' }) };
    const options = {
      services: [
        {
          layers: [{ name: '34_TOPO_TX', features: [featureA, featureB] }]
        }
      ]
    };

    handler.openMiaFromGfiOptionsForTest(options, featureA);
    handler.openMiaFromGfiOptionsForTest(options, featureB);

    first$.next([
      { taskId: 42, title: 'MIA', html: '<p data-marker="stale">stale</p>' }
    ]);
    first$.complete();
    second$.next([
      { taskId: 42, title: 'MIA', html: '<p data-marker="fresh">fresh</p>' }
    ]);
    second$.complete();

    const overlay = document.querySelector('.sitmun-mia-popup-overlay');
    expect(overlay?.innerHTML).toContain('data-marker="fresh"');
    expect(overlay?.innerHTML).not.toContain('data-marker="stale"');
  });

  it('close during load cancels so a late render does not refill the overlay', () => {
    const pending$ = new Subject<any>();
    miaService.renderMiaTasks.mockReturnValue(pending$);

    handler.openMiaFromGfiOptionsForTest({
      services: [
        {
          layers: [
            {
              name: '34_TOPO_TX',
              features: [{ getData: () => ({ id: 1 }) }]
            }
          ]
        }
      ]
    });

    const overlay = document.querySelector(
      '.sitmun-mia-popup-overlay'
    ) as HTMLElement;
    expect(overlay.classList.contains('sitmun-mia-popup-visible')).toBe(true);

    overlay
      .querySelector('.sitmun-mia-popup-close')
      ?.dispatchEvent(new Event('pointerup'));

    expect(overlay.classList.contains('sitmun-mia-popup-visible')).toBe(false);

    pending$.next([
      {
        taskId: 42,
        title: 'MIA',
        html: '<p data-marker="late">late</p>'
      }
    ]);
    pending$.complete();

    expect(overlay.classList.contains('sitmun-mia-popup-visible')).toBe(false);
    expect(overlay.innerHTML).not.toContain('data-marker="late"');
  });

  it('onMapClear delegates to clearOverlayForMapRebuild', () => {
    const spy = jest.spyOn(handler, 'clearOverlayForMapRebuild');
    handler.onMapClear();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('clearOverlayForMapRebuild removes overlay DOM and cancels in-flight render', () => {
    const pending$ = new Subject<any>();
    miaService.renderMiaTasks.mockReturnValue(pending$);

    handler.openMiaFromGfiOptionsForTest({
      services: [
        {
          layers: [
            {
              name: '34_TOPO_TX',
              features: [{ getData: () => ({ id: 1 }) }]
            }
          ]
        }
      ]
    });

    expect(document.querySelector('.sitmun-mia-popup-overlay')).toBeTruthy();
    handler.clearOverlayForMapRebuild();
    expect(document.querySelector('.sitmun-mia-popup-overlay')).toBeNull();

    pending$.next([
      { taskId: 42, title: 'MIA', html: '<p data-marker="orphaned">x</p>' }
    ]);
    pending$.complete();
    expect(document.querySelector('.sitmun-mia-popup-overlay')).toBeNull();
  });
});
