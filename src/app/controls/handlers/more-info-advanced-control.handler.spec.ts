import { MoreInfoAdvancedControlHandler, sanitizeMiaRenderedHtml } from './more-info-advanced-control.handler';

describe('sanitizeMiaRenderedHtml', () => {
  it('keeps iframe tags for MIA rendered html', () => {
    const html = '<p>before</p><iframe src="https://example.org/doc.pdf" width="100%" height="360" title="PDF"></iframe><p>after</p>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<iframe');
    expect(sanitized).toContain('src="https://example.org/doc.pdf"');
    expect(sanitized).toContain('width="100%"');
    expect(sanitized).toContain('height="360"');
  });

  it('removes unsafe script tags from MIA rendered html', () => {
    const html = '<p>safe</p><script>alert(1)</script>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<p>safe</p>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('keeps MIA export attributes needed for download buttons', () => {
    const html = '<div data-mia-export-template="true" data-mia-template-task-id="201"><p>Plantilla</p></div>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('data-mia-export-template="true"');
    expect(sanitized).toContain('data-mia-template-task-id="201"');
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
      { taskId: 12, output: 'pdf', label: 'PDF A3 horitzontal' },
      { taskId: 13, output: 'xml', label: 'XML' }
    ]);

    const menu = wrapper.querySelector('.sitmun-mia-download-menu');
    const options = wrapper.querySelectorAll('.sitmun-mia-download-options .sitmun-mia-download-btn');

    expect(menu).not.toBeNull();
    expect(wrapper.querySelectorAll('.sitmun-mia-download-toggle')).toHaveLength(1);
    expect(options).toHaveLength(3);
    expect(wrapper.textContent).toContain('PDF A4 vertical');
    expect(wrapper.textContent).toContain('PDF A3 horitzontal');
    expect(wrapper.textContent).toContain('XML');

    (options[1] as HTMLButtonElement).click();

    expect(triggerSpy).toHaveBeenCalledTimes(1);
    expect(triggerSpy.mock.calls[0][0]).toBe(wrapper);
    expect(triggerSpy.mock.calls[0][1]).toEqual({ taskId: 12, output: 'pdf', label: 'PDF A3 horitzontal' });
  });

  it('builds viewer context from namespaced runtime layer names', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).sitnaApi = {
      getGlobal: jest.fn().mockReturnValue({ map: { getExtent: jest.fn().mockReturnValue([1, 2, 3, 4]) } })
    };

    expect((handler as any).buildMiaViewerContext({ name: 'or007tur_estades', options: { layerNames: ['turisme:or007tur_estades'] } }, {})).toEqual({
      bbox: [1, 2, 3, 4],
      queriedLayer: 'or007tur_estades',
      queriedService: 'turisme'
    });
  });

  it('falls back to configured service name when config already stores the canonical name', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).sitnaApi = {
      getGlobal: jest.fn().mockReturnValue({ map: { getExtent: jest.fn().mockReturnValue([1, 2, 3, 4]) } })
    };
    (handler as any).appConfig = {
      layers: [
        { id: 'layer/7', layers: ['or007tur_estades'], service: 'turisme' }
      ]
    };

    expect((handler as any).buildMiaViewerContext({ name: 'or007tur_estades' }, {})).toEqual({
      bbox: [1, 2, 3, 4],
      queriedLayer: 'or007tur_estades',
      queriedService: 'turisme'
    });
  });

  it('falls back to service url namespace when runtime service exposes geoserver url', () => {
    const handler = Object.create(MoreInfoAdvancedControlHandler.prototype) as MoreInfoAdvancedControlHandler;
    (handler as any).sitnaApi = {
      getGlobal: jest.fn().mockReturnValue({ map: { getExtent: jest.fn().mockReturnValue([1, 2, 3, 4]) } })
    };

    expect((handler as any).buildMiaViewerContext(
      { name: 'or007tur_estades' },
      { url: 'https://ide.cime.es/geoserver/turisme/ows' }
    )).toEqual({
      bbox: [1, 2, 3, 4],
      queriedLayer: 'or007tur_estades',
      queriedService: 'turisme'
    });
  });
});
