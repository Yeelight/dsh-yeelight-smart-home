/** Bounded JSONL invoke log under the plugin home. */
import type { InvokeLogEntry, YeelightConfig } from './types.ts';
export interface InvokeLogger {
    /** Append one entry; retains at most `config.logRetention` entries. */
    append(entry: InvokeLogEntry): void;
    /** Summaries of the newest `limit` entries. */
    list(limit: number): readonly InvokeLogEntry[];
    /** The full entry by id, including request/response bodies. */
    detail(id: string): InvokeLogEntry | undefined;
    /** Drop every entry. */
    clear(): void;
    /** Whether logging is switched on right now. */
    enabled(): boolean;
    readonly file: string;
}
/**
 * A best-effort bounded logger. Writes are synchronous and rate-isolated:
 * a full-disk or permissions failure is caught and downgraded to console,
 * because a smart-home invocation must never fail because the log did.
 */
export declare function openInvokeLogger(home: string, config: () => YeelightConfig): InvokeLogger;
