import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { MoreInfoAdvancedService } from './more-info-advanced.service';

describe('MoreInfoAdvancedService', () => {
  let service: MoreInfoAdvancedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoreInfoAdvancedService]
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

  it('merges global and cartography export actions and deduplicates by taskId and output', () => {
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
      { taskId: 32312, output: 'pdf', label: 'Layer PDF duplicate' },
      { taskId: 32313, output: 'xml', label: 'Layer XML' }
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

  it('infers export output from downloadFormat value object, mime type and filename', () => {
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
          name: 'Obj output',
          parameters: { downloadFormat: { value: 'xml' } }
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
      { taskId: 401, output: 'xml', label: 'Obj output' },
      { taskId: 402, output: 'pdf', label: 'Mime output' },
      { taskId: 403, output: 'xml', label: 'Filename output' }
    ]);
  });

  it('renders all MIA tasks in one backend request', () => {
    let emitted: any;

    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ miaTaskIds: [16, 18], parameters: { id: 99 } });

    req.flush({ tasks: [{ taskId: 16, title: 'One', html: '<p>ok</p>' }] });
    expect(emitted).toEqual([{ taskId: 16, title: 'One', html: '<p>ok</p>' }]);
  });

  it('keeps short feature attributes when MIA child mappings are not available in viewer config', () => {
    service.renderMiaTasks([
      { id: 'task/32304', name: 'MIA 1', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], {
      dificultat: 'Mitjana',
      descr_ca: 'x'.repeat(501)
    }).subscribe();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      miaTaskIds: [32304],
      parameters: { dificultat: 'Mitjana' }
    });

    req.flush({ tasks: [] });
  });

  it('includes taskId and templateTaskId in html export requests when provided', () => {
    let emitted: any;

    service.exportTemplate('<p>Hola</p>', 'pdf', 201, 32312).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toContain('<output>pdf</output>');
    expect(req.request.body).toContain('<taskId>201</taskId>');
    expect(req.request.body).toContain('<templateTaskId>32312</templateTaskId>');
    expect(req.request.body).toContain('<template><![CDATA[<p>Hola</p>]]></template>');
    expect(req.request.responseType).toBe('blob');

    req.flush(new Blob(['pdf']), {
      headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="Plantilla territori.pdf"' })
    });

    expect(emitted.filename).toBe('Plantilla territori.pdf');
    expect(emitted.blob).toBeInstanceOf(Blob);
  });

  it('exports xml without taskId and decodes RFC5987 filename header', () => {
    let emitted: any;

    service.exportTemplate('<report>]]></report>', 'xml').subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    expect(req.request.body).toContain('<output>xml</output>');
    expect(req.request.body).not.toContain('<taskId>');
    expect(req.request.body).toContain('<template><![CDATA[<report>]]]]><![CDATA[></report>]]></template>');

    req.flush(new Blob(['xml']), {
      headers: new HttpHeaders({ 'Content-Disposition': "attachment; filename*=UTF-8''Plantilla%20territori.xml" })
    });

    expect(emitted.filename).toBe('Plantilla territori.xml');
  });

  it('returns null filename when response has no content disposition header', () => {
    let emitted: any;

    service.exportTemplate('<p>Hola</p>', 'pdf', 99).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/export'));
    req.flush(new Blob(['pdf']));

    expect(emitted.filename).toBeNull();
    expect(emitted.blob).toBeInstanceOf(Blob);
  });
});
