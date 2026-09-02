<div align="center">

# dsh-yeelight-smart-home

**Control, organize, diagnose, design and personalize your Yeelight smart home — right inside [DeepSeek Harness](https://github.com/deepseek-ai/dsh).**

[English](README.md) · [简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/dsh-yeelight-smart-home?color=%2330a46c&label=npm)](https://www.npmjs.com/package/dsh-yeelight-smart-home)
[![GitHub release](https://img.shields.io/github/v/release/Yeelight/dsh-yeelight-smart-home?color=%235e6ad2&label=GitHub)](https://github.com/Yeelight/dsh-yeelight-smart-home/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](#license)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-%230a84ff)](#)

</div>

---

## What it does

`dsh-yeelight-smart-home` turns DeepSeek Harness into a **full Yeelight smart-home agent**. It is powered by the local [yeelight-home](https://github.com/Yeelight/yeelight-home) Skill Runtime, so every request goes through the official runtime — no API keys, no cloud proxy, no home assistant required.

The model can control devices, query state, run scenes and automations, design lighting, keep preferences, and answer product questions — while you get a **dedicated settings page** in DSH to manage the runtime, authentication and configuration.

## Features

| | |
|---|---|
| 🤖 **Three model-facing tools** | `yeelight_home` — one-call Skill Runtime invocation · `yeelight_reference` — routing docs, catalogs & schemas on demand · `yeelight_product_select` — offline lighting-design product picks |
| 🧠 **In-memory skill** | Full adapted routing rule set (absolute rules, workflow, domain references) — works in any DSH profile |
| ⚙️ **Dedicated settings page** | A top-level section in DSH Settings (not a buried card): runtime status, config, authentication and logs at a glance |
| 🚀 **One-click runtime install** | Missing `yeelight-home`? Pick Homebrew / npm / GitHub Release right from the settings page — the plugin installs and verifies it for you |
| 📋 **Invoke log** | Bounded, auto-trimmed JSONL history with per-entry detail |
| 🗂️ **Persistent config** | Stored at `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json` |

## Quick start

### 1. Install the plugin

> Requires [Node.js](https://nodejs.org) ≥ 22.13 and [DeepSeek Harness](https://github.com/deepseek-ai/dsh) ≥ 0.1.1.

```bash
# From npm (recommended)
dsh plugin --profile web add dsh-yeelight-smart-home

# …or from source
git clone https://github.com/Yeelight/dsh-yeelight-smart-home.git
cd dsh-yeelight-smart-home
npm install && npm run build
```

Restart `dsh web`, then open **Settings → Yeelight 智能家居**.

### 2. Install the runtime (one click)

Open the plugin's settings page. If `yeelight-home` is missing, it shows the install channels available on your machine — click one and the plugin installs **and verifies** the binary for you, no terminal needed.

Prefer the terminal?

```bash
npm install -g yeelight-home          # npm
brew install yeelight/yeelight-home/yeelight-home   # Homebrew (macOS)
```

### 3. Authenticate

```bash
yeelight-home auth login --qr
```

…or copy the command from the settings page and scan the QR code in your terminal.

### 4. Start talking to your home

Once installed, the tools activate automatically on the next profile boot:

- **Control** — on/off, brightness, color temperature, color
- **Query** — device status, home summary, entity list
- **Scenes & automations** — list, activate, create, modify
- **Diagnose** — gateway, device, scene and automation diagnostics
- **Lighting design** — full-home design plan, product selection and import
- **Personalize** — memory (remember/recall), recommendations, operation lessons
- **Reference** — routing guides, product catalogs, schemas, examples

## The settings page

The plugin registers its own **top-level settings section** (Settings → **Yeelight 智能家居**), alongside 通用设置, 模型, 插件, etc.:

- **Status banner** — connection state, version, binary path, auth state, region
- **Authentication** — logged-in state with token source; QR login guide when signed out
- **Configuration** — runtime path, region & language **dropdowns**, house ID, profile, request timeout, log retention, and UI toggles
- **Runtime install** — one-click channel install with live progress when the runtime is missing
- **Invocation logs** — recent history, refreshed live

## Configuration

All keys are editable from the settings page. Config persists at `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json`.

| Key | Default | Description |
|-----|---------|-------------|
| `binPath` | `""` (auto-detect) | Absolute path to the `yeelight-home` executable |
| `region` | `""` | Region override (`cn`, `us`, `eu`, `sg`, `in`, `ru`, …) |
| `houseId` | `""` | Default house ID (`--house-id`) |
| `profile` | `""` | Runtime profile (`--profile`) |
| `locale` | `zh-CN` | Request locale (`zh-CN`, `en-US`, `zh-TW`, `ja-JP`) |
| `dryRunDefault` | `false` | Preview effects without applying them until resent with dry-run off |
| `requestTimeoutMs` | `120000` | Per-request timeout in milliseconds |
| `logRetention` | `500` | Maximum retained invoke-log entries |
| `logEnabled` | `true` | Master switch for the invoke log |
| `uiStatusEnabled` | `true` | Show the status banner |
| `uiLogsEnabled` | `true` | Show the invocation-log section |
| `uiQuickInvokeEnabled` | `true` | Show the quick-invoke box |

## Development

```bash
npm install
npm run build      # host bundle → lib/ · browser bundle → lib/client.js
npm run typecheck  # TypeScript check
npm test           # vitest suite
npm run check      # all of the above
```

Layout: host face in [`src/`](src/) (tools, skill, web routes), browser face in [`src/client/bundle.js`](src/client/bundle.js) (the settings page), skill data in [`data/`](data/).

## Documentation

- [SKILL.md](data/SKILL.md) — the skill instructions DSH-adapted from upstream ([SKILL.upstream.md](data/SKILL.upstream.md))
- [references/](data/references/) — routing documents, domain rules, payload guides
- [assets/](data/assets/) — intent catalog, schemas, lighting-design examples, product catalogs
- [CHANGELOG.md](CHANGELOG.md) — release history

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

This plugin is a derivative of the [yeelight-smart-home](https://github.com/Yeelight/yeelight-smart-home-skills) reference skill, copyright Yeelight, used under Apache-2.0.
