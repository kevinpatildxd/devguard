#!/usr/bin/env node
// PostToolUse hook: after an edit to a JS/TS file, run devguard's secrets scan
// and report hits in that file back to Claude (exit 2 + stderr).
// Any failure to run the scan exits 0 so the hook never blocks normal work.
// Set DEVGUARD_HOOK=off to disable.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SRC_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const PACKAGE = '@kevinpatil/devguard@3';

function findProjectRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function runScan(root) {
  const win = process.platform === 'win32';
  const local = path.join(root, 'node_modules', '.bin', win ? 'devguard.cmd' : 'devguard');
  const [cmd, args] = fs.existsSync(local)
    ? [local, ['react:secrets', '--json']]
    : [win ? 'npx.cmd' : 'npx', ['-y', PACKAGE, 'react:secrets', '--json']];
  const res = spawnSync(cmd, args, { cwd: root, encoding: 'utf-8', timeout: 25000, shell: win });
  if (res.error || !res.stdout) return null;
  try {
    const parsed = JSON.parse(res.stdout);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function main() {
  if ((process.env.DEVGUARD_HOOK || '').toLowerCase() === 'off') return 0;

  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch {
    return 0;
  }

  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (typeof filePath !== 'string' || !SRC_EXTS.has(path.extname(filePath))) return 0;

  const abs = path.resolve(input.cwd || process.cwd(), filePath);
  if (!fs.existsSync(abs)) return 0;

  const root = findProjectRoot(path.dirname(abs));
  if (!root) return 0;

  const issues = runScan(root);
  if (!issues) return 0;

  const rel = path.relative(root, abs).replace(/\\/g, '/');
  const hits = issues.filter((i) => i && i.file === rel);
  if (hits.length === 0) return 0;

  const lines = hits.map((i) => `  ${rel}:${i.line} — ${i.message}`);
  process.stderr.write(
    `devguard found ${hits.length} possible hardcoded secret${hits.length === 1 ? '' : 's'} in the file you just edited:\n` +
      `${lines.join('\n')}\n` +
      'If these are real credentials, move them to environment variables and add the key names to .env.example. ' +
      'If they are test fixtures or placeholders, say so and carry on.\n'
  );
  return 2;
}

process.exit(main());
