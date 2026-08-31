/** Shared types of the dsh-yeelight-smart-home plugin. */
/** Plugin-owned user configuration (file at $DSH_HOME/plugins/dsh-yeelight-smart-home/config.json). */
export interface YeelightConfig {
    /** Absolute path to the yeelight-home executable; empty means auto-detect. */
    binPath: string;
    /** --region flag forwarded to `yeelight-home invoke`; empty means Runtime default. */
    region: string;
    /** --house-id flag forwarded to `yeelight-home invoke`; empty means selected default. */
    houseId: string;
    /** --profile flag forwarded to `yeelight-home invoke`; empty means active profile. */
    profile: string;
    /** Default SkillRequest.locale. */
    locale: string;
    /** Default dry-run posture for tool invokes and the settings card. */
    dryRunDefault: boolean;
    /** Cooperative timeout for one Runtime invocation, in milliseconds. */
    requestTimeoutMs: number;
    /** Maximum number of retained log entries. */
    logRetention: number;
    /** Master switch for the invoke log. */
    logEnabled: boolean;
    /** Show the runtime-status section on the settings card. */
    uiStatusEnabled: boolean;
    /** Show the log section on the settings card. */
    uiLogsEnabled: boolean;
    /** Show the quick-invoke box on the settings card. */
    uiQuickInvokeEnabled: boolean;
}
export declare const DEFAULT_CONFIG: YeelightConfig;
/** Minimal SkillRuntime request, per the public contract version 1.0. */
export interface SkillRequest {
    readonly contractVersion: '1.0';
    readonly requestId: string;
    readonly locale: string;
    readonly utterance: string;
    readonly intent?: string;
    readonly parameters?: Record<string, unknown>;
    readonly options?: {
        readonly dryRun?: boolean;
    };
}
/** One normalized Runtime response (subset of the invoke envelope plus plugin facts). */
export interface InvokeOutcome {
    readonly status: string;
    readonly requestId: string;
    readonly dryRun: boolean;
    readonly durationMs: number;
    readonly userMessage?: string;
    readonly result?: unknown;
    readonly error?: {
        readonly code: string;
        readonly message: string;
    };
    readonly warnings?: readonly string[];
    /** Resolved runtime identity when a binary ran. */
    readonly runtime?: {
        readonly bin: string;
        readonly version: string;
    };
}
/** One persisted log entry. */
export interface InvokeLogEntry {
    readonly id: string;
    readonly ts: number;
    readonly requestId: string;
    readonly intent?: string;
    readonly utterance?: string;
    readonly dryRun: boolean;
    readonly status: string;
    readonly ok: boolean;
    readonly durationMs: number;
    readonly errorCode?: string;
    readonly userMessage?: string;
    readonly request?: unknown;
    readonly response?: unknown;
}
