import { describe, it, expect, vi, beforeEach } from 'vitest';
import { report, reportMulti } from '../src/reporter';
import { ValidationResult } from '../src/types';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

const error: ValidationResult = {
  rule: 'missing-key',
  severity: 'error',
  key: 'DATABASE_URL',
  message: 'Missing required key',
};

const warning: ValidationResult = {
  rule: 'type-mismatch',
  severity: 'warning',
  key: 'PORT',
  message: "Expected a number but got 'abc'",
};

describe('report', () => {
  it('outputs JSON when json option is true', () => {
    report([error], '.env', { json: true });
    const call = (console.log as ReturnType<typeof vi.spyOn>).mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].key).toBe('DATABASE_URL');
  });

  it('prints error output', () => {
    report([error], '.env');
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('DATABASE_URL');
  });

  it('prints warning output', () => {
    report([warning], '.env');
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('PORT');
  });

  it('shows all passed when no results', () => {
    report([], '.env');
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('All checks passed');
  });
});

describe('reportMulti', () => {
  it('prints a section for each file', () => {
    reportMulti([
      { file: '.env', results: [error] },
      { file: '.env.staging', results: [] },
    ]);
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('.env');
    expect(output).toContain('.env.staging');
  });

  it('shows summary with total error count', () => {
    reportMulti([
      { file: '.env', results: [error] },
      { file: '.env.staging', results: [error] },
    ]);
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('2 error(s)');
  });

  it('shows all passed when no issues across all files', () => {
    reportMulti([
      { file: '.env', results: [] },
      { file: '.env.staging', results: [] },
    ]);
    const output = (console.log as ReturnType<typeof vi.spyOn>).mock.calls
      .map((c) => String(c[0])).join('\n');
    expect(output).toContain('All env files passed');
  });
});
