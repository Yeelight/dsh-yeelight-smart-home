/* dsh-yeelight-smart-home — web client (lazy-CJS bundle). */
window.__ModuleLoader__.load({
  id: 'dsh-yeelight-smart-home',
  factory: (require) => {
/**
 * dsh-yeelight-smart-home — Browser face: the settings card (bundle body).
 *
 * This file is the FACTORY BODY of the lazy-CJS bundle protocol; build.mjs
 * wraps it in window.__ModuleLoader__.load({id, factory}). No build step and
 * no imports from dsh client packages: the zero-dependency stance of the
 * host half carries over.
 *
 * The card is contributed through the `settings.plugin.item` keyed slot (key
 * == the settings namespace the host half registers) and talks to the
 * plugin's own /yeelight loopback routes: configuration, runtime status,
 * quick invoke, and the invoke log. The browser never sees a token; only
 * paths and non-secret fields travel.
 *
 * Hand-written in the lazy-CJS bundle protocol with zero dsh imports, so the
 * package needs no build of the web client to render.
 */

const TEXT = {
  en: {
    title: 'Yeelight Smart Home',
    subtitle: 'Local yeelight-home runtime, plugin tools, and invoke log.',
    open: 'Open',
    close: 'Close',
    loading: 'loading...',
    refresh: 'Refresh',
    save: 'Save',
    saving: 'saving...',
    saved: 'saved',
    reset: 'Reset',
    resetting: 'resetting...',
    discard: 'Discard',
    statusTitle: 'Runtime status',
    statusMissing: 'yeelight-home runtime is not installed or not found.',
    statusHint: 'Install from Yeelight/yeelight-home Releases, or set binPath / YEELIGHT_HOME_BIN.',
    installTitle: 'Install yeelight-home',
    installSubtitle: 'The plugin needs the local yeelight-home CLI. Pick a channel:',
    installChecking: 'checking install channels…',
    installChoose: 'Install via',
    installRun: 'Install',
    installing: 'Installing…',
    installOk: 'Installed',
    installFail: 'Install failed',
    installRefresh: 'Refresh status',
    installNoChannel: 'No install channel available. Install npm or Homebrew first, or set binPath / YEELIGHT_HOME_BIN below.',
    authLabel: 'Auth',
    authLoggedIn: 'signed in',
    authOut: 'not signed in',
    authHint: 'Run `yeelight-home auth login --qr` locally to sign in.',
    authCopyCmd: 'Copy login command',
    authCopied: 'Copied!',
    authOpenTerminal: 'Open terminal and run',
    authGuideTitle: 'Sign in to Yeelight',
    authGuideDesc: 'Installation complete. Now sign in to your Yeelight account:',
    authGuideStep1: '1. Open Terminal',
    authGuideStep2: '2. Run: yeelight-home auth login --qr',
    authGuideStep3: '3. Scan the QR code with your phone',
    authGuideDone: 'After signing in, click Refresh to verify.',
    doctorLabel: 'Doctor',
    versionLabel: 'Version',
    binLabel: 'Binary',
    regionLabel: 'Region',
    houseLabel: 'House',
    configTitle: 'Configuration',
    binPath: 'Runtime path (binPath)',
    binPathHint: 'Absolute yeelight-home executable; empty = auto-detect (PATH, YEELIGHT_HOME_BIN).',
    region: 'Region (--region)',
    regionHint: 'Empty uses the local Runtime default.',
    houseId: 'Default house (--house-id)',
    houseIdHint: 'Empty uses the Runtime selected home.',
    profile: 'Runtime profile (--profile)',
    profileHint: 'Empty uses the active profile.',
    locale: 'Request locale',
    dryRunDefault: 'Dry-run by default',
    dryRunDefaultHint: 'Every invoke is a no-write preview until the request is resent without dry-run.',
    requestTimeoutMs: 'Invoke timeout (ms)',
    logRetention: 'Log retention (entries)',
    logEnabled: 'Invoke log on',
    uiStatusEnabled: 'Status section',
    uiLogsEnabled: 'Log section',
    uiQuickInvokeEnabled: 'Quick invoke section',
    quickTitle: 'Quick invoke',
    intent: 'Intent',
    intentCustom: 'custom…',
    utterance: 'Request (utterance)',
    parameters: 'Parameters (JSON, optional)',
    dryRun: 'Dry-run (no write)',
    confirm: 'I confirm this live request',
    run: 'Run',
    running: 'running...',
    result: 'Result',
    resultEmpty: 'no result yet',
    logsTitle: 'Invoke log',
    logsEmpty: 'no entries',
    clearLogs: 'Clear log',
    detailTitle: 'Detail',
    closeDetail: 'Close',
    errorLoad: 'load failed',
    errorSave: 'save failed',
    errorRun: 'run failed',
    errorClear: 'clear failed',
    versionUnknown: 'unknown',
    doctorFallback: 'doctor output unavailable',
    homeUnknown: '—',
  },
  zh: {
    title: 'Yeelight 智能家居',
    subtitle: '本地 yeelight-home 运行时、插件工具与调用日志。',
    open: '展开',
    close: '收起',
    loading: '加载中…',
    refresh: '刷新',
    save: '保存',
    saving: '保存中…',
    saved: '已保存',
    reset: '重置',
    resetting: '重置中…',
    discard: '放弃修改',
    statusTitle: '运行时状态',
    statusMissing: '未找到 yeelight-home 运行时。',
    statusHint: '请从 Yeelight/yeelight-home Releases 安装，或在下方配置 binPath / 环境变量 YEELIGHT_HOME_BIN。',
    installTitle: '安装 yeelight-home',
    installSubtitle: '插件依赖本地 yeelight-home CLI，请选择安装渠道：',
    installChecking: '正在检测安装渠道…',
    installChoose: '通过以下方式安装',
    installRun: '安装',
    installing: '安装中…',
    installOk: '安装成功',
    installFail: '安装失败',
    installRefresh: '刷新状态',
    installNoChannel: '没有可用的安装渠道。请先安装 npm 或 Homebrew，或在下方配置 binPath / YEELIGHT_HOME_BIN。',
    authLabel: '登录',
    authLoggedIn: '已登录',
    authOut: '未登录',
    authHint: '请在本机运行 `yeelight-home auth login --qr` 完成登录。',
    authCopyCmd: '复制登录命令',
    authCopied: '已复制！',
    authOpenTerminal: '打开终端并运行',
    authGuideTitle: '登录 Yeelight 账号',
    authGuideDesc: '安装完成。现在登录您的 Yeelight 账号：',
    authGuideStep1: '1. 打开终端（Terminal）',
    authGuideStep2: '2. 运行：yeelight-home auth login --qr',
    authGuideStep3: '3. 用手机扫描二维码',
    authGuideDone: '登录后点击「刷新」验证状态。',
    doctorLabel: '诊断',
    versionLabel: '版本',
    binLabel: '可执行文件',
    regionLabel: '区域',
    houseLabel: '家庭',
    configTitle: '配置',
    binPath: '运行时路径（binPath）',
    binPathHint: 'yeelight-home 可执行文件绝对路径；留空自动探测（PATH、YEELIGHT_HOME_BIN）。',
    region: '区域（--region）',
    regionHint: '留空使用 Runtime 默认区域。',
    houseId: '默认家庭（--house-id）',
    houseIdHint: '留空使用 Runtime 当前选中家庭。',
    profile: 'Runtime 配置档（--profile）',
    profileHint: '留空使用当前激活配置档。',
    locale: '请求语言（locale）',
    dryRunDefault: '默认先干跑（dry-run）',
    dryRunDefaultHint: '每次调用都先做无写入预览，确认后再以非 dry-run 重发。',
    requestTimeoutMs: '调用超时（毫秒）',
    logRetention: '日志保留条数',
    logEnabled: '启用调用日志',
    uiStatusEnabled: '显示状态区块',
    uiLogsEnabled: '显示日志区块',
    uiQuickInvokeEnabled: '显示快速调用区块',
    quickTitle: '快速调用',
    intent: '意图（intent）',
    intentCustom: '自定义…',
    utterance: '请求描述（utterance）',
    parameters: '参数（JSON，可选）',
    dryRun: '干跑（不写入）',
    confirm: '我确认执行该实时请求',
    run: '执行',
    running: '执行中…',
    result: '结果',
    resultEmpty: '暂无结果',
    logsTitle: '调用日志',
    logsEmpty: '暂无记录',
    clearLogs: '清空日志',
    detailTitle: '详情',
    closeDetail: '关闭',
    errorLoad: '加载失败',
    errorSave: '保存失败',
    errorRun: '执行失败',
    errorClear: '清空失败',
    versionUnknown: '未知',
    doctorFallback: '诊断信息不可用',
    homeUnknown: '—',
  },
}

function labels(active) {
  const lang = (
    active ||
    (typeof document !== 'undefined' ? document.documentElement.lang : '') ||
    (typeof navigator !== 'undefined' ? navigator.language : '') ||
    'en'
  ).toLowerCase()
  return lang.indexOf('zh') === 0 ? TEXT.zh : TEXT.en
}

const QUICK_INTENTS = [
  'home.summary',
  'home.list',
  'entity.list',
  'state.query',
  'light.power.set',
  'light.brightness.set',
  'light.color_temperature.set',
  'light.color.set',
  'scene.list',
  'scene.execute',
  'automation.list',
  'automation.enable',
  'automation.disable',
  'diagnose.device',
  'group.list',
  'lighting.design.plan',
  'memory.remember',
  'memory.list',
  'recommendation.list',
  'operation.lesson.list',
  'intent.explain',
]

const INPUT_STYLE = {
  border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))',
  background: 'var(--dsw-alias-bg-layer-3, rgba(127,127,127,0.06))',
  color: 'var(--dsw-alias-label-primary, #e6e6e6)',
  borderRadius: 8,
  padding: '0 10px',
  fontSize: 13,
  lineHeight: '20px',
  height: 34,
  width: '100%',
  boxSizing: 'border-box',
}

const TEXTAREA_STYLE = { ...INPUT_STYLE, height: 72, paddingTop: 7, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }

const LABEL_STYLE = { color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))', fontSize: 12, lineHeight: '18px', margin: '6px 0 3px' }

