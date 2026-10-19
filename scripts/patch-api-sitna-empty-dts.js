const fs = require('fs');
const path = require('path');

// api-sitna ships FeatureHistoryEvent.d.ts with every line commented out.
// Angular Ivy still pulls that path into the webpack graph via import('api-sitna').
// Replace the empty stub with a minimal declaration so the file can sit in the
// TypeScript program (see tsconfig.app.json include).
const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'api-sitna',
  'TC',
  'tool',
  'FeatureHistoryEvent.d.ts'
);

const replacement = [
  'export default class FeatureHistoryEvent extends Event {',
  '  constructor(type: string, eventInitDict?: EventInit);',
  '}',
  '',
].join('\n');

if (!fs.existsSync(filePath)) {
  console.warn(`[patch-api-sitna-empty-dts] File not found: ${filePath}`);
  process.exit(0);
}

const text = fs.readFileSync(filePath, 'utf8');
if (text === replacement) {
  process.exit(0);
}

const hasLiveCode = text
  .split(/\r?\n/)
  .some((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('//');
  });

if (hasLiveCode && !text.includes('export default class FeatureHistoryEvent')) {
  console.warn(
    `[patch-api-sitna-empty-dts] Refusing to overwrite ${filePath}: file has non-comment code`
  );
  process.exit(0);
}

fs.writeFileSync(filePath, replacement);
console.log(`[patch-api-sitna-empty-dts] Wrote minimal declaration ${filePath}`);
