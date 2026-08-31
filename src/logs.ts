/** Bounded JSONL invoke log under the plugin home. */

import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { InvokeLogEntry, YeelightConfig } from './types.ts'

export interface InvokeLogger {
  /** Append one entry; retains at most `config.logRetention` entries. */
  append(entry: InvokeLogEntry): void
  /** Summaries of the newest `limit` entries. */
  list(limit: number): readonly InvokeLogEntry[]
  /** The full entry by id, including request/response bodies. */
  detail(id: string): InvokeLogEntry | undefined
  /** Drop every entry. */
  clear(): void
  /** Whether logging is switched on right now. */
  enabled(): boolean
  readonly file: string
}

function logPath(home: string): string {
  return join(home, 'invoke.log.jsonl')
}

function readEntries(file: string): InvokeLogEntry[] {
  try {
    const text = readFileSync(file, 'utf8')
    const entries: InvokeLogEntry[] = []
    for (const line of text.split('\n')) {
      if (line.trim() === '') continue
      try {
        const parsed = JSON.parse(line) as InvokeLogEntry
        if (typeof parsed?.id === 'string' && typeof parsed?.ts === 'number') entries.push(parsed)
      } catch {
        // One malformed line never poisons the whole log.
      }
    }
    return entries
  } catch {
    return []
  }
}

function trimLatest(entries: InvokeLogEntry[], retention: number): InvokeLogEntry[] {
  if (entries.length <= retention) return entries
  return entries.slice(entries.length - retention)
}

/**
 * A best-effort bounded logger. Writes are synchronous and rate-isolated:
 * a full-disk or permissions failure is caught and downgraded to console,
 * because a smart-home invocation must never fail because the log did.
 */
export function openInvokeLogger(home: string, config: () => YeelightConfig): InvokeLogger {
  const file = logPath(home)
  return {
    enabled: () => config().logEnabled,
    file,
    append(entry) {
      if (!config().logEnabled) return
      try {
        mkdirSync(home, { recursive: true })
        appendFileSync(file, `${JSON.stringify(entry)}\n`)
        const retention = config().logRetention
        const entries = readEntries(file)
        if (entries.length > retention) {
          writeFileSync(file, `${trimLatest(entries, retention).map((e) => JSON.stringify(e)).join('\n')}\n`)
        }
      } catch (error) {
        console.error(`[yeelight-smart-home] invoke log append failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    list(limit) {
      const entries = readEntries(file)
      const slice = limit > 0 ? entries.slice(-limit) : entries
      // The list view is newest-first and never carries full bodies.
      return slice
        .reverse()
        .map((entry) => {
          const { request: _request, response: _response, ...summary } = entry
          return summary as unknown as InvokeLogEntry
        })
    },
    detail(id) {
      return readEntries(file).find((entry) => entry.id === id)
    },
    clear() {
      try {
        writeFileSync(file, '')
      } catch (error) {
        console.error(`[yeelight-smart-home] invoke log clear failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
  }
}
