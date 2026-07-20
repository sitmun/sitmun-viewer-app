import { TestBed } from '@angular/core/testing';

import { AppTree } from '@api/model/app-cfg';

import { CatalogSwitchingService } from './catalog-switching.service';
import { ConfigLookupService } from './config-lookup.service';
import { SitnaApiService } from './sitna-api.service';

describe('CatalogSwitchingService', () => {
  let service: CatalogSwitchingService;
  let sitnaApi: {
    getGlobal: jest.Mock;
    setGlobal: jest.Mock;
    getTC: jest.Mock;
  };
  let globals: Record<string, unknown>;

  beforeEach(() => {
    globals = {};
    sitnaApi = {
      getGlobal: jest.fn((key: string) => globals[key]),
      setGlobal: jest.fn((key: string, value: unknown) => {
        globals[key] = value;
      }),
      getTC: jest.fn().mockReturnValue({
        Consts: { classes: { HIDDEN: 'tc-hidden' } }
      })
    };

    TestBed.configureTestingModule({
      providers: [
        CatalogSwitchingService,
        { provide: SitnaApiService, useValue: sitnaApi }
      ]
    });
    service = TestBed.inject(CatalogSwitchingService);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('setupGlobalState', () => {
    it('defaults to the lowest-order tree when no prior selection exists', () => {
      const trees: AppTree[] = [
        {
          id: 'tree/2',
          title: 'Municipal',
          image: null,
          rootNode: '2',
          order: 2,
          nodes: {}
        },
        {
          id: 'tree/1',
          title: 'Provincial',
          image: null,
          rootNode: '1',
          order: 0,
          nodes: {}
        }
      ];
      const configLookup = {
        findTreeContainingNode: (nodeId: string) =>
          trees.find((tree) => tree.rootNode === nodeId)
      } as ConfigLookupService;

      service.setupGlobalState(['2', '1'], configLookup);

      expect(sitnaApi.setGlobal).toHaveBeenCalledWith(
        'layerCatalogsForModal',
        expect.objectContaining({
          currentTreeId: 'tree/1',
          catalogs: [
            { id: 'tree/1', catalog: 'Provincial' },
            { id: 'tree/2', catalog: 'Municipal' }
          ]
        })
      );
    });
  });

  describe('injectCatalogSwitchingButton', () => {
    it('injects an icon-only toolbar button with current-topic tooltip (no badge)', () => {
      globals['layerCatalogsForModal'] = {
        currentTreeId: 'tree/1',
        catalogs: [
          { id: 'tree/1', catalog: 'Provincial' },
          { id: 'tree/2', catalog: 'Municipal' }
        ]
      };

      const controlDiv = document.createElement('div');
      controlDiv.innerHTML =
        '<h2>Available layers<span class="tc-ctl-lcat-topic" data-sitmun-lcat-topic>stale</span></h2>';
      const control = {
        div: controlDiv,
        CLASS: 'tc-ctl-lcat',
        getLocaleString: (key: string) => {
          if (key === 'changeTopic') {
            return 'Change topic';
          }
          if (key === 'currentTopic') {
            return 'Current topic: {title}';
          }
          return key;
        }
      };

      service.injectCatalogSwitchingButton(control, { sitnaApi });

      const button = controlDiv.querySelector(
        '#change-catalog-sitmun'
      ) as HTMLButtonElement;

      expect(button).toBeTruthy();
      expect(button.tagName).toBe('BUTTON');
      expect(button.classList.contains('tc-ctl-lcat-btn-change-topic')).toBe(
        true
      );
      expect(button.classList.contains('tc-ctl-lcat-btn-search')).toBe(false);
      expect(button.classList.contains('tc-button')).toBe(false);
      const icon = button.querySelector('svg');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(button.textContent?.trim()).toBe('');
      expect(controlDiv.querySelector('.tc-ctl-lcat-topic')).toBeNull();
      expect(button.getAttribute('title')).toBe('Current topic: Provincial');
      expect(button.getAttribute('aria-label')).toBe(
        'Current topic: Provincial'
      );
    });

    it('should keep an inline SVG when re-normalizing an existing change-topic button', () => {
      globals['layerCatalogsForModal'] = {
        currentTreeId: 'tree/1',
        catalogs: [
          { id: 'tree/1', catalog: 'Provincial' },
          { id: 'tree/2', catalog: 'Municipal' }
        ]
      };

      const controlDiv = document.createElement('div');
      controlDiv.innerHTML =
        '<h2>Available layers<button type="button" id="change-catalog-sitmun" class="tc-button"></button></h2>';
      const control = {
        div: controlDiv,
        CLASS: 'tc-ctl-lcat',
        getLocaleString: (key: string) =>
          key === 'currentTopic' ? 'Current topic: {title}' : key
      };

      service.injectCatalogSwitchingButton(control, { sitnaApi });
      service.injectCatalogSwitchingButton(control, { sitnaApi });

      const button = controlDiv.querySelector(
        '#change-catalog-sitmun'
      ) as HTMLButtonElement;
      expect(button.querySelectorAll('svg')).toHaveLength(1);
      expect(button.classList.contains('tc-button')).toBe(false);
      expect(button.querySelector('svg')?.getAttribute('stroke')).toBe('#111111');
    });

    it('should not use unresolved locale keys as the change-topic tooltip', () => {
      globals['layerCatalogsForModal'] = {
        currentTreeId: 'tree/1',
        catalogs: [
          { id: 'tree/1', catalog: 'Provincial' },
          { id: 'tree/2', catalog: 'Municipal' }
        ]
      };

      const controlDiv = document.createElement('div');
      controlDiv.innerHTML = '<h2>Available layers</h2>';
      const control = {
        div: controlDiv,
        CLASS: 'tc-ctl-lcat',
        // SITNA echoes the key when the dictionary entry is missing
        getLocaleString: (key: string) => key
      };

      service.injectCatalogSwitchingButton(control, { sitnaApi });

      const button = controlDiv.querySelector(
        '#change-catalog-sitmun'
      ) as HTMLButtonElement;
      expect(button.getAttribute('title')).toBe('Current topic: Provincial');
      expect(button.getAttribute('aria-label')).toBe(
        'Current topic: Provincial'
      );
    });
  });
});
