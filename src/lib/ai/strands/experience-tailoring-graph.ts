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
 * 4.  Fact Checker          - Validates overall factual accuracy (max 2 iterations)
 * 5.  Relevance Evaluator   - Ensures effective JD alignment (max 2 iterations)
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

  // Agent 3a: The Keyword Extractor - Surfaces JD keywords missing from achievements
  const keywordExtractor = new Agent({
    model,
    systemPrompt:
      'You are a JD Keyword Extraction Specialist.\n\n' +
      'Given a job description and original achievements, identify JD keywords MISSING from the achievements that could improve ATS keyword matching.\n\n' +
      'CATEGORIES:\n' +
      '1. **Technologies**: Specific tools, languages, frameworks (e.g., Kubernetes, Terraform, React)\n' +
      '2. **Methodologies**: Practices and processes (e.g., Agile, CI/CD, TDD, DevSecOps)\n' +
      '3. **Domains**: Business/functional areas (e.g., FinTech, MLOps, Edge Computing)\n' +
      '4. **Soft Skills**: Only include if JD explicitly weights them (e.g., stakeholder management)\n\n' +
      'CRITICAL: Only list keywords that are ABSENT from the original achievements text.\n\n' +
      'OUTPUT FORMAT (strict JSON, no markdown, no code blocks):\n' +
      '{"missingKeywords":["kw1","kw2"],"criticalKeywords":["must-have"],"niceToHaveKeywords":["optional"]}\n\n' +
      'criticalKeywords = appear 2+ times in JD or explicitly listed as required skills\n' +
      'niceToHaveKeywords = appear once or in desired/preferred qualifications',
    printer: false,
  })

  // Agent 3b: The Enrichment Classifier - Gates keyword injection per achievement
  const keywordEnrichmentClassifier = new Agent({
    model,
    systemPrompt:
      'You are an Achievement Keyword Injection Auditor — a strict gatekeeper.\n\n' +
      'For each achievement, evaluate which JD keywords can be LEGITIMATELY woven in without fabrication.\n\n' +
      'CRITERIA FOR LEGITIMATE INJECTION (must satisfy at least one):\n' +
      '1. **Conceptual overlap**: The keyword represents a concept the achievement genuinely demonstrates (e.g., "automated deployments" ↔ CI/CD)\n' +
      '2. **Technology umbrella**: The achievement uses a sub/super-technology of the keyword (e.g., "ECS task deployment" ↔ containerization)\n' +
      "3. **Domain alignment**: The achievement operates in the keyword's domain\n" +
      '4. **Inferred tool**: Achievement describes an outcome typically achieved with the keyword tool (e.g., "zero-downtime deploys" ↔ rolling updates)\n\n' +
      'STRICT REJECTIONS — never approve if:\n' +
      '- Keyword names a specific tool/language not referenced or conceptually implied\n' +
      '- Adding keyword would require expertise clearly absent from the achievement context\n' +
      '- Keyword would change what was actually accomplished\n' +
      '- Keyword is aspirational, not evidential\n\n' +
      'OUTPUT FORMAT (strict JSON, no markdown, no code blocks):\n' +
      '{"enrichmentMap":{"0":["kw1","kw2"],"1":["kw3"],"2":[]},"rationale":"brief justification"}\n\n' +
      'Keys are achievement indices as strings (0-based). Empty array = no injection allowed for that achievement.',
    printer: false,
  })

  // Agent 3c: The Achievements Optimizer - Rewrites with approved keyword seeds
  const achievementsOptimizer = new Agent({
    model,
    systemPrompt:
      'You are a Resume Achievement Optimizer with Keyword Enrichment capability.\n\n' +
      'Rewrite achievements to: (a) emphasize JD-relevant impact, and (b) naturally weave in ONLY the approved keyword seeds for each achievement.\n\n' +
      'RULES:\n' +
      '1. **APPROVED SEEDS ONLY**: Only inject keywords explicitly listed as approved for each achievement index — never add other JD keywords\n' +
      '2. **NATURAL INTEGRATION**: Keywords must read naturally, never keyword-stuffed\n' +
      '   BAD:  "Led team (Agile, Scrum, Kanban, SAFe) to deliver project"\n' +
      '   GOOD: "Led cross-functional team using Agile/Scrum to deliver..."\n' +
      '3. **PRESERVE FACTS**: All metrics, outcomes, and scope must remain unchanged\n' +
      '4. **HONEST FRAMING**: If a keyword does not fit naturally, skip it — do not force awkward insertions\n' +
      '5. **QUANTIFY**: Maintain or enhance all quantifiable metrics\n' +
      '6. **ONE PER LINE**: Return each achievement on a separate line\n' +
      '7. **PRESERVE COUNT**: Return the same number of achievements as input\n' +
      '8. **PLAIN TEXT OUTPUT**: Do NOT echo input labels. Never start a line with "Achievement [N]:" or any index prefix — output the achievement text only\n\n' +
      'INPUT FORMAT:\n' +
      'Achievement [N]: <original text>\n' +
      'Approved keywords for [N]: keyword_a, keyword_b (or "none" if empty)\n\n' +
      'OUTPUT: Plain rewritten achievement text only, one per line, in the same order as input. No labels, no prefixes, no numbering.',
    printer: false,
  })

  // Agent 3d: The Achievement Integrity Auditor - Verifies injection defensibility
  const achievementIntegrityAuditor = new Agent({
    model,
    systemPrompt:
      'You are an Achievement Integrity Auditor specializing in keyword injection detection.\n\n' +
      'For each rewritten achievement, verify that any newly introduced keywords or terminology are DEFENSIBLE in an actual technical interview.\n\n' +
      'AUDIT CRITERIA:\n' +
      '1. **Injection Traceability**: Every new keyword maps back to a real concept in the original achievement\n' +
      '2. **Interview Defensibility**: Candidate could explain the keyword in its stated context without embarrassment\n' +
      '3. **No Credential Inflation**: Achievement does not imply deeper ownership or expertise than the original\n' +
      '4. **Natural Language**: Injected terminology flows naturally and is not keyword-stuffed\n\n' +
      'VERDICTS:\n' +
      '- "APPROVED" — all achievements pass audit\n' +
      '- "CRITIQUE: [index]: <issue> | Corrected: <rewritten achievement>" — flag specific issues with corrected text\n\n' +
      'Be strict but fair. Conceptually honest injections should pass.',
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
    content: 'Extracting JD keywords for ATS optimization...',
    done: false,
  })

  // Stage 3a: Extract missing JD keywords
  const keywordExtractionPrompt =
    `Job Description:\n${jobDescription}\n\n` +
    `Original Achievements:\n${achievements.join('\n')}\n\n` +
    `Identify JD keywords missing from the achievements for ATS optimization.`

  const keywordExtractionResult = await keywordExtractor.invoke(keywordExtractionPrompt)
  let extractedKeywords: KeywordExtractionResult = {
    missingKeywords: [],
    criticalKeywords: [],
    niceToHaveKeywords: [],
  }
  try {
    const rawJson = keywordExtractionResult
      .toString()
      .trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    extractedKeywords = JSON.parse(rawJson) as KeywordExtractionResult
  } catch {
    // Fallback: proceed without keyword extraction
  }

  onProgress?.({
    content: 'Classifying keyword injection eligibility...',
    done: false,
  })

  // Stage 3b: Gate keywords per achievement via enrichment classifier
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

    const classifierResult = await keywordEnrichmentClassifier.invoke(classifierPrompt)
    try {
      const rawJson = classifierResult
        .toString()
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      const parsed = JSON.parse(rawJson) as EnrichmentMapResult
      enrichmentMap = parsed.enrichmentMap ?? {}
    } catch {
      // Fallback: no keyword enrichment seeds — optimizer runs with reframing only
    }
  }

  onProgress?.({
    content: 'Enriching achievements with relevant keywords...',
    done: false,
  })

  // Stage 3c: Build seeded input for the optimizer
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
    const result = await achievementsOptimizer.invoke(prompt)
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

  // Stage 3d: Achievement Integrity Auditor loop (max 2 iterations)
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

    const integrityResult = await achievementIntegrityAuditor.invoke(integrityPrompt)
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

  // Stage 4: Fact checking loop (max 2 iterations)
  onProgress?.({ content: 'Validating factual accuracy...', done: false })

  const maxFactCheckIterations = 2
  for (let i = 0; i < maxFactCheckIterations; i++) {
    const factCheckPrompt =
      `Original Description: ${description}\nRewritten Description: ${rewrittenDescription}\n\n` +
      `Original Achievements:\n${achievements.join('\n')}\n\n` +
      `Rewritten Achievements:\n${rewrittenAchievements.join('\n')}`

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
    const relevancePrompt =
      `Job Description:\n${jobDescription}\n\n` +
      `Rewritten Content:\nDescription: ${rewrittenDescription}\nAchievements:\n${rewrittenAchievements.join('\n')}`

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
