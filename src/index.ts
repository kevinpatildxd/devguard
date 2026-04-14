import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { parseEnvFile, parseEnvExample } from './parser';
import { validate } from './validator';
import { report, reportMulti } from './reporter';

const program = new Command();

const SKIP_FILES = new Set(['.env.example', '.env.sample', '.env.template']);

function findEnvFiles(cwd: string): string[] {
  return fs
    .readdirSync(cwd)
    .filter((f) => f.startsWith('.env') && !SKIP_FILES.has(f) && !f.endsWith('.example'))
    .sort();
}

program
  .name('envguard')
  .description('Validate .env files against .env.example before your app ships')
  .version('1.0.4')
  .option('--env <file>', 'target a specific .env file (skips auto-scan)')
  .option('--example <file>', 'path to example file', '.env.example')
  .option('--strict', 'exit with code 1 if any errors are found')
  .option('--json', 'output results as JSON')
  .action((options) => {
    const cwd = process.cwd();
    const examplePath = path.resolve(cwd, options.example);

    if (!fs.existsSync(examplePath)) {
      console.error(`Error: '${options.example}' not found.`);
      console.error(`Tip: Create a .env.example file that lists all required keys.`);
      console.error(`     Or use --example <file> to point to an existing template.`);
      process.exit(1);
    }

    const example = parseEnvExample(examplePath);

    // single file mode
    if (options.env) {
      const envPath = path.resolve(cwd, options.env);
      if (!fs.existsSync(envPath)) {
        console.error(`Error: '${options.env}' not found.`);
        console.error(`Tip: Check the path and try again.`);
        process.exit(1);
      }
      const env = parseEnvFile(envPath);
      const results = validate(env, example);
      report(results, options.env, { json: options.json });
      if (options.strict && results.some((r) => r.severity === 'error')) process.exit(1);
      return;
    }

    // auto-scan mode
    const envFiles = findEnvFiles(cwd);

    if (envFiles.length === 0) {
      console.error(`No .env files found in ${cwd}`);
      console.error(`Tip: Create a .env file or use --env <file> to point to one.`);
      process.exit(1);
    }

    const allResults: { file: string; results: ReturnType<typeof validate> }[] = [];

    for (const file of envFiles) {
      const envPath = path.resolve(cwd, file);
      const env = parseEnvFile(envPath);
      const results = validate(env, example);
      allResults.push({ file, results });
    }

    if (options.json) {
      console.log(JSON.stringify(allResults, null, 2));
      return;
    }

    reportMulti(allResults);

    const hasErrors = allResults.some(({ results }) =>
      results.some((r) => r.severity === 'error')
    );
    if (options.strict && hasErrors) process.exit(1);
  });

program.parse();
