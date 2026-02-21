/**
 * Interface representing the result of a skills sorting and enhancement operation.
 */
export interface SkillsSortResult {
  groupOrder: string[]
  skillOrder: Record<string, string[]>
  sortedSkills?: string[] // Legacy or simplified format
  missingSkills?: string[]
}
