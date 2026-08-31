/** The yeelight-home Runtime adapter: binary resolution, health, and invoke. */
import type { InvokeOutcome, SkillRequest, YeelightConfig } from './types.ts';
/** One spawned-command capture result. */
export interface SpawnCapture {
    readonly ok: boolean;
    readonly code: number | null;
    readonly stdout: string;
    readonly stderr: string;
    readonly timedOut: boolean;
}
/** Spawn one command, feed nothing, capture bounded stdout/stderr, honor the signal. */
export declare function captureCommand(command: string, args: readonly string[], options: {
    readonly timeoutMs?: number;
    readonly signal?: AbortSignal;
    readonly env?: NodeJS.ProcessEnv;
    readonly stdin?: string;
}): Promise<SpawnCapture>;
/** One cooperative timeout that rejects with a clean error after `ms`. */
export declare function timeoutSignal(ms: number, parent?: AbortSignal): AbortSignal;
export declare function isExecutable(path: string): boolean;
/** PATH lookup for the runtime binary name. */
export declare function findOnPath(name: string, env: NodeJS.ProcessEnv): string | undefined;
/** Candidate list mirroring the reference skill's invoke.sh, newest channels first. */
export declare function runtimeCandidates(env: NodeJS.ProcessEnv): string[];
/** Resolve the runtime binary, honoring the configured path first. */
export declare function resolveRuntimeBin(env: NodeJS.ProcessEnv, config: Pick<YeelightConfig, 'binPath'>): string | undefined;
/** Parse `yeelight-home version --json`. */
export declare function parseVersionJson(text: string): {
    version: string;
    cli?: string;
    commit?: string;
    os?: string;
    arch?: string;
    date?: string;
} | undefined;
/** Whether a version payload matches the expected Runtime CLI identity. */
export declare function isCompatibleRuntime(version: {
    version: string;
    cli?: string;
} | undefined): version is {
    version: string;
    cli?: string;
};
/** Classify the most likely reason an auth status failed: `missing` | `invalid` | `none`. */
export declare function authStateFields(text: string, source: string): {
    authenticated: boolean;
    houseId?: string;
    region?: string;
    bizType?: string;
    profile?: string;
    tokenSource?: string;
    tokenPresent?: boolean;
    tokenStore?: string;
};
/** Build the error envelope for a missing runtime, mirroring the reference skill. */
export declare function runtimeMissingOutcome(requestId: string): InvokeOutcome;
/** Build the error envelope for an outdated runtime, mirroring the reference skill. */
export declare function runtimeOutdatedOutcome(requestId: string, bin: string): InvokeOutcome;
export interface InvokeInput {
    readonly request: SkillRequest;
    readonly dryRun?: boolean;
    readonly timeoutMs?: number;
    readonly signal?: AbortSignal;
    readonly bin?: string;
    readonly config: Pick<YeelightConfig, 'region' | 'houseId' | 'profile' | 'binPath'>;
    readonly env: NodeJS.ProcessEnv;
}
/** Normalize one parsed invoke response into the plugin outcome shape. */
export declare function normalizeInvokeResponse(parsed: unknown, requestId: string, dryRun: boolean, durationMs: number, runtime: {
    bin: string;
    version: string;
}): InvokeOutcome;
/** Invoke the Runtime with one SkillRequest over stdin. */
export declare function invokeRuntime(input: InvokeInput): Promise<InvokeOutcome>;
export interface RuntimeStatus {
    readonly bin: string | undefined;
    readonly version: {
        version: string;
        cli?: string;
        commit?: string;
        os?: string;
        arch?: string;
        date?: string;
    } | undefined;
    readonly compatible: boolean;
    readonly auth: {
        authenticated: boolean;
        houseId?: string;
        region?: string;
        bizType?: string;
        profile?: string;
        tokenSource?: string;
        tokenPresent?: boolean;
        tokenStore?: string;
    } | undefined;
    readonly authError?: string;
    readonly doctor: {
        ok: boolean;
        kind: 'json' | 'text';
        text: string;
    };
}
/** Best-effort status snapshot for the settings card. */
export declare function runtimeStatus(env: NodeJS.ProcessEnv, config: Pick<YeelightConfig, 'binPath'>): Promise<RuntimeStatus>;
