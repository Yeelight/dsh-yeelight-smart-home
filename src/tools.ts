/** Model-facing tools of the plugin, registered duck-typed on ctx.tools. */

import { buildSkillRequest, isPositiveStatus, parseSkillRequestJson, type SkillRequestInput } from './request.ts'
import { runProductSelect } from './product-select.ts'
import { readReferenceDoc, referenceIndex, referenceToolHints, type ReferenceDoc } from './reference.ts'
import { invokeRuntime } from './runtime.ts'
import type { InvokeOutcome, SkillRequest, YeelightConfig } from './types.ts'

/** Anything exposing `register(definition)` — the ctx.tools seam, duck-typed. */
export interface ToolsSeam {
  register(definition: Record<string, unknown>): unknown
}

export interface YeelightService {
  readonly env: NodeJS.ProcessEnv
  readonly dataDir: string
  readonly config: () => YeelightConfig
  readonly resolver: Resolver
}

/** Extra lookup surface implemented by the service for tool convenience. */
export interface Resolver {
  readonly resolveBin: () => string | undefined
}

/**
 * One Runtime invocation through the shared pipeline, with logging.
 * @returns the normalized outcome; never throws for business failures.
 */
export async function runInvoke(
  env: NodeJS.ProcessEnv,
  config: () => YeelightConfig,
  logger: { append(entry: unknown): void },
  request: SkillRequest,
  options: { readonly dryRun?: boolean; readonly signal?: AbortSignal; readonly timeoutMs?: number; readonly bin?: string },
): Promise<InvokeOutcome> {
  const started = Date.now()
  const outcome = await invokeRuntime({
    request,
    dryRun: options.dryRun,
    timeoutMs: options.timeoutMs ?? config().requestTimeoutMs,
    signal: options.signal,
    bin: options.bin,
    config: config(),
    env,
  })
  logger.append({
    id: outcome.requestId,
    ts: Date.now(),
    requestId: outcome.requestId,
    intent: request.intent,
    utterance: request.utterance,
    dryRun: outcome.dryRun,
    status: outcome.status,
    ok: isPositiveStatus(outcome.status),
    durationMs: Date.now() - started,
    errorCode: outcome.error?.code,
    userMessage: outcome.userMessage,
    request,
    response: outcome,
  })
  return outcome
}

/** Model-facing renderer of one invoke outcome. */
export function renderInvokeOutcome(outcome: InvokeOutcome): string {
  const lines: string[] = []
  lines.push(`status: ${outcome.status}${outcome.dryRun ? ' (dry-run preview, nothing written)' : ''}`)
  if (outcome.userMessage !== undefined && outcome.userMessage !== '') lines.push(outcome.userMessage)
  if (outcome.status === 'clarification_required') {
    lines.push('Ask the user exactly the smallest clarification question Runtime returned; do not guess targets.')
  } else if (outcome.status === 'auth_required') {
    lines.push('Tell the user to run `yeelight-home auth login --qr` locally; never request a token in chat.')
  } else if (outcome.status === 'blocked' || outcome.status === 'not_supported') {
    lines.push('Explain the returned reason and the safe alternative; do not attempt an unsupported fallback.')
  } else if (outcome.status === 'error') {
    lines.push(`error.code: ${outcome.error?.code ?? 'unknown'}`)
  }
  if (outcome.status === 'success' || outcome.status === 'partial') {
    lines.push('Present the result per references/response-presentation.md; reflect only what Runtime verified.')
  }
  if (outcome.warnings !== undefined && outcome.warnings.length > 0) {
    lines.push(`warnings: ${outcome.warnings.join('; ')}`)
  }
  return lines.join('\n')
}

function invokeToolDescription(): string {
  return [
    'One Yeelight Runtime invocation over the local `yeelight-home invoke --stdin` pipeline.',
    'Every Yeelight control, query, diagnostic, scene, automation, lighting-design, memory, recommendation, and product-knowledge action goes through this tool; NEVER bypass it with guessed endpoints, headers, or MCP.',
    'Pass the user natural-language request as `utterance` (or the full SkillRequest JSON as `json`) plus the classified `intent` from the yeelight-smart-home skill (intent-catalog). Do not resolve IDs yourself; Runtime does.',
    'Handle returned statuses exactly: success/partial -> report, clarification_required -> one smallest question, auth_required -> local QR login, blocked/not_supported -> safe alternative, error -> report.',
    'Load the skill `yeelight-smart-home` and its `yeelight_reference` documents for routing and domain rules before complex operations.',
  ].join('\n')
}

/** Register the three plugin tools. */
export function registerTools(tools: ToolsSeam, service: YeelightService, logger: { append(entry: unknown): void }): void {
  registerInvokeTool(tools, service, logger)
  registerReferenceTool(tools, service)
  registerProductSelectTool(tools, service)
}

