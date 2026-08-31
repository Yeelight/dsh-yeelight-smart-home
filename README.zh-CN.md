# dsh-yeelight-smart-home

**DeepSeek Harness 插件** — 基于本地 [yeelight-home](https://github.com/Yeelight/yeelight-home) 运行时，控制、组织、诊断、设计、个性化智能家居，并回答产品知识问题。

---

## 功能

- **三个面向模型的工具：**
  - `yeelight_home` — 通过 `yeelight-home invoke --stdin` 单次调用 Skill Runtime
  - `yeelight_reference` — 按需加载路由文档、资产目录、Schema 和示例
  - `yeelight_product_select` — 离线照明设计产品候选选择
- **内存技能** `yeelight-smart-home`，包含完整的路由规则集（绝对规则、工作流、领域参考）
- **设置卡片**（Web）— 插件配置、运行时状态、快速调用、调用日志
- **调用日志** — 有界 JSONL 日志，自动裁剪，支持逐条查看详情
- **配置文件** — 持久化存储于 `$DSH_HOME/plugins/dsh-yeelight-smart-home/config.json`

## 前置条件

- [Node.js](https://nodejs.org) >= 22.13
- [DeepSeek Harness](https://github.com/deepseek-ai/dsh) >= 0.1.1
- [yeelight-home](https://github.com/Yeelight/yeelight-home) CLI — 安装方式：
  ```bash
  npm install -g yeelight-home
  # 或 Homebrew
  brew install yeelight/yeelight-home/yeelight-home
  # 或从 GitHub Releases 下载
  ```
  安装后认证：`yeelight-home auth login --qr`

## 安装

```bash
dsh plugin --profile web add dsh-yeelight-smart-home
```

或手动添加到 profile 的 `package.json`：

```json
"dependencies": {
  "dsh-yeelight-smart-home": "github:axdlee/dsh-yeelight-smart-home"
}
```

然后在 profile 目录下运行 `pnpm install`。

## 使用

安装后，插件在下次启动 profile 时自动激活。模型可以：
- **控制设备：** 开关、亮度、色温、颜色
- **查询状态：** 设备状态、家居摘要、实体列表
- **执行场景和自动化：** 列表、激活、创建、修改
- **诊断：** 网关、设备、场景或自动化诊断
- **照明设计：** 全屋设计规划、产品选择、导入
- **个性化：** 记忆（记住/回忆）、推荐、操作指南
- **加载文档：** 路由指南、目录、Schema 和示例

Web 设置卡片（插件选项卡 → Yeelight 智能家居）提供：
- **配置** — 运行时路径、区域、家庭 ID、配置档、语言、超时、日志
- **运行时状态** — 版本、可执行文件、认证、诊断输出
- **快速调用** — 意图选择器、请求描述输入、JSON 参数、干跑模式
- **调用日志** — 可浏览的历史记录，支持逐条查看详情

## 配置

| 键 | 默认值 | 说明 |
|-----|---------|------|
| `binPath` | `""`（自动） | `yeelight-home` 可执行文件绝对路径 |
| `region` | `""` | `--region` 区域覆盖 |
| `houseId` | `""` | `--house-id` 默认家庭 ID |
| `profile` | `""` | `--profile` 运行时配置档 |
| `locale` | `zh-CN` | 请求语言 |
| `dryRunDefault` | `false` | 预览模式，直到不带 dry-run 重发 |
| `requestTimeoutMs` | `120000` | 单次请求超时 |
| `logRetention` | `500` | 最大调用日志条目数 |
| `logEnabled` | `true` | 启用/禁用日志 |
| `uiStatusEnabled` | `true` | Web 卡片中显示状态区块 |
| `uiLogsEnabled` | `true` | Web 卡片中显示日志区块 |
| `uiQuickInvokeEnabled` | `true` | Web 卡片中显示快速调用区块 |

## 文档

- [SKILL.md](data/SKILL.md) — DSH 适配后的技能指令（上游：[SKILL.upstream.md](data/SKILL.upstream.md)）
- [references/](data/references/) — 路由文档、领域规则和负载指南
- [assets/](data/assets/) — 意图目录、Schema、照明设计示例、产品目录

## 许可证

Apache-2.0 — 参见 [LICENSE](./LICENSE) 和 [NOTICE](./NOTICE)。

本插件衍生自 [yeelight-smart-home](https://github.com/Yeelight/yeelight-smart-home-skills) 参考技能，版权所有 Yeelight，在 Apache-2.0 下使用。