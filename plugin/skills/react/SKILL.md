---
name: react
description: Run devguard's React checks — unused imports and dead files, re-render hazards, hooks rule violations, heavy bundle packages, accessibility, Server Component boundaries, and hardcoded secrets — then fix the findings. Use when the user asks to review, lint, or clean up a React or Next.js codebase.
---

# devguard react

Run the React checks, then fix what the user approves.

```sh
npx -y @kevinpatil/devguard@3 react --json
```

Run from the project root. If `node_modules/.bin/devguard` exists, use `npx devguard react --json` instead.

## Steps

1. **Run the checks.** `react` runs all of them and prints one JSON array per check, back to back. To parse cleanly, or when the user wants only one area, run the sub-commands separately:

   | Command | Finds |
   |---|---|
   | `react:imports` | Unused imports and dead files. Takes `--entry src/main.tsx` if the entry point is not detected. |
   | `react:rerenders` | Inline objects/functions in JSX props, missing `React.memo`. `--no-memo` skips the memo check. |
   | `react:hooks` | Hooks called conditionally, in loops, in nested functions, or from non-components. |
   | `react:bundle` | Heavy packages that inflate the bundle. |
   | `react:a11y` | `img`, `button`, `input`, and anchor accessibility problems. |
   | `react:server` | Client hooks in Server Components, server-only modules in client code. |
   | `react:secrets` | Hardcoded secrets — see `/devguard:secrets`. |

   Each prints an array of `{ "type", "severity", "file", "line", "message" }`.

2. **Report** grouped by check, errors first, with `file:line`.

3. **Fix, with approval.** Read the code around each finding before changing it.
   - **Hooks and server-boundary** findings are real bugs. Fix them first.
   - **a11y** — add the missing `alt`, label, or accessible name. Write a meaningful value from context; do not paste a placeholder.
   - **Unused imports** — remove them. For a **dead file**, check for dynamic imports, route-by-filename conventions (Next.js `app/` and `pages/`), tests, and config references before deleting, and ask first.
   - **Re-renders** — treat these as suggestions. Hoist or memoize only where the component is on a hot path; do not wrap everything in `useMemo`/`React.memo`.
   - **Bundle** — suggest the lighter alternative or a narrower import; swapping a library is the user's call.

4. **Verify.** Run the project's typecheck, tests, or build, then re-run the checks you fixed.
