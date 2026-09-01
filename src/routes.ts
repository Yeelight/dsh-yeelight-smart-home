/** /yeelight web routes: the settings card's host side. */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildSkillRequest, newRequestId, parseSkillRequestJson } from './request.ts'
import { referenceIndex } from './reference.ts'
import { runtimeStatus, resolveRuntimeBin } from './runtime.ts'
import { runInvoke } from './tools.ts'
import { DEFAULT_CONFIG, type InvokeLogEntry } from './types.ts'
import type { YeelightConfig } from './types.ts'
import { detectInstallOptions, installRuntime, type InstallChannel, type InstallProgress } from './installer.ts'

export interface WebServerSeam {
  register(route: { kind: 'exact' | 'prefix'; path: string; handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void> }): unknown
}

export interface RouteService {
  readonly env: NodeJS.ProcessEnv
  readonly dataDir: string
  readonly config: () => YeelightConfig
  readonly configFile: string
  readonly logger: {
    append(entry: InvokeLogEntry): void
    list(limit: number): readonly InvokeLogEntry[]
    detail(id: string): InvokeLogEntry | undefined
    clear(): void
    enabled(): boolean
  }
  readonly patchConfig: (patch: Record<string, unknown>) => YeelightConfig
  readonly resetConfig: () => YeelightConfig
  /** Debug only: the host settings.describe() result (namespaces), when reachable. */
  readonly settingsDescribe?: () => Array<{ ns: string }>
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

function send(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value)
  res.writeHead(status, { ...JSON_HEADERS, 'cache-control': 'no-store' })
  res.end(body)
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      data += chunk
      if (data.length > 1024 * 1024) {
        reject(new Error('request body too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (data.trim() === '') resolve({})
      else {
        try {
          resolve(JSON.parse(data))
        } catch (error) {
          reject(new Error(`body is not JSON: ${error instanceof Error ? error.message : String(error)}`))
        }
      }
    })
    req.on('error', reject)
  })
}

function urlPath(req: IncomingMessage): string {
  const raw = req.url ?? '/'
  const query = raw.indexOf('?')
  return new URL(`http://localhost${query < 0 ? raw : raw.slice(0, query)}`).pathname
}

function queryParam(req: IncomingMessage, key: string): string | undefined {
  const raw = req.url ?? ''
  const search = raw.indexOf('?')
  if (search < 0) return undefined
  return new URLSearchParams(raw.slice(search + 1)).get(key) ?? undefined
}

/** Register the /yeelight prefix route. */
export function registerYeelightRoutes(webServer: WebServerSeam, service: RouteService): void {
  webServer.register({
    kind: 'prefix',
    path: '/yeelight',
    handler: async (req, res) => {
      try {
        await dispatch(req, res, service)
      } catch (error) {
        send(res, 400, {
          ok: false,
          error: { code: 'bad_request', message: error instanceof Error ? error.message : String(error) },
        })
      }
    },
  })
}

