# devguard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kevinpatildxd/devguard/actions/workflows/test.yml/badge.svg)](https://github.com/kevinpatildxd/devguard/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/%40kevinpatil%2Fdevguard.svg)](https://www.npmjs.com/package/@kevinpatil/devguard)
[![npm downloads](https://img.shields.io/npm/dm/%40kevinpatil%2Fdevguard.svg)](https://www.npmjs.com/package/@kevinpatil/devguard)

Validate your `.env` files against `.env.example` before your app ships.

Catches missing keys, insecure defaults, type mismatches, weak secrets, low-entropy secrets, cross-environment inconsistencies, and more — in a single fast command.

```
$ npx @kevinpatil/devguard

devguard — found 2 env file(s)

── .env ────────────────────────────────────
  ERRORS (2)
    ✗ DATABASE_URL — Missing required key (defined in .env.example)
    ✗ JWT_SECRET — Insecure placeholder value: 'secret'
  WARNINGS (2)
    ⚠ PORT — Expected a number but got 'abc'
    ⚠ STRIPE_KEY — Key is not declared in .env.example

── .env.staging ────────────────────────────
  ✔ All checks passed

── Cross-environment consistency ──────────
  ⚡ REDIS_URL — present in [.env] but missing in [.env.staging]

✗ 2 error(s) across 2 file(s)
⚡ 1 cross-env inconsistency issue(s)
```

---

## Install

```bash
npm install --save-dev @kevinpatil/devguard
```

Or run without installing:

```bash
npx @kevinpatil/devguard
```

---

## Usage

```bash
# Auto-scan all .env files and validate against .env.example
npx @kevinpatil/devguard

# Generate .env.example from your existing .env (values blanked)
npx @kevinpatil/devguard --init

# Target a specific env file only
npx @kevinpatil/devguard --env .env.staging

# Use a custom example file
npx @kevinpatil/devguard --example .env.example.production

# Exit with code 1 if any errors are found (for CI)
npx @kevinpatil/devguard --strict

# Output results as JSON
npx @kevinpatil/devguard --json
```

---

## Validation Rules

| Rule | Severity | Description |
|---|---|---|
| `missing-key` | ERROR | Key defined in `.env.example` is absent from `.env` |
| `empty-value` | ERROR | Key is present but has no value |
| `insecure-defaults` | ERROR | Value matches a known insecure placeholder (`changeme`, `secret`, `todo`…) |
| `undeclared-key` | WARNING | Key exists in `.env` but is not in `.env.example` |
| `weak-secret` | WARNING | Secret key is too short (under 16 chars) or has low entropy |
| `type-mismatch` | WARNING | Numeric key (`PORT`, `TIMEOUT`…) has a non-numeric value |
| `malformed-url` | WARNING | URL key has a value with a missing or unrecognized protocol |
| `boolean-mismatch` | WARNING | Boolean key (`FEATURE_*`, `ENABLE_*`…) has a non-boolean value |

---

## Cross-Environment Consistency

When multiple `.env` files are present, envguard automatically checks that all keys are consistent across environments:

```
⚡ REDIS_URL — present in [.env, .env.production] but missing in [.env.staging]
```

This catches cases where a new key is added to one env file but forgotten in others.

---

## Getting Started (existing project)

If your project doesn't have a `.env.example` yet:

```bash
npx @kevinpatil/devguard --init
```

This generates `.env.example` from your existing `.env` with all values blanked. Commit it to your repo so teammates know what keys are required.

---

## CI Integration

### GitHub Actions

```yaml
- name: Validate environment variables
  run: npx @kevinpatil/devguard --strict
```

### Any CI

```bash
npx @kevinpatil/devguard --strict  # exits with code 1 if errors are found
```

### JSON output for custom pipelines

```bash
npx @kevinpatil/devguard --json | jq '.files[].results[] | select(.severity == "error")'
```

---

## How it works

1. Reads `.env.example` as the source of truth
2. Auto-detects all `.env*` files in the current directory
3. Runs all validation rules against each file
4. Checks cross-environment key consistency across all files
5. Prints a color-coded report per file with an overall summary
6. In `--strict` mode, exits with code `1` if any errors are found

No config files required. No API keys. Works offline, in Docker, everywhere.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT © [Kevin Patil](https://github.com/kevinpatildxd)