const HINT_STYLE = { color: 'var(--dsw-alias-label-tertiary, rgba(230,230,230,0.45))', fontSize: 11, lineHeight: '16px', margin: '2px 0 0' }

const SECTION_STYLE = { flexDirection: 'column', gap: 10, marginTop: 14 }

function ConfigCard(react, localeRef) {
  const { useState, useEffect, useMemo, useCallback } = react

  return function Card() {
    const t = labels(localeRef && localeRef.current ? localeRef.current : undefined)
    const [open, setOpen] = useState(false)
    const [config, setConfig] = useState(null)
    const [defaults, setDefaults] = useState(null)
    const [draft, setDraft] = useState(null)
    const [status, setStatus] = useState(null)
    const [logs, setLogs] = useState([])
    const [detail, setDetail] = useState(null)
    const [busy, setBusy] = useState(false)
    const [notice, setNotice] = useState(null)
    const [installOpts, setInstallOpts] = useState(null)
    const [installProgress, setInstallProgress] = useState(null)
    const [installing, setInstalling] = useState(false)

    const reloadConfig = useCallback(async () => {
      const res = await fetch('/yeelight/config')
      if (!res.ok) throw new Error(`${t.errorLoad}: HTTP ${res.status}`)
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorLoad)
      setConfig(body.value.config)
      setDefaults(body.value.defaults)
      setDraft(JSON.parse(JSON.stringify(body.value.config)))
      setNotice(null)
    }, [t.errorLoad])

    const reloadStatus = useCallback(async () => {
      const res = await fetch('/yeelight/status')
      if (!res.ok) throw new Error(`${t.errorLoad}: HTTP ${res.status}`)
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorLoad)
      setStatus(body.value.status)
    }, [t.errorLoad])

    const reloadLogs = useCallback(async () => {
      const res = await fetch('/yeelight/logs?limit=80')
      if (!res.ok) throw new Error(`${t.errorLoad}: HTTP ${res.status}`)
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorLoad)
      setLogs(body.value.entries || [])
    }, [t.errorLoad])

    const loadInstallOptions = useCallback(async () => {
      try {
        const res = await fetch('/yeelight/install-options')
        if (!res.ok) return
        const body = await res.json()
        if (body.ok && Array.isArray(body.value.options)) setInstallOpts(body.value.options)
      } catch {}
    }, [])

    const runInstall = useCallback(async (channel) => {
      setInstalling(true)
      setInstallProgress({ phase: 'installing', message: t.installing, channel })
      try {
        const res = await fetch('/yeelight/install', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channel }),
        })
        const body = await res.json()
        if (!body.ok) throw new Error(body.error?.message ?? t.errorRun)
        const result = body.value.result
        const progress = body.value.progress
        const last = progress && progress.length > 0 ? progress[progress.length - 1] : null
        setInstallProgress({
          phase: result.ok ? 'done' : 'error',
          message: result.ok ? (result.version ? `${t.installOk}: yeelight-home ${result.version} @ ${result.bin}` : t.installOk) : (result.error ?? t.installFail),
          channel: result.channel,
          output: result.output?.slice(0, 2000) ?? '',
        })
        if (result.ok) await reloadStatus()
      } catch (error) {
        setInstallProgress({ phase: 'error', message: `${t.installFail}: ${error.message || error}`, output: '' })
      } finally {
        setInstalling(false)
      }
    }, [t.installing, t.errorRun, t.installOk, t.installFail, reloadStatus])

    useEffect(() => {
      // Any response at all proves the host half exists. 404/network failure
      // means no web profile: keep the card silent rather than erroring.
      fetch('/yeelight/config')
        .then((res) => {
          if (res.status === 404) return
          return Promise.all([reloadConfig(), reloadStatus(), reloadLogs()])
        })
        .catch(() => {})
    }, [reloadConfig, reloadStatus, reloadLogs])

    const patch = useCallback(
      async (next) => {
        setBusy(true)
        try {
          const res = await fetch('/yeelight/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ patch: next }),
          })
          const body = await res.json()
          if (!body.ok) throw new Error(body.error?.message ?? t.errorSave)
          setConfig(body.value.config)
          setDraft(JSON.parse(JSON.stringify(body.value.config)))
          await reloadStatus()
          setNotice(t.saved)
        } catch (error) {
          setNotice(`${t.errorSave}: ${error && error.message ? error.message : error}`)
        } finally {
          setBusy(false)
        }
      },
      [t.errorSave, t.saved, reloadStatus],
    )

    const resetAll = useCallback(async () => {
      setBusy(true)
      try {
        const res = await fetch('/yeelight/config', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ reset: true }),
        })
        const body = await res.json()
        if (!body.ok) throw new Error(body.error?.message ?? t.errorSave)
        setConfig(body.value.config)
        setDraft(JSON.parse(JSON.stringify(body.value.config)))
        setNotice(t.saved)
      } catch (error) {
        setNotice(`${t.errorSave}: ${error && error.message ? error.message : error}`)
      } finally {
        setBusy(false)
      }
    }, [t.errorSave, t.saved])

    const field = useCallback(
      (key) => ({
        get: () => (draft ? String(draft[key] ?? '') : ''),
        set: (value) => setDraft((old) => ({ ...old, [key]: value })),
      }),
      [draft],
    )
    const numberField = useCallback(
      (key) => ({
        get: () => (draft ? Number(draft[key] ?? 0) : 0),
        set: (value) => setDraft((old) => ({ ...old, [key]: typeof value === 'number' ? value : Number(value || 0) })),
      }),
      [draft],
    )
    const boolField = useCallback(
      (key) => ({
        get: () => (draft ? draft[key] === true : false),
        set: (value) => setDraft((old) => ({ ...old, [key]: value === true })),
      }),
      [draft],
    )

    const saveDraft = useCallback(() => {
      if (draft === null) return
      void patch(JSON.parse(JSON.stringify(draft)))
    }, [draft, patch])

    const draftDiffers = useMemo(() => {
      if (draft === null || config === null) return false
      return JSON.stringify(draft) !== JSON.stringify(config)
    }, [draft, config])

    const changed = useCallback((key) => draft !== null && config !== null && JSON.stringify(draft[key]) !== JSON.stringify(config[key]), [draft, config])

    const header = react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', cursor: 'pointer' } },
      react.createElement('div', { style: { flex: 1, minWidth: 0 } },
        react.createElement('div', { style: { fontSize: 14, fontWeight: 600 } }, t.title),
        react.createElement('div', { style: { color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', fontSize: 13, lineHeight: 1.5 } }, t.subtitle),
      ),
      react.createElement('span', { style: { color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', fontSize: 12 } }, open ? t.close : t.open),
    )

    // ── status section ───────────────────────────────────────────────────
    const statusBody = react.createElement('div', { style: SECTION_STYLE },
      react.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, t.statusTitle),
      !status && !busy ? react.createElement('div', { style: HINT_STYLE }, t.loading) : null,
      status &&
        (status.bin
          ? react.createElement(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              keyValueRow(t, t.versionLabel, status.version ? `${status.version.version}${status.version.commit ? ` (${String(status.version.commit).slice(0, 7)})` : ''}` : t.versionUnknown),
              keyValueRow(t, t.binLabel, status.bin),
              keyValueRow(t, t.regionLabel, status.auth && status.auth.region ? status.auth.region : '—'),
              keyValueRow(t, t.houseLabel, status.auth && status.auth.houseId ? status.auth.houseId : '—'),
              keyValueRow(
                t,
                t.authLabel,
                status.auth
                  ? `${status.auth.authenticated ? t.authLoggedIn : t.authOut}${status.auth.authenticated && status.auth.tokenSource ? ` (${status.auth.tokenSource})` : ''}`
                  : `${t.authOut}${status.authError ? ` · ${status.authError}` : ''}`,
              ),
              !status.auth || !status.auth.authenticated ? react.createElement(AuthGuide, { react, t }) : null,
              react.createElement(
                'details',
                { style: { marginTop: 4 } },
                react.createElement('summary', { style: LABEL_STYLE }, t.doctorLabel),
                react.createElement(
                  'pre',
                  { style: { ...TEXTAREA_STYLE, height: 160, whiteSpace: 'pre-wrap', margin: 0 } },
                  status.doctor && status.doctor.text ? status.doctor.text.slice(0, 6000) : t.doctorFallback,
                ),
              ),
            )
          : react.createElement(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              react.createElement('div', { style: { color: 'var(--dsw-alias-state-error-primary, #e5484d)', fontSize: 13 } }, t.statusMissing),
              react.createElement('div', { style: HINT_STYLE }, t.statusHint),
              react.createElement(InstallGuide, { react, t, installOpts, installProgress, installing, loadInstallOptions, runInstall, reloadStatus, busy }),
              react.createElement('div', { style: { marginTop: 4 } },
                react.createElement('button', { onClick: () => void reloadStatus(), disabled: busy, style: buttonStyle() }, t.refresh),
              ),
            )
      ),
      status && status.bin
        ? react.createElement('div', { style: { marginTop: 4 } },
            react.createElement('button', { onClick: () => void reloadStatus(), disabled: busy, style: buttonStyle() }, t.refresh),
          )
        : null,
    )

    // ── config section ───────────────────────────────────────────────────
    const configFields = draft
      ? [
          fieldRow(react, t, 'binPath', t.binPath, field('binPath'), INPUT_STYLE, changed, t.binPathHint),
          fieldRow(react, t, 'region', t.region, field('region'), INPUT_STYLE, changed, t.regionHint),
          fieldRow(react, t, 'houseId', t.houseId, field('houseId'), INPUT_STYLE, changed, t.houseIdHint),
          fieldRow(react, t, 'profile', t.profile, field('profile'), INPUT_STYLE, changed, t.profileHint),
          selectRow(react, t, 'locale', t.locale, field('locale'), ['zh-CN', 'en-US', 'zh-TW', 'ja-JP'], changed),
          checkboxRow(react, t, 'dryRunDefault', t.dryRunDefault, boolField('dryRunDefault'), changed, t.dryRunDefaultHint),
          numberRow(react, t, 'requestTimeoutMs', t.requestTimeoutMs, numberField('requestTimeoutMs'), changed, 5000, 600000, 1000),
          numberRow(react, t, 'logRetention', t.logRetention, numberField('logRetention'), changed, 20, 5000, 10),
          checkboxRow(react, t, 'logEnabled', t.logEnabled, boolField('logEnabled'), changed, null),
          checkboxRow(react, t, 'uiStatusEnabled', t.uiStatusEnabled, boolField('uiStatusEnabled'), changed, null),
          checkboxRow(react, t, 'uiLogsEnabled', t.uiLogsEnabled, boolField('uiLogsEnabled'), changed, null),
          checkboxRow(react, t, 'uiQuickInvokeEnabled', t.uiQuickInvokeEnabled, boolField('uiQuickInvokeEnabled'), changed, null),
        ]
      : []

    const configBody = react.createElement('div', { style: SECTION_STYLE },
      react.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, t.configTitle),
      !draft ? react.createElement('div', { style: HINT_STYLE }, t.loading) : configFields,
      draft
        ? react.createElement(
            'div',
            { style: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 } },
            react.createElement(
              'button',
              { onClick: saveDraft, disabled: busy || !draftDiffers, style: primaryButtonStyle(busy || !draftDiffers) },
              busy ? t.saving : t.save,
            ),
            react.createElement(
              'button',
              {
                onClick: () => {
                  setDraft(JSON.parse(JSON.stringify(config)))
                  setNotice(null)
                },
                disabled: !draftDiffers,
                style: buttonStyle(),
              },
              t.discard,
            ),
            react.createElement(
              'button',
              { onClick: () => void resetAll(), disabled: busy, style: buttonStyle() },
              busy ? t.resetting : t.reset,
            ),
            notice ? react.createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))' } }, notice) : null,
          )
        : null,
    )

    // ── quick invoke section ─────────────────────────────────────────────
    const quickBody = react.createElement(QuickInvoke, { react, t, busy, setBusy, onNotice: setNotice })

    // ── log section ───────────────────────────────────────────────────────
    const logBody = react.createElement(LogSection, { react, t, logs, setLogs, setDetail, reloadLogs, busy, setBusy })

    const body = react.createElement(
      'div',
      { style: { margin: '0 16px', paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 } },
      statusBody,
      configBody,
      draft && draft.uiQuickInvokeEnabled !== false ? quickBody : null,
      draft && draft.uiLogsEnabled !== false ? logBody : null,
      detail ? react.createElement(DetailView, { react, t, detail, setDetail }) : null,
    )

    return react.createElement(
      'div',
      { style: { width: '100%', boxSizing: 'border-box' } },
      react.createElement('div', { onClick: () => setOpen((v) => !v) }, header),
      open ? body : null,
    )
  }
}

