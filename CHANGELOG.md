# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-08-31

### Added

- DSH plugin bundle `dsh-yeelight-smart-home` (host face + web client face):
  - `cordis.patch.yml` layer inserting the `yeelight-smart-home` row.
  - `dsh.client` manifest wiring the settings card through `exports["./client"]`.
- Three model-facing tools registered duck-typed on `ctx.tools`:
  - `yeelight_home` — one-call Skill Runtime invocation over
    `yeelight-home invoke --stdin` (dry-run, request-id, per-call timeout).
  - `yeelight_reference` — on-demand routing documents, assets, schemas,
    examples, and an intent catalog.
  - `yeelight_product_select` — offline product candidate selection using the
    shipped lighting-design product catalog and lexical aliases.
- In-memory skill `yeelight-smart-home` registered on `ctx.skills` with the
  full adapted rule set (Absolute Rules, Workflow, domain routing).
- `/yeelight` web routes: config get/patch/reset, runtime status, quick
  invoke (with confirm gate for live requests), invoke log list/detail/clear,
  and a docs index.
- Settings card (web): configuration editor, runtime status, quick invoke,
  and invoke log with per-entry detail; bilingual zh/en.
- Config store at `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json`
  with sanitization and clamps.
- Bounded JSONL invoke logger with auto-trim and per-entry detail.
- Runtime resolver honoring `binPath` / `YEELIGHT_HOME_BIN` / PATH plus
  darwin/linux common locations; version compatibility and auth/doctor status.
- Skill data ported verbatim from
  [yeelight-smart-home](https://github.com/Yeelight/yeelight-smart-home-skills)
  (`data/SKILL.upstream.md`, `references/`, `assets/`, `scripts/`), with
  `data/SKILL.md` adapted to the DSH tool surface.
- Vitest suite (26 tests), TypeScript strict typecheck, esbuild build for
  both faces, declaration emit, Apache-2.0 LICENSE + NOTICE.
