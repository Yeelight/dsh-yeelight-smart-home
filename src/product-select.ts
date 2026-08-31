/** yeelight_product_select: offline product candidate selection per the reference skill. */

import { spawn } from 'node:child_process'
import { join } from 'node:path'

export interface ProductSelectArgs {
  readonly query: string
  readonly room?: string
  readonly goal?: string
  readonly category?: string
  readonly limit?: number
}

export interface ProductSelectResult {
  readonly query: string
  readonly normalizedQuery: string
  readonly catalog: string
  readonly returned: number
  readonly candidates: readonly unknown[]
  readonly selectionGuidance: string
  readonly runtimeRule: string
}

/** Run the reference product-select script with the shipped catalogs. */
export function runProductSelect(
  dir: string,
  args: ProductSelectArgs,
  options: { readonly timeoutMs?: number; readonly signal?: AbortSignal; readonly env?: NodeJS.ProcessEnv },
): Promise<ProductSelectResult> {
  return new Promise((resolve, reject) => {
    const script = join(dir, 'scripts', 'product-select.mjs')
    const cliArgs = ['--query', args.query]
    if (typeof args.room === 'string' && args.room.trim() !== '') cliArgs.push('--room', args.room.trim())
    if (typeof args.goal === 'string' && args.goal.trim() !== '') cliArgs.push('--goal', args.goal.trim())
    if (typeof args.category === 'string' && args.category.trim() !== '') cliArgs.push('--category', args.category.trim())
    cliArgs.push('--limit', String(Math.min(Math.max(Math.floor(args.limit ?? 8), 1), 20)))

    const child = spawn(process.execPath, [script, ...cliArgs], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: options.env ?? process.env,
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      if (!settled) {
        settled = true
        reject(new Error(`product-select timed out after ${options.timeoutMs ?? 30_000}ms`))
      }
    }, options.timeoutMs ?? 30_000)
    timer.unref?.()
    child.stdout.on('data', (chunk: Buffer) => { if (!settled) stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk: Buffer) => { if (!settled) stderr += chunk.toString('utf8') })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code !== 0) {
        reject(new Error(`product-select exited ${code}: ${stderr.trim().slice(0, 500)}`))
        return
      }
      try {
        const parsed = JSON.parse(stdout) as ProductSelectResult
        resolve(parsed)
      } catch {
        reject(new Error('product-select returned invalid JSON'))
      }
    })
  })
}
