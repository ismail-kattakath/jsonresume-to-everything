import { Agent } from '@strands-agents/sdk'
import { StreamCallback } from '@/types/openai'
import { AgentConfig } from './types'
import { createModel } from './factory'

/**
 * Result of the experience tailoring process.
 */
export interface ExperienceTailoringResult {
  description: string
  achievements: string[]
}

/**
 * Multi-agent graph that tailors work experience to align with a job description
 * while maintaining factual accuracy.
 *
 * Agents:
 * 1. Analyzer - Assesses alignment potential
 * 2. Description Writer - Rewrites description emphasizing relevant aspects
 * 3. Achievements Optimizer - Reframes achievements for impact
 * 4. Fact Checker - Validates factual accuracy (max 2 iterations)
 * 5. Relevance Evaluator - Ensures effective JD alignment (max 2 iterations)
 */
export async function tailorExperienceToJDGraph(
  description: string,
  achievements: string[],
  position: string,
  organization: string,
  jobDescription: string,
  config: AgentConfig,
  onProgress?: StreamCallback
): Promise<ExperienceTailoringResult> {
  const model = createModel(config)

  // Agent 1: The Analyzer - Assesses alignment potential
  const analyzer = new Agent({
    model,
    systemPrompt:
      'You are a Job-Experience Alignment Analyst. Analyze the job description and work experience to determine alignment potential.\n\n' +
      'ANALYSIS DIMENSIONS:\n' +
      '1. **Core Requirements**: Key skills, technologies, and responsibilities in the JD\n' +
      '2. **Experience Strengths**: What aspects of this experience align well\n' +
      '3. **Alignment Potential**: Realistic degree of match (High/Medium/Low)\n' +
      '4. **Transferable Skills**: Skills from experience applicable to JD requirements\n' +
      '5. **Honest Gaps**: Areas where experience genuinely does not match\n\n' +
      'OUTPUT: A structured analysis with alignment score and specific recommendations for emphasis.',
    printer: false,
  })

  // Agent 2: The Description Writer - Rewrites description
  const descriptionWriter = new Agent({
    model,
    systemPrompt:
      'You are a Professional Resume Writer specializing in truthful optimization.\n\n' +
      'Rewrite the work experience description to emphasize JD-relevant aspects.\n\n' +
      'CRITICAL RULES:\n' +
      '1. **NEVER FABRICATE**: Only use facts from the original description\n' +
      '2. **EMPHASIZE RELEVANCE**: Highlight aspects that align with JD requirements\n' +
      '3. **HONEST FRAMING**: Frame responsibilities using JD-relevant terminology when accurate\n' +
      '4. **ACKNOWLEDGE LIMITS**: If experience is tangentially related, be honest about it\n' +
      '5. **CONCISE**: 1 sentence maximum\n' +
      '6. **NO FABRICATION**: Do not add technologies, skills, or responsibilities not in original\n\n' +
      'Example Transformation:\n' +
      'Original: "Developed web applications using React and Node.js"\n' +
      'JD Focus: AI/ML Engineering\n' +
      'Rewritten: "Developed full-stack applications with focus on data-driven features and API integrations, providing foundation for ML model deployment workflows"\n\n' +
      'OUTPUT: Only the rewritten description text, nothing else.',
    printer: false,
  })

  // Agent 3: The Achievements Optimizer - Rewrites achievements
  const achievementsOptimizer = new Agent({
    model,
    systemPrompt:
      'You are a Resume Achievement Optimizer.\n\n' +
      'Rewrite achievements to emphasize JD-relevant impact while maintaining factual accuracy.\n\n' +
      'RULES:\n' +
      '1. **PRESERVE FACTS**: Keep all metrics, technologies, and outcomes accurate\n' +
      '2. **REFRAME IMPACT**: Emphasize aspects relevant to JD requirements\n' +
      '3. **TECHNICAL ALIGNMENT**: Use JD-relevant terminology when describing tech stack\n' +
      '4. **QUANTIFY**: Maintain or enhance quantifiable metrics\n' +
      '5. **NO FABRICATION**: If achievement does not relate to JD, keep it concise\n' +
      '6. **ONE PER LINE**: Return each achievement on a separate line\n\n' +
      '7. **PRESERVE ORIGINAL COUNT**: Return the same number of achievements as the original\n\n' +
      'OUTPUT: Rewritten achievements, one per line, preserving the original count.',
    printer: false,
  })

  // Agent 4: The Fact Checker - Validates accuracy
  const factChecker = new Agent({
    model,
    systemPrompt:
      'You are a Resume Fact-Checking Auditor.\n\n' +
      'Verify the rewritten experience maintains factual accuracy.\n\n' +
      'VALIDATION CRITERIA:\n' +
      '1. **No Fabrication**: All claims exist in original content\n' +
      '2. **Accurate Metrics**: Numbers and quantifiable results unchanged\n' +
      '3. **Honest Framing**: Terminology changes do not misrepresent actual work\n' +
      '4. **Technology Accuracy**: Tech stack mentions are factually correct\n' +
      '5. **Scope Honesty**: Does not exaggerate role or responsibilities\n\n' +
      'If factually accurate, respond "APPROVED".\n' +
      'If issues found, respond "CRITIQUE: <specific factual inaccuracies>" with corrections.',
    printer: false,
  })

  // Agent 5: The Relevance Evaluator - Assesses alignment quality
  const relevanceEvaluator = new Agent({
    model,
    systemPrompt:
      'You are a JD-Resume Alignment Evaluator.\n\n' +
      'Evaluate if the rewritten experience effectively highlights JD relevance.\n\n' +
      'CRITERIA:\n' +
      '1. **Keyword Alignment**: Uses JD-relevant terminology appropriately\n' +
      '2. **Impact Emphasis**: Highlights outcomes relevant to target role\n' +
      '3. **Transferable Skills**: Clearly shows applicable experience\n' +
      '4. **Honest Positioning**: Does not overstate alignment when limited\n' +
      '5. **Professional Tone**: Maintains resume quality standards\n\n' +
      'If well-aligned, respond "APPROVED".\n' +
      'If improvements needed, respond "CRITIQUE: <specific suggestions>".',
    printer: false,
  })

  onProgress?.({
    content: 'Analyzing job requirements and experience fit...',
    done: false,
  })

  // Stage 1: Analyze alignment potential
  const analysisPrompt = `Job Description:\n${jobDescription}\n\nPosition: ${position}\nOrganization: ${organization}\nDescription: ${description}\nAchievements:\n${achievements.join('\n')}`

  const analysisResult = await analyzer.invoke(analysisPrompt)
  const analysis = analysisResult.toString().trim()

  onProgress?.({
    content: 'Tailoring description to job requirements...',
    done: false,
  })

  // Stage 2: Rewrite description
  const descriptionPrompt = `Analysis:\n${analysis}\n\nOriginal Description:\n${description}\n\nJob Description:\n${jobDescription}`
  const descriptionResult = await descriptionWriter.invoke(descriptionPrompt)
  let rewrittenDescription = descriptionResult.toString().trim()

  onProgress?.({
    content: 'Optimizing achievements for relevance...',
    done: false,
  })

  // Stage 3: Rewrite achievements
  const achievementsPrompt = `Analysis:\n${analysis}\n\nOriginal Achievements:\n${achievements.join('\n')}\n\nJob Description:\n${jobDescription}`
  const achievementsResult = await achievementsOptimizer.invoke(achievementsPrompt)
  const rewrittenAchievements = achievementsResult
    .toString()
    .trim()
    .split('\n')
    .filter((a) => a.trim())

  // Stage 4: Fact checking loop (max 2 iterations)
  onProgress?.({ content: 'Validating factual accuracy...', done: false })

  const maxFactCheckIterations = 2
  for (let i = 0; i < maxFactCheckIterations; i++) {
    const factCheckPrompt = `Original Description: ${description}\nRewritten Description: ${rewrittenDescription}\n\nOriginal Achievements:\n${achievements.join('\n')}\n\nRewritten Achievements:\n${rewrittenAchievements.join('\n')}`

    const factCheckResult = await factChecker.invoke(factCheckPrompt)
    const factCheckText = factCheckResult.toString().trim()

    if (factCheckText.startsWith('APPROVED')) {
      break
    } else if (i < maxFactCheckIterations - 1) {
      // Use critique to refine (internal - don't show to user)
      const refinementPrompt = `${descriptionPrompt}\n\nFact Check Feedback: ${factCheckText}\n\nPlease revise to address these concerns.`
      const refinedResult = await descriptionWriter.invoke(refinementPrompt)
      rewrittenDescription = refinedResult.toString().trim()
    }
  }

  // Stage 5: Relevance evaluation loop (max 2 iterations)
  onProgress?.({ content: 'Evaluating alignment quality...', done: false })

  const maxRelevanceIterations = 2
  for (let i = 0; i < maxRelevanceIterations; i++) {
    const relevancePrompt = `Job Description:\n${jobDescription}\n\nRewritten Content:\nDescription: ${rewrittenDescription}\nAchievements:\n${rewrittenAchievements.join('\n')}`

    const relevanceResult = await relevanceEvaluator.invoke(relevancePrompt)
    const relevanceText = relevanceResult.toString().trim()

    if (relevanceText.startsWith('APPROVED')) {
      break
    } else if (i < maxRelevanceIterations - 1) {
      // Use critique to enhance relevance (internal - don't show to user)
      const enhancementPrompt = `${descriptionPrompt}\n\nRelevance Feedback: ${relevanceText}\n\nPlease enhance to better highlight JD alignment.`
      const enhancedResult = await descriptionWriter.invoke(enhancementPrompt)
      rewrittenDescription = enhancedResult.toString().trim()
    }
  }

  onProgress?.({ content: 'Experience tailored!', done: true })

  return {
    description: rewrittenDescription,
    achievements: rewrittenAchievements,
  }
}