function buttonStyle() {
  return {
    border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))',
    color: 'var(--dsw-alias-label-primary, #e6e6e6)',
    font: 'inherit',
    cursor: 'pointer',
    background: 'transparent',
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 12,
  }
}


function AuthGuide({ react, t }) {
  const { useState, useCallback } = react
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    try {
      // Use the Clipboard API via the textarea trick for cross-browser safety
      const ta = document.createElement('textarea')
      ta.value = 'yeelight-home auth login --qr'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [])
  return react.createElement('div', { style: { marginTop: 8, padding: 10, border: '1px solid var(--dsw-alias-state-warning-border, rgba(245,166,35,0.3))', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2, rgba(127,127,127,0.04))' } },
    react.createElement('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 6 } }, t.authGuideTitle),
    react.createElement('div', { style: { fontSize: 12, lineHeight: '20px', color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))' } },
      react.createElement('div', null, t.authGuideDesc),
      react.createElement('div', { style: { marginTop: 4 } }, t.authGuideStep1),
      react.createElement('div', { style: { margin: '4px 0', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 } },
        react.createElement('span', { style: { flex: 1, wordBreak: 'break-all' } }, 'yeelight-home auth login --qr'),
        react.createElement('button', {
          onClick: () => void copy(),
          style: { border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))', background: 'transparent', color: 'var(--dsw-alias-label-primary, #e6e6e6)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 },
        }, copied ? t.authCopied : t.authCopyCmd),
      ),
      react.createElement('div', null, t.authGuideStep3),
      react.createElement('div', { style: { marginTop: 6 } }, t.authGuideDone),
    ),
  )
}


function InstallGuide({ react, t, installOpts, installProgress, installing, loadInstallOptions, runInstall, reloadStatus, busy }) {
  const { useState, useEffect } = react
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!loaded) { setLoaded(true); loadInstallOptions() }
  }, [loaded, loadInstallOptions])
  if (installProgress) {
    return react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, padding: 8, border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))', borderRadius: 6 } },
      react.createElement('div', { style: { fontSize: 12, fontWeight: 600 } }, t.installTitle),
      react.createElement('div', { style: { fontSize: 12, color: installProgress.phase === 'error' ? 'var(--dsw-alias-state-error-primary, #e5484d)' : 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))' } }, installProgress.message),
      installProgress.output ? react.createElement('pre', { style: { fontSize: 11, maxHeight: 120, overflow: 'auto', background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 4, margin: 0, whiteSpace: 'pre-wrap' } }, installProgress.output) : null,
      installProgress.phase === 'done' ? react.createElement('button', { onClick: () => void reloadStatus(), disabled: busy, style: buttonStyle() }, t.installRefresh) : null,
    )
  }
  if (installing) {
    return react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, padding: 8, border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))', borderRadius: 6 } },
      react.createElement('div', { style: { fontSize: 12, fontWeight: 600 } }, t.installTitle),
      react.createElement('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))' } }, t.installing),
    )
  }
  if (!installOpts) {
    return react.createElement('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', marginTop: 4 } }, t.installChecking)
  }
  if (installOpts.length === 0) {
    return react.createElement('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', marginTop: 4 } }, t.installNoChannel)
  }
  const available = installOpts.filter((o) => o.available)
  if (available.length === 0) {
    return react.createElement('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', marginTop: 4 } }, t.installNoChannel)
  }
  return react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, padding: 8, border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))', borderRadius: 6 } },
    react.createElement('div', { style: { fontSize: 12, fontWeight: 600 } }, t.installTitle),
    react.createElement('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))' } }, t.installSubtitle),
    react.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
      available.map((opt) =>
        react.createElement('button', {
          key: opt.channel,
          onClick: () => void runInstall(opt.channel),
          disabled: installing,
          style: { ...primaryButtonStyle(installing), fontSize: 12, padding: '5px 10px' },
        }, opt.label),
      ),
    ),
    react.createElement('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', lineHeight: 1.5 } },
      available.length > 0 ? `${t.installChoose} ${available.map((o) => o.label).join(' / ')}` : null,
    ),
  )
}

