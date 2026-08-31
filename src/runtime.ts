/** The yeelight-home Runtime adapter: binary resolution, health, and invoke. */

import { accessSync, constants } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, sep } from 'node:path'
import { spawn } from 'node:child_process'
import type { InvokeOutcome, SkillRequest, YeelightConfig } from './types.ts'

/** One spawned-command capture result. */
export interface SpawnCapture {
  readonly ok: boolean
  readonly code: number | null
  readonly stdout: string
  readonly stderr: string
  readonly timedOut: boolean
}

const CAPTURE_LIMIT_BYTES = 32 * 1024 * 1024

/** Spawn one command, feed nothing, capture bounded stdout/stderr, honor the signal. */
export function captureCommand(
  command: string,
  args: readonly string[],
  options: { readonly timeoutMs?: number; readonly signal?: AbortSignal; readonly env?: NodeJS.ProcessEnv; readonly stdin?: string },
): Promise<SpawnCapture> {
  return new Promise((resolve) => {
    const timeoutMs = options.timeoutMs ?? 15_000
    let stdout = ''
    let stderr = ''
    let exceeded = false
    let settled = false
    let timer: NodeJS.Timeout | undefined
    const child = spawn(command, [...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: options.env ?? process.env,
    })
    const finish = (timedOut: boolean): void => {
      if (settled) return
      settled = true
      if (timer !== undefined) clearTimeout(timer)
      resolve({ ok: !timedOut && !exceeded && child.exitCode === 0, code: child.exitCode, stdout, stderr, timedOut })
    }
    child.stdout.on('data', (chunk: Buffer) => {
      if (exceeded || stdout.length + chunk.length > CAPTURE_LIMIT_BYTES) {
        exceeded = true
        return
      }
      stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      if (exceeded || stderr.length + chunk.length > CAPTURE_LIMIT_BYTES) {
        exceeded = true
        return
      }
      stderr += chunk.toString('utf8')
    })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      if (timer !== undefined) clearTimeout(timer)
      resolve({ ok: false, code: null, stdout, stderr: `${stderr}${error.message}\n`, timedOut: false })
    })
    child.on('close', (code) => {
      if (timer !== undefined) clearTimeout(timer)
      finish(false)
    })
    if (options.signal !== undefined) {
      if (options.signal.aborted) {
        child.kill('SIGKILL')
        finish(true)
        return
      }
      options.signal.addEventListener('abort', () => {
        child.kill('SIGKILL')
        finish(true)
      }, { once: true })
    }
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill('SIGKILL')
        finish(true)
      }, timeoutMs)
      timer.unref?.()
    }
    child.stdin.end(options.stdin ?? '')
  })
}

/** One cooperative timeout that rejects with a clean error after `ms`. */
export function timeoutSignal(ms: number, parent?: AbortSignal): AbortSignal {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error(`timeout after ${ms}ms`)), ms)
  timer.unref?.()
  if (parent !== undefined) {
    if (parent.aborted) controller.abort(parent.reason)
    else parent.addEventListener('abort', () => controller.abort(parent.reason), { once: true })
  }
  return controller.signal
}

export function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

/** PATH lookup for the runtime binary name. */
export function findOnPath(name: string, env: NodeJS.ProcessEnv): string | undefined {
  const path = (env.PATH ?? '').split(sep === '\\' ? ';' : ':').filter((entry) => entry.trim() !== '')
  for (const entry of path) {
    const candidate = join(entry, name)
    if (isExecutable(candidate)) return candidate
  }
  return undefined
}

