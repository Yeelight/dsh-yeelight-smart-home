/**
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
