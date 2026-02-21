import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { KeywordExtractionResult, EnrichmentMapResult } from '@/lib/ai/strands/experience-tailoring/types'
import { safeParseJson } from '@/lib/ai/strands/experience-tailoring/utils'

/**
 *
 */
export interface AchievementsStageInput {
  jobDescription: string
  achievements: string[]
  analysis: string
}

/**
 * Stage 2: Extract keywords, classify injection, rewrite achievements,
 * and loop through the integrity auditor.
 */
export async function runAchievementsStage(
  agents: TailoringAgents,
  input: AchievementsStageInput,
  onProgress?: StreamCallback
): Promise<string[]> {
  const { jobDescription, achievements, analysis } = input

  onProgress?.({
    content: 'Extracting JD keywords for ATS optimization...',
    done: false,
  })

  // Stage 2a: Extract missing JD keywords
  const keywordExtractionPrompt =
    `Job Description:\n${jobDescription}\n\n` +
    `Original Achievements:\n${achievements.join('\n')}\n\n` +
    `Identify JD keywords missing from the achievements for ATS optimization.`

  const keywordExtractionResult = await agents.keywordExtractor.invoke(keywordExtractionPrompt)

  const extractedKeywords = safeParseJson<KeywordExtractionResult>(keywordExtractionResult.toString(), {
    missingKeywords: [],
    criticalKeywords: [],
    niceToHaveKeywords: [],
  })

  onProgress?.({
    content: 'Classifying keyword injection eligibility...',
    done: false,
  })

  // Stage 2b: Gate keywords per achievement via enrichment classifier
  const allCandidateKeywords = [
    ...extractedKeywords.criticalKeywords,
    ...extractedKeywords.niceToHaveKeywords,
    ...extractedKeywords.missingKeywords.filter(
      (k) => !extractedKeywords.criticalKeywords.includes(k) && !extractedKeywords.niceToHaveKeywords.includes(k)
    ),
  ]

  let enrichmentMap: Record<string, string[]> = {}
  if (allCandidateKeywords.length > 0) {
    const classifierPrompt =
      `Candidate JD Keywords: ${allCandidateKeywords.join(', ')}\n\n` +
      `Original Achievements (indexed):\n` +
      achievements.map((a, i) => `[${i}] ${a}`).join('\n') +
      `\n\nJob Description:\n${jobDescription}\n\n` +
      `For each achievement index, determine which candidate keywords can be legitimately injected.`

    const classifierResult = await agents.keywordEnrichmentClassifier.invoke(classifierPrompt)
    const parsed = safeParseJson<EnrichmentMapResult>(classifierResult.toString(), {
      enrichmentMap: {},
      rationale: 'fallback',
    })
    enrichmentMap = parsed.enrichmentMap ?? {}
  }

  onProgress?.({
    content: 'Enriching achievements with relevant keywords...',
    done: false,
  })

  // Stage 2c: Build seeded input for the optimizer
  const seededAchievementsInput = achievements
    .map((a, i) => {
      const seeds = enrichmentMap[String(i)] ?? []
      const seedLine = seeds.length > 0 ? seeds.join(', ') : 'none'
      return `Achievement [${i}]: ${a}\nApproved keywords for [${i}]: ${seedLine}`
    })
    .join('\n\n')

  const achievementsPrompt =
    `Analysis:\n${analysis}\n\n` + `Job Description:\n${jobDescription}\n\n` + `${seededAchievementsInput}`

  const runAchievementsOptimizer = async (prompt: string): Promise<string[]> => {
    const result = await agents.achievementsOptimizer.invoke(prompt)
    return result
      .toString()
      .trim()
      .split('\n')
      .map((line) =>
        line
          .replace(/^Achievement\s*\[\d+\]:\s*/i, '')
          .replace(/^Approved keywords for\s*\[\d+\]:\s*.*/i, '')
          .trim()
      )
      .filter((a) => a.trim())
  }

  let rewrittenAchievements = await runAchievementsOptimizer(achievementsPrompt)

  onProgress?.({
    content: 'Auditing achievement keyword integrity...',
    done: false,
  })

  // Stage 2d: Achievement Integrity Auditor loop (max 2 iterations)
  const maxIntegrityIterations = 2
  for (let i = 0; i < maxIntegrityIterations; i++) {
    const integrityPrompt =
      `Original Achievements:\n${achievements.map((a, idx) => `[${idx}] ${a}`).join('\n')}\n\n` +
      `Rewritten Achievements:\n${rewrittenAchievements.map((a, idx) => `[${idx}] ${a}`).join('\n')}\n\n` +
      `Injected keyword seeds per achievement:\n` +
      achievements
        .map((_, idx) => {
          const seeds = enrichmentMap[String(idx)] ?? []
          return `[${idx}]: ${seeds.length > 0 ? seeds.join(', ') : 'none'}`
        })
        .join('\n')

    const integrityResult = await agents.achievementIntegrityAuditor.invoke(integrityPrompt)
    const integrityText = integrityResult.toString().trim()

    if (integrityText.startsWith('APPROVED')) {
      break
    } else if (i < maxIntegrityIterations - 1) {
      // Extract corrected achievements from CRITIQUE response and re-run optimizer
      const refinedPrompt =
        `${achievementsPrompt}\n\n` +
        `Integrity Audit Feedback:\n${integrityText}\n\n` +
        `Please revise to address the flagged issues, keeping only legitimately defensible keyword usage.`
      rewrittenAchievements = await runAchievementsOptimizer(refinedPrompt)
    }
  }

  return rewrittenAchievements
}