function primaryButtonStyle(disabled) {
  return {
    border: '1px solid transparent',
    background: 'var(--dsw-alias-brand-primary, #4a8cf7)',
    color: 'var(--dsw-alias-label-on-brand, #fff)',
    font: 'inherit',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 12,
  }
}

function keyValueRow(t, label, value) {
  return react.createElement(
    'div',
    { style: { display: 'flex', gap: 8, fontSize: 13, lineHeight: '20px' } },
    react.createElement('span', { style: { color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))', minWidth: 64 } }, label),
    react.createElement('span', { style: { wordBreak: 'break-all' } }, value),
  )
}

function fieldRow(react, t, key, label, field, style, changed, hint) {
  return react.createElement(
    'div',
    { key, style: { flexDirection: 'column', gap: 2, display: 'flex' } },
    react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      react.createElement('label', { style: { ...LABEL_STYLE, margin: 0, flex: 1 } }, label),
      changed(key) ? react.createElement('span', { style: { fontSize: 10, color: 'var(--dsw-alias-label-warning, #f5a623)' } }, '●') : null,
    ),
    react.createElement('input', {
      value: field.get(),
      placeholder: '',
      onChange: (e) => field.set(e.target.value),
      style: { ...style, height: 34 },
    }),
    hint ? react.createElement('div', { style: HINT_STYLE }, hint) : null,
  )
}

