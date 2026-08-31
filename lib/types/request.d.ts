/** Build and validate SkillRuntime request envelopes. */
import { type SkillRequest, type YeelightConfig } from './types.ts';
/** One short unique request id, stable within a process and unique enough across runs. */
export declare function newRequestId(): string;
export interface SkillRequestInput {
    readonly utterance?: unknown;
    readonly intent?: unknown;
    readonly parameters?: unknown;
    readonly request_id?: unknown;
    readonly locale?: unknown;
    readonly contract_version?: unknown;
}
/**
 * Build one SkillRequest from tool arguments or card input.
 * @throws {Error} when `utterance` is missing or blank and no `json` fallback exists.
 */
export declare function buildSkillRequest(input: SkillRequestInput, config?: Partial<YeelightConfig>): SkillRequest;
export interface ParsedSkillRequestJson {
    readonly request: SkillRequest;
    readonly dryRun: boolean;
}
/**
 * Parse a full SkillRequest JSON string (the `json` tool argument).
 * Accepts a `options.dryRun` member; flags are validated but never trusted here.
 */
export declare function parseSkillRequestJson(json: unknown, config?: Partial<YeelightConfig>): ParsedSkillRequestJson;
/** True when the status means the Runtime completed (fully or partially). */
export declare function isPositiveStatus(status: string | undefined): boolean;