/** Candidate list mirroring the reference skill's invoke.sh, newest channels first. */
export function runtimeCandidates(env: NodeJS.ProcessEnv): string[] {
  const candidates: string[] = []
  const fromEnv = (env.YEELIGHT_HOME_BIN ?? '').trim()
  if (fromEnv !== '') candidates.push(fromEnv)
  const found = findOnPath('yeelight-home', env)
  if (found !== undefined) candidates.push(found)
  if (process.platform === 'darwin') candidates.push('/opt/homebrew/bin/yeelight-home', '/usr/local/bin/yeelight-home')
  else if (process.platform === 'linux') candidates.push('/usr/local/bin/yeelight-home', '/usr/bin/yeelight-home')
  candidates.push(join(homedir(), '.local', 'bin', 'yeelight-home'))
  return [...new Set(candidates)]
}

/** Resolve the runtime binary, honoring the configured path first. */
export function resolveRuntimeBin(env: NodeJS.ProcessEnv, config: Pick<YeelightConfig, 'binPath'>): string | undefined {
  const configured = (config.binPath ?? '').trim()
  if (configured !== '') return isExecutable(configured) ? configured : undefined
  return runtimeCandidates(env).find(isExecutable)
}

/** Parse `yeelight-home version --json`. */
export function parseVersionJson(text: string): { version: string; cli?: string; commit?: string; os?: string; arch?: string; date?: string } | undefined {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    if (typeof parsed?.version === 'string') {
      return {
        version: parsed.version,
        cli: typeof parsed.cli === 'string' ? parsed.cli : undefined,
        commit: typeof parsed.commit === 'string' ? parsed.commit : undefined,
        os: typeof parsed.os === 'string' ? parsed.os : undefined,
        arch: typeof parsed.arch === 'string' ? parsed.arch : undefined,
        date: typeof parsed.date === 'string' ? parsed.date : undefined,
      }
    }
  } catch {
    // fall through
  }
  return undefined
}

/** Whether a version payload matches the expected Runtime CLI identity. */
export function isCompatibleRuntime(version: { version: string; cli?: string } | undefined): version is { version: string; cli?: string } {
  return version !== undefined && version.cli === 'yeelight-home' && version.version.trim() !== ''
}

/** Classify the most likely reason an auth status failed: `missing` | `invalid` | `none`. */
export function authStateFields(text: string, source: string): { authenticated: boolean; houseId?: string; region?: string; bizType?: string; profile?: string; tokenSource?: string; tokenPresent?: boolean; tokenStore?: string } {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    return {
      authenticated: typeof parsed?.authenticated === 'boolean' ? parsed.authenticated : false,
      houseId: typeof parsed.houseId === 'string' ? parsed.houseId : undefined,
      region: typeof parsed.region === 'string' ? parsed.region : undefined,
      bizType: typeof parsed.bizType === 'string' ? parsed.bizType : undefined,
      profile: typeof parsed.profile === 'string' ? parsed.profile : undefined,
      tokenPresent: typeof parsed.tokenPresent === 'boolean' ? parsed.tokenPresent : undefined,
      tokenSource: typeof parsed.tokenSource === 'string' ? parsed.tokenSource : undefined,
      tokenStore: typeof parsed.tokenStore === 'string' ? parsed.tokenStore : undefined,
    }
  } catch {
    return { authenticated: false }
  }
}

/** Build the error envelope for a missing runtime, mirroring the reference skill. */
export function runtimeMissingOutcome(requestId: string): InvokeOutcome {
  return {
    status: 'error',
    requestId,
    dryRun: false,
    durationMs: 0,
    userMessage:
      'Yeelight 本地 Runtime 未安装或不在 PATH 中。请从公开仓库 Yeelight/yeelight-home 的 GitHub Releases 安装 yeelight-home CLI，或使用当前已发布的 Homebrew、Scoop、npm 等包管理器渠道；也可以设置 YEELIGHT_HOME_BIN 或插件配置 binPath 指向 yeelight-home 可执行文件。安装后先运行 yeelight-home auth status --json；若未登录，优先运行 yeelight-home auth login --qr；无法扫码时，可在你自己的终端通过安全输入管道运行 yeelight-home auth token set --stdin --region <region> 导入已获准的 token。',
    error: { code: 'runtime_missing', message: 'yeelight-home CLI not found' },
  }
}

