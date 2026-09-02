<div align="center">

# dsh-yeelight-smart-home

**在 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) 中直接控制、组织、诊断、设计、个性化你的 Yeelight 智能家居。**

[English](README.md) · [简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/dsh-yeelight-smart-home?color=%2330a46c&label=npm)](https://www.npmjs.com/package/dsh-yeelight-smart-home)
[![GitHub release](https://img.shields.io/github/v/release/Yeelight/dsh-yeelight-smart-home?color=%235e6ad2&label=GitHub)](https://github.com/Yeelight/dsh-yeelight-smart-home/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](#license)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-%230a84ff)](#)

</div>

---

## 它能做什么

`dsh-yeelight-smart-home` 把 DeepSeek Harness 变成你的**完整 Yeelight 智能家居管家**。它由本地 [yeelight-home](https://github.com/Yeelight/yeelight-home) Skill Runtime 驱动——所有请求都走官方运行时，**无需 API Key、无需云代理、无需 Home Assistant**。

模型可以控制设备、查询状态、执行场景与自动化、做灯光设计、记住你的偏好、回答产品问题；而你在 DSH 里拥有一页**专属设置页**，轻松管理运行时、认证与配置。

## 功能特性

| | |
|---|---|
| 🤖 **三个面向模型的工具** | `yeelight_home` — 一键 Skill Runtime 调用 · `yeelight_reference` — 按需路由文档 / 目录 / Schema · `yeelight_product_select` — 离线灯光设计选品 |
| 🧠 **内存技能** | 完整适配的路由规则集（绝对规则、工作流、领域参考）— 任何 DSH profile 都能用 |
| ⚙️ **专属设置页** | DSH 设置中的**独立页面**（而非埋在卡片里）：运行状态、配置、认证、日志一目了然 |
| 🚀 **一键安装运行时** | 缺少 `yeelight-home`？直接在设置页选 Homebrew / npm / GitHub Release 安装并自动校验 |
| 📋 **调用日志** | 有界、自动裁剪的 JSONL 历史记录，支持逐条查看详情 |
| 🗂️ **持久化配置** | 保存在 `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json` |

## 快速开始

### 1. 安装插件

> 需要 [Node.js](https://nodejs.org) ≥ 22.13 和 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) ≥ 0.1.1。

```bash
# 从 npm 安装（推荐）
dsh plugin --profile web add dsh-yeelight-smart-home

# …或从源码构建
git clone https://github.com/Yeelight/dsh-yeelight-smart-home.git
cd dsh-yeelight-smart-home
npm install && npm run build
```

重启 `dsh web`，然后打开 **设置 → Yeelight 智能家居**。

### 2. 安装运行时（一键）

打开插件设置页。如果缺少 `yeelight-home`，页面会列出你机器上可用的安装渠道——点一下，插件就会替你安装**并校验**二进制文件，全程无需终端。

更喜欢命令行？

```bash
npm install -g yeelight-home          # npm
brew install yeelight/yeelight-home/yeelight-home   # Homebrew（macOS）
```

### 3. 认证

```bash
yeelight-home auth login --qr
```

…或者从设置页复制命令，在终端扫描二维码即可。

### 4. 开始与你的家对话

安装后，工具会在下次启动 profile 时自动激活：

- **控制** — 开关、亮度、色温、颜色
- **查询** — 设备状态、家庭摘要、实体列表
- **场景与自动化** — 查看、执行、创建、修改
- **诊断** — 网关、设备、场景、自动化诊断
- **灯光设计** — 全屋设计方案、选品、导入
- **个性化** — 记忆（记住/回忆）、推荐、操作经验
- **参考** — 路由指南、产品目录、Schema、示例

## 设置页

插件注册了**顶级设置分区**（设置 → **Yeelight 智能家居**），与「通用设置」「模型」「插件」等平级：

- **状态横幅** — 连接状态、版本、可执行文件路径、认证状态、地区
- **认证** — 登录状态与 token 来源；未登录时给出扫码登录引导
- **配置** — 运行时路径、地区与语言**下拉选择**、住宅 ID、配置档、请求超时、日志保留、界面开关
- **运行时安装** — 缺运行时的一键渠道安装，带实时进度
- **调用日志** — 最近历史，可实时刷新

## 配置

所有键都可以在设置页直接编辑。配置持久化于 `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json`。

| 键 | 默认值 | 说明 |
|-----|--------|------|
| `binPath` | `""`（自动检测） | `yeelight-home` 可执行文件的绝对路径 |
| `region` | `""` | 地区覆盖（`cn`、`us`、`eu`、`sg`、`in`、`ru` 等） |
| `houseId` | `""` | 默认住宅 ID（`--house-id`） |
| `profile` | `""` | 运行时配置档（`--profile`） |
| `locale` | `zh-CN` | 请求语言（`zh-CN`、`en-US`、`zh-TW`、`ja-JP`） |
| `dryRunDefault` | `false` | 默认仅预览效果，直到关闭 dry-run 重发 |
| `requestTimeoutMs` | `120000` | 单次请求超时（毫秒） |
| `logRetention` | `500` | 最多保留的调用日志条数 |
| `logEnabled` | `true` | 调用日志总开关 |
| `uiStatusEnabled` | `true` | 显示状态横幅 |
| `uiLogsEnabled` | `true` | 显示调用日志区域 |
| `uiQuickInvokeEnabled` | `true` | 显示快速调用面板 |

## 开发

```bash
npm install
npm run build      # host bundle → lib/ · browser bundle → lib/client.js
npm run typecheck  # TypeScript 检查
npm test           # vitest 测试套件
npm run check      # 以上全部
```

目录结构：host 端在 [`src/`](src/)（工具、技能、Web 路由），浏览器端在 [`src/client/bundle.js`](src/client/bundle.js)（设置页），技能数据在 [`data/`](data/)。

## 文档

- [SKILL.md](data/SKILL.md) — 从上游适配到 DSH 的技能说明（[SKILL.upstream.md](data/SKILL.upstream.md)）
- [references/](data/references/) — 路由文档、领域规则、载荷指南
- [assets/](data/assets/) — 意图目录、Schema、灯光设计示例、产品目录
- [CHANGELOG.md](CHANGELOG.md) — 版本历史

## 许可证

Apache-2.0 — 详见 [LICENSE](./LICENSE) 与 [NOTICE](./NOTICE)。

本插件是 [yeelight-smart-home](https://github.com/Yeelight/yeelight-smart-home-skills) 参考技能（Yeelight 版权所有，Apache-2.0 许可）的衍生作品。