function registerInvokeTool(tools: ToolsSeam, service: YeelightService, logger: { append(entry: unknown): void }): void {
  tools.register({
    name: 'yeelight_home',
    description: invokeToolDescription(),
    parameters: {
      type: 'object',
      properties: {
        utterance: {
          type: 'string',
          description: 'The user request (or confirmation of it) in natural language, in the user wording. Required unless `json` is given.',
        },
        intent: {
          type: 'string',
          description: 'The classified Runtime intent id from the intent catalog, e.g. light.power.set, entity.list, scene.execute, automation.create, lighting.design.import, memory.remember. Prefixes may be omitted only when the name is unambiguous.',
        },
        parameters: {
          type: 'object',
          description: 'Runtime intent parameters with natural target words (deviceName/roomName/sceneName/automationName...) and `confirmed: true` only after explicit user agreement for destructive or permission-sensitive operations.',
        },
        json: {
          type: 'string',
          description: 'Alternative: the COMPLETE SkillRequest JSON (`{contractVersion:"1.0",requestId,locale,utterance,intent,parameters,options}`). When given, the separate fields are ignored.',
        },
        request_id: { type: 'string', description: 'Optional stable id; the tool mints a unique one when omitted.' },
        locale: { type: 'string', description: 'Optional locale for the request; default zh-CN.' },
        dry_run: { type: 'boolean', description: 'No-write preview. Resend without it after user agreement.' },
        timeout_ms: { type: 'number', description: 'Optional per-call timeout override in milliseconds.' },
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', description: 'Runtime status: success | partial | clarification_required | auth_required | blocked | not_supported | error.' },
          requestId: { type: 'string' },
          dryRun: { type: 'boolean' },
          durationMs: { type: 'number' },
          userMessage: { type: 'string', description: 'Runtime-authored user-facing message.' },
          error: {
            type: 'object',
            additionalProperties: false,
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
          result: { type: ['object', 'array', 'string', 'number', 'boolean', 'null'], description: 'Runtime structured result when the status is success or partial.' },
          runtime: {
            type: 'object',
            additionalProperties: false,
            properties: {
              bin: { type: 'string' },
              version: { type: 'string' },
            },
            required: ['bin', 'version'],
          },
        },
        required: ['status', 'requestId', 'dryRun', 'durationMs'],
      },
      render: (_args: unknown, value: InvokeOutcome) => [{ type: 'text', text: renderInvokeOutcome(value) }],
    },
    timeoutMs: service.config().requestTimeoutMs + 15_000,
    isConcurrencySafe: () => true,
    presentCall: (args: unknown) => {
      const a = (args ?? {}) as Record<string, unknown>
      const title = typeof a.utterance === 'string' && a.utterance !== '' ? a.utterance : String(a.intent ?? 'yeelight_home')
      return { card: 'generic', title: `Yeelight: ${title.slice(0, 80)}`, kind: 'search', rawInput: args }
    },
    presentResult: (_args: unknown, result: { isError: boolean; value?: InvokeOutcome; content?: unknown }) => {
      const value = (result as { value?: InvokeOutcome }).value
      if (value === undefined) return undefined
      return { card: 'generic', title: `Yeelight ${value.status}`, content: value.userMessage ?? undefined }
    },
    async execute(args: unknown, exec: { signal: AbortSignal }) {
      const input = (args ?? {}) as Record<string, unknown>
      const config = service.config()
      if (typeof input.json === 'string' && input.json.trim() !== '') {
        const parsed = parseSkillRequestJson(input.json, config)
        const outcome = await runInvoke(service.env, () => config, logger, parsed.request, {
          dryRun: parsed.dryRun ?? (input.dry_run === true),
          signal: exec.signal,
          timeoutMs: typeof input.timeout_ms === 'number' ? input.timeout_ms : undefined,
        })
        return outcome
      }
      const request = buildSkillRequest(input as SkillRequestInput, config)
      const outcome = await runInvoke(service.env, () => config, logger, request, {
        dryRun: input.dry_run === true,
        signal: exec.signal,
        timeoutMs: typeof input.timeout_ms === 'number' ? input.timeout_ms : undefined,
      })
      return outcome
    },
  })
}

