/** Filesystem locations of the plugin. */

import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/* The host entry is shipped as a CJS bundle, where `import.meta` is empty;
 * source runs (vitest, tsc) are ESM. Bridge the two. */
declare const __filename: string | undefined
declare const __dirname: string | undefined

/** Path of this module, whichever module system it was compiled with. */
function modulePath(): string {
  if (typeof __filename === 'string' && __filename !== '') return __filename
  return fileURLToPath(import.meta.url)
}

/** Resolve the DSH home directory: $DSH_HOME, then ~/.dsh (like dsh-util-home-paths). */
export function dshHome(env: NodeJS.ProcessEnv): string {
  const fromEnv = (env.DSH_HOME ?? '').trim()
  if (fromEnv !== '') return fromEnv
  return join(homedir(), '.dsh')
}

/** Plugin-owned data directory under the DSH home. */
export function pluginHome(env: NodeJS.ProcessEnv): string {
  return join(dshHome(env), 'plugins', 'dsh-yeelight-smart-home')
}

/** The packaged skill data directory (data/), resolved from this module. */
export function dataDir(): string {
  return resolve(dirname(modulePath()), '..', 'data')
}
