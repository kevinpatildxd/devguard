import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/modules/env', () => ({ runEnv: vi.fn() }));
vi.mock('../src/modules/deps', () => ({ runDeps: vi.fn(async () => ({ errors: 0, warnings: 0 })) }));

import { program } from '../src/cli';
import { runEnv } from '../src/modules/env';
import { runDeps } from '../src/modules/deps';

beforeEach(() => vi.clearAllMocks());

describe('cli subcommand flags', () => {
  it('passes --strict and --json through to the env command', async () => {
    await program.parseAsync(['node', 'devguard', 'env', '--strict', '--json']);
    expect(runEnv).toHaveBeenCalledWith(expect.objectContaining({ strict: true, json: true }));
  });

  it('passes --json through to the deps command', async () => {
    await program.parseAsync(['node', 'devguard', 'deps', '--json']);
    expect(runDeps).toHaveBeenCalledWith(expect.objectContaining({ json: true }));
  });
});
