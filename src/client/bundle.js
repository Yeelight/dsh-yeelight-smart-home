/**
 * dsh-yeelight-smart-home — Browser face: the settings section (bundle body).
 *
 * Registered as a `settings.section` entry so it appears as a top-level page
 * alongside "通用设置", "模型", "插件", etc.  No bundle step — the body is
 * pasted verbatim into the lazy-CJS envelope by build.mjs.
 */

/* ── labels ──────────────────────────────────────────────────────────── */
var TEXT = {
  en: {
    title: 'Yeelight Smart Home',
    subtitle: 'Local yeelight-home runtime, invoke tools, and invocation logs.',
    status: 'Runtime Status',
    auth: 'Authentication',
    config: 'Configuration',
    logs: 'Logs',
    install: 'Runtime Installation',
    saved: 'Saved.',
    saving: 'Saving…',
    save: 'Save',
    reset: 'Reset',
    loading: 'Loading…',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Expand',
    connected: 'Connected',
    disconnected: 'Disconnected',
    notInstalled: 'Not installed',
    versionLabel: 'Version',
    binLabel: 'Binary',
    regionLabel: 'Region',
    houseLabel: 'House ID',
    profileLabel: 'Profile',
    authLabel: 'Auth',
    authLoggedIn: 'Logged in',
    authOut: 'Not logged in',
    authGuideTitle: 'Login via QR Code',
    authGuideDesc: 'Authenticate with your Yeelight account:',
    authGuideStep1: '1. Run this command in your terminal:',
    authGuideStep2: '2. Scan the QR code shown in the terminal',
    authGuideStep3: '3. After successful login, click "Refresh" below',
    authGuideDone: 'You can now invoke Yeelight tools.',
    authCopied: 'Copied!',
    authCopyCmd: 'Copy',
    authReAuth: 'Re-authenticate',
    authTokenSource: 'via {source}',
    configTitle: 'Settings',
    configBinPath: 'Runtime Path',
    configBinHint: 'Leave empty for auto-detect',
    configRegion: 'Region',
    configRegionHint: 'Yeelight service region',
    configHouseId: 'House ID',
    configHouseHint: 'Leave empty for default house',
    configProfile: 'Profile',
    configProfileHint: 'Leave empty for active profile',
    configLocale: 'Language',
    configDryRun: 'Dry run by default',
    configDryRunHint: 'Preview effects without applying them',
    configTimeout: 'Request Timeout (ms)',
    configLogRetention: 'Log Retention',
    configLogRetentionHint: 'Maximum log entries to keep',
    configLogEnabled: 'Enable invocation logs',
    configUiStatus: 'Show runtime status',
    configUiLogs: 'Show log section',
    configUiQuickInvoke: 'Show quick-invoke box',
    statusMissing: 'Runtime not found',
    statusHint: 'Install yeelight-home to use Yeelight Smart Home tools.',
    installTitle: 'Install yeelight-home',
    installSubtitle: 'Choose a method:',
    installChecking: 'Checking available install methods…',
    installNoChannel: 'No install method available',
    installChoose: 'Install via',
    installing: 'Installing…',
    installOk: 'Installation complete',
    installFail: 'Installation failed',
    installRefresh: 'Refresh status',
    installError: 'Installation failed',
    installErrorHint: 'See the output below for details:',
    logTitle: 'Invocation Logs',
    logEmpty: 'No log entries yet.',
    logDetail: 'View details',
    closeDetail: 'Close',
    detailTitle: 'Log Entry Details',
    doctorLabel: 'Doctor diagnostics',
    doctorFallback: 'No diagnostics available.',
    optionLabel: 'Options',
    retry: 'Retry',
    notApplicable: '—',
    homeUnknown: '—',
    unknown: 'Unknown',
    errorLoad: 'Failed to load',
    errorSave: 'Failed to save',
    errorRun: 'Failed to run',
  },
  zh: {
    title: 'Yeelight 智能家居',
    subtitle: '本地 yeelight-home 运行时、插件工具与调用日志。',
    status: '运行状态',
    auth: '认证',
    config: '配置',
    logs: '日志',
    install: '运行时安装',
    saved: '已保存。',
    saving: '保存中…',
    save: '保存',
    reset: '重置',
    loading: '加载中…',
    refresh: '刷新',
    close: '收起',
    open: '展开',
    connected: '已连接',
    disconnected: '未连接',
    notInstalled: '未安装',
    versionLabel: '版本',
    binLabel: '可执行文件',
    regionLabel: '地区',
    houseLabel: '住宅 ID',
    profileLabel: '配置档',
    authLabel: '认证',
    authLoggedIn: '已登录',
    authOut: '未登录',
    authGuideTitle: '扫码登录',
    authGuideDesc: '使用 Yeelight 账号认证：',
    authGuideStep1: '1. 在终端中运行以下命令：',
    authGuideStep2: '2. 扫描终端中显示的二维码',
    authGuideStep3: '3. 登录成功后点击下方"刷新"',
    authGuideDone: '现在可以正常使用 Yeelight 工具了。',
    authCopied: '已复制！',
    authCopyCmd: '复制',
    authReAuth: '重新认证',
    authTokenSource: '通过 {source}',
    configTitle: '设置',
    configBinPath: '运行时路径',
    configBinHint: '留空自动检测',
    configRegion: '地区',
    configRegionHint: 'Yeelight 服务区域',
    configHouseId: '住宅 ID',
    configHouseHint: '留空使用默认住宅',
    configProfile: '配置档',
    configProfileHint: '留空使用活跃配置',
    configLocale: '语言',
    configDryRun: '默认 Dry Run',
    configDryRunHint: '预览效果不实际执行',
    configTimeout: '请求超时 (毫秒)',
    configLogRetention: '日志保留',
    configLogRetentionHint: '最多保留的日志条数',
    configLogEnabled: '启用调用日志',
    configUiStatus: '显示运行状态',
    configUiLogs: '显示日志区域',
    configUiQuickInvoke: '显示快速调用面板',
    statusMissing: '未找到运行时',
    statusHint: '安装 yeelight-home 以使用 Yeelight 智能家居工具。',
    installTitle: '安装 yeelight-home',
    installSubtitle: '选择安装方式：',
    installChecking: '正在检查可用安装方式…',
    installNoChannel: '无可用安装方式',
    installChoose: '通过以下方式安装',
    installing: '安装中…',
    installOk: '安装完成',
    installFail: '安装失败',
    installRefresh: '刷新状态',
    installError: '安装失败',
    installErrorHint: '查看下方输出了解详情：',
    logTitle: '调用日志',
    logEmpty: '暂无日志。',
    logDetail: '查看详情',
    closeDetail: '关闭',
    detailTitle: '日志详情',
    doctorLabel: '诊断信息',
    doctorFallback: '暂无诊断信息。',
    optionLabel: '选项',
    retry: '重试',
    notApplicable: '—',
    homeUnknown: '—',
    unknown: '未知',
    errorLoad: '加载失败',
    errorSave: '保存失败',
    errorRun: '执行失败',
  },
}

