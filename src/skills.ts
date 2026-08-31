/** In-memory skill registration: the yeelight-smart-home skill, DSH-adapted. */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface SkillSeam {
  register(registration: Record<string, unknown>): unknown
}

export interface ParsedSkill {
  readonly name: string
  readonly description: string
  readonly body: string
  readonly contentBytes: number
}

/** Parse the SKILL.md frontmatter (name/description) and return the body. */
export function parseSkillFrontmatter(content: string): ParsedSkill {
  const lines = content.split('\n')
  if (lines[0]?.trim() !== '---') {
    throw new Error('SKILL.md must start with a --- frontmatter block')
  }
  let name = ''
  let description = ''
  let end = -1
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.trim() === '---') {
      end = i
      break
    }
    const match = /^([A-Za-z0-9-]+):\s*(.*)$/.exec(line)
    if (match === null) continue
    const key = match[1]
    const value = match[2].trim()
    if (key === 'name') name = value
    else if (key === 'description') description = value
  }
  if (end < 0) throw new Error('SKILL.md frontmatter has no closing ---')
  if (name === '') throw new Error('SKILL.md frontmatter has no name')
  return { name, description, body: lines.slice(end + 1).join('\n').trim() + '\n', contentBytes: content.length }
}

/**
 * Register the packaged skill on ctx.skills (runtime provider). The skill
 * body is the DSH-adapted SKILL.md: invocation happens through the
 * `yeelight_home` tool and routing documents load through
 * `yeelight_reference`, everything else stays byte-faithful to upstream.
 */
export function registerSkill(seam: SkillSeam, dir: string): unknown {
  const raw = readFileSync(join(dir, 'SKILL.md'), 'utf8')
  const parsed = parseSkillFrontmatter(raw)
  return seam.register({
    name: parsed.name,
    description: parsed.description,
    content: parsed.body,
    invocation: { modelInvocable: true, userInvocable: true },
  })
}
