/**
 * Yeelight Runtime installer: detect the best install channel for the
 * current platform, run the install, and report progress. The installer is
 * optional sugar — the plugin itself never requires it, but the settings
 * card uses it to turn "runtime missing" into one click.
 *
 * Channels (newest first, first available wins):
 *   - brew   (macOS):      brew install yeelight/yeelight-home/yeelight-home
 *   - npm    (all):        npm install -g yeelight-home
 *   - scoop  (windows):    scoop install yeelight/yeelight-home/yeelight-home
 *   - download (all):      GitHub release binary into ~/.local/bin
 */

import { spawn } from 'node:child_process'
import { chmodSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { captureCommand, findOnPath, resolveRuntimeBin } from './runtime.ts'

export type InstallChannel = 'brew' | 'npm' | 'scoop' | 'download'

export interface InstallOption {
  readonly channel: InstallChannel
  readonly label: string
  readonly command: string
  readonly args: readonly string[]
  /** True when the channel's package manager is present on PATH. */
  readonly available: boolean
  readonly hint: string
}

export interface InstallProgress {
  readonly phase: 'resolving' | 'installing' | 'verifying' | 'done' | 'error'
  readonly message: string
  readonly output?: string
}

export interface InstallResult {
  readonly ok: boolean
  readonly channel?: InstallChannel
  readonly bin?: string
  readonly version?: string
  readonly output: string
  readonly error?: string
}

/** Detect the install channels usable on this machine. */
export function detectInstallOptions(env: NodeJS.ProcessEnv): InstallOption[] {
  const platform = process.platform
  const options: InstallOption[] = []
  const has = (name: string): boolean => findOnPath(name, env) !== undefined

  if (platform === 'darwin') {
    options.push({
      channel: 'brew',
      label: 'Homebrew',
      command: 'brew',
      args: ['install', 'yeelight/yeelight-home/yeelight-home'],
      available: has('brew'),
      hint: '推荐：macOS 官方渠道，自动处理依赖与升级。',
    })
  }
  if (platform === 'win32') {
    options.push({
      channel: 'scoop',
      label: 'Scoop',
      command: 'scoop',
      args: ['install', 'yeelight/yeelight-home/yeelight-home'],
      available: has('scoop'),
      hint: 'Windows 官方渠道。',
    })
  }
  options.push({
    channel: 'npm',
    label: 'npm (Node.js)',
    command: has('npm') ? 'npm' : 'npx',
    args: has('npm') ? ['install', '-g', 'yeelight-home'] : ['-y', 'yeelight-home@latest'],
    available: has('npm') || has('npx'),
    hint: '跨平台渠道，随 npm 生态更新。',
  })
  options.push({
    channel: 'download',
    label: 'GitHub Release',
    command: 'gh',
    args: [],
    available: has('gh'),
    hint: '从 Yeelight/yeelight-home Releases 下载官方二进制到 ~/.local/bin。',
  })
  return options
}

/** Stream one command; resolves with its captured output. */
function runStream(
  command: string,
  args: readonly string[],
  options: { timeoutMs?: number; signal?: AbortSignal; env?: NodeJS.ProcessEnv; stdin?: string },
): Promise<{ ok: boolean; code: number | null; stdout: string; stderr: string; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(command, [...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: options.env ?? process.env,
      shell: process.platform === 'win32',
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      if (!settled) {
        settled = true
        resolve({ ok: false, code: null, stdout, stderr, timedOut: true })
      }
    }, options.timeoutMs ?? 120_000)
    timer.unref?.()
    options.signal?.addEventListener('abort', () => {
      child.kill('SIGKILL')
      if (!settled) {
        settled = true
        resolve({ ok: false, code: null, stdout, stderr, timedOut: true })
      }
    }, { once: true })
    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
    child.on('error', (error) => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve({ ok: false, code: null, stdout, stderr: `${stderr}${error.message}`, timedOut: false })
      }
    })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: code === 0, code, stdout, stderr, timedOut: false })
    })
    if (options.stdin !== undefined) child.stdin.write(options.stdin)
    child.stdin.end()
  })
}

/** Local binary target for the download channel. */
export function localBinPath(env: NodeJS.ProcessEnv): string {
  const fromEnv = (env.YEELIGHT_HOME_BIN ?? '').trim()
  if (fromEnv !== '') return fromEnv
  return join(homedir(), '.local', 'bin', 'yeelight-home')
}

