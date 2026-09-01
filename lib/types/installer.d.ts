/**
 * Yeelight Runtime installer: detect the best install channel for the
 * current platform, run the install, and report progress. The installer is
 * optional sugar — the plugin itself never requires it, but the settings
 * card uses it to turn "runtime missing" into one click.
 *
 * Channels (newest first, first available wins):
 *   - brew   (macOS):      brew install yeelight/yeelight-home/yeelight-home
 *   - npm    (all):        npm install -g yeelight-home
 *   - scoop  (windows):    scoop install yeelight/yeelight-home/yeelight-home
 *   - download (all):      GitHub release binary into ~/.local/bin
 */
export type InstallChannel = 'brew' | 'npm' | 'scoop' | 'download';
export interface InstallOption {
    readonly channel: InstallChannel;
    readonly label: string;
    readonly command: string;
    readonly args: readonly string[];
    /** True when the channel's package manager is present on PATH. */
    readonly available: boolean;
    readonly hint: string;
}
export interface InstallProgress {
    readonly phase: 'resolving' | 'installing' | 'verifying' | 'done' | 'error';
    readonly message: string;
    readonly output?: string;
}
export interface InstallResult {
    readonly ok: boolean;
    readonly channel?: InstallChannel;
    readonly bin?: string;
    readonly version?: string;
    readonly output: string;
    readonly error?: string;
}
/** Detect the install channels usable on this machine. */
export declare function detectInstallOptions(env: NodeJS.ProcessEnv): InstallOption[];
/** Local binary target for the download channel. */
export declare function localBinPath(env: NodeJS.ProcessEnv): string;
/** Install the runtime through the requested (or first available) channel. */
export declare function installRuntime(env: NodeJS.ProcessEnv, options: {
    channel?: InstallChannel;
    timeoutMs?: number;
    signal?: AbortSignal;
    onProgress?: (p: InstallProgress) => void;
}): Promise<InstallResult>;
