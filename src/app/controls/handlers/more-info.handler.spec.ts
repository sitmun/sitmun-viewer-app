import { FeatureInfoMoreInfoHandler } from './more-info.handler';

describe('FeatureInfoMoreInfoHandler paths', () => {
  const handler = new FeatureInfoMoreInfoHandler(
    {} as never,
    () => null,
    { instant: (key: string) => key } as never
  );

  it('resolves a parameter by the service name when the header is a translation', () => {
    const table = document.createElement('table');
    table.innerHTML =
      '<tbody><tr><th data-feature-path="season">Temporada</th><td>summer</td></tr></tbody>';

    const data = (
      handler as unknown as {
        extractFeatureDataFromTable: (node: HTMLElement) => Record<string, string>;
      }
    ).extractFeatureDataFromTable(table);

    expect(data['season']).toBe('summer');
    expect(data['Temporada']).toBeUndefined();
  });

  it('reads a nested path from feature data', () => {
    const value = (
      handler as unknown as {
        lookupFeatureValue: (data: unknown, path: string) => unknown;
      }
    ).lookupFeatureValue({ address: { city: 'Girona' } }, 'address.city');

    expect(value).toBe('Girona');
  });
});
