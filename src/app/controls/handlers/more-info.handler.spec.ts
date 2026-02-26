import { of, throwError } from 'rxjs';

import { FeatureInfoMoreInfoHandler } from './more-info.handler';
import { MoreInfoService } from '../../services/more-info.service';

describe('FeatureInfoMoreInfoHandler', () => {
  let handler: FeatureInfoMoreInfoHandler;
  let mockMoreInfoService: jest.Mocked<MoreInfoService>;
  const getAppConfig = jest.fn();
  const showJsonResult = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';

    mockMoreInfoService = {
      getMoreInfoTasks: jest.fn(),
      executeMoreInfo: jest.fn()
    } as Partial<jest.Mocked<MoreInfoService>> as jest.Mocked<MoreInfoService>;

    getAppConfig.mockReturnValue({
      layers: [
        {
          id: 'layer/12',
          layers: ['municipis']
        }
      ]
    });

    handler = new FeatureInfoMoreInfoHandler(
      mockMoreInfoService,
      getAppConfig,
      showJsonResult
    );
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('injectMoreInfoFields', () => {
    it('should build a clickable link for URL tasks replacing placeholders', () => {
      const feature = {
        data: { Codi: '08001', codi: '08001' },
        setData: jest.fn()
      };

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        {
          id: 'task-url',
          name: 'Fitxa municipal',
          command: 'https://example.org/item/$CODI$',
          parameters: {
            CODI: { label: '$CODI$', value: 'Codi' }
          }
        }
      ]);

      handler.injectMoreInfoFields({
        services: [
          {
            layers: [
              {
                name: 'municipis',
                features: [feature]
              }
            ]
          }
        ]
      });

      expect(mockMoreInfoService.getMoreInfoTasks).toHaveBeenCalledWith('12');
      expect(feature.setData).toHaveBeenCalledTimes(1);
      const injected = feature.setData.mock.calls[0][0];
      const moreInfoField = injected['ℹ️ Fitxa municipal'];

      expect(typeof moreInfoField).toBe('string');
      expect(moreInfoField).toContain('class="sitmun-more-info-link"');
      expect(moreInfoField).toContain('data-task-id="task-url"');
      expect(moreInfoField).toContain('data-cartography-id="12"');
      expect(moreInfoField).toContain('https://example.org/item/08001');
    });

    it('should build placeholders for non-interactive SQL/API tasks', () => {
      const feature = {
        data: { id: 'abc' },
        setData: jest.fn()
      };

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        {
          id: 'task-sql',
          name: 'Resum SQL',
          scope: 'SQL'
        },
        {
          id: 'task-api',
          name: 'Resum API',
          parameters: {
            queryType: 'api',
            apiUrl: 'https://api.example.org/items'
          }
        }
      ]);

      handler.injectMoreInfoFields({
        services: [
          {
            layers: [
              {
                name: 'municipis',
                features: [feature]
              }
            ]
          }
        ]
      });

      const injected = feature.setData.mock.calls[0][0];
      const sqlField = injected['ℹ️ Resum SQL'];
      const apiFieldKey = Object.keys(injected).find((key) =>
        key.startsWith('ℹ️ Resum API')
      );
      const apiField = apiFieldKey ? injected[apiFieldKey] : undefined;

      expect(sqlField).toContain('class="sitmun-more-info-placeholder"');
      expect(sqlField).toContain('data-task-id="task-sql"');
      expect(sqlField).toContain('(Carregant...)');

      expect(apiField).toContain('class="sitmun-more-info-placeholder"');
      expect(apiField).toContain('data-task-id="task-api"');
      expect(apiField).toContain('(Carregant...)');
    });

    it('should keep original command when task parameters JSON is invalid', () => {
      const feature = {
        data: { Codi: '08001', codi: '08001' },
        setData: jest.fn()
      };

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        {
          id: 'task-url',
          name: 'Fitxa municipal',
          command: 'https://example.org/item/$CODI$',
          parameters: '{invalid-json'
        }
      ]);

      handler.injectMoreInfoFields({
        services: [
          {
            layers: [
              {
                name: 'municipis',
                features: [feature]
              }
            ]
          }
        ]
      });

      const injected = feature.setData.mock.calls[0][0];
      const moreInfoField = injected['ℹ️ Fitxa municipal'];
      expect(moreInfoField).toContain('https://example.org/item/$CODI$');
    });
  });

  describe('attachMoreInfoListeners', () => {
    it('should execute link task by task-id and call showJsonResult with normalized rows', () => {
      const table = document.createElement('table');
      table.className = 'tc-attr';
      table.innerHTML = `
        <tbody>
          <tr><th>Codi</th><td>08001</td></tr>
          <tr><th>Nom</th><td>Barcelona</td></tr>
        </tbody>
      `;

      const link = document.createElement('a');
      link.className = 'sitmun-more-info-link';
      link.dataset['taskId'] = 'task-api';
      link.dataset['taskIndex'] = '0';
      link.dataset['cartographyId'] = '12';
      link.href = '#';
      table.appendChild(link);

      const container = document.createElement('div');
      container.appendChild(table);
      document.body.appendChild(container);

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        { id: 'task-api', name: 'Dades API' }
      ]);
      mockMoreInfoService.executeMoreInfo.mockReturnValue(
        of({ data: { city: 'Barcelona', count: 2 } })
      );

      handler.attachMoreInfoListeners({
        getInfoContainer: () => container
      });

      link.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenCalledWith(
        { id: 'task-api', name: 'Dades API' },
        expect.objectContaining({
          Codi: '08001',
          codi: '08001',
          Nom: 'Barcelona',
          nom: 'Barcelona'
        })
      );
      expect(showJsonResult).toHaveBeenCalledWith('Dades API', [
        { city: 'Barcelona', count: 2 }
      ]);
    });

    it('should fallback to task-index when task-id is missing', () => {
      const table = document.createElement('table');
      table.className = 'tc-attr';
      table.innerHTML = `
        <tbody>
          <tr><th>ID</th><td>123</td></tr>
        </tbody>
      `;

      const link = document.createElement('a');
      link.className = 'sitmun-more-info-link';
      link.dataset['taskIndex'] = '1';
      link.dataset['cartographyId'] = '12';
      link.href = '#';
      table.appendChild(link);

      const container = document.createElement('div');
      container.appendChild(table);
      document.body.appendChild(container);

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        { id: 'task-0', name: 'Primer task' },
        { id: 'task-1', name: 'Segon task' }
      ]);
      mockMoreInfoService.executeMoreInfo.mockReturnValue(
        of({ data: { ok: true } })
      );

      handler.attachMoreInfoListeners({
        getInfoContainer: () => container
      });

      link.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenCalledWith(
        { id: 'task-1', name: 'Segon task' },
        expect.objectContaining({ ID: '123', id: '123' })
      );
    });

    it('should trigger placeholder request and render HTML table with response data', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <table class="tc-attr">
          <tbody>
            <tr><th>ID</th><td>123</td></tr>
          </tbody>
          <tr>
            <td>
              <span
                class="sitmun-more-info-placeholder"
                data-task-id="task-sql"
                data-cartography-id="12"
                data-placeholder-id="ph-1"
              >Resum SQL (Carregant...)</span>
            </td>
          </tr>
        </table>
      `;
      document.body.appendChild(container);

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        { id: 'task-sql', name: 'Resum SQL', scope: 'SQL' }
      ]);
      mockMoreInfoService.executeMoreInfo.mockReturnValue(
        of({ data: { total: 15, status: 'ok' } })
      );

      handler.attachMoreInfoListeners({
        getInfoContainer: () => container
      });

      const placeholder = container.querySelector(
        '[data-placeholder-id="ph-1"]'
      ) as HTMLElement;

      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenCalledWith(
        { id: 'task-sql', name: 'Resum SQL', scope: 'SQL' },
        expect.objectContaining({ ID: '123', id: '123' })
      );
      expect(placeholder.innerHTML).toContain('sitmun-json-table');
      expect(placeholder.innerHTML).toContain('<th>total</th>');
      expect(placeholder.innerHTML).toContain('<td>15</td>');
    });

    it('should render escaped error in placeholder when execution fails', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <table class="tc-attr">
          <tbody><tr><th>ID</th><td>123</td></tr></tbody>
          <tr>
            <td>
              <span
                class="sitmun-more-info-placeholder"
                data-task-id="task-sql"
                data-cartography-id="12"
                data-placeholder-id="ph-2"
              >Resum SQL (Carregant...)</span>
            </td>
          </tr>
        </table>
      `;
      document.body.appendChild(container);

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        { id: 'task-sql', name: 'Resum SQL', scope: 'SQL' }
      ]);
      mockMoreInfoService.executeMoreInfo.mockReturnValue(
        throwError(() => new Error('boom <fail>'))
      );

      handler.attachMoreInfoListeners({
        getInfoContainer: () => container
      });

      const placeholder = container.querySelector(
        '[data-placeholder-id="ph-2"]'
      ) as HTMLElement;

      expect(placeholder.innerHTML).toContain('Error: boom &lt;fail&gt;');
    });

    it('should not render anything when result is redirected', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <span
          class="sitmun-more-info-placeholder"
          data-placeholder-id="ph-redirect"
        >pending</span>
      `;
      document.body.appendChild(container);

      (handler as any).displayMoreInfoResult(
        { id: 'task-r', name: 'Task redirect' },
        { redirected: true },
        'ph-redirect'
      );

      const placeholder = container.querySelector(
        '[data-placeholder-id="ph-redirect"]'
      ) as HTMLElement;
      expect(placeholder.innerHTML).toBe('pending');
      expect(showJsonResult).not.toHaveBeenCalled();
    });

    it('should flush pending result when placeholder appears later', () => {
      (handler as any).displayMoreInfoResult(
        { id: 'task-p', name: 'Task pending' },
        { data: { value: 7 } },
        'ph-pending'
      );

      const container = document.createElement('div');
      container.innerHTML = `
        <span
          class="sitmun-more-info-placeholder"
          data-placeholder-id="ph-pending"
        >Carregant...</span>
      `;
      document.body.appendChild(container);

      handler.attachMoreInfoListeners({
        getInfoContainer: () => container
      });

      const placeholder = container.querySelector(
        '[data-placeholder-id="ph-pending"]'
      ) as HTMLElement;
      expect(placeholder.innerHTML).toContain('sitmun-json-table');
      expect(placeholder.innerHTML).toContain('<td>7</td>');
    });
  });

  describe('executeSqlTasksForFeatures', () => {
    it('should execute only non-interactive tasks for each feature', () => {
      const feature1 = { getData: () => ({ id: '1' }) };
      const feature2 = { getData: () => ({ id: '2' }) };

      mockMoreInfoService.getMoreInfoTasks.mockReturnValue([
        { id: 'sql-1', name: 'Consulta SQL', scope: 'SQL' },
        { id: 'url-1', name: 'Link extern', command: 'https://example.org' }
      ]);
      mockMoreInfoService.executeMoreInfo.mockReturnValue(
        of({ data: { ok: 1 } })
      );

      handler.executeSqlTasksForFeatures({
        services: [
          {
            layers: [
              {
                name: 'municipis',
                features: [feature1, feature2]
              }
            ]
          }
        ]
      });

      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenCalledTimes(2);
      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenNthCalledWith(
        1,
        { id: 'sql-1', name: 'Consulta SQL', scope: 'SQL' },
        { id: '1' }
      );
      expect(mockMoreInfoService.executeMoreInfo).toHaveBeenNthCalledWith(
        2,
        { id: 'sql-1', name: 'Consulta SQL', scope: 'SQL' },
        { id: '2' }
      );
    });
  });
});