function numberRow(react, t, key, label, field, changed, min, max, step) {
  return react.createElement(
    'div',
    { key, style: { flexDirection: 'column', gap: 2, display: 'flex' } },
    react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      react.createElement('label', { style: { ...LABEL_STYLE, margin: 0, flex: 1 } }, label),
      changed(key) ? react.createElement('span', { style: { fontSize: 10, color: 'var(--dsw-alias-label-warning, #f5a623)' } }, '●') : null,
    ),
    react.createElement('input', {
      type: 'number',
      value: field.get(),
      min,
      max,
      step,
      onChange: (e) => field.set(Number(e.target.value)),
      style: { ...INPUT_STYLE, height: 34 },
    }),
  )
}

function selectRow(react, t, key, label, field, options, changed) {
  return react.createElement(
    'div',
    { key, style: { flexDirection: 'column', gap: 2, display: 'flex' } },
    react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
      react.createElement('label', { style: { ...LABEL_STYLE, margin: 0, flex: 1 } }, label),
      changed(key) ? react.createElement('span', { style: { fontSize: 10, color: 'var(--dsw-alias-label-warning, #f5a623)' } }, '●') : null,
    ),
    react.createElement(
      'select',
      { value: field.get(), onChange: (e) => field.set(e.target.value), style: { ...INPUT_STYLE, height: 34, cursor: 'pointer' } },
      options.map((option) => react.createElement('option', { key: option, value: option }, option)),
    ),
  )
}

