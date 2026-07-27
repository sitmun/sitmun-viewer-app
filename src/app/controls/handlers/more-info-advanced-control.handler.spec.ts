import { NEVER } from 'rxjs';

import { MoreInfoAdvancedControlHandler, sanitizeMiaRenderedHtml } from './more-info-advanced-control.handler';

describe('sanitizeMiaRenderedHtml', () => {
  it('keeps iframe tags for MIA rendered html', () => {
    const html = '<p>before</p><iframe src="https://example.org/doc.pdf" width="100%" height="360" title="PDF" allow="scripts" allowfullscreen></iframe><p>after</p>';

    const sanitized = sanitizeMiaRenderedHtml(html);

    expect(sanitized).toContain('<iframe');
    expect(sanitized).toContain('src="https://example.org/doc.pdf"');
    expect(sanitized).toContain('width="100%"');
    expect(sanitized).toContain('height="360"');
    expect(sanitized).toContain('sandbox=""');
    expect(sanitized).not.toContain('allow=');
    expect(sanitized).not.toContain('allowfullscreen');
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