/** Build the error envelope for an outdated runtime, mirroring the reference skill. */
export function runtimeOutdatedOutcome(requestId: string, bin: string): InvokeOutcome {
  return {
    status: 'error',
    requestId,
    dryRun: false,
    durationMs: 0,
    userMessage:
      'PATH 中的 yeelight-home 不是当前 Yeelight Home Runtime CLI，或版本过旧，无法作为 Skill Runtime 使用。请先运行 yeelight-home version --json 和 yeelight-home doctor --json --online 检查安装来源；通常需要升级当前 PATH 上的安装渠道，例如 npm install -g yeelight-home@latest、brew update && brew upgrade yeelight-home，或设置 YEELIGHT_HOME_BIN / 插件配置 binPath 指向新版 yeelight-home 可执行文件。',
    error: { code: 'runtime_outdated', message: `runtime at ${bin} lacks the expected metadata` },
  }
}

export interface InvokeInput {
  readonly request: SkillRequest
  readonly dryRun?: boolean
  readonly timeoutMs?: number
  readonly signal?: AbortSignal
  readonly bin?: string
  readonly config: Pick<YeelightConfig, 'region' | 'houseId' | 'profile' | 'binPath'>
  readonly env: NodeJS.ProcessEnv
}

/** Normalize one parsed invoke response into the plugin outcome shape. */
export function normalizeInvokeResponse(parsed: unknown, requestId: string, dryRun: boolean, durationMs: number, runtime: { bin: string; version: string }): InvokeOutcome {
  const record = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as Record<string, unknown>
  const error =
    typeof record.error === 'object' && record.error !== null
      ? { code: stringOf(record.error as Record<string, unknown>, 'code', 'unknown'), message: stringOf(record.error as Record<string, unknown>, 'message', '') }
      : undefined
  const warnings = Array.isArray(record.warnings) ? record.warnings.map(String) : undefined
  return {
    status: typeof record.status === 'string' ? record.status : 'error',
    requestId: typeof record.requestId === 'string' ? record.requestId : requestId,
    dryRun,
    durationMs,
    userMessage: typeof record.userMessage === 'string' ? record.userMessage : undefined,
    result: record.result,
    ...error !== undefined ? { error } : {},
    ...warnings !== undefined && warnings.length > 0 ? { warnings } : {},
    runtime,
  }
}

function stringOf(source: Record<string, unknown>, key: string, fallback: string): string {
  return typeof source[key] === 'string' ? (source[key] as string) : fallback
}

