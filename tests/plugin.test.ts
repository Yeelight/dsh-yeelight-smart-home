import { mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it } from 'vitest'
import { buildSkillRequest, newRequestId, parseSkillRequestJson } from '../src/request.ts'
import { openConfigStore } from '../src/store.ts'
import { DEFAULT_CONFIG } from '../src/types.ts'
import { openInvokeLogger } from '../src/logs.ts'
import { listReferenceDocs, readReferenceDoc } from '../src/reference.ts'
import {
  authStateFields,
  isCompatibleRuntime,
  normalizeInvokeResponse,
  parseVersionJson,
  resolveRuntimeBin,
  runtimeCandidates,
  runtimeMissingOutcome,
  runtimeOutdatedOutcome,
} from '../src/runtime.ts'
import { parseSkillFrontmatter, registerSkill } from '../src/skills.ts'
import { registerYeelightRoutes } from '../src/routes.ts'
import { registerTools } from '../src/tools.ts'
import { runProductSelect } from '../src/product-select.ts'
import type { InvokeLogEntry, YeelightConfig } from '../src/types.ts'

function tmpHome(): string {
  return mkdtempSync(join(tmpdir(), 'dsh-yeelight-test-'))
}

function dataRoot(): string {
  return join(process.cwd(), 'data')
}

function defaultConfig(): YeelightConfig {
  return { ...DEFAULT_CONFIG }
}

function makeEntry(id: string): InvokeLogEntry {
  return { id, ts: Date.now(), requestId: id, utterance: `u${id}`, dryRun: true, status: 'success', ok: true, durationMs: 5 }
}

describe('request', () => {
  it('builds a SkillRequest and strips empty intent', () => {
    const req = buildSkillRequest({ utterance: '  打开客厅灯  ' }, defaultConfig())
    expect(req.contractVersion).toBe('1.0')
    expect(req.utterance).toBe('打开客厅灯')
    expect(req.intent).toBeUndefined()
    expect(req.requestId).toMatch(/^dsh-/)
  })

  it('keeps intent and parameters when provided', () => {
    const req = buildSkillRequest({ utterance: 'x', intent: 'light.power.set', parameters: { on: true } }, defaultConfig())
    expect(req.intent).toBe('light.power.set')
    expect(req.parameters).toEqual({ on: true })
  })

  it('rejects empty utterance', () => {
    expect(() => buildSkillRequest({ utterance: '   ' }, defaultConfig())).toThrow(/utterance/)
  })

  it('parses a full SkillRequest JSON with camel and snake fields', () => {
    const out = parseSkillRequestJson(
      JSON.stringify({ contractVersion: '1.0', requestId: 'r1', locale: 'en-US', utterance: 'hi', intent: 'home.summary', parameters: {} }),
      defaultConfig(),
    )
    expect(out.request.requestId).toBe('r1')
    expect(out.request.intent).toBe('home.summary')
    const out2 = parseSkillRequestJson(JSON.stringify({ request_id: 'r2', utterance: 'hi2', locale: 'en-US', options: { dryRun: true } }), defaultConfig())
    expect(out2.request.requestId).toBe('r2')
    expect(out2.request.utterance).toBe('hi2')
    expect(out2.dryRun).toBe(true)
  })

  it('generates unique request ids', () => {
    const a = newRequestId()
    const b = newRequestId()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^dsh-/)
  })
})

describe('store', () => {
  it('normalizes config over defaults and persists', () => {
    const home = tmpHome()
    const store = openConfigStore(home)
    const c0 = store.current()
    expect(c0.locale).toBe('zh-CN')
    expect(c0.requestTimeoutMs).toBe(120_000)
    const c1 = store.patch({ requestTimeoutMs: 99_000, region: 'cn', nonsense: 1 })
    expect(c1.requestTimeoutMs).toBe(99_000)
    expect(c1.region).toBe('cn')
    expect((c1 as unknown as Record<string, unknown>).nonsense).toBeUndefined()
    const c2 = store.patch({ requestTimeoutMs: 1_000_000_000 })
    expect(c2.requestTimeoutMs).toBe(600_000)
    const store2 = openConfigStore(home)
    expect(store2.current().region).toBe('cn')
    store.reset()
    expect(openConfigStore(home).current().region).toBe('')
  })
})

