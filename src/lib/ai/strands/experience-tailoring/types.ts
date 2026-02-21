/**
 * Result of the experience tailoring process.
 */
export interface ExperienceTailoringResult {
  description: string
  achievements: string[]
  techStack?: string[]
}

/**
 * Structured output from the keyword extractor agent.
 */
export interface KeywordExtractionResult {
  missingKeywords: string[]
  criticalKeywords: string[]
  niceToHaveKeywords: string[]
}

/**
 * Structured output from the keyword enrichment classifier agent.
 * Maps achievement index (as string) to a list of approved injectable keywords.
 */
export interface EnrichmentMapResult {
  enrichmentMap: Record<string, string[]>
  rationale: string
}

/**
 * Structured output from the tech stack aligner agent.
 */
export interface TechStackAlignmentResult {
  techStack: string[]
  rationale: string
}
