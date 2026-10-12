---
name: audit
description: Run a full devguard audit of the current project — env files, dependencies, hardcoded secrets, and React code quality — then summarize the findings and offer to fix them. Use when the user asks to audit, health-check, or "devguard" the project, or wants a pre-ship / pre-commit check.
---

# devguard audit

Run every devguard check that applies to this project, report the findings in one place, then fix what the user approves.

devguard is an npm CLI. Run it from the project root (the folder with `package.json`) as:

```sh
npx -y @kevinpatil/devguard@3 <command> --json
```

Run each check as its own command. Do not use the bare root command for this: it prints several JSON documents back to back and stops early when `.env.example` is missing.

## Steps

1. **Find the project root.** Use the nearest folder with a `package.json`. If there is none, say devguard needs a Node project and stop.

2. **Run the checks** (they are independent, so run them in parallel):

   | Check | Command | When |
   |---|---|---|
   | Env | `npx -y @kevinpatil/devguard@3 env --json` | Only if `.env.example` exists. If it does not but a `.env` does, skip the check and mention that `/devguard:env` can generate one. |
   | Deps | `npx -y @kevinpatil/devguard@3 deps --json` | Always. Needs network access for outdated and vulnerability lookups. |
   | Secrets | `npx -y @kevinpatil/devguard@3 react:secrets --json` | Always. It scans all JS/TS source, not only React. |
   | React | `npx -y @kevinpatil/devguard@3 react --json` | Only if `react` is in `dependencies` or `devDependencies`. This already includes the secrets scan, so skip the separate secrets command. |

3. **Read the output.**
   - `env` prints `{ "files": [{ "file", "results": [{ "rule", "severity", "key", "message" }] }], "consistency": [...] }`.
   - `deps` and `react:*` print an array of `{ "type", "severity", "name" | "file" + "line", "message" }`.
   - `react` prints one array per sub-check, back to back. Read them in order rather than parsing the output as a single document.
   - A non-zero exit or an `Error:` line means the check could not run. Report that as-is; do not treat it as "no findings".

4. **Report.** Give one short summary: counts of errors and warnings per area, then the findings grouped by area with errors first. Give `file:line` for code findings and the key or package name for the rest. Never print the value of a secret or an env variable — name the key, file and line only.

5. **Offer fixes.** List what you can fix and ask which to apply. Follow the fix rules in the per-area skills:
   - env → `/devguard:env`
   - deps → `/devguard:deps`
   - secrets → `/devguard:secrets`
   - React → `/devguard:react`

   Fix code findings yourself with normal edits. Confirm before anything that removes packages, changes versions, or touches a real `.env` file.

6. **Re-run** the checks you fixed and report what is left.

## Notes

- If the project has a local install (`node_modules/.bin/devguard`), use `npx devguard <command>` instead so the project's pinned version is respected.
- A `.devguard.json` in the project root sets defaults (for example `react.entry`); the CLI reads it automatically.
- If the user passed arguments (for example `deps` or `--licenses`), narrow the run to match.
