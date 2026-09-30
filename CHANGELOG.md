# Changelog

All notable changes to devguard are documented here.

## [Unreleased]
### Fixed
- Flags given after a subcommand (`devguard env --strict`, `devguard deps --json`, …) were taken by the root command and ignored, so `env --strict` never failed CI on env errors

## [3.4.2] — 2026-09-30
### Fixed
- `deps`: vulnerability and outdated checks now use the installed version (`node_modules` → `package-lock.json`) instead of the lowest version in the `package.json` range, removing false-positive vulnerability reports

## [3.4.1] — 2026-07-14
### Changed
- Releases are now published from CI via npm trusted publishing (OIDC) with provenance; prereleases go to the `next` dist-tag
- Removed a duplicate, unused copy of the env rules from the package source

## [3.4.0] — 2026-05-14
### Added
- `devguard react --no-memo`: skip the missing `React.memo` check
- `deps --duplicates` now reads `pnpm-lock.yaml` and `yarn.lock` as well as `package-lock.json`
### Fixed
- npm registry calls run in batches, so large projects no longer fire hundreds of requests at once
- The CLI version is read from `package.json` instead of a hard-coded string
- Bundlephobia lookups time out instead of hanging

## [3.3.1] — 2026-05-12
### Fixed
- `devguard react` now includes the secrets check
- Corrected the reported version string and the CI badge URL

## [3.3.0] — 2026-05-12
### Added
- `devguard env --schema`: generate `env.schema.ts` with Zod types inferred from `.env.example`
- `devguard init --hooks`: install a pre-commit hook that runs `devguard --strict`
- `.devguard.json` config file support (keys: `strict`, `json`, `env.depth`, `react.threshold`)

## [3.2.0]
### Added
- `devguard env --scan-git`: scan git history for accidentally committed `.env` files
- `--depth <n>`: configure how many commits to scan (default: 50)

## [3.1.0]
### Added
- `--sarif`: write a SARIF 2.1.0 report (`devguard.sarif`) compatible with GitHub Code Scanning
- `--score`: print only the project health score (0–100), for CI gate usage
- ASCII mascot (DevGuard dog) in the CLI output

## [3.0.0]
### Added
- `devguard react` and all sub-commands: `react:imports`, `react:rerenders`, `react:hooks`, `react:bundle`, `react:a11y`, `react:server`, `react:secrets`
- Static bundle size database for 30+ common packages with Bundlephobia API fallback
- React Server Component boundary detection

## [2.0.0]
### Added
- `devguard deps`: dependency auditing module
- Unused package detection via AST import analysis
- Outdated version checking against npm registry
- Vulnerability scanning via OSV.dev batch API
- License classification (MIT/ISC/Apache vs GPL/AGPL)
- Supply chain risk checks (install scripts, abandonment, single-maintainer)
- Duplicate version detection from lockfile
- Lighter-weight alternative suggestions for 24 heavy packages
- 24-hour local HTTP cache at `~/.devguard/cache.json`

## [1.0.0]
### Added
- Initial release: `.env` file validation against `.env.example`
- Rules: missing-key, empty-value, insecure-defaults, weak-secret, type-mismatch, malformed-url, boolean-mismatch, undeclared-key
- CLI flags: `--strict`, `--json`, `--file`, `--example`
- Published as `@kevinpatil/devguard` on npm
