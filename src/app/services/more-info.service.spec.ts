import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MoreInfoService } from './more-info.service';

describe('MoreInfoService', () => {
  let service: MoreInfoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoreInfoService]
    });

    service = TestBed.inject(MoreInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('initialize', () => {
    it('should register only sitna.moreInfo tasks and extract cartography ids', () => {
      service.initialize({
        tasks: [
          {
            id: 'task-1',
            'ui-control': 'sitna.moreInfo',
            cartography: { id: 12 }
          },
          {
            id: 'task-2',
            'ui-control': 'sitna.moreInfo',
            parameters: '{"cartographyId": "77"}'
          },
          {
            id: 'task-3',
            'ui-control': 'sitna.featureInfo',
            cartography: { id: 12 }
          }
        ]
      } as any);

      expect(service.hasMoreInfoTasks()).toBe(true);
      expect(service.getMoreInfoTasks('12').map((task) => task.id)).toEqual([
        'task-1'
      ]);
      expect(service.getMoreInfoTasks('77').map((task) => task.id)).toEqual([
        'task-2'
      ]);
      expect(service.getMoreInfoTask('999')).toBeNull();
    });
  });

  describe('executeMoreInfo', () => {
    it('should execute URL task and open resolved URL', () => {
      const openSpy = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: openSpy
      });

      let emitted: any;
      service
        .executeMoreInfo(
          {
            id: 'url-task',
            command: 'https://example.org/item/$CODI$?name={Nom}',
            parameters: {
              CODI: { label: '$CODI$', value: 'Codi' }
            }
          },
          {
            Codi: '08001',
            Nom: 'Barcelona'
          }
        )
        .subscribe((result) => {
          emitted = result;
        });

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.org/item/08001?name=Barcelona',
        '_blank'
      );
      expect(emitted).toEqual({
        redirected: true,
        success: true,
        url: 'https://example.org/item/08001?name=Barcelona'
      });
    });

    it('should expand RFC6570 URL templates using declared parameters (including dotted field paths)', () => {
      const openSpy = jest.fn();
      Object.defineProperty(window, 'open', {
        writable: true,
        value: openSpy
      });

      let emitted: any;
      service
        .executeMoreInfo(
          {
            id: 'url-task-rfc6570',
            command:
              'https://example.org/item/{code}?name={name}&season={season}',
            parameters: {
              code: { label: 'code', value: 'properties.code' },
              name: { label: 'name', value: 'Nom' },
              season: { label: 'season', value: 'properties.season' }
            }
          },
          {
            Nom: 'Barcelona',
            properties: { code: '08001', season: 2024 }
          }
        )
        .subscribe((result) => {
          emitted = result;
        });

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.org/item/08001?name=Barcelona&season=2024',
        '_blank'
      );
      expect(emitted).toEqual({
        redirected: true,
        success: true,
        url: 'https://example.org/item/08001?name=Barcelona&season=2024'
      });
    });

    it('should return an error for invalid JSON task parameters', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      let emitted: any;

      service
        .executeMoreInfo(
          {
            id: 'invalid-task',
            command: 'https://example.org',
            parameters: '{invalid-json'
          },
          { id: 1 }
        )
        .subscribe((result) => {
          emitted = result;
        });

      expect(emitted).toEqual({ error: 'Invalid task parameters' });
      consoleErrorSpy.mockRestore();
    });

    it('should execute SQL queryType tasks against configured apiUrl', () => {
      let emitted: any;

      service
        .executeMoreInfo(
          {
            id: 'sql-task',
            parameters: {
              queryType: 'sql',
              sql: 'SELECT * FROM municipis WHERE id = {id}',
              apiUrl: '/api/sql'
            }
          },
          { id: 123 }
        )
        .subscribe((result) => {
          emitted = result;
        });

      const req = httpMock.expectOne((request) =>
        request.url.startsWith('/api/sql')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('sql')).toBe(
        'SELECT * FROM municipis WHERE id = 123'
      );
      req.flush({ rows: [{ id: 123 }] });

      expect(emitted).toEqual({
        success: true,
        data: { rows: [{ id: 123 }] }
      });
    });

    it('should execute scope API tasks with params mapping', () => {
      let emitted: any;

      service
        .executeMoreInfo(
          {
            id: 'api-task',
            scope: 'API',
            command: '/api/info/{id}',
            parameters: {
              queryType: 'api',
              params: {
                city: '{city}',
                page: 1,
                active: true,
                meta: { source: 'sitmun' }
              }
            }
          },
          { id: 12, city: 'Barcelona' }
        )
        .subscribe((result) => {
          emitted = result;
        });

      const req = httpMock.expectOne(
        '/api/info/12?city=Barcelona&page=1&active=true&meta=%7B%22source%22:%22sitmun%22%7D'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ ok: true });

      expect(emitted).toEqual({
        success: true,
        data: { ok: true }
      });
    });

    it('should execute scope SQL proxy tasks and build query params from task config', () => {
      let emitted: any;

      service
        .executeMoreInfo(
          {
            id: 'sql-proxy-task',
            scope: 'SQL',
            url: '/api/sql-proxy/{layer}',
            parameters: {
              $ID$: { value: 'id' },
              code: { name: 'Codi' }
            }
          },
          { id: 7, Codi: '08001', layer: 'municipis' }
        )
        .subscribe((result) => {
          emitted = result;
        });

      const req = httpMock.expectOne(
        '/api/sql-proxy/municipis?ID=7&code=08001'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ total: 1 });

      expect(emitted).toEqual({
        success: true,
        data: { total: 1 }
      });
    });

    it('should return unknown query type error when queryType is unsupported', () => {
      let emitted: any;

      service
        .executeMoreInfo(
          {
            id: 'unknown-task',
            parameters: {
              queryType: 'something-else'
            }
          },
          { id: 1 }
        )
        .subscribe((result) => {
          emitted = result;
        });

      expect(emitted).toEqual({ error: 'Unknown query type: something-else' });
    });
  });
});
