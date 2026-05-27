import { isLeftPanelToolsTabActive } from './left-panel-tools-tab-active';

const HIDDEN = 'tc-hidden';

function createTab(id: string, hidden = false): HTMLElement {
  const tab = document.createElement('h1');
  tab.id = id;
  if (hidden) {
    tab.classList.add(HIDDEN);
  }
  return tab;
}

function createLegend(hidden = false): HTMLElement {
  const legend = document.createElement('div');
  legend.classList.add('tc-ctl-legend');
  if (hidden) {
    legend.classList.add(HIDDEN);
  }
  return legend;
}

describe('isLeftPanelToolsTabActive', () => {
  it.each([
    {
      name: 'tools tab active with hidden legend control',
      toolsTab: createTab('tools-tab'),
      legendTab: createTab('legend-tab', true),
      legend: createLegend(true),
      expected: true
    },
    {
      name: 'legend tab active',
      toolsTab: createTab('tools-tab', true),
      legendTab: createTab('legend-tab'),
      legend: createLegend(false),
      expected: false
    },
    {
      name: 'no legend configured (#156)',
      toolsTab: createTab('tools-tab'),
      legendTab: createTab('legend-tab', true),
      legend: null,
      expected: true
    },
    {
      name: 'tools tab hidden',
      toolsTab: createTab('tools-tab', true),
      legendTab: createTab('legend-tab'),
      legend: createLegend(false),
      expected: false
    },
    {
      name: 'legend tab visible while tools tab visible',
      toolsTab: createTab('tools-tab'),
      legendTab: createTab('legend-tab'),
      legend: createLegend(false),
      expected: false
    },
    {
      name: 'no legend tab but hidden legend control',
      toolsTab: createTab('tools-tab'),
      legendTab: null,
      legend: createLegend(true),
      expected: true
    }
  ])('$name', ({ toolsTab, legendTab, legend, expected }) => {
    expect(isLeftPanelToolsTabActive(toolsTab, legendTab, legend)).toBe(
      expected
    );
  });
});