async function dispatch(req: IncomingMessage, res: ServerResponse, service: RouteService): Promise<void> {
  const path = urlPath(req)
  const method = req.method ?? 'GET'
  switch (path) {
    case '/yeelight/config': {
      if (method === 'GET') {
        send(res, 200, {
          ok: true,
          value: {
            config: service.config(),
            defaults: DEFAULT_CONFIG,
            file: service.configFile,
            env: {
              DSH_HOME: service.env.DSH_HOME ?? '',
              YEELIGHT_HOME_BIN: service.env.YEELIGHT_HOME_BIN ?? '',
            },
            host: { platform: process.platform, node: process.version },
          },
        })
        return
      }
      if (method === 'POST') {
        const body = (await readBody(req)) as Record<string, unknown>
        const config = body?.reset === true
          ? service.resetConfig()
          : service.patchConfig((body?.patch ?? {}) as Record<string, unknown>)
        send(res, 200, { ok: true, value: { config, file: service.configFile } })
        return
      }
      send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
      return
    }
    case '/yeelight/status': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const status = await runtimeStatus(service.env, service.config())
      send(res, 200, {
        ok: true,
        value: {
          status,
          config: service.config(),
          runtime: { bin: resolveRuntimeBin(service.env, service.config()) ?? status.bin ?? null },
        },
      })
      return
    }
    case '/yeelight/invoke': {
      if (method !== 'POST') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const body = (await readBody(req)) as Record<string, unknown>
      const config = service.config()
      const dryRun = body?.dry_run === true
      const confirm = body?.confirm === true
      if (!dryRun && !confirm) {
        send(res, 200, {
          ok: false,
          error: { code: 'confirm_required', message: 'Running a live (non-dry-run) request from the card needs confirm: true.' },
        })
        return
      }
      let request
      if (typeof body?.json === 'string' && body.json.trim() !== '') {
        const parsed = parseSkillRequestJson(body.json, config)
        request = parsed.request
      } else {
        request = buildSkillRequest(
          { utterance: body?.utterance, intent: body?.intent, parameters: body?.parameters, request_id: body?.request_id, locale: body?.locale },
          config,
        )
      }
      const outcome = await runInvoke(service.env, () => config, service.logger, request, {
        dryRun,
        timeoutMs: typeof body?.timeout_ms === 'number' ? body.timeout_ms : config.requestTimeoutMs,
      })
      send(res, 200, { ok: true, value: { outcome, request } })
      return
    }
    case '/yeelight/logs': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const limit = Number.parseInt(queryParam(req, 'limit') ?? '60', 10) || 60
      send(res, 200, { ok: true, value: { entries: service.logger.list(Math.min(Math.max(limit, 1), 500)) } })
      return
    }
    case '/yeelight/logs/detail': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const id = queryParam(req, 'id')
      const entry = id === undefined ? undefined : service.logger.detail(id)
      if (entry === undefined) {
        send(res, 404, { ok: false, error: { code: 'not_found', message: 'no such log entry' } })
        return
      }
      send(res, 200, { ok: true, value: { entry } })
      return
    }
    case '/yeelight/logs/clear': {
      if (method !== 'POST') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      service.logger.clear()
      send(res, 200, { ok: true, value: { cleared: true } })
      return
    }
    case '/yeelight/docs': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const docs = [...referenceIndex(service.dataDir).values()].map((doc) => ({
        key: doc.key,
        label: doc.label,
        kind: doc.kind,
        bytes: doc.bytes,
      }))
      send(res, 200, { ok: true, value: { docs } })
      return
    }
    case '/yeelight/request-id': {
      send(res, 200, { ok: true, value: { requestId: newRequestId() } })
      return
    }
    case '/yeelight/options': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      // Selectable options for the settings page: fixed catalogs the UI can
      // render as <select> instead of free-text inputs.
      send(res, 200, {
        ok: true,
        value: {
          regions: [
            { value: '', label: 'Default' },
            { value: 'cn', label: 'China (cn)' },
            { value: 'us', label: 'United States (us)' },
            { value: 'eu', label: 'Europe (eu)' },
            { value: 'sg', label: 'Singapore (sg)' },
            { value: 'in', label: 'India (in)' },
            { value: 'ru', label: 'Russia (ru)' },
          ],
          locales: [
            { value: 'zh-CN', label: '简体中文 (zh-CN)' },
            { value: 'en-US', label: 'English (en-US)' },
            { value: 'zh-TW', label: '繁體中文 (zh-TW)' },
            { value: 'ja-JP', label: '日本語 (ja-JP)' },
          ],
        },
      })
      return
    }
    case '/yeelight/install-options': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      send(res, 200, { ok: true, value: { options: detectInstallOptions(service.env) } })
      return
    }
    case '/yeelight/debug/describe': {
      if (method !== 'GET') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const describe = (service as unknown as { settingsDescribe?: () => Array<{ ns: string }> }).settingsDescribe
      send(res, 200, {
        ok: true,
        value: {
          namespaces: describe ? describe().map((n) => n.ns) : [],
          hasDescribe: typeof describe === 'function',
        },
      })
      return
    }
    case '/yeelight/install': {
      if (method !== 'POST') {
        send(res, 405, { ok: false, error: { code: 'method_not_allowed', message: method } })
        return
      }
      const body = (await readBody(req)) as Record<string, unknown>
      const progress: InstallProgress[] = []
      const channel = typeof body?.channel === 'string' ? (body.channel as InstallChannel) : undefined
      if (body?.dry_run === true) {
        // Preview mode: resolve the channel without executing anything.
        const preview = detectInstallOptions(service.env)
        const chosen = channel !== undefined ? preview.find((o) => o.channel === channel) : preview.find((o) => o.available)
        send(res, 200, { ok: true, value: { dryRun: true, chosen: chosen ?? null } })
        return
      }
      const result = await installRuntime(service.env, {
        channel,
        timeoutMs: typeof body?.timeout_ms === 'number' ? body.timeout_ms : undefined,
        onProgress: (p) => progress.push(p),
      })
      send(res, 200, { ok: true, value: { result, progress } })
      return
    }
    default:
      send(res, 404, { ok: false, error: { code: 'not_found', message: path } })
  }
}
