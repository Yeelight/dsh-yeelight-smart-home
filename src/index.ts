/**
 * dsh-yeelight-smart-home — Host face.
 *
 * Mounts the Yeelight Smart Home capability into a DeepSeek Harness
 * composition: three model-facing tools (yeelight_home, yeelight_reference,
 * yeelight_product_select), the in-memory yeelight-smart-home skill, a
 * dispatchable settings namespace, and the /yeelight web routes that the
 * settings card talks to.
 *
 * Every seam is optional and rides a scoped ctx.inject, so a headless
 * profile keeps the tools and the skill and simply skips the web routes,
 * and the plugin never blocks a boot because a service is missing.
 */

import { openConfigStore } from './store.ts'
import { openInvokeLogger } from './logs.ts'
import { dataDir, pluginHome } from './paths.ts'
import { registerTools, runInvoke, type ToolsSeam, type YeelightService } from './tools.ts'
import { registerSkill, type SkillSeam } from './skills.ts'
import { registerYeelightRoutes, type RouteService, type WebServerSeam } from './routes.ts'
import { resolveRuntimeBin } from './runtime.ts'

/** Composition-level overrides (mostly for tests); user config lives in the config file. */
export interface PluginOptions {
  /** Override the packaged data directory (tests). */
  readonly dataDir?: string
  /** Override the plugin home directory (tests). */
  readonly home?: string
}

/** Anything exposing `inject(names, callback)` and `effect(...)` — the ctx seam, duck-typed. */
interface InjectingContext {
  inject(names: readonly string[], callback: (scope: Record<string, unknown>) => void): unknown
  effect(callback: () => unknown, label?: string): void
  provide?(name: string, value: unknown): void
}

/**
 * Host plugin entry. The Loader calls apply with the composition `ctx`;
 * `options` carries the row config (empty for the shipped row).
 */
export function apply(ctx: InjectingContext, options: PluginOptions = {}): void {
  const env = process.env
  const home = options.home ?? pluginHome(env)
  const dir = options.dataDir ?? dataDir()
  const store = openConfigStore(home)
  const logger = openInvokeLogger(home, () => store.current())

  const service: YeelightService = {
    env,
    dataDir: dir,
    config: () => store.current(),
    resolver: { resolveBin: () => resolveRuntimeBin(env, store.current()) },
  }

  const routes: RouteService = {
    env,
    dataDir: dir,
    config: () => store.current(),
    configFile: store.file,
    logger: {
      append: (entry) => logger.append(entry),
      list: (limit) => logger.list(limit),
      detail: (id) => logger.detail(id),
      clear: () => logger.clear(),
      enabled: () => logger.enabled(),
    },
    patchConfig: (patch) => store.patch(patch),
    resetConfig: () => store.reset(),
    settingsDescribe: () => settingsDescribeRef.current?.() ?? [],
  }

  const settingsDescribeRef: { current: (() => Array<{ ns: string }>) | undefined } = { current: undefined }

  // Model-facing tools (core). A missing 'tools' seam only logs; nothing here
  // blocks a boot.
  ctx.inject(['tools'], (scope) => {
    try {
      registerTools(scope.tools as ToolsSeam, service, logger)
    } catch (error) {
      console.error(`[yeelight-smart-home] tool registration failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // In-memory skill so agents can load full domain instructions on demand.
  ctx.inject(['skills'], (scope) => {
    try {
      const dispose = registerSkill(scope.skills as SkillSeam, dir)
      if (typeof dispose === 'function') ctx.effect(() => dispose, 'yeelight-smart-home: skill')
    } catch (error) {
      console.error(`[yeelight-smart-home] skill registration failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // The empty namespace makes the settings card dispatchable in the Plugins
  // tab; the values themselves live in the config file behind /yeelight.
  ctx.inject(['settings'], (scope) => {
    try {
      const settingsScope = scope.settings as {
        register(ns: string, schema: unknown, opts: { base: Record<string, unknown> }): unknown
        describe(): Array<{ ns: string }>
      }
      const passThrough = (value?: unknown): Record<string, unknown> => ({ ...((value ?? {}) as Record<string, unknown>) })
      Object.assign(passThrough, {
        toJSON: () => ({ uid: 0, refs: { 0: { type: 'object', meta: { default: {} }, dict: {} } } }),
      })
      settingsScope.register('yeelight-smart-home', passThrough, { base: {} })
      settingsDescribeRef.current = () => settingsScope.describe()
      const namespaces = settingsScope.describe()
      console.error(`[yeelight-smart-home] settings registered, namespaces: ${namespaces.map((n) => n.ns).join(', ')}`)
    } catch (error) {
      console.error(`[yeelight-smart-home] settings namespace skipped: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // The settings card's host half.
  ctx.inject(['webServer'], (scope) => {
    try {
      registerYeelightRoutes(scope.webServer as WebServerSeam, routes)
    } catch (error) {
      console.error(`[yeelight-smart-home] /yeelight routes skipped: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // Optional service so other plugins (or tests) can reach the pipeline.
  ctx.provide?.('yeelightHome', {
    config: () => store.current(),
    configFile: store.file,
    home,
    dataDir: dir,
    invoke: (request: Parameters<typeof runInvoke>[3], options: Parameters<typeof runInvoke>[4]) =>
      runInvoke(env, () => store.current(), logger, request, options),
  })
}