function labels(active) {
  var raw = ''
  if (typeof active === 'string' && active.length > 0) {
    raw = active
  } else if (typeof document !== 'undefined' && typeof document.documentElement.lang === 'string') {
    raw = document.documentElement.lang
  }
  if (typeof raw !== 'string' || raw.length === 0) {
    if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') raw = navigator.language
  }
  if (typeof raw !== 'string' || raw.length === 0) raw = 'en'
  return raw.toLowerCase().indexOf('zh') === 0 ? TEXT.zh : TEXT.en
}

/* ── style constants ─────────────────────────────────────────────────── */
var CARD = {
  border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))',
  bg: 'var(--dsw-alias-bg-layer-2, rgba(127,127,127,0.04))',
  radius: '12px',
  padding: '16px',
}
var INPUT = {
  border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))',
  background: 'var(--dsw-alias-bg-layer-3, rgba(127,127,127,0.06))',
  color: 'var(--dsw-alias-label-primary, #e6e6e6)',
  borderRadius: '8px',
  padding: '0 10px',
  fontSize: 13,
  lineHeight: '32px',
  height: 34,
  width: '100%',
  boxSizing: 'border-box',
  font: 'inherit',
}
var SELECT = Object.assign({}, INPUT, {
  cursor: 'pointer',
  appearance: 'auto' // let the browser render the native dropdown arrow
})
var LABEL = {
  color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))',
  fontSize: 12,
  lineHeight: '18px',
  marginBottom: 4,
}
var HINT = {
  color: 'var(--dsw-alias-label-tertiary, rgba(230,230,230,0.45))',
  fontSize: 11,
  lineHeight: '16px',
  marginTop: 2,
}
var ERROR = {
  color: 'var(--dsw-alias-state-error-primary, #e5484d)',
  fontSize: 12,
  lineHeight: '18px',
}
var SUCCESS = {
  color: 'var(--dsw-alias-state-success-primary, #30a46c)',
  fontSize: 12,
  lineHeight: '18px',
}

