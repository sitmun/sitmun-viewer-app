const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'api-sitna',
  'TC',
  'control',
  'PrintMap.js'
);

const target = [
  '            }, function () {',
  '                PrintMap.imageErrorHandling(self.options.logo);',
  '',
  '                return onLogoError();',
  '            });'
].join('\n');

const replacement = [
  '            }, function () {',
  "                TC.error(self.getLocaleString('print.error'));",
  "                TC.error('No se ha podido generar el base64 correspondiente a la imagen: ' + self.options.logo, Consts.msgErrorMode.EMAIL, 'Error en la impresión'); //Correo de error",
  '                return onLogoError();',
  '            });'
].join('\n');

if (!fs.existsSync(filePath)) {
  console.warn(`[patch-printmap-logo] File not found: ${filePath}`);
  process.exit(0);
}

const source = fs.readFileSync(filePath, 'utf8');

if (source.includes(replacement)) {
  console.log('[patch-printmap-logo] Already patched.');
  process.exit(0);
}

if (!source.includes(target)) {
  console.warn('[patch-printmap-logo] Target snippet not found. No changes made.');
  process.exit(0);
}

const updated = source.replace(target, replacement);
fs.writeFileSync(filePath, updated, 'utf8');
console.log('[patch-printmap-logo] Patch applied.');
