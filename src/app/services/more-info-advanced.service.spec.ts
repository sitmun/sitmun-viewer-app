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

  it('renders all MIA tasks in one backend request with map-session coords and lang', () => {
    let emitted: any;

    service.setMapContext(5, 7);
    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] },
      { id: 'task/18', name: 'Two', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }).subscribe((result) => {
      emitted = result;
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/tasks/template/more-info-advanced/render'));
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('lang')).toBe('ca');
    expect(req.request.body).toEqual({
      miaTaskIds: [16, 18],
      appId: 5,
      terId: 7,
      parameters: { id: 99 }
    });

    req.flush({ tasks: [{ taskId: 16, title: 'One', html: '<p>ok</p>' }] });
    expect(emitted).toEqual([{ taskId: 16, title: 'One', html: '<p>ok</p>' }]);
  });

  it('keeps short feature attributes when MIA child mappings are not available in viewer config', () => {
    service.setMapContext(5, 7);
    service.renderMiaTasks([
      { id: 'task/32304', name: 'MIA 1', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], {
      dificultat: 'Mitjana',
      descr_ca: 'x'.repeat(501)
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

  it('does not POST render without map-session coords', () => {
    let emitted: any;

    service.renderMiaTasks([
      { id: 'task/16', name: 'One', cartographyId: '12', visualizationMode: 'tabs', includedTasks: [] }
    ], { id: 99 }).subscribe((result) => {
      emitted = result;
    });

    httpMock.expectNone((request) =>
      request.url.endsWith('/api/tasks/template/more-info-advanced/render')
    );
    expect(emitted[0].error).toContain('appId and terId');
  });
});
