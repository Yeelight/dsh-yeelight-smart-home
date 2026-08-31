/** The yeelight_reference tool: on-demand routing documents and assets. */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export interface ReferenceDoc {
  readonly key: string
  readonly label: string
  readonly kind: 'reference' | 'asset' | 'example' | 'schema'
  readonly relative: string
  readonly bytes: number
}

const ASSETS: readonly { key: string; relative: string; label: string; kind: ReferenceDoc['kind'] }[] = [
  { key: 'intent-catalog', relative: 'assets/intent-catalog.json', label: 'Intent catalog: every supported Runtime intent id', kind: 'asset' },
  { key: 'skill-request.schema', relative: 'assets/schemas/skill-request.schema.json', label: 'SkillRequest JSON schema', kind: 'schema' },
  { key: 'skill-response.schema', relative: 'assets/schemas/skill-response.schema.json', label: 'Runtime response JSON schema', kind: 'schema' },
  { key: 'lighting-design-full-home', relative: 'assets/examples/lighting-design-full-home.json', label: 'Full multi-room lighting design import example', kind: 'example' },
  { key: 'README', relative: 'references/README.md', label: 'Reference router: the shortest path to the right document', kind: 'reference' },
]

/** Scan the shipped references directory; works from both src/ and lib/ layouts. */
export function listReferenceDocs(dir: string): ReferenceDoc[] {
  const docs: ReferenceDoc[] = []
  const referencesDir = join(dir, 'references')
  for (const name of readdirSync(referencesDir).sort()) {
    if (!name.endsWith('.md')) continue
    const relative = join('references', name)
    docs.push({ key: name.slice(0, -3), label: `references/${name}`, kind: 'reference', relative, bytes: statSync(join(dir, relative)).size })
  }
  for (const asset of ASSETS) {
    docs.push({ key: asset.key, label: asset.label, kind: asset.kind, relative: asset.relative, bytes: statSync(join(dir, asset.relative)).size })
  }
  return docs
}

/** The docs registry keyed by accepted `doc` value. */
export function referenceIndex(dir: string): Map<string, ReferenceDoc> {
  const index = new Map<string, ReferenceDoc>()
  for (const doc of listReferenceDocs(dir)) index.set(doc.key, doc)
  return index
}

/** Read one document by its registry key. Throws with the available keys when unknown. */
export function readReferenceDoc(dir: string, key: string): { doc: ReferenceDoc; content: string } {
  const index = referenceIndex(dir)
  const doc = index.get(key)
  if (doc === undefined) {
    const keys = [...index.keys()].join(', ')
    throw new Error(`unknown document "${key}"; available: ${keys}`)
  }
  return { doc, content: readFileSync(join(dir, doc.relative), 'utf8') }
}

/**
 * The tool description line listing the most useful routing keys. Kept
 * stable and hand-written so the model sees routing guidance without
 * reading every file name first.
 */
export function referenceToolHints(dir: string): string {
  const index = referenceIndex(dir)
  const picks = [
    'README (router first when unsure)',
    'device-control',
    'product-knowledge',
    'home-room-area',
    'groups',
    'scenes',
    'automations',
    'payload-shapes',
    'lighting-design',
    'lighting-design-import',
    'lighting-product-selection',
    'scene-recipes',
    'automation-recipes',
    'automation-events',
    'lighting-experience',
    'diagnostics',
    'memory-and-personalization',
    'recommendations',
    'operation-lessons',
    'safety-and-confirmation',
    'capability-boundaries',
    'device-lexicon',
    'thing-model',
    'runtime-status-and-errors',
    'response-presentation',
    'intent-catalog',
    'lighting-design-full-home',
  ]
  const existing = picks.filter((key) => index.has(key))
  return `Available documents (${existing.join(', ')}); ${index.size} total.`
}
