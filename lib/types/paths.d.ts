/** Filesystem locations of the plugin. */
/** Resolve the DSH home directory: $DSH_HOME, then ~/.dsh (like dsh-util-home-paths). */
export declare function dshHome(env: NodeJS.ProcessEnv): string;
/** Plugin-owned data directory under the DSH home. */
export declare function pluginHome(env: NodeJS.ProcessEnv): string;
/** The packaged skill data directory (data/), resolved from this module. */
export declare function dataDir(): string;
