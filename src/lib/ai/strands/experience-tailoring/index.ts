import { StreamCallback } from '@/types/openai'
import { AgentConfig } from '@/lib/ai/strands/types'
import { ExperienceTailoringResult, TailoringInvocationState } from '@/lib/ai/strands/experience-tailoring/types'
import { createTailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'

import { runAnalyzerStage } from './stages/analyzer-writer'
import { runAchievementsStage } from './stages/achievements'
import { runTechStackStage } from './stages/tech-stack'
import { runVerificationStage } from './stages/verification'

export * from '@/lib/ai/strands/experience-tailoring/types'

/**
 * Multi-agent graph that tailors work experience to align with a job description
 * while maintaining factual accuracy.
 *
 * Agents:
 * 1.  Analyzer              - Assesses alignment potential
 * 2.  Description Writer    - Rewrites description emphasizing relevant aspects
 * 3a. Keyword Extractor     - Identifies JD keywords missing from achievements
 * 3b. Enrichment Classifier - Gates which keywords are legitimately injectable per achievement
 * 3c. Achievements Optimizer- Rewrites achievements with approved keyword seeds
 * 3d. Integrity Auditor     - Verifies injected keywords are interview-defensible (max 2 iterations)
 * 4a. Tech Stack Aligner    - Aligns tech stack to JD terminology and adds evidenced tech
 * 4b. Tech Stack Validator  - Audits tech stack changes for integrity (max 2 iterations)
 * 5.  Fact Checker          - Validates overall factual accuracy (max 2 iterations)
 * 6.  Relevance Evaluator   - Ensures effective JD alignment (max 2 iterations)
 */
export async function tailorExperienceToJDGraph(
  description: string,
  achievements: string[],
  position: string,
  organization: string,
  jobDescription: string,
  techStack: string[] = [],
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<ExperienceTailoringResult> {
  const agents = createTailoringAgents(config)

  const state: TailoringInvocationState = {
    jobDescription,
    position,
    organization,
    originalDescription: description,
    originalAchievements: achievements,
    originalTechStack: techStack,
  }

  // Stage 1: Analyze alignment potential & rewrite description
  await runAnalyzerStage(agents, state, onProgress)

  // Stage 2: Keyword extraction, enrichment, and formatting
  await runAchievementsStage(agents, state, onProgress)

  // Stage 3: Tech Stack Alignment (only if techStack provided and non-empty)
  await runTechStackStage(agents, state, onProgress)

  // Stage 4: Fact checking & relevance evaluation
  await runVerificationStage(agents, state, onProgress)

  onProgress?.({ content: 'Experience tailored!', done: true })

  return {
    description: state.rewrittenDescription || description,
    achievements: state.rewrittenAchievements || achievements,
    techStack: state.finalTechStack || techStack,
  }
}