function checkboxRow(react, t, key, label, field, changed, hint) {
  return react.createElement(
    'div',
    { key, style: { flexDirection: 'column', gap: 2, display: 'flex' } },
    react.createElement('label', { style: { ...LABEL_STYLE, margin: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 } },
      react.createElement('input', { type: 'checkbox', checked: field.get(), onChange: (e) => field.set(e.target.checked) }),
      label,
      changed(key) ? react.createElement('span', { style: { fontSize: 10, color: 'var(--dsw-alias-label-warning, #f5a623)' } }, '●') : null,
    ),
    hint ? react.createElement('div', { style: HINT_STYLE }, hint) : null,
  )
}

function QuickInvoke({ react, t, busy, setBusy, onNotice }) {
  const { useState, useCallback } = react
  const [intent, setIntent] = useState('home.summary')
  const [utterance, setUtterance] = useState('')
  const [parameters, setParameters] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    if (utterance.trim() === '') {
      setError(`${t.errorRun}: ${t.utterance}`)
      return
    }
    if (!dryRun && !confirm) {
      setError(`${t.errorRun}: ${t.confirm}`)
      return
    }
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/yeelight/invoke', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          utterance: utterance.trim(),
          intent: intent === '__custom__' ? '' : intent,
          parameters: parameters.trim() === '' ? undefined : JSON.parse(parameters),
          dry_run: dryRun,
          confirm,
        }),
      })
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorRun)
      setResult(body.value.outcome)
      onNotice(null)
    } catch (e) {
      setError(`${t.errorRun}: ${e && e.message ? e.message : e}`)
    } finally {
      setRunning(false)
      setBusy(false)
    }
  }, [utterance, intent, parameters, dryRun, confirm, t.errorRun, t.utterance, t.confirm, onNotice, setBusy])

  return react.createElement(
    'div',
    { style: SECTION_STYLE },
    react.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, t.quickTitle),
    react.createElement('label', { style: LABEL_STYLE }, t.intent),
    react.createElement(
      'select',
      {
        value: intent,
        onChange: (e) => setIntent(e.target.value),
        style: { ...INPUT_STYLE, height: 34, cursor: 'pointer' },
      },
      QUICK_INTENTS.map((option) => react.createElement('option', { key: option, value: option }, option)),
      react.createElement('option', { value: '__custom__' }, t.intentCustom),
    ),
    react.createElement('label', { style: LABEL_STYLE }, t.utterance),
    react.createElement('textarea', {
      value: utterance,
      placeholder: '',
      onChange: (e) => setUtterance(e.target.value),
      style: TEXTAREA_STYLE,
    }),
    react.createElement('label', { style: LABEL_STYLE }, t.parameters),
    react.createElement('textarea', {
      value: parameters,
      placeholder: '{}',
      spellCheck: false,
      onChange: (e) => setParameters(e.target.value),
      style: TEXTAREA_STYLE,
    }),
    react.createElement('div', { style: { display: 'flex', gap: 18, alignItems: 'center', marginTop: 6 } },
      react.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' } },
        react.createElement('input', { type: 'checkbox', checked: dryRun, onChange: (e) => setDryRun(e.target.checked) }),
        t.dryRun,
      ),
      react.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: dryRun ? 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))' : undefined } },
        react.createElement('input', { type: 'checkbox', checked: confirm, disabled: dryRun, onChange: (e) => setConfirm(e.target.checked) }),
        t.confirm,
      ),
    ),
    react.createElement('div', { style: { marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 } },
      react.createElement('button', { onClick: () => void run(), disabled: running || busy, style: primaryButtonStyle(running || busy) }, running ? t.running : t.run),
      error ? react.createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #e5484d)' } }, error) : null,
    ),
    result
      ? react.createElement(
          'div',
          { style: { marginTop: 8 } },
          react.createElement('div', { style: LABEL_STYLE }, t.result),
          react.createElement(
            'pre',
            { style: { ...TEXTAREA_STYLE, height: 'auto', minHeight: 60, maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0 } },
            JSON.stringify(result, null, 2),
          ),
        )
      : null,
  )
}

function fmtTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function LogSection({ react, t, logs, setLogs, setDetail, reloadLogs, busy, setBusy }) {
  const { useCallback } = react
  const loadDetail = useCallback(async (id) => {
    try {
      const res = await fetch(`/yeelight/logs/detail?id=${encodeURIComponent(id)}`)
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorLoad)
      setDetail(body.value.entry)
    } catch (e) {
      setDetail({ error: e && e.message ? e.message : String(e) })
    }
  }, [setDetail, t.errorLoad])

  const clear = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetch('/yeelight/logs/clear', { method: 'POST' })
      const body = await res.json()
      if (!body.ok) throw new Error(body.error?.message ?? t.errorClear)
      setLogs([])
      setDetail(null)
    } catch (e) {
      // surface inline
    } finally {
      setBusy(false)
    }
  }, [setLogs, setDetail, t.errorClear, setBusy])

  return react.createElement(
    'div',
    { style: SECTION_STYLE },
    react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      react.createElement('div', { style: { fontSize: 13, fontWeight: 600, flex: 1 } }, t.logsTitle),
      react.createElement('button', { onClick: () => void reloadLogs(), disabled: busy, style: buttonStyle() }, t.refresh),
      react.createElement('button', { onClick: () => void clear(), disabled: busy, style: buttonStyle() }, t.clearLogs),
    ),
    logs.length === 0
      ? react.createElement('div', { style: HINT_STYLE }, t.logsEmpty)
      : react.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflow: 'auto' } },
          logs.map((entry) =>
            react.createElement(
              'div',
              {
                key: entry.id,
                onClick: () => void loadDetail(entry.id),
                style: {
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                  border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.2))',
                },
              },
              react.createElement('span', { style: { color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', fontVariantNumeric: 'tabular-nums' } }, fmtTime(entry.ts)),
              react.createElement(
                'span',
                {
                  style: {
                    borderRadius: 999,
                    padding: '1px 8px',
                    fontSize: 11,
                    color: entry.ok ? 'var(--dsw-alias-state-success-primary, #46a758)' : 'var(--dsw-alias-state-error-primary, #e5484d)',
                    border: '1px solid currentColor',
                  },
                },
                entry.status,
              ),
              react.createElement('span', { style: { flex: 1, color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                `${entry.intent ?? ''}${entry.intent && entry.utterance ? ' · ' : ''}${entry.utterance ?? ''}`),
              react.createElement('span', { style: { color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', fontVariantNumeric: 'tabular-nums' } }, `${entry.durationMs}ms`),
              entry.dryRun ? react.createElement('span', { style: { color: 'var(--dsw-alias-label-warning, #f5a623)', fontSize: 11 } }, 'dry') : null,
            ),
          ),
        ),
  )
}

function DetailView({ react, t, detail, setDetail }) {
  const { useMemo } = react
  const text = useMemo(() => JSON.stringify(detail, null, 2), [detail])
  return react.createElement(
    'div',
    { style: SECTION_STYLE },
    react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      react.createElement('div', { style: { fontSize: 13, fontWeight: 600, flex: 1 } }, t.detailTitle),
      react.createElement('button', { onClick: () => setDetail(null), style: buttonStyle() }, t.closeDetail),
    ),
    react.createElement(
      'pre',
      { style: { ...TEXTAREA_STYLE, height: 'auto', maxHeight: 320, overflow: 'auto', whiteSpace: 'pre-wrap', margin: 0 } },
      text,
    ),
  )
}

function registerCard(ctx) {
  console.error('[yeelight-card] registerCard called, typeof ctx.inject:', typeof ctx.inject)
  if (typeof ctx.inject !== 'function') { console.error('[yeelight-card] ctx.inject not a function'); return }

  const localeRef = { current: null }
  ctx.inject(['locale'], (scope) => {
    localeRef.current = scope.locale
    if (typeof scope.effect === 'function') {
      scope.effect(
        () => () => {
          localeRef.current = null
        },
        'yeelight-smart-home: locale handle',
      )
    }
  })

  ctx.inject(['slots'], (scope) => {
    console.error('[yeelight-card] ctx.inject([slots]) callback fired, typeof scope.slots:', typeof scope.slots)
    fetch('/yeelight/config')
      .then((response) => {
        console.error('[yeelight-card] fetch /yeelight/config status:', response.status)
        if (response.status === 404) { console.error('[yeelight-card] 404 - skipping card mount'); return }
        try {
          mountCard(scope, localeRef)
          console.error('[yeelight-card] mountCard completed')
        } catch (error) {
          console.error(`[yeelight-smart-home] settings card skipped: ${error instanceof Error ? error.message : String(error)}`)
        }
      })
      .catch((err) => {
        console.error('[yeelight-card] fetch /yeelight/config failed:', String(err))
      })
  })
}

function mountCard(ctx, localeRef) {
  try { window.__yeelightCardState = 'mountCard entered' } catch(e) {}
  let react
  try {
    react = require('react')
    try { window.__yeelightCardState = 'require react ok' } catch(e) {}
  } catch (error) {
    try { window.__yeelightCardState = 'require react failed: ' + String(error) } catch(e) {}
    return
  }
  const Card = ConfigCard(react, localeRef)
  try { window.__yeelightCardState = 'ConfigCard created' } catch(e) {}
  ctx.slots.inject('settings.plugin.item', function* () {
    try { window.__yeelightCardState = 'slots.inject generator called' } catch(e) {}
    yield ctx.slots.register(
      { name: 'settings.plugin.item', id: 'yeelight-smart-home', key: 'yeelight-smart-home', order: 35 },
      Card,
    )
    try { window.__yeelightCardState = 'slots.register completed' } catch(e) {}
  })
  try { window.__yeelightCardState = 'slots.inject returned' } catch(e) {}
  // DIAGNOSTIC: direct register to observe the true failure mode.
  try {
    var directDispose = ctx.slots.register(
      { name: 'settings.plugin.item', id: 'yeelight-smart-home', key: 'yeelight-smart-home', order: 36 },
      Card,
    )
    try { window.__yeelightCardState = 'DIRECT register OK type=' + typeof directDispose } catch(e) {}
  } catch (err) {
    try { window.__yeelightCardState = 'DIRECT register FAILED: ' + String(err) } catch(e) {}
  }
}

function apply(ctx) {
  registerCard(ctx)
}

var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
exports.apply = apply;
exports.inject = [];
// Exposed for the repo's tests only; not part of the plugin contract.
exports.__card = { ConfigCard: ConfigCard, labels: labels };
return module.exports;

  },
});
