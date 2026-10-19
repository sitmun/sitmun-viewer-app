import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { createContext, runInContext } from 'vm';

const viewerRoot = process.cwd();
const patchScript = path.join(viewerRoot, 'scripts/patch-wfs-110-parser.js');
const blobPath = path.join(
  viewerRoot,
  'node_modules/api-sitna/workers/tc-caps-web-worker-blob.mjs'
);

const capabilitiesXml = `<?xml version="1.0"?>
<wfs:WFS_Capabilities version="1.1.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ows="http://www.opengis.net/ows" xmlns:app="http://example.com/app">
  <ows:OperationsMetadata>
    <ows:Operation name="GetFeature">
      <ows:DCP>
        <ows:HTTP>
          <ows:Get xlink:href="http://example.com/wfs"/>
        </ows:HTTP>
      </ows:DCP>
    </ows:Operation>
    <ows:Operation name="DescribeFeatureType">
      <ows:DCP>
        <ows:HTTP>
          <ows:Get xlink:href="http://example.com/wfs"/>
        </ows:HTTP>
      </ows:DCP>
    </ows:Operation>
  </ows:OperationsMetadata>
  <FeatureTypeList>
    <FeatureType>
      <Name>app:parcels</Name>
      <Title>Parcels</Title>
    </FeatureType>
  </FeatureTypeList>
</wfs:WFS_Capabilities>`;

function workerSource(): string {
  const file = readFileSync(blobPath, 'utf8');
  const start = file.indexOf('String.raw`');
  const end = file.lastIndexOf('`],');
  return file.slice(start + 'String.raw`'.length, end);
}

describe('WFS 1.1.0 capabilities parser patch', () => {
  beforeAll(() => {
    execFileSync(process.execPath, [patchScript], {
      cwd: viewerRoot,
      stdio: 'inherit'
    });
  });

  it('parses wfs:WFS_Capabilities 1.1.0 into version, feature type, and GetFeature', () => {
    const messages: Array<{
      state?: string;
      capabilities?: {
        version?: string;
        FeatureTypes?: Record<string, { Name?: string }>;
        Operations?: { GetFeature?: unknown };
      };
    }> = [];
    const sandbox = {
      postMessage: (message: (typeof messages)[number]) => {
        messages.push(message);
      },
      onmessage: undefined as
        | ((event: { data: { type: string; text: string } }) => void)
        | undefined
    };
    const context = createContext(sandbox);
    runInContext(workerSource(), context);
    sandbox.onmessage?.({ data: { type: 'WFS', text: capabilitiesXml } });

    expect(messages[0]?.state).toBe('success');
    expect(messages[0]?.capabilities?.version).toBe('1.1.0');
    expect(messages[0]?.capabilities?.FeatureTypes?.['parcels']?.Name).toBe(
      'app:parcels'
    );
    expect(messages[0]?.capabilities?.Operations?.GetFeature).toBeDefined();
  });
});
