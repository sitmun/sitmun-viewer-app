import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { URL_API_MAP_CONFIG } from '@api/api-config';
import { environment } from 'src/environments/environment';

import { CommonService } from './common.service';
import { AppConfigService } from '../../services/app-config.service';

describe('CommonService', () => {
  let service: CommonService;
  let httpMock: HttpTestingController;
  let appConfigService: jest.Mocked<
    Pick<AppConfigService, 'getTestConfigFile'>
  >;

  const mockAppCfg = {
    application: { id: 1, name: 'Test', theme: 'sitmun-base' },
    territory: { id: 10, name: 'Territory' },
    tasks: []
  };

  beforeEach(() => {
    appConfigService = {
      getTestConfigFile: jest.fn().mockReturnValue(null)
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CommonService,
        { provide: AppConfigService, useValue: appConfigService }
      ]
    });
    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('fetchMapConfiguration cache', () => {
    it('should use cache on second call within TTL', (done) => {
      const url = environment.apiUrl + URL_API_MAP_CONFIG(5, 10);
      service.fetchMapConfiguration(5, 10).subscribe((data) => {
        expect(data).toEqual(mockAppCfg);
        service.fetchMapConfiguration(5, 10).subscribe((data2) => {
          expect(data2).toEqual(mockAppCfg);
          done();
        });
      });
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppCfg);
    });

    it('should re-fetch when TTL expired', (done) => {
      const url = environment.apiUrl + URL_API_MAP_CONFIG(5, 10);
      service.fetchMapConfiguration(5, 10).subscribe((data) => {
        expect(data).toEqual(mockAppCfg);
        jest.useFakeTimers();
        jest.advanceTimersByTime(61_000);
        service.fetchMapConfiguration(5, 10).subscribe((data2) => {
          expect(data2).toEqual(mockAppCfg);
          jest.useRealTimers();
          done();
        });
        const req2 = httpMock.expectOne(url);
        req2.flush(mockAppCfg);
      });
      const req = httpMock.expectOne(url);
      req.flush(mockAppCfg);
    });

    it('should not cache on error, retry on next call', (done) => {
      const url = environment.apiUrl + URL_API_MAP_CONFIG(5, 10);
      service.fetchMapConfiguration(5, 10).subscribe({
        error: () => {
          service.fetchMapConfiguration(5, 10).subscribe((data) => {
            expect(data).toEqual(mockAppCfg);
            done();
          });
          const req2 = httpMock.expectOne(url);
          req2.flush(mockAppCfg);
        }
      });
      const req = httpMock.expectOne(url);
      req.error(new ProgressEvent('error'), {
        status: 500,
        statusText: 'Server Error'
      });
    });

    it('should bypass cache when test config file is set', () => {
      appConfigService.getTestConfigFile.mockReturnValue('test-config.json');
      service.fetchMapConfiguration(5, 10).subscribe();
      service.fetchMapConfiguration(5, 10).subscribe();
      const reqs = httpMock.match((r) =>
        r.url?.includes('assets/config/test-config.json')
      );
      expect(reqs.length).toBe(2);
    });
  });
});