describe('logger', () => {
  it('appends, lists, trims, details and clears', () => {
    const home = tmpHome()
    const logger = openInvokeLogger(home, () => ({ ...defaultConfig(), logRetention: 3, logEnabled: true }))
    expect(logger.enabled()).toBe(true)
    for (let i = 0; i < 5; i += 1) logger.append(makeEntry(`r${i}`))
    const list = logger.list(100)
    expect(list.length).toBeLessThanOrEqual(3)
    expect(list[0].id).toBe('r4')
    const d = logger.detail('r3')
    expect(d?.utterance).toBe('ur3')
    expect(logger.detail('missing')).toBeUndefined()
    logger.clear()
    expect(logger.list(10).length).toBe(0)
  })

  it('respects logEnabled=false', () => {
    const home = tmpHome()
    const logger = openInvokeLogger(home, () => ({ ...defaultConfig(), logEnabled: false }))
    logger.append({ id: 'x', ts: 0, requestId: 'x', dryRun: true, status: 'success', ok: true, durationMs: 0 })
    expect(logger.list(10).length).toBe(0)
  })
})

describe('references', () => {
  it('lists the reference docs plus assets', () => {
    const docs = listReferenceDocs(dataRoot())
    const keys = docs.map((d) => d.key)
    expect(keys).toContain('README')
    expect(keys).toContain('device-control')
    expect(keys).toContain('intent-catalog')
    expect(keys).toContain('lighting-design-full-home')
    expect(keys).toContain('skill-request.schema')
  })

  it('reads a doc by key and throws on unknown', () => {
    const doc = readReferenceDoc(dataRoot(), 'README')
    expect(doc.content.length).toBeGreaterThan(0)
    expect(doc.doc.bytes).toBe(doc.content.length)
    expect(() => readReferenceDoc(dataRoot(), 'nope')).toThrow(/nope/)
  })
})

describe('skills', () => {
  it('parses frontmatter and strips it from content', () => {
    const raw = '---\nname: yeelight-smart-home\ndescription: Something.\n---\nBody text.'
    const parsed = parseSkillFrontmatter(raw)
    expect(parsed.name).toBe('yeelight-smart-home')
    expect(parsed.description).toBe('Something.')
    expect(parsed.body).toBe('Body text.\n')
  })

  it('registers the packaged skill on a seam', () => {
    const seen: Array<Record<string, unknown>> = []
    const seam = { register: (r: Record<string, unknown>) => { seen.push(r) } }
    registerSkill(seam as never, dataRoot())
    expect(seen.length).toBe(1)
    expect(seen[0].name).toBe('yeelight-smart-home')
    expect(String(seen[0].content)).toContain('Absolute Rules')
  })
})

