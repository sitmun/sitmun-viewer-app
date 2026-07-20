import {
  applyPaneHeight,
  attachToolsPanelSplitter,
  clampPaneHeight,
  clearPaneHeight,
  findCapasCatalogPair,
  listLoadedToolsPanes,
  listSplitToolsPanes,
  PANE_RESIZED_CLASS,
  readPaneHeights,
  SPLITTER_CLASS,
  TOOLS_PANEL_PANE_HEIGHTS_KEY,
  TOOLS_PANEL_WLM_HEIGHT_KEY,
  WLM_HEIGHT_MIN_PX,
  writePaneHeight
} from './tools-panel-splitter';

function pointerEvent(type: string, clientY: number, pointerId = 1): PointerEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperty(event, 'clientY', { value: clientY });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  return event;
}

describe('tools-panel-splitter', () => {
  describe('clampPaneHeight', () => {
    it('clamps to min and reserve-below max', () => {
      expect(
        clampPaneHeight(10, 400, { minPx: WLM_HEIGHT_MIN_PX, reserveBelowPx: 160 })
      ).toBe(WLM_HEIGHT_MIN_PX);
      expect(
        clampPaneHeight(500, 400, { minPx: WLM_HEIGHT_MIN_PX, reserveBelowPx: 160 })
      ).toBe(400 - 160 - 6);
    });
  });

  describe('storage', () => {
    it('migrates legacy Capas height into paneHeights', () => {
      const store = new Map<string, string>();
      const storage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        }
      };
      store.set(TOOLS_PANEL_WLM_HEIGHT_KEY, '210');
      expect(readPaneHeights(storage)['tc-slot-wlm']).toBe(210);
      writePaneHeight(storage, 'tc-slot-bms', 90);
      expect(JSON.parse(store.get(TOOLS_PANEL_PANE_HEIGHTS_KEY)!)).toEqual({
        'tc-slot-wlm': 210,
        'tc-slot-bms': 90
      });
    });
  });

  describe('listLoadedToolsPanes / findCapasCatalogPair', () => {
    it('finds Capas and catalog among mounted controls', () => {
      const content = document.createElement('div');
      content.innerHTML = `
        <div id="tc-slot-bms" class="tc-ctl tc-ctl-bms tc-collapsed"></div>
        <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm"></div>
        <div id="tc-slot-toc" class="tc-ctl tc-ctl-lcat"></div>
        <div id="tc-slot-xdata" class="tc-ctl tc-ctl-tctr tc-collapsed"></div>
      `;
      expect(listLoadedToolsPanes(content).map((el) => el.id)).toEqual([
        'tc-slot-bms',
        'tc-slot-wlm',
        'tc-slot-toc',
        'tc-slot-xdata'
      ]);
      expect(listSplitToolsPanes(content).map((el) => el.id)).toEqual([
        'tc-slot-wlm',
        'tc-slot-toc'
      ]);
      const pair = findCapasCatalogPair(content);
      expect(pair?.capas.id).toBe('tc-slot-wlm');
      expect(pair?.catalog.id).toBe('tc-slot-toc');
      expect(pair?.belowPanes.map((el) => el.id)).toEqual([
        'tc-slot-toc',
        'tc-slot-xdata'
      ]);
    });
  });

  describe('attachToolsPanelSplitter', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('inserts no splitter when Capas or catalog is missing', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm"></div>
            <div id="tc-slot-toc"></div>
          </div>
        </div>
      `;
      const handles = attachToolsPanelSplitter(document, null);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(0);
      handles?.dispose();
    });

    it('expands Capas and shows splitter when the first loaded layer appears', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm tc-collapsed">
              <h2>Loaded Layers</h2>
              <div class="tc-ctl-wlm-content"><ul></ul></div>
            </div>
            <div id="tc-slot-toc" class="tc-ctl tc-ctl-lcat"></div>
          </div>
        </div>
      `;
      const content = document.querySelector('.tc-panel-content') as HTMLElement;
      Object.defineProperty(content, 'getBoundingClientRect', {
        value: () => ({ height: 500, width: 300, top: 0, left: 0, bottom: 500, right: 300 })
      });
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      const handles = attachToolsPanelSplitter(document, null);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(0);
      expect(wlm.classList.contains('tc-collapsed')).toBe(true);

      const ul = wlm.querySelector('ul') as HTMLElement;
      const li = document.createElement('li');
      li.className = 'tc-ctl-wlm-elm';
      ul.appendChild(li);
      handles!.sync();

      expect(wlm.classList.contains('tc-collapsed')).toBe(false);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(1);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      expect(parseFloat(wlm.style.height)).toBe(WLM_HEIGHT_MIN_PX);
      handles?.dispose();
    });

    it('hides splitter and clears height when Capas has no loaded layers', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm">
              <h2>Loaded Layers</h2>
              <div class="tc-ctl-wlm-empty"></div>
            </div>
            <div id="tc-slot-toc" class="tc-ctl tc-ctl-lcat"></div>
          </div>
        </div>
      `;
      const content = document.querySelector('.tc-panel-content') as HTMLElement;
      Object.defineProperty(content, 'getBoundingClientRect', {
        value: () => ({ height: 500, width: 300, top: 0, left: 0, bottom: 500, right: 300 })
      });
      const store = new Map<string, string>([
        [TOOLS_PANEL_PANE_HEIGHTS_KEY, JSON.stringify({ 'tc-slot-wlm': 347 })]
      ]);
      const storage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        }
      };
      const handles = attachToolsPanelSplitter(document, storage);
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(0);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(false);
      expect(wlm.style.height).toBe('');
      handles?.dispose();
    });

    it('clears locked Capas height when Capas collapses', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm" style="height: 160px">
              <ul><li class="tc-ctl-wlm-elm" data-layer-id="1"></li></ul>
            </div>
            <div id="tc-slot-toc" class="tc-ctl tc-ctl-lcat"></div>
          </div>
        </div>
      `;
      const content = document.querySelector('.tc-panel-content') as HTMLElement;
      Object.defineProperty(content, 'getBoundingClientRect', {
        value: () => ({ height: 500, width: 300, top: 0, left: 0, bottom: 500, right: 300 })
      });
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      const handles = attachToolsPanelSplitter(document, null);
      applyPaneHeight(wlm, 180);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      wlm.classList.add('tc-collapsed');
      handles!.sync();
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(false);
      expect(wlm.style.height).toBe('');
      handles?.dispose();
    });

    it('resizes Capas while Capas and catalog stay co-visible', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-bms" class="tc-ctl tc-ctl-bms tc-collapsed" style="height: 40px"></div>
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm" style="height: 160px">
              <ul><li class="tc-ctl-wlm-elm" data-layer-id="1"></li></ul>
            </div>
            <div id="tc-slot-toc" class="tc-ctl tc-ctl-lcat" style="height: 300px"></div>
            <div id="tc-slot-xdata" class="tc-ctl tc-ctl-tctr tc-collapsed" style="height: 40px"></div>
          </div>
        </div>
      `;
      const content = document.querySelector('.tc-panel-content') as HTMLElement;
      Object.defineProperty(content, 'getBoundingClientRect', {
        value: () => ({ height: 500, width: 300, top: 0, left: 0, bottom: 500, right: 300 })
      });
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      Object.defineProperty(wlm, 'getBoundingClientRect', {
        value: () => {
          const h = parseFloat(wlm.style.height || '160');
          return { height: h, width: 300, top: 40, left: 0, bottom: 40 + h, right: 300 };
        }
      });

      const store = new Map<string, string>();
      const storage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        }
      };

      const handles = attachToolsPanelSplitter(document, storage);
      const splitters = Array.from(
        document.querySelectorAll(`.${SPLITTER_CLASS}`),
      ) as HTMLElement[];
      expect(splitters.length).toBe(1);
      expect(splitters[0]!.previousElementSibling?.id).toBe('tc-slot-wlm');
      expect(splitters[0]!.nextElementSibling?.id).toBe('tc-slot-toc');

      const toc = document.querySelector('#tc-slot-toc') as HTMLElement;
      const wlmSplitter = splitters[0]!;
      wlmSplitter.setPointerCapture = jest.fn();
      wlmSplitter.releasePointerCapture = jest.fn();
      wlmSplitter.dispatchEvent(pointerEvent('pointerdown', 200));
      expect(toc.classList.contains('tc-collapsed')).toBe(false);
      window.dispatchEvent(pointerEvent('pointermove', 260));
      window.dispatchEvent(pointerEvent('pointerup', 260));

      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      expect(wlm.style.flex).toBe('0 0 auto');
      expect(parseFloat(wlm.style.height)).toBe(220);
      expect(readPaneHeights(storage)['tc-slot-wlm']).toBe(220);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(1);

      wlmSplitter.dispatchEvent(pointerEvent('pointerdown', 200));
      window.dispatchEvent(pointerEvent('pointermove', 200 + 400));
      window.dispatchEvent(pointerEvent('pointerup', 200 + 400));
      // Capas grows, but catalog keeps ≥ CATALOG_MIN_REMAINING (+ xdata header).
      expect(parseFloat(wlm.style.height)).toBeGreaterThan(220);
      expect(parseFloat(wlm.style.height)).toBeLessThanOrEqual(500 - 160 - 40 - 6);
      expect(toc.classList.contains('tc-collapsed')).toBe(false);

      // Manual Capas header collapse clears locked height; splitter + catalog stay.
      wlm.classList.add('tc-collapsed');
      handles!.sync();
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(1);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(false);

      applyPaneHeight(wlm, 180);
      clearPaneHeight(wlm);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(false);

      handles!.dispose();
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(0);
    });
  });
});
