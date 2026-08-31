/** Model-facing tools of the plugin, registered duck-typed on ctx.tools. */
import type { InvokeOutcome, SkillRequest, YeelightConfig } from './types.ts';
/** Anything exposing `register(definition)` — the ctx.tools seam, duck-typed. */
export interface ToolsSeam {
    register(definition: Record<string, unknown>): unknown;
}
export interface YeelightService {
    readonly env: NodeJS.ProcessEnv;
    readonly dataDir: string;
    readonly config: () => YeelightConfig;
    readonly resolver: Resolver;
}
/** Extra lookup surface implemented by the service for tool convenience. */
export interface Resolver {
    readonly resolveBin: () => string | undefined;
}
/**
 * One Runtime invocation through the shared pipeline, with logging.
 * @returns the normalized outcome; never throws for business failures.
 */
export declare function runInvoke(env: NodeJS.ProcessEnv, config: () => YeelightConfig, logger: {
    append(entry: unknown): void;
}, request: SkillRequest, options: {
    readonly dryRun?: boolean;
    readonly signal?: AbortSignal;
    readonly timeoutMs?: number;
    readonly bin?: string;
}): Promise<InvokeOutcome>;
/** Model-facing renderer of one invoke outcome. */
export declare function renderInvokeOutcome(outcome: InvokeOutcome): string;
/** Register the three plugin tools. */
export declare function registerTools(tools: ToolsSeam, service: YeelightService, logger: {
    append(entry: unknown): void;
}): void;
