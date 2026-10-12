---
name: env
description: Validate .env files against .env.example with devguard and fix the gaps — missing keys, undeclared keys, type mismatches, inconsistent env files. Also generates .env.example or a Zod schema, and scans git history for committed .env files. Use when the user asks about env files, missing environment variables, or .env.example.
---

# devguard env

Check the project's `.env` files against `.env.example`, then fix what the user approves.

```sh
npx -y @kevinpatil/devguard@3 env --json
```

Run from the project root. If `node_modules/.bin/devguard` exists, use `npx devguard env --json` instead.

## Steps

1. **Check for `.env.example`.** If it is missing, the command fails with `'.env.example' not found`. Offer to generate one from the existing `.env`:
   ```sh
   npx -y @kevinpatil/devguard@3 env --init
   ```
   Review the generated file before moving on: it must contain key names only, with no real values.

2. **Run the check** and read the JSON:
   ```
   { "files": [{ "file": ".env", "results": [{ "rule", "severity", "key", "message" }] }], "consistency": [...] }
   ```
   `consistency` lists keys that differ between env files (for example present in `.env` but not in `.env.production`).

3. **Report** per file, errors first, by key name and rule. Never print env values, and do not read a `.env` file aloud to the user.

4. **Fix, with approval.**
   - `missing-key` — add the key to the `.env` file with an empty value and tell the user to fill it in. Do not invent a value.
   - `undeclared-key` — if the app really uses the key, add it to `.env.example` (name only). Otherwise suggest removing it from `.env`.
   - `type-mismatch` and similar value rules — explain what is expected; let the user correct the value.
   - Ask before editing any real `.env` file. Editing `.env.example` is safe.

5. **Re-run** to confirm.

## Other flags

| Goal | Command |
|---|---|
| Check one file | `env --file .env.production` |
| Use another example file | `env --example .env.sample` |
| Find `.env` files committed in git history | `env --scan-git --depth 200` |
| Generate a Zod schema (`env.schema.ts`) from `.env.example` | `env --schema` |
| Fail with exit code 1 on errors (CI) | `env --strict` |

If `--scan-git` finds a committed `.env`, tell the user the secrets in it must be rotated; removing the file from history is not enough.
