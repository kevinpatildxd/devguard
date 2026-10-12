---
name: secrets
description: Scan JS/TS source for hardcoded secrets with devguard — AWS, OpenAI, Google, GitHub, Stripe, and Slack keys, plus hardcoded passwords and tokens — and move them to environment variables. Use when the user asks to check for leaked keys, hardcoded credentials, or secrets before committing or pushing.
---

# devguard secrets

Find hardcoded secrets in source files and move them out of the code.

```sh
npx -y @kevinpatil/devguard@3 react:secrets --json
```

Run from the project root. Despite the command name it scans every `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, and `.cjs` file, React or not. If `node_modules/.bin/devguard` exists, use `npx devguard react:secrets --json` instead.

## Steps

1. **Run the scan** and read the JSON — an array of `{ "type": "hardcoded-secret", "severity", "file", "line", "message" }`.

2. **Check each hit.** Read the line. Matches in tests, fixtures, and docs are often fake example values; say so and leave them alone unless the user wants them changed.

3. **Report** by `file:line` and the kind of secret. Never print the secret itself, in full or in part.

4. **Fix, with approval.**
   - Replace the literal with an environment variable read (`process.env.NAME`, or `import.meta.env.VITE_NAME` only for values that are safe to ship to the browser).
   - Add the key name to `.env.example` with an empty value. Put the real value in the user's `.env` only if they ask; otherwise tell them to add it.
   - Make sure `.env` is in `.gitignore`.
   - A secret must never go into a `NEXT_PUBLIC_` or `VITE_` variable: those are bundled into client code.

5. **Say this plainly:** if the secret was ever committed or pushed, it must be rotated at the provider. Removing it from the code does not un-leak it. Check with `git log -S` on a non-secret part of the line, or offer `/devguard:env` with `--scan-git` for committed `.env` files.

6. **Re-run** the scan to confirm.
