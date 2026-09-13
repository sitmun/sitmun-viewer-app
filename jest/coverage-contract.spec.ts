import {readFileSync} from 'node:fs';

import jestConfig from '../jest.config';

function packageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
    scripts: Record<string, string>;
  };
  return pkg.scripts;
}

describe('Viewer Jest coverage contract', () => {
  const scripts = packageScripts();

  it('does not collect coverage on the default config npm test loads', () => {
    expect(jestConfig.collectCoverage).toBe(false);
  });

  it('splits commands: local test never asks for coverage', () => {
    expect(scripts['test']).toBe('jest');
    expect(scripts['test:watch']).toBe('jest --watch');
    expect(scripts['test']).not.toMatch(/coverage/);
    expect(scripts['test:watch']).not.toMatch(/coverage/);
    expect(scripts['test:coverage']).toMatch(/--coverage/);
    expect(scripts['test:coverage']).toMatch(/watchAll=false/);
  });
});