function registerReferenceTool(tools: ToolsSeam, service: YeelightService): void {
  const dir = service.dataDir
  const keys = [...referenceIndex(dir).keys()]
  const first = keys.slice(0, 6).join(', ')
  tools.register({
    name: 'yeelight_reference',
    description: [
      'Load one Yeelight Smart Home routing document or asset by its registry key.',
      'The routing document explains the Runtime payload shapes, intents, safety lanes, and response rules for one domain; the skill instructs when to load which.',
      'Start with `README` when unsure, then the domain key: device-control, product-knowledge, home-room-area, groups, scenes, automations, payload-shapes, lighting-design, lighting-design-import, lighting-product-selection, scene-recipes, automation-recipes, automation-events, lighting-experience, diagnostics, memory-and-personalization, recommendations, operation-lessons, safety-and-confirmation, capability-boundaries, device-lexicon, thing-model, runtime-status-and-errors, response-presentation.',
      'Assets: intent-catalog (all 193 intents), skill-request.schema, skill-response.schema, lighting-design-full-home.',
      `Unknown keys throw with the full list (${keys.length} documents; e.g. ${first}, ...).`,
    ].join('\n'),
    parameters: {
      type: 'object',
      properties: {
        doc: { type: 'string', description: `The document key. Available: ${referenceToolHints(dir)}` },
      },
      required: ['doc'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          key: { type: 'string' },
          label: { type: 'string' },
          bytes: { type: 'number' },
          content: { type: 'string' },
        },
        required: ['key', 'label', 'bytes', 'content'],
      },
      render: (_args: unknown, value: { key: string; content: string }) => [
        { type: 'text', text: `# yeelight_reference: ${value.key}\n\n${value.content}` },
      ],
    },
    timeoutMs: 10_000,
    isConcurrencySafe: () => true,
    presentCall: (args: unknown) => {
      const a = (args ?? {}) as Record<string, unknown>
      return { card: 'generic', title: `Load Yeelight doc ${String(a.doc ?? '')}`, kind: 'read', rawInput: args }
    },
    async execute(args: unknown, exec: { signal: AbortSignal }) {
      const a = (args ?? {}) as Record<string, unknown>
      const doc = typeof a.doc === 'string' ? a.doc.trim() : ''
      if (doc === '') throw new Error('doc must be a non-empty document key')
      const { doc: meta, content } = readReferenceDoc(dir, doc)
      return { key: (meta as ReferenceDoc).key, label: (meta as ReferenceDoc).label, bytes: (meta as ReferenceDoc).bytes, content }
    },
  })
}

function registerProductSelectTool(tools: ToolsSeam, service: YeelightService): void {
  tools.register({
    name: 'yeelight_product_select',
    description: [
      'Offline candidate product selection for not-yet-installed lighting slots, using the shipped Yeelight lighting-design catalog and lexical aliases.',
      'Pass the user product wording (`query`), the target `room`, the `goal` of the design, and an optional `category`, then apply references/lighting-product-selection.md and references/product-knowledge.md before choosing.',
      'After the AI chooses a candidate, copy skuCode, capabilityPid, productComponentId and the readable productName/category/series/notes into lighting.design.import or device.slot.create via yeelight_home.',
      'For official product facts (manual, FAQ, SKU, pedia) use yeelight_home with product.pedia.search, thing.product_faq.* or thing.product.info.* intents instead.',
    ].join('\n'),
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The user product wording or design requirement, e.g. "客厅无边框嵌入式射灯 24度 黑色 55开孔".' },
        room: { type: 'string', description: 'Target room, e.g. 客厅.' },
        goal: { type: 'string', description: 'Design goal, e.g. "重点照明 洗墙" or "氛围基础照明".' },
        category: { type: 'string', description: 'Optional category hint, e.g. 射灯.' },
        limit: { type: 'number', description: 'Candidate limit 1..20 (default 8).' },
      },
      required: ['query'],
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          query: { type: 'string' },
          normalizedQuery: { type: 'string' },
          catalog: { type: 'string' },
          returned: { type: 'number' },
          candidates: { type: 'array', items: { type: 'object' } },
          selectionGuidance: { type: 'string' },
          runtimeRule: { type: 'string' },
        },
        required: ['query', 'normalizedQuery', 'catalog', 'returned', 'candidates', 'selectionGuidance', 'runtimeRule'],
      },
      render: (_args: unknown, value: { query: string; returned: number; selectionGuidance: string; runtimeRule: string }) => [
        { type: 'text', text: `# yeelight_product_select: ${value.query}\nreturned ${value.returned} candidate(s)\n\n${value.selectionGuidance}\n\n${value.runtimeRule}` },
      ],
    },
    timeoutMs: 30_000,
    isConcurrencySafe: () => true,
    presentCall: (args: unknown) => {
      const a = (args ?? {}) as Record<string, unknown>
      return { card: 'generic', title: `Yeelight product select: ${String(a.query ?? '').slice(0, 60)}`, kind: 'search', rawInput: args }
    },
    async execute(args: unknown, exec: { signal: AbortSignal }) {
      const a = (args ?? {}) as Record<string, unknown>
      const query = typeof a.query === 'string' ? a.query.trim() : ''
      if (query === '') throw new Error('query must be a non-empty string')
      return runProductSelect(
        service.dataDir,
        {
          query,
          room: typeof a.room === 'string' ? a.room : undefined,
          goal: typeof a.goal === 'string' ? a.goal : undefined,
          category: typeof a.category === 'string' ? a.category : undefined,
          limit: typeof a.limit === 'number' ? a.limit : undefined,
        },
        { signal: exec.signal, env: service.env },
      )
    },
  })
}
