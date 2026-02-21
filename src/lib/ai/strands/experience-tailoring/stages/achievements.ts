import { StreamCallback } from '@/types/openai'
import { TailoringAgents } from '@/lib/ai/strands/experience-tailoring/agents'
import { KeywordExtractionResult, EnrichmentMapResult } from '@/lib/ai/strands/experience-tailoring/types'
import { extractToolOutput, runAgentStream } from '@/lib/ai/strands/experience-tailoring/utils'

import { TailoringInvocationState } from '@/lib/ai/strands/experience-tailoring/types'

/**
 * Stage 2: Extract keywords, classify injection, rewrite achievements,
 * and loop through the integrity auditor.
 */
export async function runAchievementsStage(
  agents: TailoringAgents,
  state: TailoringInvocationState,
  onProgress?: StreamCallback
): Promise<void> {
  const { jobDescription, originalAchievements, analysis } = state

  onProgress?.({ content: 'Extracting JD keywords...', done: false })
  // Stage 2a: Extract missing JD keywords
  const keywordExtractionPrompt =
    `Job Description:\n${jobDescription}\n\n` +
    `Original Achievements:\n${originalAchievements.join('\n')}\n\n` +
    `Identify JD keywords missing from the achievements for ATS optimization.`

  await runAgentStream(await agents.keywordExtractor.stream(keywordExtractionPrompt), onProgress, 'Extracting Keywords')

  const extractedKeywords = extractToolOutput<KeywordExtractionResult>(
    agents.keywordExtractor.messages,
    'finalize_keyword_extraction',
    {
      missingKeywords: [],
      criticalKeywords: [],
      niceToHaveKeywords: [],
    }
  )

  onProgress?.({ content: 'Classifying keywords for achievements...', done: false })

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
      originalAchievements.map((a, i) => `[${i}] ${a}`).join('\n') +
      `\n\nJob Description:\n${jobDescription}\n\n` +
      `For each achievement index, determine which candidate keywords can be legitimately injected.`

    await runAgentStream(
      await agents.keywordEnrichmentClassifier.stream(classifierPrompt),
      onProgress,
      'Classifying Keywords'
    )
    const parsed = extractToolOutput<EnrichmentMapResult>(
      agents.keywordEnrichmentClassifier.messages,
      'finalize_enrichment_classification',
      {
        enrichmentMap: {},
        rationale: 'fallback',
      }
    )
    enrichmentMap = parsed.enrichmentMap ?? {}
  }

  onProgress?.({
    content: 'Enriching achievements with relevant keywords...',
    done: false,
  })

  // Stage 2c: Build seeded input for the optimizer
  const seededAchievementsInput = originalAchievements.map((a, i) => {
    const seeds = enrichmentMap[String(i)] ?? []
    const seedLine = seeds.length > 0 ? seeds.join(', ') : 'none'
    return `Achievement [${i}]: ${a}\nApproved keywords for [${i}]: ${seedLine}`
  })

  const achievementsPromptBase = `Analysis:\n${analysis}\n\n` + `Job Description:\n${jobDescription}\n\n`

  const runAchievementsOptimizer = async (inputAchievements: string[]): Promise<string[]> => {
    onProgress?.({ content: 'Rewriting achievements with approved keywords...', done: false })
    const optimizerPrompt =
      achievementsPromptBase + `Original Achievements to Process:\n${inputAchievements.join('\n\n')}\n`

    const result = await runAgentStream(
      await agents.achievementsOptimizer.stream(optimizerPrompt),
      onProgress,
      'Optimizing Achievements'
    )
    return result
      .toString()
      .trim()
      .split('\n')
      .map((line: string) =>
        line
          .replace(/^Achievement\s*\[\d+\]:\s*/i, '')
          .replace(/^Approved keywords for\s*\[\d+\]:\s*.*/i, '')
          .trim()
      )
      .filter((a: string) => a.trim())
  }

  let rewrittenAchievements = await runAchievementsOptimizer(seededAchievementsInput)

  onProgress?.({
    content: 'Auditing achievement keyword integrity...',
    done: false,
  })

  // Stage 2d: Achievement Integrity Auditor loop (max 2 iterations)
  const maxIntegrityIterations = 2
  for (let i = 0; i < maxIntegrityIterations; i++) {
    onProgress?.({ content: `Auditing achievement integrity (Iteration ${i + 1})...`, done: false })
    const integrityPrompt =
      `Original Achievements:\n${originalAchievements.map((a, idx) => `[${idx}] ${a}`).join('\n')}\n\n` +
      `Rewritten Achievements:\n${rewrittenAchievements.map((a, idx) => `[${idx}] ${a}`).join('\n')}\n\n` +
      `Injected keyword seeds per achievement:\n` +
      originalAchievements
        .map((_, idx) => {
          const seeds = enrichmentMap[String(idx)] ?? []
          return `[${idx}]: ${seeds.length > 0 ? seeds.join(', ') : 'none'}`
        })
        .join('\n')

    const integrityText = await runAgentStream(
      await agents.achievementIntegrityAuditor.stream(integrityPrompt),
      onProgress,
      'Auditing Integrity'
    )

    if (integrityText.startsWith('APPROVED')) {
      break
    } else if (i < maxIntegrityIterations - 1) {
      // For refinement, we re-run the optimizer with the audit feedback
      onProgress?.({ content: 'Refining achievements based on audit feedback...', done: false })
      const refinementPrompt =
        achievementsPromptBase +
        `Original Achievements (seeded):\n${seededAchievementsInput.join('\n\n')}\n\n` +
        `Current (FLAGGED) Rewritten Achievements:\n${rewrittenAchievements.join('\n\n')}\n\n` +
        `Integrity Audit Feedback (CRITICAL):\n${integrityText}\n\n` +
        `Please revise exclusively the FLAGGED achievements while keeping the already-approved ones intact.`

      const result = await runAgentStream(
        await agents.achievementsOptimizer.stream(refinementPrompt),
        onProgress,
        'Refining Achievements'
      )
      rewrittenAchievements = result
        .toString()
        .trim()
        .split('\n')
        .map((line: string) =>
          line
            .replace(/^Achievement\s*\[\d+\]:\s*/i, '')
            .replace(/^Approved keywords for\s*\[\d+\]:\s*.*/i, '')
            .trim()
        )
        .filter((a: string) => a.trim())
    }
  }

  state.rewrittenAchievements = rewrittenAchievements
}
