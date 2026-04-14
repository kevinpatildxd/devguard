import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { parseEnvFile, parseEnvExample } from './parser';
import { validate } from './validator';
import { report, reportMulti } from './reporter';
import { checkConsistency } from './consistency';

const program = new Command();

const SKIP_FILES = new Set(['.env.example', '.env.sample', '.env.template']);

function findEnvFiles(cwd: string): string[] {
  return fs
    .readdirSync(cwd)
    .filter((f) => f.startsWith('.env') && !SKIP_FILES.has(f) && !f.endsWith('.example'))
    .sort();
}

function generateExample(envPath: string, examplePath: string): void {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const output = lines.map((line) => {
    const trimmed = line.trim();
    // keep blank lines and comments as-is
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) return line;
    // blank out the value
    return line.slice(0, eqIndex + 1);
  });
  fs.writeFileSync(examplePath, output.join('\n'), 'utf-8');
}

program
  .name('envguard')
  .description('Validate .env files against .env.example before your app ships')
  .version('1.1.0')
  .option('--env <file>', 'target a specific .env file (skips auto-scan)')
  .option('--example <file>', 'path to example file', '.env.example')
  .option('--strict', 'exit with code 1 if any errors are found')
  .option('--json', 'output results as JSON')
  .option('--init', 'generate .env.example from your .env file')
  .action((options) => {
    const cwd = process.cwd();
    const examplePath = path.resolve(cwd, options.example);

    // --init mode: generate .env.example
    if (options.init) {
      const sourcePath = path.resolve(cwd, options.env ?? '.env');
      if (!fs.existsSync(sourcePath)) {
        console.error(`Error: '${options.env ?? '.env'}' not found. Cannot generate .env.example.`);
        process.exit(1);
      }
      if (fs.existsSync(examplePath)) {
        console.error(`Error: '${options.example}' already exists.`);
        console.error(`Tip: Delete it first if you want to regenerate it.`);
        process.exit(1);
      }
      generateExample(sourcePath, examplePath);
      console.log(`✔ Generated ${options.example} from ${options.env ?? '.env'} (all values blanked)`);
      return;
    }

    if (!fs.existsSync(examplePath)) {
      console.error(`Error: '${options.example}' not found.`);
      console.error(`Tip: Run 'npx @kevinpatil/envguard --init' to generate one from your .env`);
      console.error(`     Or use --example <file> to point to an existing template.`);
      process.exit(1);
    }

    const example = parseEnvExample(examplePath);

    // --env mode: single file
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

    const allResults: { file: string; results: ReturnType<typeof validate>; env: ReturnType<typeof parseEnvFile> }[] = [];

    for (const file of envFiles) {
      const envPath = path.resolve(cwd, file);
      const env = parseEnvFile(envPath);
      const results = validate(env, example);
      allResults.push({ file, results, env });
    }

    const consistency = checkConsistency(allResults.map(({ file, env }) => ({ file, env })));

    if (options.json) {
      console.log(JSON.stringify({ files: allResults.map(({ file, results }) => ({ file, results })), consistency }, null, 2));
      return;
    }

    reportMulti(allResults, consistency);

    const hasErrors = allResults.some(({ results }) => results.some((r) => r.severity === 'error'));
    if (options.strict && hasErrors) process.exit(1);
  });

program.parse();
