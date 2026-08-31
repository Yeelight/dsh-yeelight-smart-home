/** Plugin configuration file: load, sanitize, and persist under the plugin home. */
import { type YeelightConfig } from './types.ts';
export interface ConfigStore {
    /** Current effective configuration (deep-frozen object). */
    current(): YeelightConfig;
    /** Merge a patch of known keys over the current config and persist it. */
    patch(patch: Record<string, unknown>): YeelightConfig;
    /** Reset every field to its default and persist. */
    reset(): YeelightConfig;
    /** Absolute config file path. */
    readonly file: string;
}
/** Sanitize one raw object into a valid {@link YeelightConfig} over defaults. */
export declare function normalizeConfig(raw: unknown): YeelightConfig;
/** Create a config store backed by `$pluginHome/config.json`. */
export declare function openConfigStore(home: string): ConfigStore;
