jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: (html: string) => html
  }
}), { virtual: true });

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MoreInfoAdvancedControlHandler } from './more-info-advanced-control.handler';
import { MoreInfoAdvancedService } from '../../services/more-info-advanced.service';
import { AppConfigService } from '../../services/app-config.service';
import { SitnaApiService } from '../../services/sitna-api.service';

describe('MoreInfoAdvancedControlHandler', () => {
  let handler: MoreInfoAdvancedControlHandler;
  let miaService: jest.Mocked<MoreInfoAdvancedService>;

  beforeEach(() => {
    miaService = {
      initialize: jest.fn(),
      hasMiaTasks: jest.fn().mockReturnValue(true),
      getExportActionsForCartography: jest.fn().mockReturnValue([]),
      renderMiaTasks: jest.fn(),
      exportTemplate: jest.fn()
    } as unknown as jest.Mocked<MoreInfoAdvancedService>;

    TestBed.configureTestingModule({
      providers: [
        MoreInfoAdvancedControlHandler,
        { provide: MoreInfoAdvancedService, useValue: miaService },
        {
          provide: AppConfigService,
          useValue: {
            getAppTasksDefaultConfig: jest.fn().mockReturnValue(null)
          }
        },
        {
          provide: SitnaApiService,
          useValue: {
            getTC: jest.fn(),
            getSITNA: jest.fn(),
            getTCProperty: jest.fn(),
            isReady: jest.fn().mockReturnValue(true)
          }
        }
      ]
    });

    handler = TestBed.inject(MoreInfoAdvancedControlHandler);
  });

  it('injects one export button per document export action in every template wrapper', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div data-mia-export-template="true">
        <p>Hola</p>
      </div>
      <div data-mia-export-template="true">
        <p>Adeu</p>
      </div>
    `;

    (handler as any).injectDownloadButtons(container, [
      { taskId: 701, output: 'pdf', label: 'PDF oficial' },
      { taskId: 702, output: 'xml', label: 'XML oficial' }
    ]);

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.sitmun-mia-download-btn'));
    expect(buttons).toHaveLength(4);
    expect(buttons[0].className).toContain('sitmun-mia-download-btn--pdf');
    expect(buttons[0].textContent).toContain('Exportar PDF');
    expect(buttons[1].className).toContain('sitmun-mia-download-btn--xml');
    expect(buttons[1].textContent).toContain('Descarregar XML');
  });

  it('uses backend filename when downloading exported templates', () => {
    const originalCreateElement = document.createElement.bind(document);
    const createdAnchors: HTMLAnchorElement[] = [];
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        createdAnchors.push(element as HTMLAnchorElement);
      }
      return element;
    }) as typeof document.createElement);
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue('blob:test')
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn()
    });

    miaService.exportTemplate.mockReturnValue(of({
      blob: new Blob(['pdf']),
      filename: 'Plantilla territori.pdf'
    }));

    const container = document.createElement('div');
    container.innerHTML = `
      <div data-mia-export-template="true">
        <p>Hola</p>
      </div>
    `;

    (handler as any).injectDownloadButtons(container, [
      { taskId: 201, output: 'pdf', label: 'Plantilla PDF' }
    ]);

    const button = container.querySelector<HTMLButtonElement>('.sitmun-mia-download-btn');
    expect(button).not.toBeNull();

    button?.click();

    expect(miaService.exportTemplate).toHaveBeenCalled();
    expect(createdAnchors).toHaveLength(1);
    expect(createdAnchors[0].download).toBe('Plantilla territori.pdf');

    createElementSpy.mockRestore();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: originalRevokeObjectURL
    });
  });

  it('does not inject buttons when there are no document export actions', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div data-mia-export-template="true">
        <p>Hola</p>
      </div>
    `;

    (handler as any).injectDownloadButtons(container, []);

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.sitmun-mia-download-btn'));
    expect(buttons).toHaveLength(0);
  });

  it('fills rendered tasks and injects buttons after sanitizing template wrappers', () => {
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = '<div data-mia-task-id="201"></div>';

    (handler as any).fillRenderedMiaTasks(contentDiv, [
      {
        taskId: 201,
        title: 'Plantilla',
        html: '<section data-mia-export-template="true" data-mia-template-task-id="301"><p>Hola</p></section>'
      }
    ], [
      { taskId: 701, output: 'pdf', label: 'PDF oficial' }
    ]);

    const target = contentDiv.querySelector('[data-mia-task-id="201"]') as HTMLElement;
    expect(target.querySelector('[data-mia-export-template]')).not.toBeNull();
    expect(target.querySelector('[data-mia-template-task-id="301"]')).not.toBeNull();
    expect(target.querySelectorAll('.sitmun-mia-download-btn')).toHaveLength(1);
  });

  it('strips download bar html before requesting pdf export', () => {
    miaService.exportTemplate.mockReturnValue(of({ blob: new Blob(['pdf']), filename: 'test.pdf' }));

    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true" data-mia-template-task-id="301"><div class="content">Hola</div></div>';
    const wrapper = container.querySelector('[data-mia-export-template]') as HTMLElement;

    (handler as any).injectDownloadButtons(container, [{ taskId: 201, output: 'pdf', label: 'PDF' }]);

    const button = container.querySelector<HTMLButtonElement>('.sitmun-mia-download-btn')!;
    button.click();

    expect(miaService.exportTemplate).toHaveBeenCalledWith(
      expect.not.stringContaining('sitmun-mia-download-bar'),
      'pdf',
      201,
      301,
    );
    expect((miaService.exportTemplate.mock.calls[0] as any[])[0]).toContain('<div class="content">Hola</div>');
    expect(wrapper.querySelector('.sitmun-mia-download-bar')).not.toBeNull();
  });

  it('uses empty template body for xml export', () => {
    miaService.exportTemplate.mockReturnValue(of({ blob: new Blob(['xml']), filename: 'test.xml' }));

    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true" data-mia-template-task-id="302"><div class="content">Hola</div></div>';

    (handler as any).injectDownloadButtons(container, [{ taskId: 202, output: 'xml', label: 'XML' }]);

    const button = container.querySelector<HTMLButtonElement>('.sitmun-mia-download-btn')!;
    button.click();

    expect(miaService.exportTemplate).toHaveBeenCalledWith('', 'xml', 202, 302);
  });

  it('re-enables button and restores label after export error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    miaService.exportTemplate.mockReturnValue(throwError(() => new Error('boom')));

    const container = document.createElement('div');
    container.innerHTML = '<div data-mia-export-template="true"><div class="content">Hola</div></div>';

    (handler as any).injectDownloadButtons(container, [{ taskId: 203, output: 'pdf', label: 'PDF' }]);

    const button = container.querySelector<HTMLButtonElement>('.sitmun-mia-download-btn')!;
    const label = button.querySelector('.sitmun-mia-download-btn-label') as HTMLElement;
    button.click();

    expect(button.disabled).toBe(false);
    expect(label.textContent).toBe('Exportar PDF');
    consoleErrorSpy.mockRestore();
  });
});
