/**
 * Build: esbuild bundle for the host face (lib/index.js) plus static
 * assembly of the browser face (lib/client.js) in the lazy-CJS bundle
 * protocol, and TypeScript declarations (lib/types).
 *
 * - Host: platform node, external @deepseek-ai/* (resolved at runtime by the
 *   harness), no other runtime deps.
 * - Client: the card is handwritten in `src/client/bundle.js` as the FACTORY
 *   BODY; we paste it verbatim into the window.__ModuleLoader__.load({id,
 *   factory}) envelope (the same contract @liustack/modsearch ships). No
 *   bundling, no React import rewriting — the body requires('react') lazily.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const lib = join(root, 'lib')
const types = join(lib, 'types')
const esbuild = join(root, 'node_modules', '.bin', 'esbuild')

function run(args) {
  execFileSync(process.execPath, [esbuild, ...args], { stdio: 'inherit' })
}

mkdirSync(types, { recursive: true })

// 1. Host bundle. The package is "type": "module" and the harness imports
// plugins as native ESM (see @liustack/modsearch), so emit ESM — a CJS
// bundle inside a "type":"module" package would load as an empty namespace.
run([
  join('src', 'index.ts'),
  '--bundle',
  '--format=esm',
  '--platform=node',
  '--target=node22',
  '--external:@deepseek-ai/*',
  '--log-level=warning',
  '--outfile=' + join(lib, 'index.js'),
  '--sourcemap',
])

// 2. Client bundle: paste the factory body into the loader envelope.
const body = readFileSync(join(root, 'src', 'client', 'bundle.js'), 'utf8')
const envelope = `/* dsh-yeelight-smart-home — web client (lazy-CJS bundle). */
window.__ModuleLoader__.load({
  id: 'dsh-yeelight-smart-home',
  factory: (require) => {
${body}
  },
});
`
mkdirSync(lib, { recursive: true })
writeFileSync(join(lib, 'client.js'), envelope)

// 3. Declarations: emit .d.ts from src/ into lib/types (keeps the source
// layout; esbuild took care of the JS).
try {
  execFileSync(join(root, 'node_modules', '.bin', 'tsc'), ['-p', join(root, 'tsconfig.build.json')], { stdio: 'inherit' })
} catch (error) {
  console.error('[build] tsc declarations failed; continuing (JS artifacts are still valid).')
}

// 4. Handwritten declaration shims.
writeFileSync(
  join(types, 'index.d.ts'),
  `export * from './index.js'\n`,
)
writeFileSync(
  join(types, 'client.d.ts'),
  `/**
 * Browser face (lazy-CJS bundle; already compiled into lib/client.js).
 * The client registers the settings card through the settings.plugin.item
 * slot; this type mirrors the exported contract for tooling only.
 */
export interface ClientOptions {
  /** Card display order in the Plugins settings list. */
  order?: number
}
export declare function apply(ctx: unknown, options?: ClientOptions): void
export declare const inject: readonly string[]
`,
)

// Copy NOTICE/LICENSE into the package? They live at repo root and are
// listed in files[]; nothing to do here.
console.log('[build] ok → lib/index.js, lib/client.js, lib/types/')