describe('runtime helpers', () => {
  it('parses version json', () => {
    expect(parseVersionJson(JSON.stringify({ version: '1.2.3', cli: 'yeelight-home' }))?.version).toBe('1.2.3')
    expect(parseVersionJson('garbage')).toBeUndefined()
  })

  it('checks compatibility', () => {
    expect(isCompatibleRuntime({ version: '1.2', cli: 'yeelight-home' })).toBe(true)
    expect(isCompatibleRuntime({ version: '1.2', cli: 'other' })).toBe(false)
    expect(isCompatibleRuntime(undefined)).toBe(false)
  })

  it('classifies auth fields', () => {
    const f = authStateFields(JSON.stringify({ authenticated: true, houseId: 'h1', region: 'cn' }), 'file')
    expect(f.authenticated).toBe(true)
    expect(f.houseId).toBe('h1')
  })

  it('normalizes invoke responses', () => {
    const out = normalizeInvokeResponse({ status: 'success', result: { x: 1 }, warnings: ['w'] }, 'r1', false, 12, { bin: '/b', version: '1' })
    expect(out.status).toBe('success')
    expect(out.result).toEqual({ x: 1 })
    expect(out.warnings).toEqual(['w'])
    const err = normalizeInvokeResponse({ status: 'error', error: { code: 'boom', message: 'nah' } }, 'r1', false, 1, { bin: '/b', version: '1' })
    expect(err.error?.code).toBe('boom')
  })

  it('produces missing/outdated outcomes with guidance', () => {
    const miss = runtimeMissingOutcome('r1')
    expect(miss.status).toBe('error')
    expect(miss.error?.code).toBe('runtime_missing')
    expect(miss.userMessage ?? '').toContain('yeelight-home')
    const out = runtimeOutdatedOutcome('r2', '/bin/x')
    expect(out.error?.code).toBe('runtime_outdated')
  })

  it('returns candidate paths without crashing', () => {
    const candidates = runtimeCandidates({ ...process.env, YEELIGHT_HOME_BIN: '/custom/bin/yeelight-home' })
    expect(Array.isArray(candidates)).toBe(true)
    expect(candidates.length).toBeGreaterThan(0)
  })

  it('honors a real executable binPath and ignores a missing one', () => {
    const dir = tmpHome()
    const realBin = join(dir, 'yeelight-home')
    writeFileSync(realBin, '#!/bin/sh\necho ok\n', { mode: 0o755 })
    expect(resolveRuntimeBin({ PATH: '/usr/bin' }, { binPath: realBin })).toBe(realBin)
    expect(resolveRuntimeBin({ PATH: '/usr/bin' }, { binPath: join(dir, 'missing-bin') })).toBeUndefined()
  })
})

describe('tools', () => {
  it('registers the three tools on a seam', () => {
    const regs: Array<Record<string, unknown>> = []
    const seam = { register: (def: Record<string, unknown>) => { regs.push(def) } }
    registerTools(seam as never, fakeService(), noopLogger())
    const names = regs.map((r) => r.name)
    expect(names).toContain('yeelight_home')
    expect(names).toContain('yeelight_reference')
    expect(names).toContain('yeelight_product_select')
  })

  it('yeelight_reference execute reads a doc', async () => {
    let defB: Record<string, unknown> | undefined
    registerTools({ register: (d: Record<string, unknown>) => { if (d.name === 'yeelight_reference') defB = d } } as never, fakeService() as never, noopLogger() as never)
    const def = defB as { execute: (args: { doc: string }) => Promise<{ key: string; bytes: number }> }
    const result = await def.execute({ doc: 'README' })
    expect(result.key).toBe('README')
    expect(result.bytes).toBeGreaterThan(0)
  })

  it('yeelight_product_select runs the bundled script', async () => {
    const result = await runProductSelect(dataRoot(), { query: '客厅 无边框嵌入式射灯 24度', limit: 2 }, { timeoutMs: 60_000 })
    expect(result.returned).toBeGreaterThan(0)
    expect(result.candidates.length).toBeGreaterThan(0)
    expect(result.catalog).toBe('skill_lighting_design_products')
    expect(result.selectionGuidance.length).toBeGreaterThan(0)
    expect(result.runtimeRule.length).toBeGreaterThan(0)
  }, 70_000)
})

