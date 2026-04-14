import chalk from 'chalk';
import { ValidationResult } from './types';

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
  }

  if (errors.length > 0) {
    console.log(chalk.red.bold(`  ${errors.length} error(s) found. Fix before deploying.`));
  } else if (warnings.length > 0) {
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

  console.log(chalk.bold(`\n── ${file} ${'─'.repeat(Math.max(0, 40 - file.length))}`));
  printResults(results);
}

export function reportMulti(
  allResults: { file: string; results: ValidationResult[] }[]
): void {
  const totalErrors = allResults.reduce(
    (sum, { results }) => sum + results.filter((r) => r.severity === 'error').length, 0
  );
  const totalWarnings = allResults.reduce(
    (sum, { results }) => sum + results.filter((r) => r.severity === 'warning').length, 0
  );

  console.log(chalk.bold(`\nenvguard — found ${allResults.length} env file(s)\n`));

  for (const { file, results } of allResults) {
    console.log(chalk.bold(`── ${file} ${'─'.repeat(Math.max(0, 40 - file.length))}`));
    printResults(results);
    console.log();
  }

  // summary line
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(chalk.green.bold('✔ All env files passed'));
  } else if (totalErrors > 0) {
    console.log(chalk.red.bold(`✗ ${totalErrors} error(s) across ${allResults.length} file(s). Fix before deploying.`));
  } else {
    console.log(chalk.yellow(`⚠ ${totalWarnings} warning(s) across ${allResults.length} file(s).`));
  }
}
