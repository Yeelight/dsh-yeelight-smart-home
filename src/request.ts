/** Build and validate SkillRuntime request envelopes. */

import { DEFAULT_CONFIG, type SkillRequest, type YeelightConfig } from './types.ts'

let sequence = 0

/** One short unique request id, stable within a process and unique enough across runs. */
export function newRequestId(): string {
  sequence = (sequence + 1) % 0xffff
  return `dsh-${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export interface SkillRequestInput {
  readonly utterance?: unknown
  readonly intent?: unknown
  readonly parameters?: unknown
  readonly request_id?: unknown
  readonly locale?: unknown
  readonly contract_version?: unknown
}

/**
 * Build one SkillRequest from tool arguments or card input.
 * @throws {Error} when `utterance` is missing or blank and no `json` fallback exists.
 */
export function buildSkillRequest(input: SkillRequestInput, config: Partial<YeelightConfig> = {}): SkillRequest {
  const utterance = typeof input.utterance === 'string' ? input.utterance.trim() : ''
  if (utterance === '') {
    throw new Error('utterance must be a non-empty string: the natural-language request or confirmation of it')
  }
  const parameters =
    typeof input.parameters === 'object' && input.parameters !== null && !Array.isArray(input.parameters)
      ? (input.parameters as Record<string, unknown>)
      : undefined
  const requestId =
    typeof input.request_id === 'string' && input.request_id.trim() !== ''
      ? input.request_id.trim()
      : newRequestId()
  const locale = typeof input.locale === 'string' && input.locale.trim() !== ''
    ? input.locale.trim()
    : config.locale ?? DEFAULT_CONFIG.locale
  return Object.freeze({
    contractVersion: '1.0',
    requestId,
    locale,
    utterance,
    ...typeof input.intent === 'string' && input.intent.trim() !== '' ? { intent: input.intent.trim() } : {},
    ...parameters !== undefined ? { parameters } : {},
  } satisfies SkillRequest as SkillRequest)
}

export interface ParsedSkillRequestJson {
  readonly request: SkillRequest
  readonly dryRun: boolean
}

/**
 * Parse a full SkillRequest JSON string (the `json` tool argument).
 * Accepts a `options.dryRun` member; flags are validated but never trusted here.
 */
export function parseSkillRequestJson(json: unknown, config: Partial<YeelightConfig> = {}): ParsedSkillRequestJson {
  if (typeof json !== 'string' || json.trim() === '') {
    throw new Error('json must be a non-empty string holding a SkillRequest object')
  }
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch (error) {
    throw new Error(`json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('json must hold one SkillRequest object')
  }
  const input = raw as Record<string, unknown>
  const options =
    typeof input.options === 'object' && input.options !== null && !Array.isArray(input.options)
      ? (input.options as Record<string, unknown>)
      : undefined
  const dryRun = options?.dryRun === true
  const requestId = typeof input.requestId === 'string' ? input.requestId : input.request_id
  return {
    request: buildSkillRequest(
      {
        utterance: input.utterance,
        intent: input.intent,
        parameters: input.parameters,
        request_id: requestId,
        locale: input.locale,
        contract_version: input.contractVersion,
      },
      config,
    ),
    dryRun,
  }
}

/** True when the status means the Runtime completed (fully or partially). */
export function isPositiveStatus(status: string | undefined): boolean {
  return status === 'success' || status === 'partial'
}