describe('routes', () => {
  it('GET /yeelight/config responds ok with the config', async () => {
    const home = tmpHome()
    const req = fakeReq('GET', '/yeelight/config')
    const res = fakeRes()
    await registerRoute('/yeelight/config', home, req, res)
    const body = (await res.json()) as { ok: boolean; value: { config: { locale: string }; file: string } }
    expect(res.statusCode).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.value.config.locale).toBe('zh-CN')
    expect(body.value.file).toContain('config.json')
  })

  it('POST /yeelight/config persists a patch into the file', async () => {
    const home = tmpHome()
    const req = fakeReq('POST', '/yeelight/config', JSON.stringify({ patch: { region: 'cn' } }))
    const res = fakeRes()
    await registerRoute('/yeelight/config', home, req, res)
    const body = (await res.json()) as { ok: boolean; value: { config: { region: string } } }
    expect(body.ok).toBe(true)
    expect(body.value.config.region).toBe('cn')
  })

  it('POST /yeelight/invoke requires confirm unless dry-run; dry-run returns ok if runtime present', async () => {
    const home = tmpHome()
    // no-confirm live request -> refused
    const res1 = fakeRes()
    const req1 = fakeReq('POST', '/yeelight/invoke', JSON.stringify({ utterance: '开灯', dry_run: false }))
    await registerRoute('/yeelight/invoke', home, req1, res1)
    const b1 = (await res1.json()) as { ok: boolean; error: { code: string } }
    expect(b1.ok).toBe(false)
    expect(b1.error.code).toBe('confirm_required')
    // confirm passes validation; without a runtime it must degrade to a runtime outcome, not throw
    const res2 = fakeRes()
    const req2 = fakeReq('POST', '/yeelight/invoke', JSON.stringify({ utterance: '开灯', intent: 'light.power.set', dry_run: true, confirm: true }))
    await registerRouteWithEnv('/yeelight/invoke', home, { PATH: join(tmpHome(), 'no-bin') }, req2, res2)
    const b2 = (await res2.json()) as { ok: boolean; value: { outcome: { status: string } } }
    expect(b2.ok).toBe(true)
    expect(['success', 'partial', 'error', 'not_supported', 'blocked', 'clarification_required', 'auth_required']).toContain(b2.value.outcome.status)
  })

  it('GET /yeelight/logs lists entries', async () => {
    const home = tmpHome()
    writeFileSync(join(home, 'invoke.log.jsonl'), JSON.stringify({ id: 'e1', ts: 1, requestId: 'e1', dryRun: true, status: 'success', ok: true, durationMs: 1 }) + '\n')
    const req = fakeReq('GET', '/yeelight/logs')
    const res = fakeRes()
    const seam = { register: (r: { handler: Handler }) => { void r.handler(req, res) } }
    registerYeelightRoutes(seam as never, routesService(home) as never)
    await new Promise((resolve) => setTimeout(resolve, 20))
    const body = (await res.json()) as { ok: boolean; value: { entries: unknown[] } }
    expect(body.ok).toBe(true)
    expect(body.value.entries.length).toBe(1)
  })
})

// ── test doubles ──────────────────────────────────────────────────────────

type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void>

function registerRoute(path: string, home: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  return registerRouteWithEnv(path, home, {}, req, res)
}

function registerRouteWithEnv(path: string, home: string, env: NodeJS.ProcessEnv, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const seam = { register: (r: { kind: string; path: string; handler: Handler }) => {
    if (r.kind === 'prefix' && path.startsWith(r.path)) void r.handler(req, res)
  } }
  registerYeelightRoutes(seam as never, routesService(home, env) as never)
  return new Promise((resolve) => setTimeout(resolve, 200))
}

function routesService(home: string, env: NodeJS.ProcessEnv = {}) {
  const store = openConfigStore(home)
  const logger = openInvokeLogger(home, () => store.current())
  return {
    env,
    dataDir: dataRoot(),
    config: () => store.current(),
    configFile: store.file,
    logger: {
      append: (e: unknown) => logger.append(e as never),
      list: (l: number) => logger.list(l),
      detail: (id: string) => logger.detail(id),
      clear: () => logger.clear(),
      enabled: () => logger.enabled(),
    },
    patchConfig: (p: Record<string, unknown>) => store.patch(p),
    resetConfig: () => store.reset(),
  }
}

function fakeService() {
  return { env: {}, dataDir: dataRoot(), config: defaultConfig, resolver: { resolveBin: () => undefined } }
}

function noopLogger() {
  return { append: () => {}, list: () => [], detail: () => undefined, clear: () => {}, enabled: () => true }
}