/** Invoke the Runtime with one SkillRequest over stdin. */
export async function invokeRuntime(input: InvokeInput): Promise<InvokeOutcome> {
  const requestId = input.request.requestId
  const dryRun = input.dryRun ?? false
  const bin = input.bin ?? resolveRuntimeBin(input.env, input.config)
  if (bin === undefined) return runtimeMissingOutcome(requestId)

  const started = Date.now()
  const version = parseVersionJson((await captureCommand(bin, ['version', '--json'], { signal: input.signal, timeoutMs: 10_000, env: input.env })).stdout)
  if (!isCompatibleRuntime(version)) return runtimeOutdatedOutcome(requestId, bin)

  const args = ['invoke', '--stdin']
  const region = (input.config.region ?? '').trim()
  const houseId = (input.config.houseId ?? '').trim()
  const profile = (input.config.profile ?? '').trim()
  if (region !== '') args.push('--region', region)
  if (houseId !== '') args.push('--house-id', houseId)
  if (profile !== '') args.push('--profile', profile)
  if (dryRun) args.push('--dry-run')

  const pathEnv = { ...input.env, PATH: `${dirname(bin)}${sep}${input.env.PATH ?? ''}` }
  const captured = await captureCommand(bin, args, {
    timeoutMs: input.timeoutMs ?? 120_000,
    signal: input.signal,
    env: pathEnv,
    stdin: JSON.stringify(input.request),
  })
  const durationMs = Date.now() - started
  const runtime = { bin, version: version.version }

  if (captured.timedOut) {
    return {
      status: 'error',
      requestId,
      dryRun,
      durationMs,
      userMessage: `Runtime 未在限时内返回（超过 ${input.timeoutMs ?? 120_000}ms）。可稍后重试，或先运行 yeelight-home doctor --json --online 检查网络和网关状态。`,
      error: { code: 'runtime_timeout', message: `timed out after ${input.timeoutMs ?? 120_000}ms` },
      runtime,
    }
  }

  if (captured.stdout.trim() === '') {
    const detail = captured.stderr.trim().slice(0, 500)
    return {
      status: 'error',
      requestId,
      dryRun,
      durationMs,
      userMessage: `Runtime 未返回 JSON 响应。${detail !== '' ? `stderr: ${detail}` : '请运行 yeelight-home doctor --json --online 检查安装。'}`,
      error: { code: 'invalid_runtime_response', message: detail !== '' ? detail : 'empty response' },
      runtime,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(captured.stdout)
  } catch {
    return {
      status: 'error',
      requestId,
      dryRun,
      durationMs,
      userMessage: 'Runtime 返回了非 JSON 响应。请运行 yeelight-home doctor --json --online 检查安装。',
      error: { code: 'invalid_runtime_response', message: 'stdout is not JSON' },
      runtime,
    }
  }
  return normalizeInvokeResponse(parsed, requestId, dryRun, durationMs, runtime)
}

export interface RuntimeStatus {
  readonly bin: string | undefined
  readonly version: { version: string; cli?: string; commit?: string; os?: string; arch?: string; date?: string } | undefined
  readonly compatible: boolean
  readonly auth:
    | {
        authenticated: boolean
        houseId?: string
        region?: string
        bizType?: string
        profile?: string
        tokenSource?: string
        tokenPresent?: boolean
        tokenStore?: string
      }
    | undefined
  readonly authError?: string
  readonly doctor: { ok: boolean; kind: 'json' | 'text'; text: string }
}

/** Best-effort status snapshot for the settings card. */
export async function runtimeStatus(env: NodeJS.ProcessEnv, config: Pick<YeelightConfig, 'binPath'>): Promise<RuntimeStatus> {
  const bin = resolveRuntimeBin(env, config)
  if (bin === undefined) {
    return { bin: undefined, version: undefined, compatible: false, auth: undefined, doctor: { ok: false, kind: 'text', text: 'runtime not installed' } }
  }
  const signal = timeoutSignal(20_000)
  const [versionCapture, authCapture, doctorCapture] = await Promise.all([
    captureCommand(bin, ['version', '--json'], { timeoutMs: 10_000, signal, env }),
    captureCommand(bin, ['auth', 'status', '--json'], { timeoutMs: 10_000, signal, env }),
    captureCommand(bin, ['doctor', '--json'], { timeoutMs: 15_000, signal, env }),
  ])
  const version = parseVersionJson(versionCapture.stdout)
  const authFields = authCapture.ok && authCapture.stdout.trim() !== ''
    ? authStateFields(authCapture.stdout, authCapture.stderr)
    : undefined
  const doctorJson = doctorCapture.stdout.trim()
  const doctor = doctorJson !== ''
    ? { ok: doctorCapture.ok, kind: 'json' as const, text: doctorJson.slice(0, 16_000) }
    : { ok: false, kind: 'text' as const, text: (doctorCapture.stderr.trim() || 'doctor produced no output').slice(0, 2_000) }
  return {
    bin,
    version,
    compatible: isCompatibleRuntime(version),
    auth: authFields,
    authError: authFields === undefined ? (authCapture.stderr.trim().slice(0, 500) || 'auth status unavailable') : undefined,
    doctor,
  }
}