/** Install the runtime through the requested (or first available) channel. */
export async function installRuntime(
  env: NodeJS.ProcessEnv,
  options: { channel?: InstallChannel; timeoutMs?: number; signal?: AbortSignal; onProgress?: (p: InstallProgress) => void },
): Promise<InstallResult> {
  const report = (phase: InstallProgress['phase'], message: string, output?: string) => options.onProgress?.({ phase, message, output })
  const candidates = detectInstallOptions(env)
  let chosen: InstallOption | undefined
  if (options.channel !== undefined) {
    chosen = candidates.find((c) => c.channel === options.channel)
    if (chosen === undefined) {
      report('error', `未知安装渠道：${options.channel}`)
      return { ok: false, output: '', error: `unknown install channel "${options.channel}"` }
    }
    if (!chosen.available) {
      report('error', `安装渠道不可用：${chosen.label}（未找到 ${chosen.command}）`)
      return { ok: false, output: '', error: `channel "${options.channel}" is not available` }
    }
  } else {
    chosen = candidates.find((c) => c.available)
  }

  if (chosen === undefined) {
    report('error', '没有可用的安装渠道：请先安装 npm 或 Homebrew。')
    return { ok: false, output: '', error: 'no install channel available' }
  }

  report('installing', `通过 ${chosen.label} 安装 yeelight-home…`)
  let result
  if (chosen.channel === 'download') {
    result = await installFromGithub(env, { timeoutMs: options.timeoutMs, signal: options.signal, onProgress: report })
  } else {
    const captured = await runStream(chosen.command, chosen.args, { timeoutMs: options.timeoutMs, signal: options.signal, env })
    result = {
      ok: captured.ok,
      channel: chosen.channel,
      output: `${captured.stdout}${captured.stderr}`.trim(),
      ...captured.timedOut ? { error: `install timed out after ${options.timeoutMs ?? 120_000}ms` } : {},
      ...captured.ok ? {} : { error: `install failed (exit ${captured.code ?? '?'})` },
    }
  }

  if (!result.ok) {
    report('error', result.error ?? '安装失败。', result.output)
    return result
  }

  // Verify the binary resolves now.
  report('verifying', '验证安装…')
  const bin = resolveRuntimeBin(env, { binPath: '' })
  if (bin === undefined) {
    const err = '安装完成但未能在 PATH 中找到 yeelight-home；请检查 shell 配置或重启应用。'
    report('error', err, result.output)
    return { ...result, ok: false, error: err }
  }
  const version = await captureCommand(bin, ['version', '--json'], { timeoutMs: 10_000, env })
  const parsed = JSON.parse(version.stdout || '{}') as Record<string, unknown>
  const versionText = typeof parsed.version === 'string' ? parsed.version : undefined
  report('done', `安装成功：yeelight-home ${versionText ?? ''} @ ${bin}`.trim(), result.output)
  return { ...result, bin, version: versionText }
}

/** The GitHub download channel: fetch the release binary into ~/.local/bin. */
async function installFromGithub(
  env: NodeJS.ProcessEnv,
  options: { timeoutMs?: number; signal?: AbortSignal; onProgress?: (phase: InstallProgress['phase'], message: string, output?: string) => void },
): Promise<InstallResult> {
  const report = options.onProgress ?? (() => {})
  report('resolving', '查询最新版本…')
  const arch = process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'amd64' : process.arch
  const os = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'windows' : 'linux'
  const ext = process.platform === 'win32' ? '.exe' : ''
  const url = `https://github.com/Yeelight/yeelight-home/releases/latest/download/yeelight-home-${os}-${arch}${ext}`

  const target = localBinPath(env)
  report('installing', `下载 ${url} → ${target}`)
  try {
    mkdirSync(dirname(target), { recursive: true })
    const downloaded = await runStream('curl', ['-L', '--fail', '--silent', '--show-error', '-o', target, url], {
      timeoutMs: options.timeoutMs ?? 300_000,
      signal: options.signal,
      env,
    })
    if (!downloaded.ok) {
      return { ok: false, channel: 'download', output: downloaded.stderr.trim(), error: '下载失败，请检查网络或改用 npm/brew 渠道。' }
    }
    if (process.platform !== 'win32') chmodSync(target, 0o755)
    return { ok: true, channel: 'download', output: downloaded.stderr.trim() }
  } catch (error) {
    return { ok: false, channel: 'download', output: '', error: error instanceof Error ? error.message : String(error) }
  }
}
