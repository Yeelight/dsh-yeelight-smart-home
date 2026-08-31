/** In-memory skill registration: the yeelight-smart-home skill, DSH-adapted. */
export interface SkillSeam {
    register(registration: Record<string, unknown>): unknown;
}
export interface ParsedSkill {
    readonly name: string;
    readonly description: string;
    readonly body: string;
    readonly contentBytes: number;
}
/** Parse the SKILL.md frontmatter (name/description) and return the body. */
export declare function parseSkillFrontmatter(content: string): ParsedSkill;
/**
 * Register the packaged skill on ctx.skills (runtime provider). The skill
 * body is the DSH-adapted SKILL.md: invocation happens through the
 * `yeelight_home` tool and routing documents load through
 * `yeelight_reference`, everything else stays byte-faithful to upstream.
 */
export declare function registerSkill(seam: SkillSeam, dir: string): unknown;
