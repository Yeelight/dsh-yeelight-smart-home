# dsh-yeelight-smart-home

**DeepSeek Harness plugin** — control, organize, diagnose, design, personalize, and answer product knowledge questions for a Yeelight smart home, powered by the local [yeelight-home](https://github.com/Yeelight/yeelight-home) runtime.

---

## Features

- **Three model-facing tools:**
  - `yeelight_home` — one-call Skill Runtime invocation over `yeelight-home invoke --stdin`
  - `yeelight_reference` — on-demand routing documents, asset catalogs, schemas, and examples
  - `yeelight_product_select` — offline product candidate selection for lighting design
- **In-memory skill** `yeelight-smart-home` with the full routing rule set (Absolute Rules, Workflow, domain references)
- **Settings card** (web) — plugin configuration, runtime status, quick invoke, and invoke log
- **Invoke log** — bounded JSONL logger with auto-trim and per-entry detail
- **Config file** — persisted at `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json`

## Prerequisites

- [Node.js](https://nodejs.org) >= 22.13
- [DeepSeek Harness](https://github.com/deepseek-ai/dsh) >= 0.1.1
- [yeelight-home](https://github.com/Yeelight/yeelight-home) CLI — install via:
  ```bash
  npm install -g yeelight-home
  # or Homebrew
  brew install yeelight/yeelight-home/yeelight-home
  # or download from GitHub Releases
  ```
  Then authenticate: `yeelight-home auth login --qr`

### One-click install from the settings card

If the runtime is missing, the plugin's settings card shows an install guide
with the channels available on your machine (Homebrew on macOS, npm, or the
GitHub Release binary). Pick one and the plugin installs and verifies the
runtime for you — no terminal needed.

You can also pre-check what would run without installing:

```bash
curl -X POST -H 'content-type: application/json' -d '{"dry_run":true}' \
  http://127.0.0.1:<port>/yeelight/install
```

## Installation

```bash
dsh plugin --profile web add dsh-yeelight-smart-home
```

Or add it to your profile's `package.json` manually:

```json
"dependencies": {
  "dsh-yeelight-smart-home": "github:Yeelight/dsh-yeelight-smart-home"
}
```

Then run `pnpm install` in the profile directory.

## Usage

Once installed, the plugin activates automatically on the next profile boot. The model can:
- **Control devices:** turn on/off, set brightness, color temperature, color
- **Query state:** device status, home summary, entity list
- **Execute scenes and automations:** list, activate, create, modify
- **Diagnose:** gateway, device, scene, or automation diagnostics
- **Lighting design:** full-home design plan, product selection, import
- **Personalize:** memory (remember/recall), recommendations, operation lessons
- **Load documents:** routing guides, catalogs, schemas, and examples

The web settings card (Plugins tab → Yeelight Smart Home) provides:
- **Configuration** — runtime path, region, house ID, profile, locale, timeouts, logging
- **Runtime status** — version, binary, authentication, doctor output;
  one-click install guide when the runtime is missing
- **Quick invoke** — intent selector, utterance input, JSON parameters, dry-run
- **Invoke log** — browsable history with per-entry detail

## Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `binPath` | `""` (auto) | Absolute path to `yeelight-home` executable |
| `region` | `""` | Region override for `--region` |
| `houseId` | `""` | Default house ID for `--house-id` |
| `profile` | `""` | Runtime profile for `--profile` |
| `locale` | `zh-CN` | Request locale |
| `dryRunDefault` | `false` | Preview-only mode until resend without dry-run |
| `requestTimeoutMs` | `120000` | Per-request timeout |
| `logRetention` | `500` | Max invoke log entries |
| `logEnabled` | `true` | Enable/disable logging |
| `uiStatusEnabled` | `true` | Show status section in web card |
| `uiLogsEnabled` | `true` | Show log section in web card |
| `uiQuickInvokeEnabled` | `true` | Show quick invoke section in web card |

## Documentation

- [SKILL.md](data/SKILL.md) — DSH-adapted skill instructions (upstream: [SKILL.upstream.md](data/SKILL.upstream.md))
- [references/](data/references/) — routing documents, domain rules, and payload guides
- [assets/](data/assets/) — intent catalog, schemas, lighting design examples, product catalogs

## License

Apache-2.0 — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

This plugin is a derivative of the [yeelight-smart-home](https://github.com/Yeelight/yeelight-smart-home-skills) reference skill, copyright Yeelight, used under Apache-2.0.