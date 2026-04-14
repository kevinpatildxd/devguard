import chalk from 'chalk';
import { ValidationResult } from './types';
import { ConsistencyIssue } from './consistency';

const DIVIDER_LEN = 40;

function divider(label: string): string {
  const dashes = '─'.repeat(Math.max(0, DIVIDER_LEN - label.length));
  return chalk.bold(`── ${label} ${dashes}`);
}

function printResults(results: ValidationResult[]): void {
  const errors = results.filter((r) => r.severity === 'error');
  const warnings = results.filter((r) => r.severity === 'warning');

  if (errors.length > 0) {
    console.log(chalk.red.bold(`  ERRORS (${errors.length})`));
    for (const r of errors) {
      console.log(chalk.red(`    ✗ ${r.key} — ${r.message}`));
    }
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`  WARNINGS (${warnings.length})`));
    for (const r of warnings) {
      console.log(chalk.yellow(`    ⚠ ${r.key} — ${r.message}`));
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green(`  ✔ All checks passed`));
  } else if (errors.length > 0) {
    console.log(chalk.red.bold(`  ${errors.length} error(s) found. Fix before deploying.`));
  } else {
    console.log(chalk.yellow(`  ${warnings.length} warning(s). Review before deploying.`));
  }
}

export function report(
  results: ValidationResult[],
  file: string,
  options: { json?: boolean } = {}
): void {
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  console.log(divider(file));
  printResults(results);
}

export function reportMulti(
  allResults: { file: string; results: ValidationResult[] }[],
  consistency: ConsistencyIssue[] = []
): void {
  const totalErrors = allResults.reduce(
    (sum, { results }) => sum + results.filter((r) => r.severity === 'error').length, 0
  );
  const totalWarnings = allResults.reduce(
    (sum, { results }) => sum + results.filter((r) => r.severity === 'warning').length, 0
  );

  console.log(chalk.bold(`\nenvguard — found ${allResults.length} env file(s)\n`));

  // per-file reports
  for (const { file, results } of allResults) {
    console.log(divider(file));
    printResults(results);
    console.log();
  }

  // cross-env consistency
  if (consistency.length > 0) {
    console.log(chalk.cyan.bold(`── Cross-environment consistency ${'─'.repeat(6)}`));
    for (const issue of consistency) {
      console.log(
        chalk.cyan(`  ⚡ ${issue.key} — present in [${issue.presentIn.join(', ')}] but missing in [${issue.missingIn.join(', ')}]`)
      );
    }
    console.log();
  }

  // overall summary
  const consistencyCount = consistency.length;
  if (totalErrors === 0 && totalWarnings === 0 && consistencyCount === 0) {
    console.log(chalk.green.bold(`✔ All ${allResults.length} env file(s) passed`));
  } else {
    if (totalErrors > 0) {
      console.log(chalk.red.bold(`✗ ${totalErrors} error(s) across ${allResults.length} file(s)`));
    }
    if (totalWarnings > 0) {
      console.log(chalk.yellow(`⚠ ${totalWarnings} warning(s) across ${allResults.length} file(s)`));
    }
    if (consistencyCount > 0) {
      console.log(chalk.cyan(`⚡ ${consistencyCount} cross-env inconsistency issue(s)`));
    }
  }
}
