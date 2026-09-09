import { HttpHeaders } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';
import { MoreInfoAdvancedService } from './more-info-advanced.service';

describe('MoreInfoAdvancedService', () => {
  let service: MoreInfoAdvancedService;
  let httpMock: HttpTestingController;
  let languageService: { getCurrentLanguage: jest.Mock<string, []> };

  beforeEach(() => {
    languageService = {
      getCurrentLanguage: jest.fn().mockReturnValue('ca')
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MoreInfoAdvancedService,
        { provide: LanguageService, useValue: languageService }
      ]
    });

    service = TestBed.inject(MoreInfoAdvancedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requires a basic control task to activate MIA popups', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/16',
          typeId: 16,
          name: 'MIA parent',
          cartographyId: '12',
          parameters: { advancedTaskKind: 'parent' }
        }
      ]
    } as any);

    expect(service.hasMiaTasks()).toBe(false);
    expect(service.getTasksForCartography('12').map((task) => task.id)).toEqual(['task/16']);
  });

  it('indexes authorized MIA parent tasks when a basic sitna.moreInfoAdvanced control exists', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/16',
          typeId: 16,
          name: 'MIA parent',
          cartographyId: '12',
          parameters: { advancedTaskKind: 'parent', visualizationMode: 'scroll' }
        },
        {
          id: 'task/17',
          typeId: 16,
          name: 'MIA child',
          cartographyId: '12',
          parameters: { advancedTaskKind: 'child' }
        }
      ]
    } as any);

    expect(service.hasMiaTasks()).toBe(true);
    expect(service.getTasksForCartography('12').map((task) => task.id)).toEqual(['task/16']);
  });

  it('discovers export actions from the global profile task list', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/16',
          typeId: 16,
          name: 'MIA parent',
          cartographyId: '12',
          parameters: { advancedTaskKind: 'parent' }
        },
        {
          id: 'task/32312',
          typeId: 17,
          name: 'Plantilla PDF',
          parameters: {
            output: 'pdf'
          }
        }
      ]
    } as any);

    expect(service.getExportActionsForCartography('12')).toEqual([
      { taskId: 32312, output: 'pdf', label: 'Plantilla PDF' }
    ]);
  });

  it('indexes document export actions by layer id when profile uses layer/<id>', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/32312',
          typeId: 17,
          name: 'Plantilla PDF',
          layer: 'layer/12',
          parameters: {
            output: 'pdf'
          }
        }
      ]
    } as any);

    expect(service.getExportActionsForCartography('12')).toEqual([
      { taskId: 32312, output: 'pdf', label: 'Plantilla PDF' }
    ]);
  });

  it('merges global and cartography PDF export actions and ignores XML output', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/32312',
          typeId: 17,
          name: 'Global PDF',
          parameters: { output: 'pdf' }
        },
        {
          id: 'task/32312',
          typeId: 17,
          name: 'Layer PDF duplicate',
          layer: 'layer/12',
          parameters: { output: 'pdf' }
        },
        {
          id: 'task/32313',
          typeId: 17,
          name: 'Layer XML',
          layer: 'layer/12',
          parameters: { output: 'xml' }
        }
      ]
    } as any);

    expect(service.getExportActionsForCartography('12')).toEqual([
      { taskId: 32312, output: 'pdf', label: 'Layer PDF duplicate' }
    ]);
  });

  it('ignores legacy query tasks that point to the template export endpoint', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/32312',
          typeId: 5,
          name: 'Legacy export',
          url: 'http://localhost:9000/backend/api/tasks/template/export',
          mimeType: 'application/pdf',
          filename: 'plantillaConsulta.pdf',
          parameters: {
            output: {
              type: 'query',
              required: true
            }
          }
        }
      ]
    } as any);

    expect(service.getExportActionsForCartography('12')).toEqual([]);
  });

  it('accepts only PDF output while retaining PDF MIME and filename inference', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/401',
          typeId: 17,
          cartographyId: '12',
          name: 'PDF value output',
          parameters: { downloadFormat: { value: 'pdf' } }
        },
        {
          id: 'task/402',
          typeId: 17,
          cartographyId: '12',
          name: 'Mime output',
          mimeType: 'application/pdf'
        },
        {
          id: 'task/403',
          typeId: 17,
          cartographyId: '12',
          name: 'Filename output',
          filename: 'report.jrxml'
        }
      ]
    } as any);

    expect(service.getExportActionsForCartography('12')).toEqual([
      { taskId: 401, output: 'pdf', label: 'PDF value output' },
      { taskId: 402, output: 'pdf', label: 'Mime output' }
    ]);
  });

  it('renders all MIA tasks in one backend request with map-session coords and lang', () => {
    let emitted: any;

    service.setMapContext(5, 7);
    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }, { featureBbox: [5, 6, 7, 8], applicationId: 7, territoryId: 11 }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('lang')).toBe('ca');
    expect(req.request.body).toEqual({
      miaTaskIds: [16, 18],
      appId: 5,
      terId: 7,
      parameters: { id: 99 },
      featureBbox: [5, 6, 7, 8]
    });

    req.flush({ tasks: [{ taskId: 16, title: 'One', html: '<p>ok</p>' }] });
    expect(emitted).toEqual([{ taskId: 16, title: 'One', html: '<p>ok</p>' }]);
  });

  it('associates render request errors with every requested MIA task', () => {
    let emitted: any;

    service.setMapContext(7, 11);
    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }, { applicationId: 7, territoryId: 11 }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Boom' });

    const error = 'Http failure response for http://localhost:9000/backend/api/tasks/template/more-info-advanced/render?lang=ca: 500 Boom';
    expect(emitted).toEqual([
      { taskId: 16, title: 'One', html: '', error },
      { taskId: 18, title: 'Two', html: '', error }
    ]);
  });

  it.each([
    { featureBbox: [1, 2, 3] },
    { featureBbox: [1, 2, 3, 4, 5] },
    { featureBbox: [null, 2, 3, 4] },
    { featureBbox: [1, 2, Number.POSITIVE_INFINITY, 4] },
    { featureBbox: [5, 2, 3, 4] },
    { featureBbox: [1, 6, 3, 4] }
  ])('omits invalid featureBbox $featureBbox', ({ featureBbox }) => {
    service.setMapContext(7, 11);
    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], {}, { featureBbox: featureBbox as number[], applicationId: 7, territoryId: 11 }).subscribe();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.body).not.toHaveProperty('featureBbox');
    req.flush({ tasks: [] });
  });

  it('sends only referenced fields when child parameter mappings are known', () => {
    service.setMapContext(7, 11);
    service.renderMiaTasks([
      {
        id: 'task/16',
        name: 'One',
        cartographyId: '12',
        visualizationMode: 'tabs',
        includedTasks: [
          {
            id: 'task/20',
            name: 'Child',
            order: 1,
            childType: 'query',
            parameters: { childParam: 'featureId' },
            childTaskParameters: { child: { label: 'featureName' } }
          }
        ]
      }
    ], {
      featureId: 10,
      featureName: 'Road',
      ignored: 'value',
      html: '<div class="sitmun-more-info-x">ignored</div>'
    }, { applicationId: 7, territoryId: 11 }).subscribe();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.body).toEqual({
      miaTaskIds: [16],
      appId: 7,
      terId: 11,
      parameters: {
        featureId: 10,
        featureName: 'Road'
      }
    });

    req.flush({ tasks: [] });
  });

  it('keeps short feature attributes when MIA child mappings are not available in viewer config', () => {
    service.setMapContext(5, 7);
    service.renderMiaTasks([
      { id: 'task/32304', name: 'MIA 1', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], {
      dificultat: 'Mitjana',
      descr_ca: 'x'.repeat(501)
    }, {
      applicationId: 7,
      territoryId: 11
    }).subscribe();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('lang')).toBe('ca');
    expect(req.request.body).toEqual({
      miaTaskIds: [32304],
      appId: 5,
      terId: 7,
      parameters: { dificultat: 'Mitjana' }
    });

    req.flush({ tasks: [] });
  });

  it('includes taskId and templateTaskId in html export requests when provided', () => {
    let emitted: any;

    service.exportTemplate({
      template: '<p>Hola</p>',
      output: 'pdf',
      taskId: 201,
      templateTaskId: 32312,
      applicationId: 7,
      territoryId: 11
    }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toContain('<output>pdf</output>');
    expect(req.request.body).toContain('<taskId>201</taskId>');
    expect(req.request.body).toContain('<templateTaskId>32312</templateTaskId>');
    expect(req.request.body).toContain('<applicationId>7</applicationId>');
    expect(req.request.body).toContain('<territoryId>11</territoryId>');
    expect(req.request.body).toContain('<template><![CDATA[<p>Hola</p>]]></template>');
    expect(req.request.headers.get('Content-Type')).toBe('application/xml');
    expect(req.request.responseType).toBe('blob');

    req.flush(new Blob(['pdf']), {
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="Plantilla territori.pdf"' })
    });

    expect(emitted.filename).toBe('Plantilla territori.pdf');
    expect(emitted.blob).toBeInstanceOf(Blob);
  });

  it('returns null filename when response has no content disposition header', () => {
    let emitted: any;

    service.exportTemplate({
      template: '<p>Hola</p>',
      output: 'pdf',
      taskId: 99,
      applicationId: 7,
      territoryId: 11
    }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    req.flush(new Blob(['pdf']));

    expect(emitted.filename).toBeNull();
    expect(emitted.blob).toBeInstanceOf(Blob);
  });

  it('parses template and document export child types and defaults visualization mode to tabs', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/16',
          typeId: 16,
          name: 'MIA parent',
          cartographyId: '12',
          parameters: {
            includedTasks: [
              { id: 'task/2', name: 'Template child', order: 2, childType: 'template' },
              { id: 'task/3', name: 'Export child', order: 1, childType: 'documentExport' },
              { id: 'task/4', name: 'Query child', order: 3, childType: 'unknown' }
            ]
          }
        }
      ]
    } as any);

    expect(service.getTasksForCartography('12')).toEqual([
      {
        id: 'task/16',
        name: 'MIA parent',
        cartographyId: '12',
        visualizationMode: 'tabs',
        includedTasks: [
          { id: 'task/3', name: 'Export child', order: 1, childType: 'documentExport', parameters: null, childTaskParameters: null },
          { id: 'task/2', name: 'Template child', order: 2, childType: 'template', parameters: null, childTaskParameters: null },
          { id: 'task/4', name: 'Query child', order: 3, childType: 'query', parameters: null, childTaskParameters: null }
        ]
      }
    ]);
  });

  it('includes taskId and templateTaskId in html export requests when provided', () => {
    let emitted: any;

    service.exportTemplate({
      template: '<p>Hola</p>',
      output: 'pdf',
      taskId: 201,
      templateTaskId: 32312,
      applicationId: 7,
      territoryId: 11
    }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toContain('<output>pdf</output>');
    expect(req.request.body).toContain('<taskId>201</taskId>');
    expect(req.request.body).toContain('<templateTaskId>32312</templateTaskId>');
    expect(req.request.body).toContain('<applicationId>7</applicationId>');
    expect(req.request.body).toContain('<territoryId>11</territoryId>');
    expect(req.request.body).toContain('<template><![CDATA[<p>Hola</p>]]></template>');
    expect(req.request.headers.get('Content-Type')).toBe('application/xml');
    expect(req.request.responseType).toBe('blob');

    req.flush(new Blob(['pdf']), {
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="Plantilla territori.pdf"' })
    });

    expect(emitted.filename).toBe('Plantilla territori.pdf');
    expect(emitted.blob).toBeInstanceOf(Blob);
  });

  it('returns null filename when response has no content disposition header', () => {
    let emitted: any;

    service.exportTemplate({
      template: '<p>Hola</p>',
      output: 'pdf',
      taskId: 99,
      applicationId: 7,
      territoryId: 11
    }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    req.flush(new Blob(['pdf']));

    expect(emitted.filename).toBeNull();
    expect(emitted.blob).toBeInstanceOf(Blob);
  });

  it('parses template and document export child types and defaults visualization mode to tabs', () => {
    service.initialize({
      tasks: [
        {
          id: 'task/1',
          typeId: 1,
          'ui-control': 'sitna.moreInfoAdvanced',
          parameters: {}
        },
        {
          id: 'task/16',
          typeId: 16,
          name: 'MIA parent',
          cartographyId: '12',
          parameters: {
            includedTasks: [
              { id: 'task/2', name: 'Template child', order: 2, childType: 'template' },
              { id: 'task/3', name: 'Export child', order: 1, childType: 'documentExport' },
              { id: 'task/4', name: 'Query child', order: 3, childType: 'unknown' }
            ]
          }
        }
      ]
    } as any);

    expect(service.getTasksForCartography('12')).toEqual([
      {
        id: 'task/16',
        name: 'MIA parent',
        cartographyId: '12',
        visualizationMode: 'tabs',
        includedTasks: [
          { id: 'task/3', name: 'Export child', order: 1, childType: 'documentExport', parameters: null, childTaskParameters: null },
          { id: 'task/2', name: 'Template child', order: 2, childType: 'template', parameters: null, childTaskParameters: null },
          { id: 'task/4', name: 'Query child', order: 3, childType: 'query', parameters: null, childTaskParameters: null }
        ]
      }
    ]);
  });

  it('maps missing appId/terId onto each requested MIA task id', () => {
    let emitted: any;

    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }).subscribe((result) => {
      emitted = result;
    });

    httpMock.expectNone((request) =>
      request.url.endsWith('/api/tasks/template/more-info-advanced/render')
    );
    expect(emitted).toEqual([
      {
        taskId: 16,
        title: 'One',
        html: '',
        error: expect.stringContaining('appId and terId'),
      },
      {
        taskId: 18,
        title: 'Two',
        html: '',
        error: expect.stringContaining('appId and terId'),
      },
    ]);
  });

  it('maps HTTP render failures onto each requested MIA task id', () => {
    let emitted: any;

    service.setMapContext(5, 7);
    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(emitted).toEqual([
      { taskId: 16, title: 'One', html: '', error: expect.stringMatching(/500|Http failure|boom/i) },
      { taskId: 18, title: 'Two', html: '', error: expect.stringMatching(/500|Http failure|boom/i) }
    ]);
  });
});
