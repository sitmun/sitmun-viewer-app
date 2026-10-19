#!/usr/bin/env node
/**
 * Build the e2e configuration once, then serve dist statically with proxies.
 * Playwright suites load Cesium heavily; webpack-dev-server dies mid-suite under that load.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '..');
const distIndex = join(appRoot, 'dist', 'viewer-app', 'index.html');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function fail(message) {
  console.error(`[start-e2e] ${message}`);
  process.exit(1);
}

const skipBuild =
  process.env.SITMUN_E2E_SKIP_BUILD === '1' && existsSync(distIndex);

if (!skipBuild) {
  console.error('[start-e2e] Building e2e configuration...');
  const build = spawnSync(npmCmd, ['run', 'build:e2e'], {
    cwd: appRoot,
    env: process.env,
    stdio: 'inherit',
    shell: isWindows,
  });
  if (build.status !== 0) {
    fail(`build:e2e exited with code ${build.status ?? 1}`);
  }
} else {
  console.error('[start-e2e] Reusing existing dist (SITMUN_E2E_SKIP_BUILD=1)');
}

if (!existsSync(distIndex)) {
  fail(`Missing ${distIndex} after build`);
}

const child = spawn(
  process.execPath,
  [join(__dirname, 'serve-e2e.mjs'), ...process.argv.slice(2)],
  {
    cwd: appRoot,
    env: process.env,
    stdio: 'inherit',
  }
);

function shutdown(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(signal));
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