function fakeReq(method: string, url: string, body?: string): IncomingMessage {
  const req = new (require('node:http').IncomingMessage as { new (): IncomingMessage })()
  ;(req as any).method = method
  ;(req as any).url = url
  ;(req as any).setEncoding = () => {}
  ;(req as any).on = (event: string, cb: (chunk?: unknown) => void) => {
    if (event === 'data' && body !== undefined) cb(body)
    if (event === 'end') queueMicrotask(cb)
    return req
  }
  return req as unknown as IncomingMessage
}

function fakeRes(): ServerResponse & { statusCode: number; body: string; json: () => Promise<{ ok: boolean; [k: string]: unknown }> } {
  const data: { statusCode: number; body: string } = { statusCode: 200, body: '' }
  const res = {
    writeHead: (code: number) => { data.statusCode = code; return res },
    end: (chunk: string) => { if (chunk) data.body += chunk; return res },
    json: () => Promise.resolve(JSON.parse(data.body)),
    get statusCode() { return data.statusCode },
    get body() { return data.body },
  }
  return res as never
}
describe('installer', () => {
  it('detects install channels with availability flags', () => {
    const { detectInstallOptions } = require('../src/installer.ts') as never
    const opts = (detectInstallOptions as (env: NodeJS.ProcessEnv) => Array<{ channel: string; label: string; available: boolean; command: string; args: string[]; hint: string }>)({ PATH: '/usr/bin:/bin' })
    expect(opts.length).toBeGreaterThanOrEqual(1)
    const npm = opts.find((o) => o.channel === 'npm')
    expect(npm).toBeDefined()
    expect(['npm', 'npx']).toContain(npm!.command)
    expect(typeof npm!.available).toBe('boolean')
    // every option has the shape the card needs
    for (const o of opts) {
      expect(o.channel).toMatch(/^(brew|npm|scoop|download)$/)
      expect(o.label.length).toBeGreaterThan(0)
      expect(Array.isArray(o.args)).toBe(true)
      expect(o.hint.length).toBeGreaterThan(0)
    }
  })

  it('detectInstallOptions honors YEELIGHT_HOME_BIN for the local bin path', () => {
    const { localBinPath } = require('../src/installer.ts') as never
    const p = (localBinPath as (env: NodeJS.ProcessEnv) => string)({ YEELIGHT_HOME_BIN: '/custom/bin/yeelight-home' })
    expect(p).toBe('/custom/bin/yeelight-home')
  })

  it('routes expose install options', async () => {
    const home = tmpHome()
    const req = fakeReq('GET', '/yeelight/install-options')
    const res = fakeRes()
    await registerRouteWithEnv('/yeelight/install-options', home, { PATH: '/usr/bin:/bin' }, req, res)
    const body = (await res.json()) as { ok: boolean; value: { options: Array<{ channel: string }> } }
    expect(body.ok).toBe(true)
    expect(body.value.options.length).toBeGreaterThanOrEqual(1)
  })

  it('rejects an unknown channel instead of falling back', async () => {
    const { installRuntime } = require('../src/installer.ts') as never
    const result = await (installRuntime as (env: NodeJS.ProcessEnv, o: { channel: string }) => Promise<{ ok: boolean; error?: string }>)(
      { PATH: '/usr/bin:/bin' },
      { channel: 'nonexistent' },
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('unknown install channel')
  })

  it('install route dry-run resolves a channel without executing', async () => {
    const home = tmpHome()
    const req = fakeReq('POST', '/yeelight/install', JSON.stringify({ dry_run: true }))
    const res = fakeRes()
    await registerRouteWithEnv('/yeelight/install', home, { PATH: '/usr/bin:/bin' }, req, res)
    const body = (await res.json()) as { ok: boolean; value: { dryRun: boolean; chosen: { channel: string } | null } }
    expect(body.ok).toBe(true)
    expect(body.value.dryRun).toBe(true)
    // chosen may be null when no install channel is available on PATH
    if (body.value.chosen !== null) {
      expect(['npm', 'npx', 'download', 'brew']).toContain(body.value.chosen.channel)
    }
  })
})
