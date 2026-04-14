import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { parseEnvFile, parseEnvExample } from './parser';
import { validate } from './validator';
import { report } from './reporter';

const program = new Command();

program
  .name('envguard')
  .description('Validate .env files against .env.example before your app ships')
  .version('1.0.3')
  .option('--env <file>', 'path to .env file', '.env')
  .option('--example <file>', 'path to .env.example file', '.env.example')
  .option('--strict', 'exit with code 1 if any errors are found')
  .option('--json', 'output results as JSON')
  .action((options) => {
    const envPath = path.resolve(process.cwd(), options.env);
    const examplePath = path.resolve(process.cwd(), options.example);

    if (!fs.existsSync(envPath)) {
      console.error(`Error: '${options.env}' not found.`);
      if (options.env === '.env') {
        // check if any named env files exist and suggest them
        const named = ['.env.local', '.env.development', '.env.staging', '.env.production']
          .filter((f) => fs.existsSync(path.resolve(process.cwd(), f)));
        if (named.length > 0) {
          console.error(`Found: ${named.join(', ')}`);
          console.error(`Tip: Use --env to target one, e.g. --env ${named[0]}`);
        } else {
          console.error(`Tip: Create a .env file or use --env <file> to point to one.`);
        }
      } else {
        console.error(`Tip: Check the path and try again.`);
      }
      process.exit(1);
    }

    if (!fs.existsSync(examplePath)) {
      console.error(`Error: '${options.example}' not found.`);
      if (options.example === '.env.example') {
        console.error(`Tip: Create a .env.example file that lists all required keys.`);
        console.error(`     Or use --example <file> to point to an existing template.`);
      } else {
        console.error(`Tip: Check the path and try again.`);
      }
      process.exit(1);
    }

    const env = parseEnvFile(envPath);
    const example = parseEnvExample(examplePath);

    const results = validate(env, example);
    report(results, { json: options.json });

    const hasErrors = results.some((r) => r.severity === 'error');
    if (options.strict && hasErrors) {
      process.exit(1);
    }
  });

program.parse();
