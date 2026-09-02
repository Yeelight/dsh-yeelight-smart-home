# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-02

### Added

- **Promoted to a top-level settings section** — Yeelight now appears as an
  independent settings page alongside 通用设置, 模型, 插件, etc., instead of
  being a card inside the plugins tab.
- **Modern settings page UI** — status banner (version, binary, auth, region),
  authentication card, configuration card with `<select>` dropdowns for region
  and locale, inline fields for house ID / profile / bin path, toggle switches,
  and a formatted log view.
- **`/yeelight/options` endpoint** — returns region and locale catalogs so the
  client renders `<select>` pickers instead of free-text inputs.

### Changed

- Renamed `registerCard`/`mountCard` → `registerSection`/`mountSection`; slot
  registration changed from `settings.plugin.item` to `settings.section`.

### Fixed

- **Settings card render crashes** — three root causes resolved:
  - `labels()` received the locale service object instead of the locale string,
    causing `.toLowerCase()` to throw on the service proxy.
  - `keyValueRow(t, label, value)` used `react.createElement` without receiving
    the `react` parameter (ReferenceError).
  - One multi-line `keyValueRow` call site was missed by the batch fix, causing
    `react.createElement is not a function` (TypeError).
- **React error #31** (objects passed as React children) — `InvokeLogEntry`
  objects are now formatted to readable strings before rendering.
- **Locale injection** — stored the active locale string from
  `locale.getLocale().active` instead of the locale service object.

## [0.1.0] - 2026-08-31

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
