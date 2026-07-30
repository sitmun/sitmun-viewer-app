import {
  applyPaneHeight,
  attachToolsPanelSplitter,
  clampPaneHeight,
  clearPaneHeight,
  findCapasCatalogPair,
  heightToShowFirstCapasEntry,
  listLoadedToolsPanes,
  listSplitToolsPanes,
  PANE_RESIZED_CLASS,
  readPaneHeights,
  SPLITTER_CLASS,
  TOOLS_PANEL_PANE_HEIGHTS_KEY,
  TOOLS_PANEL_WLM_HEIGHT_KEY,
  WLM_ENTRY_EM,
  WLM_HEIGHT_MIN_PX,
  WLM_LIST_MARGIN_PX,
  writePaneHeight
} from './tools-panel-splitter';

/** Header + entry chrome + list margins. */
function expectedCapasOpenHeight(headerPx: number, entryPx: number): number {
  return Math.round(headerPx + entryPx + WLM_LIST_MARGIN_PX);
}

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

  describe('heightToShowFirstCapasEntry', () => {
    it('uses measured header and full LI entry chrome (not input-only)', () => {
      document.body.innerHTML = `
        <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm" style="font-size: 16px">
          <h2>Loaded Layers</h2>
          <div class="tc-ctl-wlm-content">
            <ul>
              <li class="tc-ctl-wlm-elm">
                <div class="tc-ctl-wlm-lyr"></div>
                <div class="tc-ctl-wlm-path"></div>
                <div class="tc-ctl-wlm-input"></div>
                <div class="tc-ctl-wlm-info tc-hidden"></div>
              </li>
            </ul>
          </div>
        </div>
      `;
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      const h2 = wlm.querySelector('h2') as HTMLElement;
      const li = wlm.querySelector('li') as HTMLElement;
      const input = wlm.querySelector('.tc-ctl-wlm-input') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      // Input-only is shorter; floor must use the full LI (path+title+tools).
      Object.defineProperty(input, 'getBoundingClientRect', {
        value: () => ({ height: 24, width: 300, top: 40, left: 0, bottom: 64, right: 300 })
      });
      Object.defineProperty(li, 'getBoundingClientRect', {
        value: () => ({ height: 71, width: 300, top: 40, left: 0, bottom: 111, right: 300 })
      });
      expect(heightToShowFirstCapasEntry(wlm)).toBe(expectedCapasOpenHeight(40, 71));
      expect(heightToShowFirstCapasEntry(wlm)).toBeLessThan(expectedCapasOpenHeight(40, 120));
    });

    it('ignores expanded layer details for the open/drag floor', () => {
      document.body.innerHTML = `
        <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm" style="font-size: 16px">
          <h2>Loaded Layers</h2>
          <div class="tc-ctl-wlm-content">
            <ul>
              <li class="tc-ctl-wlm-elm">
                <div class="tc-ctl-wlm-input"></div>
                <div class="tc-ctl-wlm-info"></div>
              </li>
            </ul>
          </div>
        </div>
      `;
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      const h2 = wlm.querySelector('h2') as HTMLElement;
      const li = wlm.querySelector('li') as HTMLElement;
      const info = wlm.querySelector('.tc-ctl-wlm-info') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      Object.defineProperty(info, 'getBoundingClientRect', {
        value: () => ({ height: 320, width: 300, top: 128, left: 0, bottom: 448, right: 300 })
      });
      Object.defineProperty(li, 'getBoundingClientRect', {
        value: () => ({ height: 408, width: 300, top: 40, left: 0, bottom: 448, right: 300 })
      });
      // 408 LI − 320 info = 88 entry chrome
      expect(heightToShowFirstCapasEntry(wlm)).toBe(expectedCapasOpenHeight(40, 88));
    });

    it('falls back to 5.5em entry chrome when the first entry has no layout yet', () => {
      document.body.innerHTML = `
        <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm" style="font-size: 16px">
          <h2>Loaded Layers</h2>
          <ul><li class="tc-ctl-wlm-elm"></li></ul>
        </div>
      `;
      const wlm = document.querySelector('#tc-slot-wlm') as HTMLElement;
      const h2 = wlm.querySelector('h2') as HTMLElement;
      const li = wlm.querySelector('li') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      Object.defineProperty(li, 'getBoundingClientRect', {
        value: () => ({ height: 0, width: 0, top: 0, left: 0, bottom: 0, right: 0 })
      });
      expect(heightToShowFirstCapasEntry(wlm)).toBe(WLM_HEIGHT_MIN_PX);
      expect(WLM_ENTRY_EM * 16).toBe(88);
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
      const input = document.createElement('div');
      input.className = 'tc-ctl-wlm-input';
      li.appendChild(input);
      ul.appendChild(li);
      const h2 = wlm.querySelector('h2') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      handles!.sync();

      expect(wlm.classList.contains('tc-collapsed')).toBe(false);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(1);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      expect(parseFloat(wlm.style.height)).toBe(WLM_HEIGHT_MIN_PX);
      handles?.dispose();
    });

    it('locks Capas height when the first layer appears on already-expanded Capas', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm">
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
      Object.defineProperty(wlm, 'getBoundingClientRect', {
        value: () => {
          const h = parseFloat(wlm.style.height || '48');
          return { height: h, width: 300, top: 0, left: 0, bottom: h, right: 300 };
        }
      });
      const handles = attachToolsPanelSplitter(document, null);
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(false);

      const ul = wlm.querySelector('ul') as HTMLElement;
      const li = document.createElement('li');
      li.className = 'tc-ctl-wlm-elm';
      const input = document.createElement('div');
      input.className = 'tc-ctl-wlm-input';
      li.appendChild(input);
      ul.appendChild(li);
      const h2 = wlm.querySelector('h2') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      handles!.sync();

      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      expect(parseFloat(wlm.style.height)).toBe(WLM_HEIGHT_MIN_PX);
      handles?.dispose();
    });

    it('does not grow Capas to fit expanded layer details on sync', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm">
              <h2>Loaded Layers</h2>
              <div class="tc-ctl-wlm-content">
                <ul>
                  <li class="tc-ctl-wlm-elm">
                    <div class="tc-ctl-wlm-input"></div>
                    <div class="tc-ctl-wlm-info tc-hidden"></div>
                  </li>
                </ul>
              </div>
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
      const h2 = wlm.querySelector('h2') as HTMLElement;
      const li = wlm.querySelector('li') as HTMLElement;
      const info = wlm.querySelector('.tc-ctl-wlm-info') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      let liHeight = 48;
      let infoHeight = 0;
      Object.defineProperty(info, 'getBoundingClientRect', {
        value: () => ({
          height: infoHeight,
          width: 300,
          top: 88,
          left: 0,
          bottom: 88 + infoHeight,
          right: 300
        })
      });
      Object.defineProperty(li, 'getBoundingClientRect', {
        value: () => ({
          height: liHeight,
          width: 300,
          top: 40,
          left: 0,
          bottom: 40 + liHeight,
          right: 300
        })
      });
      Object.defineProperty(wlm, 'getBoundingClientRect', {
        value: () => {
          const h = parseFloat(wlm.style.height || String(WLM_HEIGHT_MIN_PX));
          return { height: h, width: 300, top: 0, left: 0, bottom: h, right: 300 };
        }
      });

      const store = new Map<string, string>([
        [TOOLS_PANEL_PANE_HEIGHTS_KEY, JSON.stringify({ 'tc-slot-wlm': WLM_HEIGHT_MIN_PX })]
      ]);
      const storage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        }
      };
      const handles = attachToolsPanelSplitter(document, storage);
      const before = parseFloat(wlm.style.height);
      expect(before).toBe(WLM_HEIGHT_MIN_PX);

      info.classList.remove('tc-hidden');
      infoHeight = 320;
      liHeight = 368;
      handles!.sync();

      const after = parseFloat(wlm.style.height);
      expect(after).toBe(before);
      expect(after).toBe(before);
      handles?.dispose();
    });

    it('drag floor uses the measured entry min even when stored height is larger', () => {
      document.body.innerHTML = `
        <div class="tc-tools-panel">
          <div class="tc-panel-content" style="height: 500px">
            <div id="tc-slot-wlm" class="tc-ctl tc-ctl-wlm">
              <h2>Loaded Layers</h2>
              <ul><li class="tc-ctl-wlm-elm"><div class="tc-ctl-wlm-input"></div></li></ul>
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
      const h2 = wlm.querySelector('h2') as HTMLElement;
      Object.defineProperty(h2, 'getBoundingClientRect', {
        value: () => ({ height: 40, width: 300, top: 0, left: 0, bottom: 40, right: 300 })
      });
      Object.defineProperty(wlm, 'getBoundingClientRect', {
        value: () => {
          const h = parseFloat(wlm.style.height || '220');
          return { height: h, width: 300, top: 0, left: 0, bottom: h, right: 300 };
        }
      });
      const store = new Map<string, string>([
        [TOOLS_PANEL_PANE_HEIGHTS_KEY, JSON.stringify({ 'tc-slot-wlm': 220 })]
      ]);
      const storage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        }
      };
      const handles = attachToolsPanelSplitter(document, storage);
      const splitter = document.querySelector(`.${SPLITTER_CLASS}`) as HTMLElement;
      splitter.setPointerCapture = jest.fn();
      splitter.releasePointerCapture = jest.fn();
      splitter.dispatchEvent(pointerEvent('pointerdown', 200));
      // Drag upward past the old large floor; stop at the measured entry min.
      window.dispatchEvent(pointerEvent('pointermove', 200 - 200));
      window.dispatchEvent(pointerEvent('pointerup', 200 - 200));
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

      const openHeight = parseFloat(wlm.style.height);
      expect(openHeight).toBe(WLM_HEIGHT_MIN_PX);

      const toc = document.querySelector('#tc-slot-toc') as HTMLElement;
      const wlmSplitter = splitters[0]!;
      wlmSplitter.setPointerCapture = jest.fn();
      wlmSplitter.releasePointerCapture = jest.fn();
      wlmSplitter.dispatchEvent(pointerEvent('pointerdown', 200));
      expect(toc.classList.contains('tc-collapsed')).toBe(false);
      window.dispatchEvent(pointerEvent('pointermove', 260));
      window.dispatchEvent(pointerEvent('pointerup', 260));

      const afterDrag = openHeight + 60;
      expect(wlm.classList.contains(PANE_RESIZED_CLASS)).toBe(true);
      expect(wlm.style.flex).toBe('0 0 auto');
      expect(parseFloat(wlm.style.height)).toBe(afterDrag);
      expect(readPaneHeights(storage)['tc-slot-wlm']).toBe(afterDrag);
      expect(document.querySelectorAll(`.${SPLITTER_CLASS}`).length).toBe(1);

      wlmSplitter.dispatchEvent(pointerEvent('pointerdown', 200));
      window.dispatchEvent(pointerEvent('pointermove', 200 + 400));
      window.dispatchEvent(pointerEvent('pointerup', 200 + 400));
      // Capas grows, but catalog keeps ≥ CATALOG_MIN_REMAINING (+ xdata header).
      expect(parseFloat(wlm.style.height)).toBeGreaterThan(afterDrag);
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
