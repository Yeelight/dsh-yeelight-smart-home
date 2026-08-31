/** Plugin configuration file: load, sanitize, and persist under the plugin home. */

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_CONFIG, type YeelightConfig } from './types.ts'

export interface ConfigStore {
  /** Current effective configuration (deep-frozen object). */
  current(): YeelightConfig
  /** Merge a patch of known keys over the current config and persist it. */
  patch(patch: Record<string, unknown>): YeelightConfig
  /** Reset every field to its default and persist. */
  reset(): YeelightConfig
  /** Absolute config file path. */
  readonly file: string
}

const KNOWN_KEYS = new Set(Object.keys(DEFAULT_CONFIG) as (keyof YeelightConfig)[])

function numberIn(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function booleanOf(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function stringOf(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

/** Sanitize one raw object into a valid {@link YeelightConfig} over defaults. */
export function normalizeConfig(raw: unknown): YeelightConfig {
  const input = (raw ?? {}) as Record<string, unknown>
  return Object.freeze({
    binPath: stringOf(input.binPath, DEFAULT_CONFIG.binPath),
    region: stringOf(input.region, DEFAULT_CONFIG.region),
    houseId: stringOf(input.houseId, DEFAULT_CONFIG.houseId),
    profile: stringOf(input.profile, DEFAULT_CONFIG.profile),
    locale: stringOf(input.locale, DEFAULT_CONFIG.locale),
    dryRunDefault: booleanOf(input.dryRunDefault, DEFAULT_CONFIG.dryRunDefault),
    requestTimeoutMs: numberIn(input.requestTimeoutMs, DEFAULT_CONFIG.requestTimeoutMs, 5_000, 10 * 60_000),
    logRetention: numberIn(input.logRetention, DEFAULT_CONFIG.logRetention, 20, 50_000),
    logEnabled: booleanOf(input.logEnabled, DEFAULT_CONFIG.logEnabled),
    uiStatusEnabled: booleanOf(input.uiStatusEnabled, DEFAULT_CONFIG.uiStatusEnabled),
    uiLogsEnabled: booleanOf(input.uiLogsEnabled, DEFAULT_CONFIG.uiLogsEnabled),
    uiQuickInvokeEnabled: booleanOf(input.uiQuickInvokeEnabled, DEFAULT_CONFIG.uiQuickInvokeEnabled),
  })
}

function readFileSafe(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return undefined
  }
}

/** Create a config store backed by `$pluginHome/config.json`. */
export function openConfigStore(home: string): ConfigStore {
  const file = join(home, 'config.json')
  let current = normalizeConfig(readFileSafe(file))
  const persist = (): void => {
    mkdirSync(home, { recursive: true })
    const tmp = `${file}.tmp`
    writeFileSync(tmp, `${JSON.stringify(current, null, 2)}\n`)
    renameSync(tmp, file)
  }
  return {
    get file() {
      return file
    },
    current: () => current,
    patch(patch) {
      const next: Record<string, unknown> = { ...current }
      for (const [key, value] of Object.entries(patch ?? {})) {
        if (KNOWN_KEYS.has(key as keyof YeelightConfig)) next[key] = value
      }
      current = normalizeConfig(next)
      persist()
      return current
    },
    reset() {
      current = normalizeConfig(undefined)
      persist()
      return current
    },
  }
}