function btnStyle(primary) {
  return {
    border: '1px solid ' + (primary ? 'var(--dsw-alias-brand-primary, #5e6ad2)' : 'var(--dsw-alias-border-l2, rgba(127,127,127,0.3))'),
    background: primary ? 'var(--dsw-alias-brand-primary, #5e6ad2)' : 'transparent',
    color: primary ? '#fff' : 'var(--dsw-alias-label-primary, #e6e6e6)',
    borderRadius: 8,
    padding: '5px 14px',
    fontSize: 13,
    cursor: 'pointer',
    font: 'inherit',
    lineHeight: '22px',
    whiteSpace: 'nowrap',
  }
}

function disabledStyle(disabled) {
  return disabled ? { opacity: 0.5, cursor: 'default' } : {}
}

/* ── YeelightPage factory ────────────────────────────────────────────── */
function YeelightPage(react, localeRef) {
  var useState = react.useState
  var useCallback = react.useCallback
  var useEffect = react.useEffect

  return function Page() {
    var t = labels(localeRef && localeRef.current ? localeRef.current : undefined)
    var _s = useState(null)
    var config = _s[0]
    var setConfig = _s[1]
    var _s2 = useState(null)
    var defaults = _s2[0]
    var setDefaults = _s2[1]
    var _s3 = useState(null)
    var status = _s3[0]
    var setStatus = _s3[1]
    var _s4 = useState([])
    var logs = _s4[0]
    var setLogs = _s4[1]
    var _s5 = useState(null)
    var detail = _s5[0]
    var setDetail = _s5[1]
    var _s6 = useState(false)
    var busy = _s6[0]
    var setBusy = _s6[1]
    var _s7 = useState(null)
    var notice = _s7[0]
    var setNotice = _s7[1]
    var _s8 = useState(null)
    var installOpts = _s8[0]
    var setInstallOpts = _s8[1]
    var _s9 = useState(null)
    var installProgress = _s9[0]
    var setInstallProgress = _s9[1]
    var _s10 = useState(false)
    var installing = _s10[0]
    var setInstalling = _s10[1]
    // Options for select fields
    var _s11 = useState(null)
    var options = _s11[0]
    var setOptions = _s11[1]
    // Edit draft
    var _s12 = useState(null)
    var draft = _s12[0]
    var setDraft = _s12[1]

    // ── data fetchers ─────────────────────────────────────────────────
    var loadConfig = useCallback(async function() {
      try {
        var res = await fetch('/yeelight/config')
        if (!res.ok) return
        var body = await res.json()
        if (body.ok) {
          setConfig(body.value.config)
          setDefaults(body.value.defaults)
          setDraft(body.value.config ? JSON.parse(JSON.stringify(body.value.config)) : null)
        }
      } catch (e) {}
    }, [])

    var loadStatus = useCallback(async function() {
      try {
        var res = await fetch('/yeelight/status')
        if (!res.ok) return
        var body = await res.json()
        if (body.ok && body.value) setStatus(body.value.status)
      } catch (e) {}
    }, [])

    var loadLogs = useCallback(async function() {
      try {
        var res = await fetch('/yeelight/logs?limit=80')
        if (!res.ok) return
        var body = await res.json()
        if (body.ok && body.value) setLogs(body.value.entries || [])
      } catch (e) {}
    }, [])

    var loadOptions = useCallback(async function() {
      try {
        var res = await fetch('/yeelight/options')
        if (!res.ok) return
        var body = await res.json()
        if (body.ok) setOptions(body.value)
      } catch (e) {}
    }, [])

    var loadInstallOptions = useCallback(async function() {
      try {
        var res = await fetch('/yeelight/install-options')
        if (!res.ok) return
        var body = await res.json()
        if (body.ok && Array.isArray(body.value.options)) setInstallOpts(body.value.options)
      } catch (e) {}
    }, [])

    useEffect(function() {
      Promise.all([
        loadConfig(),
        loadStatus(),
        loadLogs(),
        loadOptions(),
        loadInstallOptions(),
      ]).catch(function() {})
    }, [loadConfig, loadStatus, loadLogs, loadOptions, loadInstallOptions])

    // ── save ──────────────────────────────────────────────────────────
    var saveDraft = useCallback(async function() {
      setBusy(true)
      setNotice(null)
      try {
        var res = await fetch('/yeelight/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config: draft }),
        })
        var body = await res.json()
        if (!body.ok) throw new Error(body.error && body.error.message || t.errorSave)
        setConfig(JSON.parse(JSON.stringify(draft)))
        setDefaults(JSON.parse(JSON.stringify(draft)))
        setNotice(t.saved)
      } catch (err) {
        setNotice(err instanceof Error ? err.message : String(err))
      }
      setBusy(false)
    }, [draft, t.errorSave, t.saved])

    // ── install ───────────────────────────────────────────────────────
    var runInstall = useCallback(async function(channel) {
      setInstalling(true)
      setInstallProgress({ phase: 'installing', message: t.installing, channel: channel })
      try {
        var res = await fetch('/yeelight/install', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channel: channel }),
        })
        var body = await res.json()
        if (!body.ok) throw new Error((body.error && body.error.message) || t.installFail)
        var result = body.value.result
        var progress = body.value.progress
        var last = progress && progress.length > 0 ? progress[progress.length - 1] : null
        setInstallProgress({
          phase: result.ok ? 'done' : 'error',
          message: result.ok ? (result.version ? t.installOk + ': yeelight-home ' + result.version : t.installOk) : (result.error || t.installFail),
          channel: result.channel,
          output: result.output ? result.output.slice(0, 2000) : '',
        })
        if (result.ok) {
          loadStatus()
          loadConfig()
        }
      } catch (error) {
        setInstallProgress({ phase: 'error', message: t.installFail + ': ' + (error.message || error), output: '' })
      }
      setInstalling(false)
    }, [t.installing, t.installFail, t.installOk, loadStatus, loadConfig])

    // ── field helpers ─────────────────────────────────────────────────
    var changed = useCallback(function(key) {
      return function(value) {
        if (!draft) return
        setDraft(Object.assign({}, draft, (function() { var o = {}; o[key] = value; return o })()))
      }
    }, [draft])

    var field = useCallback(function(key) {
      return draft && draft[key] !== undefined ? draft[key] : defaults && defaults[key] !== undefined ? defaults[key] : ''
    }, [draft, defaults])

    var boolField = useCallback(function(key) {
      return draft && draft[key] !== undefined ? draft[key] : defaults && defaults[key] !== undefined ? defaults[key] : false
    }, [draft, defaults])

    var numField = useCallback(function(key) {
      return draft && draft[key] !== undefined ? draft[key] : defaults && defaults[key] !== undefined ? defaults[key] : 0
    }, [draft, defaults])

    var draftDiffers = config && draft ? JSON.stringify(config) !== JSON.stringify(draft) : false

    // ── render: FieldRow ──────────────────────────────────────────────
    function FieldRow(label, hint, child) {
      return react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
        react.createElement('label', { style: LABEL }, label),
        child,
        hint ? react.createElement('div', { style: HINT }, hint) : null,
      )
    }

    function SelectField(label, hint, key, options) {
      var val = field(key) || ''
      return FieldRow(label, hint,
        react.createElement('select', {
          value: val,
          onChange: function(e) { changed(key)(e.target.value) },
          disabled: !draft,
          style: Object.assign({}, SELECT, disabledStyle(!draft)),
        },
          options.map(function(opt) {
            return react.createElement('option', { key: opt.value, value: opt.value }, opt.label)
          })
        )
      )
    }

    function TextField(label, hint, key, placeholder) {
      return FieldRow(label, hint,
        react.createElement('input', {
          type: 'text',
          value: field(key),
          placeholder: placeholder || '',
          onChange: function(e) { changed(key)(e.target.value) },
          disabled: !draft,
          style: Object.assign({}, INPUT, disabledStyle(!draft)),
        })
      )
    }

    function NumberField(label, hint, key, min, max, step) {
      return FieldRow(label, hint,
        react.createElement('input', {
          type: 'number',
          value: numField(key),
          min: min,
          max: max,
          step: step || 1,
          onChange: function(e) { changed(key)(Number(e.target.value)) },
          disabled: !draft,
          style: Object.assign({}, INPUT, disabledStyle(!draft)),
        })
      )
    }

    function CheckField(label, key, hint) {
      var checked = boolField(key)
      return react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' } },
        react.createElement('input', {
          type: 'checkbox',
          checked: checked,
          onChange: function(e) { changed(key)(e.target.checked) },
          disabled: !draft,
          style: { cursor: 'pointer', width: 16, height: 16 },
        }),
        react.createElement('label', { style: Object.assign({}, LABEL, { marginBottom: 0, cursor: 'pointer' }),
          onClick: function() { if (draft) changed(key)(!checked) },
        }, label),
        hint ? react.createElement('span', { style: HINT }, hint) : null,
      )
    }

    // ── render: Status Banner ─────────────────────────────────────────
    function renderStatusBanner() {
      if (!status) return react.createElement('div', { style: { padding: 12, textAlign: 'center', color: 'var(--dsw-alias-label-tertiary)' } }, t.loading)

      var connected = status.bin && status.bin !== ''
      var items = []

      items.push(react.createElement('span', { key: 'dot', style: {
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: connected ? 'var(--dsw-alias-state-success-primary, #30a46c)' : 'var(--dsw-alias-state-error-primary, #e5484d)',
        marginRight: 6,
      }}))

      items.push(react.createElement('span', { key: 'status', style: { fontSize: 13, fontWeight: 600, marginRight: 16 } },
        connected ? t.connected : t.disconnected
      ))

      if (status.version) {
        items.push(renderBadge('v' + (status.version.version || '') + (status.version.commit ? ' (' + status.version.commit.slice(0, 7) + ')' : '')))
      }
      if (status.bin) {
        items.push(renderBadge(status.bin))
      }
      if (status.auth) {
        items.push(renderBadge(status.auth.authenticated ? '✅ ' + t.authLoggedIn : '🔑 ' + t.authOut))
      }
      if (status.auth && status.auth.region) {
        items.push(renderBadge(status.auth.region))
      }

      return react.createElement('div', { style: {
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
        padding: CARD.padding, border: CARD.border, borderRadius: CARD.radius,
        background: CARD.bg, marginBottom: 12,
      }}, items)
    }

    function renderBadge(text) {
      return react.createElement('span', { key: text, style: {
        background: 'var(--dsw-alias-bg-module-platform, rgba(127,127,127,0.08))',
        color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))',
        borderRadius: 999, padding: '2px 8px', fontSize: 11, lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}, text)
    }

    // ── render: Configuration Card ────────────────────────────────────
    var regionOptions = (options && options.regions) || [
      { value: '', label: t.notApplicable },
      { value: 'cn', label: 'China (cn)' },
      { value: 'us', label: 'United States (us)' },
      { value: 'eu', label: 'Europe (eu)' },
      { value: 'sg', label: 'Singapore (sg)' },
      { value: 'in', label: 'India (in)' },
      { value: 'ru', label: 'Russia (ru)' },
    ]
    var localeOptions = (options && options.locales) || [
      { value: 'zh-CN', label: '中文 (zh-CN)' },
      { value: 'en-US', label: 'English (en-US)' },
      { value: 'zh-TW', label: '中文 (zh-TW)' },
      { value: 'ja-JP', label: '日本語 (ja-JP)' },
    ]

    function renderConfig() {
      var fields = []
      fields.push(SelectField(t.configRegion, t.configRegionHint, 'region', regionOptions))
      fields.push(TextField(t.configHouseId, t.configHouseHint, 'houseId', t.configHouseHint))
      fields.push(TextField(t.configProfile, t.configProfileHint, 'profile', t.configProfileHint))
      fields.push(SelectField(t.configLocale, '', 'locale', localeOptions))
      fields.push(TextField(t.configBinPath, t.configBinHint, 'binPath', t.configBinHint))
      fields.push(NumberField(t.configTimeout, '', 'requestTimeoutMs', 1000, 300000, 100))
      fields.push(NumberField(t.configLogRetention, t.configLogRetentionHint, 'logRetention', 10, 5000, 10))
      fields.push(CheckField(t.configDryRun, 'dryRunDefault', t.configDryRunHint))
      fields.push(CheckField(t.configLogEnabled, 'logEnabled', ''))
      fields.push(CheckField(t.configUiStatus, 'uiStatusEnabled', ''))
      fields.push(CheckField(t.configUiLogs, 'uiLogsEnabled', ''))
      fields.push(CheckField(t.configUiQuickInvoke, 'uiQuickInvokeEnabled', ''))

      return react.createElement('div', { style: {
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
      }},
        react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 12 } }, t.configTitle),
        react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, fields),
        react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 } },
          react.createElement('button', {
            onClick: saveDraft,
            disabled: busy || !draftDiffers,
            style: Object.assign({}, btnStyle(true), disabledStyle(busy || !draftDiffers)),
          }, busy ? t.saving : t.save),
          react.createElement('button', {
            onClick: function() { setDraft(config ? JSON.parse(JSON.stringify(config)) : null); setNotice(null) },
            disabled: busy || !draftDiffers,
            style: Object.assign({}, btnStyle(false), disabledStyle(busy || !draftDiffers)),
          }, t.reset),
          notice ? react.createElement('span', {
            style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, rgba(127,127,127,0.8))', marginLeft: 8 }
          }, notice) : null,
        ),
      )
    }

    // ── render: Auth Card ─────────────────────────────────────────────
    function renderAuth() {
      if (!status) return null
      var isAuth = status.auth && status.auth.authenticated
      var tokenSource = status.auth && status.auth.tokenSource ? status.auth.tokenSource : null

      return react.createElement('div', { style: {
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
      }},
        react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 8 } }, t.auth),
        isAuth
          ? react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
              react.createElement('span', { style: SUCCESS }, '✅ ' + t.authLoggedIn),
              tokenSource ? react.createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } },
                t.authTokenSource.replace('{source}', tokenSource)
              ) : null,
              react.createElement('button', {
                onClick: loadStatus,
                style: btnStyle(false),
              }, t.refresh),
            )
          : react.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
              react.createElement('span', { style: ERROR }, '🔑 ' + t.authOut),
              react.createElement('div', { style: { fontSize: 12, lineHeight: '20px', color: 'var(--dsw-alias-label-secondary)' } },
                react.createElement('div', null, t.authGuideDesc),
                react.createElement('div', { style: { marginTop: 4 } }, t.authGuideStep1),
                react.createElement('div', { style: { margin: '4px 0', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 } },
                  react.createElement('span', { style: { flex: 1, wordBreak: 'break-all' } }, 'yeelight-home auth login --qr'),
                  react.createElement(ClipboardButton, { react: react, t: t }),
                ),
                react.createElement('div', { style: { marginTop: 4 } }, t.authGuideStep3),
                react.createElement('div', { style: { marginTop: 6 } }, t.authGuideDone),
              ),
              react.createElement('div', { style: { marginTop: 4 } },
                react.createElement('button', { onClick: loadStatus, style: btnStyle(false) }, t.refresh),
              ),
            ),
      )
    }

    function ClipboardButton(props) {
      var _r = props.react
      var _t = props.t
      var _s = _r.useState(false)
      var copied = _s[0]
      var setCopied = _s[1]
      var copy = _r.useCallback(function() {
        try {
          var ta = document.createElement('textarea')
          ta.value = 'yeelight-home auth login --qr'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          setCopied(true)
          setTimeout(function() { setCopied(false) }, 2000)
        } catch (e) {}
      }, [])
      return react.createElement('button', {
        onClick: function() { copy() },
        style: { border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.3))', background: 'transparent', color: 'var(--dsw-alias-label-primary, #e6e6e6)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 },
      }, copied ? _t.authCopied : _t.authCopyCmd)
    }

    // ── render: Install Card ──────────────────────────────────────────
    function renderInstall() {
      if (!status) return null
      if (status.bin && status.bin !== '') return null // already installed

      if (installProgress && installProgress.phase === 'done') {
        return react.createElement('div', { style: {
          border: '1px solid var(--dsw-alias-state-success-border, rgba(48,164,108,0.3))', borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
        }},
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
          react.createElement('div', { style: SUCCESS }, installProgress.message),
          react.createElement('button', { onClick: loadStatus, style: Object.assign({}, btnStyle(false), { marginTop: 6 }) }, t.installRefresh),
        )
      }

      if (installProgress) {
        return react.createElement('div', { style: {
          border: '1px solid var(--dsw-alias-state-warning-border, rgba(245,166,35,0.3))', borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
        }},
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
          react.createElement('div', { style: { fontSize: 12, color: installProgress.phase === 'error' ? 'var(--dsw-alias-state-error-primary, #e5484d)' : 'var(--dsw-alias-label-secondary)' } }, installProgress.message),
          installProgress.output ? react.createElement('pre', { style: { fontSize: 11, maxHeight: 120, overflow: 'auto', background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 4, margin: 0, whiteSpace: 'pre-wrap', marginTop: 4 } }, installProgress.output) : null,
        )
      }

      if (installing) {
        return react.createElement('div', { style: {
          border: '1px solid var(--dsw-alias-border-l2)', borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
        }},
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
          react.createElement('div', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }, t.installing),
        )
      }

      if (!installOpts) {
        return react.createElement('div', { style: {
          border: CARD.border, borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
        }},
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
          react.createElement('div', { style: HINT }, t.installChecking),
        )
      }

      var available = installOpts.filter(function(o) { return o.available })
      if (available.length === 0) {
        return react.createElement('div', { style: {
          border: '1px solid var(--dsw-alias-state-error-border, rgba(229,72,77,0.3))', borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
        }},
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
          react.createElement('div', { style: ERROR }, t.installNoChannel),
        )
      }

      return react.createElement('div', { style: {
        border: '1px solid var(--dsw-alias-state-warning-border, rgba(245,166,35,0.3))', borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
      }},
        react.createElement('div', { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, t.installTitle),
        react.createElement('div', { style: HINT, marginBottom: 8 }, t.installSubtitle),
        react.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          available.map(function(opt) {
            return react.createElement('button', {
              key: opt.channel,
              onClick: function() { runInstall(opt.channel) },
              disabled: installing,
              style: Object.assign({}, btnStyle(true), { fontSize: 12, padding: '5px 10px' }, disabledStyle(installing)),
            }, opt.label)
          }),
        ),
        react.createElement('div', { style: Object.assign({}, HINT, { marginTop: 6 }) },
          t.installChoose + ' ' + available.map(function(o) { return o.label }).join(' / '),
        ),
      )
    }

    // ── render: Logs Card ─────────────────────────────────────────────
    function renderLogs() {
      return react.createElement('div', { style: {
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
      }},
        react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
          react.createElement('div', { style: { fontSize: 14, fontWeight: 600, flex: 1 } }, t.logTitle),
          react.createElement('button', { onClick: loadLogs, style: btnStyle(false) }, t.refresh),
        ),
        logs.length === 0
          ? react.createElement('div', { style: HINT }, t.logEmpty)
          : react.createElement('div', { style: { maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 } },
              logs.slice(-100).reverse().map(function(line, i) {
                var text = ''
                if (typeof line === 'string') text = line
                else if (line && typeof line === 'object') {
                  var d = line.ts ? new Date(line.ts) : null
                  var ts = d ? d.toLocaleString() : ''
                  text = ts + ' [' + (line.status || '?') + '] ' + (line.intent || line.utterance || '') + (line.durationMs ? ' (' + line.durationMs + 'ms)' : '')
                } else text = String(line)
                return react.createElement('div', { key: i, style: { fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '18px', color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))' } }, text)
              }),
            ),
      )
    }

    // ── render: Detail Panel ──────────────────────────────────────────
    function renderDetail() {
      if (!detail) return null
      var text = ''
      try { text = JSON.stringify(detail, null, 2) } catch (e) { text = String(detail) }
      return react.createElement('div', { style: {
        border: CARD.border, borderRadius: CARD.radius, background: CARD.bg, padding: CARD.padding, marginBottom: 12,
      }},
        react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
          react.createElement('div', { style: { fontSize: 13, fontWeight: 600, flex: 1 } }, t.detailTitle),
          react.createElement('button', { onClick: function() { setDetail(null) }, style: btnStyle(false) }, t.closeDetail),
        ),
        react.createElement('pre', { style: {
          fontSize: 11, maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap',
          background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 4, margin: 0,
        }}, text),
      )
    }

    // ── render: Doctor ────────────────────────────────────────────────
    function renderDoctor() {
      if (!status || !status.doctor || !status.doctor.text) return null
      return react.createElement('details', { style: { marginTop: 8 } },
        react.createElement('summary', { style: { fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--dsw-alias-label-secondary, rgba(230,230,230,0.7))' } }, t.doctorLabel),
        react.createElement('pre', { style: {
          fontSize: 11, maxHeight: 160, overflow: 'auto', whiteSpace: 'pre-wrap',
          background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 4, margin: 0, marginTop: 4,
        }}, status.doctor.text.slice(0, 6000)),
      )
    }

    // ── assemble page ─────────────────────────────────────────────────
    return react.createElement('div', { style: { maxWidth: 600, margin: '0 auto', padding: '16px 0' } },
      // Title
      react.createElement('div', { style: { marginBottom: 16 } },
        react.createElement('div', { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, t.title),
        react.createElement('div', { style: { fontSize: 13, color: 'var(--dsw-alias-label-tertiary, rgba(230,230,230,0.45))' } }, t.subtitle),
      ),
      // Status banner
      renderStatusBanner(),
      // Auth
      renderAuth(),
      // Install
      renderInstall(),
      // Config
      renderConfig(),
      // Doctor
      renderDoctor(),
      // Logs
      renderLogs(),
      // Detail
      renderDetail(),
    )
  }
}

/* ── apply ────────────────────────────────────────────────────────────── */
function apply(ctx) {
  if (typeof ctx.inject !== 'function') return

  const localeRef = { current: null }
  ctx.inject(['locale'], (scope) => {
    var localeSvc = scope.locale
    localeRef.current = localeSvc && typeof localeSvc.getLocale === 'function' ? localeSvc.getLocale().active : 'en'
    if (typeof localeSvc.subscribe === 'function') {
      var unsub = localeSvc.subscribe(function() {
        localeRef.current = localeSvc && typeof localeSvc.getLocale === 'function' ? localeSvc.getLocale().active : 'en'
      })
      if (typeof scope.effect === 'function') {
        scope.effect(function() { return unsub }, 'yeelight-smart-home: locale subscription')
      }
    }
  })

  ctx.inject(['slots'], (scope) => {
    fetch('/yeelight/config')
      .then(function(response) {
        if (response.status === 404) return
        mountSection(scope, localeRef)
      })
      .catch(function() {})
  })
}

function mountSection(ctx, localeRef) {
  var react
  try {
    react = require('react')
  } catch (e) {
    return
  }

  var Page = YeelightPage(react, localeRef)

  ctx.slots.inject('settings.section', function* () {
    yield ctx.slots.register({
      name: 'settings.section',
      id: 'yeelight-smart-home',
      order: 16,
      label: function() { return 'Yeelight 智能家居' },
    }, Page)
  })
}

var module = { exports: {} }
var exports = module.exports
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
exports.apply = apply
exports.inject = []
return module.exports