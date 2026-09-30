import fs from 'fs';
import path from 'path';

export function stripRange(version: string): string {
  return version.replace(/^[\^~>=<]+/, '').trim();
}

interface PackageLock {
  packages?:     Record<string, { version?: string }>;
  dependencies?: Record<string, { version?: string }>;
}

function readJson<T>(file: string): T | null {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch {
    return null;
  }
}

// Returns a lookup that resolves each package to the version actually installed,
// so checks run against what ships rather than the floor of the declared range.
// Order: node_modules/<name>/package.json → package-lock.json → declared range.
export function createVersionResolver(cwd: string): (name: string, range: string) => string {
  const lock = readJson<PackageLock>(path.join(cwd, 'package-lock.json'));

  return (name, range) => {
    const installed = readJson<{ version?: string }>(
      path.join(cwd, 'node_modules', name, 'package.json'),
    );
    if (installed?.version) return installed.version;

    const locked = lock?.packages?.[`node_modules/${name}`]?.version
      ?? lock?.dependencies?.[name]?.version;
    if (locked) return locked;

    return stripRange(range);
  };
}
