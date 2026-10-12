---
name: deps
description: Audit npm dependencies with devguard — unused packages, outdated versions, known vulnerabilities, plus optional license, supply-chain, and duplicate-version checks — then help fix them. Use when the user asks about unused or outdated dependencies, vulnerable packages, licenses, or supply-chain risk.
---

# devguard deps

Audit the project's dependencies, then fix what the user approves.

```sh
npx -y @kevinpatil/devguard@3 deps --json
```

Run from the project root. If `node_modules/.bin/devguard` exists, use `npx devguard deps --json` instead. The check needs network access to the npm registry.

## Steps

1. **Run the check.** Add flags when the user asks for them, or all three for a thorough audit:

   | Flag | Adds |
   |---|---|
   | `--licenses` | Copyleft (GPL/AGPL) and missing license declarations |
   | `--supply-chain` | Install scripts, abandoned packages, single-maintainer risk |
   | `--duplicates` | Packages installed at more than one version |

2. **Read the JSON** — an array of `{ "type", "severity", "name", "message" }`. `type` is the kind of finding (`unused`, `outdated`, a vulnerability, and so on).

3. **Verify `unused` before acting.** devguard looks for imports in source files, so it can flag packages that are used another way. Before calling one unused, search the repo for it in config files, `package.json` scripts, CLI usage, type-only packages (`@types/*`), peer dependencies, and plugin/preset names referenced as strings.

4. **Report** grouped by type: vulnerabilities first, then unused, then outdated. For outdated packages say whether the jump is a major version.

5. **Fix, with approval.** Each of these changes `package.json` and the lockfile, so ask first and say exactly what will change:
   - Unused — preview with `deps --fix --dry-run`, then `deps --fix`, or uninstall only the confirmed ones with the project's package manager.
   - Outdated — patch and minor bumps are usually safe together. Do major bumps one at a time and check the package's changelog for breaking changes.
   - Vulnerable — upgrade to the fixed version named in the finding.

   Use the project's package manager (check for `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `package-lock.json`).

6. **Verify.** Run the project's tests or build after changes, then re-run the check.
