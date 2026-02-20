# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 👤 Core Principles

1. **Tool-First** - Prioritize MCP Server tools (Desktop Commander) over built-ins
2. **Production Mindset** - Write deployment-ready code
3. **GitHub Flow** - NEVER commit to `main`. Always use feature branches + PRs
4. **Documentation** - Keep docs, tests, and code in sync
5. **Security** - Validate inputs, consider security in all changes

### 🔀 GitHub Flow (MANDATORY)

**🚨 NEVER commit to `main`. ALWAYS use feature branches + PRs.**

**Workflow:**

```bash
# 1. Create an Issue
gh issue create --title "Feature or Fix description" --body "..." --label "bug|feature|chore"

# 2. Sync and Branch (Reference the issue number)
git checkout main && git pull
git checkout -b feature/name-#issue  # e.g. fix/mobile-print-#42

# 3. Work and Commit
git add . && git commit -m "feat: description (#issue)"
git push -u origin HEAD

# 4. Finish and create PR
npm test && npm run build
gh pr create --title "feat: Title" --body "Closes #issue"
# Wait for user approval, then merge via GitHub
```

**Branch prefixes:** `feature/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`

**At START of task:** Check branch with `git branch --show-current`. If on `main`, create feature branch immediately.

**At END of task:** Create PR, provide link, do NOT merge.

### 🔧 MCP Tool Priority

**ALWAYS prefer Desktop Commander MCP tools over built-ins:**

**Files:** `mcp__desktop-commander__read_file`, `write_file`, `edit_block`, `list_directory`
**Search:** `start_search` (streaming, files/content modes), `get_more_search_results`, `stop_search`
**Processes:** `start_process`, `interact_with_process` (MANDATORY for local file analysis)

**Use built-in tools only for:** git/npm/docker commands or when MCP unavailable

## 📖 Docs

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for technical details. Feature guides in **[docs/](./docs/)**.

---

## 🎯 Golden Rules

1. **Data-Driven:** All content in `src/data/resume.json` (JSON Resume v1.0.0). Edit JSON, not components.
2. **Type-Safe Updates:** types → adapter → components (in that order)
3. **Test First:** `npm test` must pass (85% coverage minimum)
4. **Dev Server:** Keep `npm run dev:reload` running on port 3000
5. **Absolute Paths:** Use full paths in bash (working dir resets between calls)

---

## 🧭 Common Tasks

**Add new field:** types → adapter → components → tests (in order)
**Fix tests:** Check type errors first, then component logic, ensure 85% coverage
**Add homepage section:** Add to `resume.json` → create component → import in `page.tsx` → add tests
**Debug:** Use Explore agent for "How does X work?" questions

---

## Project Summary

Next.js 16.0.4 portfolio • Static export to GitHub Pages • Data: `src/data/resume.json` (JSON Resume v1.0.0) • Optional password auth • OpenAI-compatible AI generation • 85%+ test coverage

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm test             # Run tests
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier + Tailwind
```

---

## Architecture

**Data Flow:** `resume.json` → `resumeAdapter.ts` → Internal types → UI components

**⚠️ Edit `src/data/resume.json` only for content. Changes auto-propagate.**

### Key Files

| Path                              | Purpose                     |
| --------------------------------- | --------------------------- |
| `src/data/resume.json`            | ⭐ Single source of truth    |
| `src/lib/resumeAdapter.ts`        | JSON Resume → Internal      |
| `src/types/`                      | Type definitions (4 layers) |
| `src/app/page.tsx`                | Homepage                    |
| `src/app/resume/builder/page.tsx` | Resume editor               |
| `src/components/sections/`        | Homepage sections           |

**Adapters:** `resumeAdapter.ts` (JSON→Internal), `jsonResume.ts` (Internal→JSON), `portfolio.ts` (Internal→UI)

---

## Common Tasks

**Update content:** Edit `src/data/resume.json` → verify at localhost:3000

**Add section:** Add to `resume.json` → create component → import in `page.tsx` → add tests

**Fix build errors:** Update types → adapter → components (in order)

**Enable password:** `node scripts/generate-password-hash.mjs "pwd"` → set `NEXT_PUBLIC_EDIT_PASSWORD_HASH` in `.env.local` or GitHub Secrets

**Test changes:** `npm test` (all), `npm test -- path` (specific), `npm test:watch` (dev mode)

---

## Features

**Password Protection:** Optional client-side auth (bcrypt + sessionStorage). See `docs/PASSWORD_PROTECTION_SETUP.md`

**AI Generation:** OpenAI-compatible APIs for cover letters. See `docs/AI_COVER_LETTER_GENERATOR.md`

**Tests:** 85%+ coverage (Jest + RTL). Unit/Integration/E2E in `src/**/__tests__/`

---

## Code Quality

**Git hooks** auto-enforce ESLint + Prettier + Tailwind CSS sorting on commit (Husky + lint-staged).

**Manual:** `npm run format`, `npm run lint`

**⚠️ Never bypass hooks.**

---

## Development Workflow

**Dev Server:** `npm run dev:reload` (kills port conflicts, clears `.next/`, restarts). Keep running on port 3000.

**Pre-commit:** Hooks auto-run ESLint + Prettier. Manually verify: tests pass, build succeeds, docs updated.

**Deployment:** Create feature branch → commit → push → create PR → wait for CI → merge after approval → auto-deploy to GitHub Pages (2-3 min)

---

## Conventions

**Files:** PascalCase (components), camelCase (utils), kebab-case (types)

**Imports:** Use `@/` alias, not relative paths

**Data:** Always use adapter functions (`resumeAdapter.ts`), never import raw JSON

---

## Avoid

❌ Edit components for content (edit `resume.json` instead)
❌ Add fields without updating types → adapter → UI
❌ Skip tests (CI enforces passing tests)
❌ Mutate state directly (use setters)

---

## Quick Reference

**Content:** `src/data/resume.json` | **Homepage:** `src/app/page.tsx` | **Editor:** `src/app/resume/builder/page.tsx` | **Tests:** `src/**/__tests__/`

**Env:** `NEXT_PUBLIC_EDIT_PASSWORD_HASH` (optional, for password auth)

---

## Troubleshooting

**Build fails:** `npm run build` → fix types → adapter → components

**Password issues:** Regenerate hash, check env var, clear browser cache

**Tests fail:** `npm test -- --verbose`, fix issues, clear cache if needed

**Deploy 404:** Check `.nojekyll` exists, verify GitHub Actions succeeded, wait 2-3 min

---

## Automation

**ESLint:** Enforces naming conventions, `@/` imports, security patterns. See [docs/ESLINT_GRADUAL_IMPROVEMENT_PLAN.md](./docs/ESLINT_GRADUAL_IMPROVEMENT_PLAN.md)

**Commitlint:** Conventional commits required (feat:, fix:, docs:, etc.)

**Coverage:** 85% minimum enforced by Jest

**TypeScript:** Strict mode + additional safety checks

---

## Resources

See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details, [docs/](./docs/) for feature guides.

## Temporary files

- Temporary log files generated during troubleshooting should be under `logs/` folder. Strictly not at project root.
- Temporary script files generated during troubleshooting should be under `tmp/` folder. Strictly not at project root or `scripts/` folder.