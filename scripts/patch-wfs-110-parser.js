const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'api-sitna',
  'workers',
  'tc-caps-web-worker-blob.mjs'
);

const fallthroughTarget = [
  '                    case e.V1_1_0:',
  '                        return {};',
  '                    case e.V2_0_0:'
].join('\n');

const fallthroughReplacement = [
  '                    case e.V1_1_0:',
  '                    case e.V2_0_0:'
].join('\n');

const capabilitiesTarget =
  "var capabilities = xml.WFS_Capabilities || (xml['?xml'] && (xml['?xml'].WFS_Capabilities));";

const capabilitiesReplacement =
  "var capabilities = xml.WFS_Capabilities || xml['wfs:WFS_Capabilities'] || (xml['?xml'] && (xml['?xml'].WFS_Capabilities || xml['?xml']['wfs:WFS_Capabilities']));";

if (!fs.existsSync(filePath)) {
  console.warn(`[patch-wfs-110-parser] File not found: ${filePath}`);
  process.exit(0);
}

let source = fs.readFileSync(filePath, 'utf8');
const originalSource = source;
source = source.replace(/\r\n/g, '\n');

const needsFallthrough = source.includes(fallthroughTarget);
const needsCapabilities = source.includes(capabilitiesTarget);
const alreadyPatched =
  source.includes(fallthroughReplacement) &&
  source.includes(capabilitiesReplacement) &&
  !needsFallthrough &&
  !needsCapabilities;

if (alreadyPatched || (!needsFallthrough && !needsCapabilities)) {
  console.log(
    alreadyPatched
      ? '[patch-wfs-110-parser] Already patched.'
      : '[patch-wfs-110-parser] Target snippet not found. No changes made.'
  );
  process.exit(0);
}

let updated = source;
if (needsFallthrough) {
  updated = updated.split(fallthroughTarget).join(fallthroughReplacement);
}
if (needsCapabilities) {
  updated = updated.replace(capabilitiesTarget, capabilitiesReplacement);
}

const finalContent = originalSource.includes('\r\n')
  ? updated.replace(/\n/g, '\r\n')
  : updated;

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('[patch-wfs-110-parser] Patch applied.');
