# @kevinpatil/envguard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kevinpatildxd/envguard/actions/workflows/ci.yml/badge.svg)](https://github.com/kevinpatildxd/envguard/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40kevinpatil%2Fenvguard.svg)](https://www.npmjs.com/package/@kevinpatil/envguard)
[![npm downloads](https://img.shields.io/npm/dm/%40kevinpatil%2Fenvguard.svg)](https://www.npmjs.com/package/@kevinpatil/envguard)

Validate your `.env` file against `.env.example` before your app ships.

Catches missing keys, insecure defaults, type mismatches, weak secrets, and more — in a single fast command.

```
$ npx @kevinpatil/envguard

envguard — checking .env against .env.example

ERRORS (2)
  ✗ DATABASE_URL — Missing required key (defined in .env.example)
  ✗ JWT_SECRET — Insecure placeholder value: 'secret'

WARNINGS (2)
  ⚠ PORT — Expected a number but got 'abc'
  ⚠ STRIPE_KEY — Key is not declared in .env.example

2 error(s) found. Fix them before deploying.
```

---

## Install

```bash
npm install --save-dev @kevinpatil/envguard
```

Or run without installing:

```bash
npx @kevinpatil/envguard
```

---

## Usage

```bash
# Validate .env against .env.example in the current directory
npx @kevinpatil/envguard

# Target a specific env file
npx @kevinpatil/envguard --env .env.production

# Use a custom example file
npx @kevinpatil/envguard --example .env.example.production

# Exit with code 1 if any errors are found (for CI)
npx @kevinpatil/envguard --strict

# Output results as JSON
npx @kevinpatil/envguard --json
```

---

## Validation Rules

| Rule | Severity | Description |
|---|---|---|
| `missing-key` | ERROR | Key defined in `.env.example` is absent from `.env` |
| `empty-value` | ERROR | Key is present but has no value |
| `insecure-defaults` | ERROR | Value matches a known insecure placeholder (`changeme`, `secret`, `todo`…) |
| `undeclared-key` | WARNING | Key exists in `.env` but is not in `.env.example` |
| `weak-secret` | WARNING | Secret key is under 16 characters |
| `type-mismatch` | WARNING | Numeric key (`PORT`, `TIMEOUT`…) has a non-numeric value |
| `malformed-url` | WARNING | URL key has a value with a missing or unrecognized protocol |
| `boolean-mismatch` | WARNING | Boolean key (`FEATURE_*`, `ENABLE_*`…) has a non-boolean value |

---

## CI Integration

Add envguard to your pipeline to block deployments with bad config:

### GitHub Actions

```yaml
- name: Validate environment variables
  run: npx @kevinpatil/envguard --strict
```

### Any CI

```bash
npx @kevinpatil/envguard --strict  # exits with code 1 if errors are found
```

### JSON output for custom pipelines

```bash
npx @kevinpatil/envguard --json | jq '.[] | select(.severity == "error")'
```

---

## How it works

1. Reads `.env.example` as the source of truth
2. Reads your `.env` file
3. Runs all validation rules against both
4. Prints a color-coded report to the terminal
5. In `--strict` mode, exits with code `1` if any errors are found

No config files required. No API keys. Works offline, in Docker, everywhere.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT © [Kevin Patil](https://github.com/kevinpatildxd)
