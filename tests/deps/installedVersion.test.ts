import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createVersionResolver, stripRange } from '../../src/modules/deps/installedVersion';

let dir: string;

beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'devguard-ver-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

function write(rel: string, data: unknown): void {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

describe('stripRange', () => {
  it('removes range operators', () => {
    expect(stripRange('^8.1.0')).toBe('8.1.0');
    expect(stripRange('~1.2.3')).toBe('1.2.3');
    expect(stripRange('>=2.0.0')).toBe('2.0.0');
  });
});

describe('createVersionResolver', () => {
  it('prefers the version installed in node_modules', () => {
    write('node_modules/tsup/package.json', { version: '8.5.1' });
    write('package-lock.json', { packages: { 'node_modules/tsup': { version: '8.4.0' } } });
    expect(createVersionResolver(dir)('tsup', '^8.1.0')).toBe('8.5.1');
  });

  it('resolves scoped packages from node_modules', () => {
    write('node_modules/@babel/parser/package.json', { version: '7.29.9' });
    expect(createVersionResolver(dir)('@babel/parser', '^7.29.2')).toBe('7.29.9');
  });

  it('falls back to package-lock.json v2/v3 packages map', () => {
    write('package-lock.json', { packages: { 'node_modules/tsup': { version: '8.4.0' } } });
    expect(createVersionResolver(dir)('tsup', '^8.1.0')).toBe('8.4.0');
  });

  it('falls back to package-lock.json v1 dependencies map', () => {
    write('package-lock.json', { dependencies: { tsup: { version: '8.3.0' } } });
    expect(createVersionResolver(dir)('tsup', '^8.1.0')).toBe('8.3.0');
  });

  it('falls back to the declared range when nothing is installed or locked', () => {
    expect(createVersionResolver(dir)('tsup', '^8.1.0')).toBe('8.1.0');
  });

  it('ignores a malformed lockfile', () => {
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{ not json');
    expect(createVersionResolver(dir)('tsup', '~8.1.0')).toBe('8.1.0');
  });
});
